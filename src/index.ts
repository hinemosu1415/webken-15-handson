import { Hono } from 'hono'

// Cloudflare Workers の型定義
// wrangler.toml の 'DB' バインディングと型を合わせます
export interface Env {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>()

// ルート: シンプルな挨拶
app.get('/', (c) => {
  return c.text('テキストリーダー Worker へようこそ！')
})

// すべてのテキストのリスト（ファイル名のみ）を取得
app.get('/texts', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT id, filename, created_at FROM texts"
    ).all();
    return c.json(results);
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

// 特定のテキストファイルの内容を取得
app.get('/texts/:filename', async (c) => {
  const filename = c.req.param('filename');
  if (!filename) {
    return c.json({ error: 'ファイル名が必要です' }, 400);
  }

  try {
    // プリペアドステートメントを使用して SQL インジェクションを防ぎます
    const stmt = c.env.DB.prepare("SELECT content FROM texts WHERE filename = ?1");
    const data = await stmt.bind(filename).first("content");

    if (!data) {
      return c.json({ error: 'テキストが見つかりません' }, 404);
    }

    // テキストをプレーンテキストとして返す
    c.header('Content-Type', 'text/plain; charset=UTF-8');
    return c.body(data as string);
    
    // もしJSONで返したい場合はこちら
    // return c.json({ filename: filename, content: data });

  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

export default app
