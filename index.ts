import express from "express";
const app = express();
const PORT = process.env.PORT || 8888;

app.get("/", (req, res) => {
  res.send("こんにちは！再スタート成功じゃ！");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
