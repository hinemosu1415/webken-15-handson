export default {
  async fetch(request, env, ctx): Promise<Response> {
    const url = new URL(request.url);
    const db = env.textDB_LOCAL || env.textDB_PROD;

    if (!db) {
      return new Response("Database binding undefined", { status: 500 });
    }

    // 共通CORSヘッダ
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // CORSプリフライト対応
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 一覧取得
    if (url.pathname === "/texts") {
      const { results } = await db.prepare("SELECT * FROM texts").all();
      return Response.json(results, { headers: corsHeaders });
    }

    // 新規追加
    if (url.pathname === "/add" && request.method === "POST") {
      const { text } = await request.json();
      const filename = `text_${Date.now()}.txt`;
      await db.prepare("INSERT INTO texts (filename, content) VALUES (?, ?)")
        .bind(filename, text)
        .run();
      return Response.json({ success: true, filename }, { headers: corsHeaders });
    }

    // Not found
    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
};
