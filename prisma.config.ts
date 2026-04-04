import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local first (Next.js convention), fall back to .env
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use unpooled connection for migrations (direct, no pgBouncer)
    // Vercel Neon integration sets DATABASE_URL_UNPOOLED; fall back to DIRECT_URL for local dev
    url: (process.env["DATABASE_URL_UNPOOLED"] ?? process.env["DIRECT_URL"])!,
  },
});
