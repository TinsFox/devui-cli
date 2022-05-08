import type { InlineConfig } from "vite";
import { resolveConfig } from "../config";
import { createServer as viteServer } from "vite";
import colors from "picocolors";
import { join, parse } from "path";
import react from "@vitejs/plugin-react";
import { injectHtml } from "vite-plugin-html";
import glob from "fast-glob";
import { normalizePath } from "../utils";
import { DOCS_DIR, REACT_SITE_DIR, SITE_CONFIG } from "../constants";
import { removeExt, smartOutputFile } from "../utils/fs";
import vitePluginMarkdown from "../vite-plugin-markdown";
import Inspect from "vite-plugin-inspect";
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
async function genSiteEntry(): Promise<void> {
  return new Promise((resolve, reject) => {
    genSiteConfig();
    // TODO 没有 resole会停止往下执行
    resolve();
  });
}
export async function compileSite() {
  await genSiteEntry();
  const config = await getViteConfigForSiteDev();
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
export async function genDesktop() {}

// doc site config
export async function getViteConfigForSiteDev(
  inlineConfig: InlineConfig = {}
): Promise<InlineConfig> {
  const siteConfig = await resolveConfig(inlineConfig, "serve", "development");
  const title = getTitle(siteConfig);
  const baiduAnalytics = siteConfig.site?.baiduAnalytics;
  const enableVConsole = siteConfig.site?.enableVConsole;
  console.log("SITE_CONFIG", SITE_CONFIG);
  return {
    root: REACT_SITE_DIR, // TODO Vue
    resolve: {
      alias: {
        "site-config": SITE_CONFIG,
      },
    },
    plugins: [
      //distinguish react or vue
      Inspect(),
      react(), // TODO Vue
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
