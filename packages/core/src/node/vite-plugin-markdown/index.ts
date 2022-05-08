import type { Plugin } from "vite";
import MarkdownIt from "markdown-it";
const pluginName = "vite-plugin-markdown";
export default function vitePluginMarkdown(): Plugin {
  console.log("vitePluginMarkdown");
  return {
    name: pluginName,
    enforce: "pre",
    transform(code, id) {
      if (/\.md$/.test(id) === false) {
        return;
      }
      const result = new MarkdownIt().render(code);
      console.log("result", result);
      return { code: result };
    },
  };
}
