// node:http という標準ライブラリを使って、サーバーを作るぞ
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

// Render が指定するポート番号、なければ 8888 番を使う
const PORT = process.env.PORT || 8888;

const server = http.createServer((req, res) => {
  // アクセスがあったらログを出す
  console.log(`${req.method} ${req.url}`);

  // 現時点では、サーバーが生きていることを確認するためのメッセージを返すぞ
  // 次のステップで、お主の作った「電卓の画面」を出すように書き換えるから安心しておくれ
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.writeHead(200);
  res.end("傾斜割り勘電卓のサーバー、起動中じゃ！");
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
