import path from "path";
import { createLogger } from "./logger";
import { performance } from "perf_hooks";
import fs from "fs";
import colors from "picocolors";
import { createDebugger, isObject, normalizePath } from "./utils";
import { build } from "esbuild";

const debug = createDebugger("devui:config");
export type configFile = `devui.comfig.${string}`;

export interface INavItem {
  title: string;
  path: string;
  items: Array<INavItem>;
}

export interface ISite {
  nav?: Array<INavItem>;
  description?: string;
}
/**
 * User Config
 */
export interface UserConfig {
  // site title
  title?: string;
  mode?: string;
  root?: string;
  build?: any;
  site?: ISite;
  /* site logo */
  logo?: string;
  frame?: "react" | "vue-3";
}

export interface InlineConfig extends UserConfig {
  configFile?: string | false;
  envFile?: false;
}

export interface ConfigEnv {
  command: "build" | "serve";
  mode: string;
}

export type UserConfigFn = (env: ConfigEnv) => UserConfig | Promise<UserConfig>;
export type UserConfigExport = UserConfig | Promise<UserConfig> | UserConfigFn;
export type ResolvedConfig = Readonly<
  Omit<UserConfig, "plugins" | "alias" | "dedupe"> & {
    configFile: string | undefined;
    configFileDependencies: string[];
    inlineConfig: InlineConfig;
    root: string;
    base: string;
    publicDir: string;
    cacheDir: string;
    command: "build" | "serve";
    mode: string;
    isProduction: boolean;
    env: Record<string, any>;
  }
>;

export async function resolveConfig(
  inlineConfig: InlineConfig,
  command: "build" | "serve",
  defaultMode = "development"
): Promise<any> {
  let config = inlineConfig;
  let mode = inlineConfig.mode || defaultMode;

  if (mode === "production") {
    process.env.NODE_ENV = "production";
  }

  const configEnv = {
    mode,
    command,
  };

  let { configFile } = config;
  if (configFile !== false) {
    const loadResult = await loadConfigFromFile(
      configEnv,
      configFile,
      config.root
    );
    if (loadResult) {
      config = loadResult.config;
      // config = mergeConfig(loadResult.config, config)
      configFile = loadResult.path;
    }
  }

  // user config may provide an alternative mode. But --mode has a higher priority
  mode = inlineConfig.mode || config.mode || mode;
  configEnv.mode = mode;
  return config;
}

// 使用esbuild构建配置文件
async function bundleConfigFile(
  fileName: string,
  isESM = false
): Promise<{ code: string; dependencies: string[] }> {
  const result = await build({
    absWorkingDir: process.cwd(),
    entryPoints: [fileName],
    outfile: "out.js",
    write: false,
    platform: "node",
    bundle: true,
    format: isESM ? "esm" : "cjs",
    sourcemap: "inline",
    metafile: true,
    plugins: [
      {
        name: "externalize-deps",
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => {
            const id = args.path;
            if (id[0] !== "." && !path.isAbsolute(id)) {
              return {
                external: true,
              };
            }
          });
        },
      },
      {
        name: "replace-import-meta",
        setup(build) {
          build.onLoad({ filter: /\.[jt]s$/ }, async (args) => {
            const contents = await fs.promises.readFile(args.path, "utf8");
            return {
              loader: args.path.endsWith(".ts") ? "ts" : "js",
              contents: contents
                .replace(
                  /\bimport\.meta\.url\b/g,
                  JSON.stringify(`file://${args.path}`)
                )
                .replace(
                  /\b__dirname\b/g,
                  JSON.stringify(path.dirname(args.path))
                )
                .replace(/\b__filename\b/g, JSON.stringify(args.path)),
            };
          });
        },
      },
    ],
  });
  const { text } = result.outputFiles[0];
  return {
    code: text,
    dependencies: result.metafile ? Object.keys(result.metafile.inputs) : [],
  };
}

interface NodeModuleWithCompile extends NodeModule {
  _compile(code: string, filename: string): any;
}

// 从配置文件构建产物读取用户配置
async function loadConfigFromBundledFile(
  fileName: string,
  bundledCode: string
): Promise<UserConfig> {
  const extension = path.extname(fileName);
  const defaultLoader = require.extensions[extension]!;
  require.extensions[extension] = (module: NodeModule, filename: string) => {
    if (filename === fileName) {
      (module as NodeModuleWithCompile)._compile(bundledCode, filename);
    } else {
      defaultLoader(module, filename);
    }
  };
  // clear cache in case of server restart
  delete require.cache[require.resolve(fileName)];
  const raw = require(fileName);
  const config = raw.__esModule ? raw.default : raw;
  require.extensions[extension] = defaultLoader;
  return config;
}

export async function loadConfigFromFile(
  configEnv: any,
  configFile?: string,
  configRoot: string = process.cwd()
): Promise<any> {
  const start = performance.now();
  const getTime = () => `${(performance.now() - start).toFixed(2)}ms`;

  let resolvedPath: string | undefined;
  let isTS = false;
  let isESM = false;
  let dependencies: string[] = [];
  if (configFile) {
    // explicit config path is always resolved from cwd
    resolvedPath = path.resolve(configFile);
    isTS = configFile.endsWith(".ts");

    if (configFile.endsWith(".mjs")) {
      isESM = true;
    }
  } else {
    // implicit config file loaded from inline root (if present)
    // otherwise from cwd
    const jsconfigFile = path.resolve(configRoot, "devui.config.js");
    if (fs.existsSync(jsconfigFile)) {
      resolvedPath = jsconfigFile;
    }

    if (!resolvedPath) {
      const mjsconfigFile = path.resolve(configRoot, "devui.config.mjs");
      if (fs.existsSync(mjsconfigFile)) {
        resolvedPath = mjsconfigFile;
        isESM = true;
      }
    }

    if (!resolvedPath) {
      const tsconfigFile = path.resolve(configRoot, "devui.config.ts");
      if (fs.existsSync(tsconfigFile)) {
        resolvedPath = tsconfigFile;
        isTS = true;
      }
    }

    if (!resolvedPath) {
      const cjsConfigFile = path.resolve(configRoot, "devui.config.cjs");
      if (fs.existsSync(cjsConfigFile)) {
        resolvedPath = cjsConfigFile;
        isESM = false;
      }
    }
  }

  if (!resolvedPath) {
    createLogger("info").error(colors.red(`no config file found.`));
    // TODO debug 失效
    debug("no config file found.");
    return null;
  }

  try {
    let userConfig: UserConfigExport | undefined;
    if (!userConfig) {
      console.log("Bundle config file and transpile it to cjs using esbuild.");
      // Bundle config file and transpile it to cjs using esbuild.
      const bundled = await bundleConfigFile(resolvedPath);
      dependencies = bundled.dependencies;
      userConfig = await loadConfigFromBundledFile(resolvedPath, bundled.code);
      debug(`bundled config file loaded in ${getTime()}`);
    }

    const config = await (typeof userConfig === "function"
      ? userConfig(configEnv)
      : userConfig);
    if (!isObject(config)) {
      throw new Error(`config must export or return an object.`);
    }
    return {
      path: normalizePath(resolvedPath),
      config,
      dependencies,
    };
  } catch (e) {
    createLogger("info").error(
      colors.red(`failed to load config from ${resolvedPath}`),
      { error: e }
    );
    throw e;
  }
}
// TODO define menu type

// define cli config
export function defineConfig(config: UserConfigExport): UserConfigExport {
  return config;
}
