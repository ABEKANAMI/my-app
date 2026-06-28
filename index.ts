import "dotenv/config";
import express from "express";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

// データベース接続の設定じゃ
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["query"] });

const app = express();
const PORT = process.env.PORT || 8888;

// EJS を使うための設定じゃ
app.set("view engine", "ejs");
app.set("views", "./views");
// フォームから送られてきたデータ（名前や年齢）を受け取れるようにするぞ
app.use(express.urlencoded({ extended: true }));

// トップページ：ユーザー一覧を表示する
app.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.render("index", { users });
  } catch (error) {
    console.error(error);
    res.status(500).send("データベースからデータを取ってくるのに失敗したぞ。");
  }
});

// ユーザー追加：フォームからのデータを受けて保存する
app.post("/users", async (req, res) => {
  const name = req.body.name;
  const age = req.body.age; // 画面から送られてきた年齢じゃ

  if (name) {
    await prisma.user.create({
      data: { 
        name: name,
        // 年齢があれば数字に変換して保存し、なければ空（null）にするぞ
        age: age ? parseInt(age) : null 
      }
    });
  }
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
