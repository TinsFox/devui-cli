import { cac } from "cac";
import { PKG } from "./constants";
const cli = cac("devui-cli");
// dev
console.log(`devui-cli v${PKG.version}`)
cli
  .command("[root]", "start dev server") // default command
  .alias("serve") // the command is called 'serve' in Vite's API
  .alias("dev") // alias to align with the script name
  .alias("start") // alias to align with the script name
  .option("--host [host]", `[string] specify hostname`)
  .action(async () => {
    const { createServer } = await import("./server");
    await createServer();
  });

cli.help();
cli.version(PKG.version);

cli.parse();
