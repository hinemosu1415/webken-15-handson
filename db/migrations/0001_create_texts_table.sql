CREATE TABLE IF NOT EXISTS texts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL UNIQUE, -- 元のファイル名 (例: "hello.txt")
    content TEXT NOT NULL,         -- テキストの内容
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);