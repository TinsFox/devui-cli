import { defineConfig } from "@devui/devui-cli";

export default ({ mode }) => {
  return defineConfig({
    title: "DevUI React",
    logo: "https://vue-devui.github.io/assets/logo.svg",
    frame: "react",
  });
};
