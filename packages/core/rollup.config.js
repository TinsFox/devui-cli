import path from "path";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import alias from "@rollup/plugin-alias";
import MagicString from "magic-string";
import { babel } from "@rollup/plugin-babel";
/**
 * @type { import('rollup').RollupOptions }
 */
const sharedNodeOptions = {
  treeshake: {
    moduleSideEffects: "no-external",
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false,
  },
  output: {
    dir: path.resolve(__dirname, "dist"),
    entryFileNames: `node/[name].js`,
    chunkFileNames: "node/chunks/dep-[hash].js",
    exports: "named",
    format: "cjs",
    externalLiveBindings: false,
    freeze: false,
  },
  onwarn(warning, warn) {
    // node-resolve complains a lot about this but seems to still work?
    if (warning.message.includes("Package subpath")) {
      return;
    }
    // we use the eval('require') trick to deal with optional deps
    if (warning.message.includes("Use of eval")) {
      return;
    }
    if (warning.message.includes("Circular dependency")) {
      return;
    }
    warn(warning);
  },
};

/**
 *
 * @param {boolean} isProduction
 * @returns {import('rollup').RollupOptions}
 */
const createNodeConfig = (isProduction) => {
  /**
   * @type { import('rollup').RollupOptions }
   */
  const nodeConfig = {
    ...sharedNodeOptions,
    input: {
      index: path.resolve(__dirname, "src/node/index.ts"),
      cli: path.resolve(__dirname, "src/node/cli.ts"),
    },
    output: {
      ...sharedNodeOptions.output,
      sourcemap: !isProduction,
    },
    external: [
      "fsevents",
      ...Object.keys(require("./package.json").dependencies),
      ...(isProduction
        ? []
        : Object.keys(require("./package.json").devDependencies)),
    ],
    plugins: [
      alias({
        // packages with "module" field that doesn't play well with cjs bundles
        entries: {
          "@vue/compiler-dom": require.resolve(
            "@vue/compiler-dom/dist/compiler-dom.cjs.js"
          ),
        },
      }),
      nodeResolve({ preferBuiltins: true }),
      typescript({
        tsconfig: "src/node/tsconfig.json",
        module: "esnext",
        target: "es2019",
        include: ["src/**/*.ts", "types/**"],
        exclude: ["src/**/__tests__/**"],
        esModuleInterop: true,
        // in production we use api-extractor for dts generation
        // in development we need to rely on the rollup ts plugin
        ...(isProduction
          ? {
              declaration: false,
              sourceMap: false,
            }
          : {
              declaration: true,
              declarationDir: path.resolve(__dirname, "dist/node"),
            }),
      }),
      // Some deps have try...catch require of optional deps, but rollup will
      // generate code that force require them upfront for side effects.
      // Shim them with eval() so rollup can skip these calls.
      isProduction &&
        shimDepsPlugin({
          // cac re-assigns module.exports even in its mjs dist
          "cac/dist/index.mjs": {
            src: `if (typeof module !== "undefined") {`,
            replacement: `if (false) {`,
          },
        }),
      babel({
        exclude: "node_modules/**",
      }),
      commonjs({
        extensions: [".js"],
        // Optional peer deps of ws. Native deps that are mostly for performance.
        // Since ws is not that perf critical for us, just ignore these deps.
        ignore: ["bufferutil", "utf-8-validate"],
      }),
      json(),
    ],
  };

  return nodeConfig;
};

/**
 * Terser needs to be run inside a worker, so it cannot be part of the main
 * bundle. We produce a separate bundle for it and shims plugin/terser.ts to
 * use the production path during build.
 *
 * @type { import('rollup').RollupOptions }
 */
const terserConfig = {
  ...sharedNodeOptions,
  output: {
    ...sharedNodeOptions.output,
    exports: "default",
    sourcemap: false,
  },
  input: {
    terser: require.resolve("terser"),
  },
  plugins: [nodeResolve(), commonjs()],
};

/**
 * @type { (deps: Record<string, { src?: string, replacement: string, pattern?: RegExp }>) => import('rollup').Plugin }
 */
function shimDepsPlugin(deps) {
  const transformed = {};

  return {
    name: "shim-deps",
    transform(code, id) {
      for (const file in deps) {
        if (id.replace(/\\/g, "/").endsWith(file)) {
          const { src, replacement, pattern } = deps[file];

          const magicString = new MagicString(code);
          if (src) {
            const pos = code.indexOf(src);
            if (pos < 0) {
              this.error(
                `Could not find expected src "${src}" in file "${file}"`
              );
            }
            transformed[file] = true;
            magicString.overwrite(pos, pos + src.length, replacement);
          }

          if (pattern) {
            let match;
            while ((match = pattern.exec(code))) {
              transformed[file] = true;
              const start = match.index;
              const end = start + match[0].length;
              magicString.overwrite(start, end, replacement);
            }
            if (!transformed[file]) {
              this.error(
                `Could not find expected pattern "${pattern}" in file "${file}"`
              );
            }
          }

          return {
            code: magicString.toString(),
            map: magicString.generateMap({ hires: true }),
          };
        }
      }
    },
    buildEnd(err) {
      if (!err) {
        for (const file in deps) {
          if (!transformed[file]) {
            this.error(
              `Did not find "${file}" which is supposed to be shimmed, was the file renamed?`
            );
          }
        }
      }
    },
  };
}

export default (commandLineArgs) => {
  const isDev = commandLineArgs.watch;
  const isProduction = !isDev;

  return [
    createNodeConfig(isProduction),
    ...(isProduction ? [terserConfig] : []),
  ];
};
