import { defineConfig } from '@prisma/config';

export default defineConfig({
  // 設計図の場所を指定するぞ
  schema: './prisma/schema.prisma',
  // データベースの接続先を指定するぞ
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
