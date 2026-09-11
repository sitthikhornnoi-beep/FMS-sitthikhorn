import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "npm run db:seed" },
  engine: "classic",
  datasource: { url: env("DATABASE_URL") },
});
