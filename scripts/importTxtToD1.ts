/**
 * D1 に ./src/files/*.txt の内容を完全同期するスクリプト
 *
 * 実行すると、texts テーブルを全削除 → 全ファイルを再インポートします。
 *
 * 例:
 *   npx ts-node scripts/importTxtToD1.ts          ← ローカルDBへ
 *   npx ts-node scripts/importTxtToD1.ts prod     ← 本番DBへ（--remote）
 */

import { readdir, readFile } from "node:fs/promises";
import { exec } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import util from "node:util";

const execAsync = util.promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filesDir = path.join(__dirname, "../src/files");

// コマンド引数で環境を選択
const mode = process.argv[2] === "prod" ? "prod" : "local";
const binding = "textDB";
const remoteFlag = mode === "prod" ? "--remote" : "";

(async () => {
  console.log(`📦 モード: ${mode} → D1(${binding}) に登録を行います`);

  try {
    // --- テーブル全削除 ---
    console.log("🧹 texts テーブルを全削除中...");
    await execAsync(`npx wrangler d1 execute ${binding} ${remoteFlag} --command "DELETE FROM texts;"`);

    // --- ファイル一覧取得 ---
    const files = await readdir(filesDir);
    const txtFiles = files.filter((f) => f.endsWith(".txt"));
    if (txtFiles.length === 0) {
      console.log("⚠️ テキストファイルが見つかりません。src/files に .txt を置いてください。");
      return;
    }

    // --- ファイル挿入 ---
    for (const filename of txtFiles) {
      console.log(`📄 ${filename} をインポート中...`);
      const content = await readFile(path.join(filesDir, filename), "utf-8");
      const escapedContent = content
        .replace(/'/g, "''")
        .replace(/\r?\n/g, "\\n");

      const sql = `
        INSERT INTO texts (filename, content)
        VALUES ('${filename}', '${escapedContent}');
      `;

      const { stdout } = await execAsync(`npx wrangler d1 execute ${binding} ${remoteFlag} --command "${sql}"`);
      console.log(stdout.trim());
    }

    console.log("✅ すべてのファイルを D1 に再登録しました。");
  } catch (e: any) {
    console.error("❌ エラー:", e.message || e);
  }
})();
