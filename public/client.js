window.addEventListener('DOMContentLoaded', async () => {
	const listEl = document.getElementById('file-list');
	const contentEl = document.getElementById('file-content');
	const titleEl = document.getElementById('viewer-title');

	try {
		const res = await fetch('/texts');
		const files = await res.json();

		if (!Array.isArray(files) || files.length === 0) {
			listEl.innerHTML = '<li>ファイルが登録されていません</li>';
			return;
		}

		listEl.innerHTML = '';
		files.forEach((file) => {
			const li = document.createElement('li');
			li.textContent = `${file.filename} (${file.created_at})`;
			li.addEventListener('click', () => {
				titleEl.textContent = `📝 ${file.filename}`;
				contentEl.textContent = file.content;
			});
			listEl.appendChild(li);
		});
	} catch (e) {
		listEl.innerHTML = `<li>取得エラー: ${e.message}</li>`;
	}
});
