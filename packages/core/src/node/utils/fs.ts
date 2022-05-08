import { existsSync, readFileSync, outputFileSync } from "fs-extra";

/* ooutput file when data is different */
export const smartOutputFile = (filePath: string, content: string) => {
  if (existsSync(filePath)) {
    const previousContent = readFileSync(filePath, "utf-8");
    if (previousContent === content) {
      return;
    }
  }
  outputFileSync(filePath, content);
};
export function removeExt(path: string) {
  return path.replace(".tsx", "");
}
