import { existsSync } from "fs-extra";
import { dirname, join } from "path";

/* cli config name */
const CONFIG_FILE_NAME = "devui.config.ts";

/* find root dir with config file */
const findRootDir = (dir: string): string => {
  if (existsSync(join(dir, CONFIG_FILE_NAME))) {
    return dir;
  }

  const parentDir = dirname(dir);
  if (dir === parentDir) {
    return dir;
  }

  return findRootDir(parentDir);
};

export const CWD = process.cwd();

export const PROJECT_ROOT = findRootDir(CWD);
export const CLI_ROOT = join(__dirname, "..", "..");
export const DOCS_DIR = join(PROJECT_ROOT, "docs");
export const REACT_SITE_DIR = join(CLI_ROOT, "..", "src", "client", "react");
export const VUE_SITE_DIR = join(CLI_ROOT, "..", "src", "client", "vue");
export const CLI_DIST = join(CLI_ROOT, "dist");
export const SITE_CONFIG = join(CLI_DIST, "site-config.js");
export const REACT_SITE_DIR1 = join(CLI_ROOT, "..", "src", "client", "react");
export const PKG = require("../../../package.json")
