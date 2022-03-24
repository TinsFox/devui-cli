import type { InlineConfig } from "vite";
import { resolveConfig } from "../config";
import { createServer as viteServer } from "vite";
import colors from "picocolors";
import { join } from "path";
import react from "@vitejs/plugin-react";
import { injectHtml } from "vite-plugin-html";

export async function createServer() {
  await compileSite();
}

export async function compileSite() {
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
// 返回站点的vite配置
export async function getViteConfigForSiteDev(
  inlineConfig: InlineConfig = {}
): Promise<InlineConfig> {
  const siteConfig = await resolveConfig(inlineConfig, "serve", "development");
  const title = getTitle(siteConfig);
  const baiduAnalytics = siteConfig.site?.baiduAnalytics;
  const enableVConsole = siteConfig.site?.enableVConsole;
  return {
    root: join(__dirname, "..", "..", "..", "site"),
    plugins: [
      react(),
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
