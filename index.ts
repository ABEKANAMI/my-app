import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["query"] });

async function main() {
  console.log("DB接続テスト中...");
  await prisma.user.create({
    data: { name: `テストユーザー ${new Date().toISOString()}` },
  });
  const users = await prisma.user.findMany();
  console.log("現在のユーザー一覧:", users);
}

main()
  .catch((e) => console.error(e))
  .finally(() => Promise.all([prisma.$disconnect(), pool.end()]));
