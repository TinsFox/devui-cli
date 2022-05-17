import react from "@vitejs/plugin-react";
import { InlineConfig } from "vite";
import { injectHtml } from "vite-plugin-html";
import { resolveUserConfig } from "../config";
import { DOCS_DIR, REACT_SITE_DIR, SITE_CONFIG, VUE_SITE_DIR } from "../constants";
import Inspect from "vite-plugin-inspect";
import vue from "@vitejs/plugin-vue";
import { normalizePath } from "../utils";
import glob from "fast-glob";
import { join, parse } from "path";
import { smartOutputFile } from "../utils/fs";
import { formatName, getHTMLMeta, getTitle } from "../share";
import mdPlugin, { Mode } from "vite-plugin-markdown";

const FRAME: {
  [key: string]: string,
} = {
  "react": REACT_SITE_DIR,
  "vue-3": VUE_SITE_DIR
};

function genImportDocuments(items: any[]) {
  return items
    .map(
      (item) => `import * as ${item.name} from '${normalizePath(item.path)}';`
    )
    .join("\n");
}

// 静态markdown
function resolveComponentDocuments(dirs: string) {
  return glob
    .sync(normalizePath(join(DOCS_DIR, "**/*.md")))
    .map((path) => {
      const pairs = parse(path).name.split(".");
      return {
        name: formatName(pairs[0], pairs[1]),
        path
      };
    });
}

const genExportAllDocuments = (items: any[]) => {
  return `export const documents = {
  ${items.map((item) => item.name).join(",\n  ")}
};`;
};

/**
 * TODO
 * [ ] resolve 站点介绍md
 * [ ] export import 站点介绍md
 ${genImportConfig()}
 ${genExportAllDocuments(documents)}
 *
 */
async function genSiteConfig() {
  const staticDocuments = resolveComponentDocuments(DOCS_DIR);
  const documents = [...staticDocuments];
  const code = `
${genImportDocuments(documents)}
${genExportAllDocuments(documents)}
`;
  console.log("SITE_CONFIG", SITE_CONFIG);
  smartOutputFile(SITE_CONFIG, code);
}

async function resolveSiteEntry(): Promise<void> {
  return new Promise((resolve, reject) => {
    genSiteConfig();
    resolve();
  });
}

export const createPlugins = (siteConfig: any) => {
  let plugins: any = [Inspect(), injectHtml({
    data: {
      title: getTitle(siteConfig),
      baiduAnalytics: siteConfig.site?.baiduAnalytics,
      enableVConsole: siteConfig.site?.enableVConsole,
      ...siteConfig,
      description: siteConfig.description,
      meta: getHTMLMeta(siteConfig)
    }
  })];

  if (siteConfig["frame"] === "react") {
    plugins.push(
      react({
        include: [/(\.tsx)$/, /\.md$/]
      }),
      mdPlugin({
        mode: [Mode.REACT]
      })
    );
  } else {
    plugins.push(
      vue({
        include: [/(\.vue)$/, /\.md$/]
      }),
      mdPlugin({
        mode: [Mode.VUE]
      })
      // vitePluginMarkdownTOVue()
    );
  }
  return plugins;
};

export async function resolveConfig(
  inlineConfig: InlineConfig = {}
): Promise<InlineConfig> {
  const siteConfig = await resolveUserConfig(inlineConfig, "serve", "development");
  await resolveSiteEntry();
  return {
    root: FRAME[siteConfig["frame"]] || REACT_SITE_DIR,
    resolve: {
      alias: {
        "site-config": SITE_CONFIG
      }
    },
    plugins: [
      ...createPlugins(siteConfig)
    ],
    server: {
      port: 4000,
      host: "0.0.0.0"
    }
  };
}
