/**
 * D1 に ./src/files/*.txt の内容を自動登録するスクリプト
 * ローカル or 本番どちらのDBに入れるかを指定可能
 * 
 * 例:
 *   npx ts-node scripts/importTxtToD1.ts local
 *   npx ts-node scripts/importTxtToD1.ts prod
 */

import { readdir, readFile } from "node:fs/promises";
import { exec } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import util from "node:util";

const execAsync = util.promisify(exec);

// --- 設定 ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filesDir = path.join(__dirname, "../src/files");

// コマンド引数: "local" or "prod"
const mode = process.argv[2] || "local";
const binding = mode === "prod" ? "textDB_PROD" : "textDB_LOCAL";
const remoteFlag = mode === "prod" ? "--remote" : "--local";

(async () => {
  console.log(`📦 モード: ${mode} → ${binding} に接続`);
  try {
    const files = await readdir(filesDir);
    const txtFiles = files.filter((f) => f.endsWith(".txt"));

    if (txtFiles.length === 0) {
      console.log("⚠️ テキストファイルが見つかりません。src/files に .txt を置いてください。");
      return;
    }

    for (const filename of txtFiles) {
      console.log(`📄 ${filename} をインポート中...`);
      const content = await readFile(path.join(filesDir, filename), "utf-8");
      const escapedContent = content
        .replace(/'/g, "''") // SQL用にエスケープ
        .replace(/\r?\n/g, "\\n");

      const sql = `
        INSERT OR REPLACE INTO texts (filename, content)
        VALUES ('${filename}', '${escapedContent}');
      `;

      const cmd = `npx wrangler d1 execute ${binding} ${remoteFlag} --command "${sql}"`;
      const { stdout, stderr } = await execAsync(cmd);
      if (stderr) console.warn(stderr.trim());
      console.log(stdout.trim());
    }

    console.log("✅ すべてのファイルを D1 に登録しました。");
  } catch (e: any) {
    console.error("❌ エラー:", e);
  }
})();
