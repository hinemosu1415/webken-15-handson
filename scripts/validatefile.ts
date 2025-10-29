/**
 * src/files ディレクトリを検証する
 * - 重複ファイル名がない
 * - 各ファイルが5,000文字以内
 */

import { readdir, readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filesDir = path.join(__dirname, "../src/files");

(async () => {
  const files = await readdir(filesDir);
  const txtFiles = files.filter((f) => f.endsWith(".txt"));

  if (txtFiles.length === 0) {
    console.error("src/files に .txt ファイルが存在しません。");
    process.exit(1);
  }

  // 重複チェック
  const duplicates = txtFiles.filter(
    (item, index) => txtFiles.indexOf(item) !== index
  );
  if (duplicates.length > 0) {
    console.error(`重複ファイル名が検出されました: ${duplicates.join(", ")}`);
    process.exit(1);
  }

  // サイズチェック
  for (const file of txtFiles) {
    const content = await readFile(path.join(filesDir, file), "utf-8");
    if (content.length > 5000) {
      console.error(`${file} が5,000文字を超えています (${content.length}文字)`);
      process.exit(1);
    }
  }

  console.log("ファイル検証完了: 問題ありません。");
})();
