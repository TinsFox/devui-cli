import { defineConfig } from "@devui/devui-cli";

export default ({ mode }) => {
  return defineConfig({
    title: "DevUI Vue",
    logo: "https://vue-devui.github.io/assets/logo.svg",
    frame: "vue-3",
  });
};
