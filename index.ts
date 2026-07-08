import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

// ファイルパスを扱うための設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// データベースの設定
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["query"] });

const app = express();
const PORT = process.env.PORT || 8888;

// JSONやフォームのデータを受け取れるようにする
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Viteでビルドした後のファイル（distフォルダ）を配信する
// Renderではビルドによって dist フォルダができているはずじゃ
app.use(express.static(path.join(__dirname, "dist")));
app.use(express.static(__dirname));

// 動作確認用のAPI（現在のDBユーザーを返す）
app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (e) {
    res.status(500).send("DBエラーじゃ");
  }
});

// どこにも当てはまらないアクセスは index.html を返す
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}. 準備万端じゃ！`);
});
