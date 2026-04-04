// src/lib/prisma.ts
// Prisma client singleton using Neon serverless adapter (Prisma 7)

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Vercel Neon integration sets POSTGRES_PRISMA_URL (pooled + pgBouncer-safe).
  // Fall back to DATABASE_URL for local dev (.env.local).
  const connectionString =
    process.env.POSTGRES_PRISMA_URL ?? process.env.DATABASE_URL!;
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
