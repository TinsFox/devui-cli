import colors from "picocolors";
import { createServer as createViteServer } from "vite";
import { resolveConfig } from "./config";

export async function createServer() {
  const config = await resolveConfig();
  const server = await createViteServer(config);
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
