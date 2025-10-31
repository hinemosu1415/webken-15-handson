export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const db = env.textDB;

		if (!db) {
			return Response.json({ error: 'D1 Database binding is undefined' });
		}

		// 一覧取得
		if (url.pathname === '/texts') {
			const { results } = await db.prepare('SELECT * FROM texts').all();
			return Response.json(results, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		// 追加
		if (url.pathname === '/add' && request.method === 'POST') {
			const { text } = await request.json();
			const filename = `text_${Date.now()}.txt`; // ← 一意なファイル名
			await db.prepare('INSERT INTO texts (filename, content) VALUES (?, ?)').bind(filename, text).run();
			return Response.json({ success: true, filename });
		}

		// CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		return new Response('Not found', { status: 404 });
	},
};
