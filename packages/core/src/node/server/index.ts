import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";
import glob from "fast-glob";
import { join, parse } from "path";
import colors from "picocolors";
import type { InlineConfig } from "vite";
import { createServer as viteServer } from "vite";
import { injectHtml } from "vite-plugin-html";
import Inspect from "vite-plugin-inspect";
import { resolveConfig } from "../config";
import {
  DOCS_DIR,
  REACT_SITE_DIR,
  SITE_CONFIG,
  VUE_SITE_DIR
} from "../constants";
import { normalizePath } from "../utils";
import { removeExt, smartOutputFile } from "../utils/fs";
import vitePluginMarkdown from "../vite-plugin-markdown";

const genImportConfig = () => {
  return `import config from '${removeExt(normalizePath(""))}';`;
};
export async function createServer() {
  await compileSite();
}

const camelizeRE = /-(\w)/g;
const pascalizeRE = /(\w)(\w*)/g;

export function camelize(str: string): string {
  return str.replace(camelizeRE, (_, c) => c.toUpperCase());
}

export function pascalize(str: string): string {
  return camelize(str).replace(
    pascalizeRE,
    (_, c1, c2) => c1.toUpperCase() + c2
  );
}
function formatName(component: string, lang?: string) {
  component = pascalize(component);
  if (lang) {
    return `${component}_${lang.replace("-", "_")}`;
  }
  return component;
}
// 静态markdown
function resolveComponentDocuments(dirs: string) {
  const staticDocs = glob
    .sync(normalizePath(join(DOCS_DIR, "**/*.md")))
    .map((path) => {
      const pairs = parse(path).name.split(".");
      return {
        name: formatName(pairs[0], pairs[1]),
        path,
      };
    });
  return staticDocs;
}

function genImportDocuments(items: any[]) {
  return items
    .map(
      (item) => `import * as ${item.name} from '${normalizePath(item.path)}';`
    )
    .join("\n");
}
const genExportAllDocuments = (items: any[]) => {
  return `export const documents = {
  ${items.map((item) => item.name).join(",\n  ")}
};`;
};

function genSiteConfig() {
  const staticDocuments = resolveComponentDocuments(DOCS_DIR);
  const documents = [...staticDocuments];
  console.log("genImportDocuments(documents)", genImportDocuments(documents));
  /**
   * ${genImportDocuments(documents)}
${genExportAllDocuments(documents)}
   */
  const code = `
export const config ={
  version:'0.0.1'
}
// ${genImportConfig()}
`;
  smartOutputFile(SITE_CONFIG, code);
}
async function resoleSiteEntry(): Promise<void> {
  return new Promise((resolve, reject) => {
    genSiteConfig();
    // TODO 没有 resole会停止往下执行
    resolve();
  });
}
export async function compileSite() {
  await resoleSiteEntry();
  const config = await resolveSiteConfig();
  const server = await viteServer(config);
  await server.listen();
  const info = server.config.logger.info;
  info(
    colors.cyan(`\n  vite v${require("vite/package.json").version}`) +
    colors.green(` dev server running at:\n`),
    {
      clear: !server.config.logger.hasWarned,
    }
  );
  server.printUrls();
}
/* HTML meta */
function getHTMLMeta(siteConfig: any) {
  const meta = siteConfig.site?.htmlMeta;
  if (meta) {
    return Object.keys(meta)
      .map((key) => `<meta name="${key}" content="${meta[key]}">`)
      .join("\n");
  }
  return "";
}
/* HTML title */
function getTitle(config: { title: string; description?: string }) {
  let { title } = config;

  if (config.description) {
    title += ` - ${config.description}`;
  }

  return title;
}
export async function genDesktop() { }
const frame: {
  [key: string]: string,
} = {
  "react": REACT_SITE_DIR,
  "vue-3": VUE_SITE_DIR
}

export async function resolveSiteConfig(
  inlineConfig: InlineConfig = {}
): Promise<InlineConfig> {
  console.log("env", process.env.NODE_ENV)
  const siteConfig = await resolveConfig(inlineConfig, "serve", "development");
  const title = getTitle(siteConfig);
  const baiduAnalytics = siteConfig.site?.baiduAnalytics;
  const enableVConsole = siteConfig.site?.enableVConsole;
  return {
    root: frame[siteConfig["frame"]] || REACT_SITE_DIR,
    resolve: {
      alias: {
        "site-config": SITE_CONFIG,
      },
    },
    plugins: [
      Inspect(),
      react({
        include: [/(\.tsx)$/, /\.md$/]
      }),
      vue({
        include: [/(\.vue)$/, /\.md$/]
      }),
      vitePluginMarkdown(),
      injectHtml({
        data: {
          ...siteConfig,
          title,
          description: siteConfig.description,
          baiduAnalytics,
          enableVConsole,
          meta: getHTMLMeta(siteConfig),
        },
      }),
    ],
    server: {
      port: 4000,
      host: "0.0.0.0",
    },
  };
}
