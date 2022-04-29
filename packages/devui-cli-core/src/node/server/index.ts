import type { InlineConfig } from "vite";
import { resolveConfig } from "../config";
import { createServer as viteServer } from "vite";
import colors from "picocolors";
import { dirname, join } from "path";
import react from "@vitejs/plugin-react";
import { injectHtml } from "vite-plugin-html";
import {
  readdirSync,
  existsSync,
  readFileSync,
  outputFileSync,
} from "fs-extra";
import glob from "fast-glob";
import { normalizePath } from "../utils";

export async function createServer() {
  await compileSite();
}
const CONFIG_FILE_NAME = "devui.config.ts";
function findRootDir(dir: string): string {
  if (existsSync(join(dir, CONFIG_FILE_NAME))) {
    return dir;
  }

  const parentDir = dirname(dir);
  if (dir === parentDir) {
    return dir;
  }

  return findRootDir(parentDir);
}
export const CWD = process.cwd();
export const ROOT = findRootDir(CWD);
export const DOCS_DIR = join(ROOT, "docs");
export function smartOutputFile(filePath: string, content: string) {
  if (existsSync(filePath)) {
    const previousContent = readFileSync(filePath, "utf-8");

    if (previousContent === content) {
      return;
    }
  }

  outputFileSync(filePath, content);
}
function resolveComponentDocuments(dirs: string) {
  const staticDocs = glob.sync(normalizePath(join(dirs, "**/*.md")));
  return staticDocs;
}
function genImportDocuments(items: any[]) {
  return items
    .map(
      (item) => `import * as ${item.name} from '${normalizePath(item.path)}';`
    )
    .join("\n");
}
function genSiteDesktopShared() {
  console.log("DOCS_DIR", DOCS_DIR);
  const dirs = readdirSync(DOCS_DIR);
  console.log("dirs", dirs);
  console.log("生成入口文件");
  const staticDocuments = resolveComponentDocuments(DOCS_DIR);
  console.log("componentDocuments", staticDocuments);
  const documents = [...staticDocuments];
  const code = `
${genImportDocuments(documents)}
`;
  console.log("code", code);
  // smartOutputFile(SITE_DESKTOP_SHARED_FILE, code);
}
async function genSiteEntry(): Promise<void> {
  return new Promise((resolve, reject) => {
    genSiteDesktopShared();
    // TODO 没有 resole会停止往下执行
    // resolve();
  });
}
export async function compileSite() {
  await genSiteEntry();
  const config = await getViteConfigForSiteDev();
  console.log("config", config);

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

function getHTMLMeta(siteConfig: any) {
  const meta = siteConfig.site?.htmlMeta;
  if (meta) {
    return Object.keys(meta)
      .map((key) => `<meta name="${key}" content="${meta[key]}">`)
      .join("\n");
  }

  return "";
}

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
  return {
    root: join(__dirname, "..", "..", "..", "site/react"), // TODO Vue
    resolve: {
      alias: {
        "site-desktop-shared": join(
          __dirname,
          "..",
          "..",
          "..",
          "dist/site-desktop-shared.js"
        ),
      },
    },

    plugins: [
      //distinguish react or vue
      react(), // TODO Vue
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
