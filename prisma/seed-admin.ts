// prisma/seed-admin.ts
// One-off script: create the initial admin user
// Run: pnpm tsx prisma/seed-admin.ts

import { config } from "dotenv";
config({ path: new URL("../.env.local", import.meta.url).pathname });
config({ path: new URL("../.env", import.meta.url).pathname });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "samuelmoegenburg@gmail.com";
  const password = "admin123";
  const name = "Sam Moegenburg";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    // Promote to ADMIN if not already
    if (existing.role !== "ADMIN") {
      await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
      });
      console.log(`✓ Promoted existing user ${email} to ADMIN`);
    } else {
      console.log(`✓ Admin user ${email} already exists`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`✓ Created admin user: ${email} (password: ${password})`);
  console.log("  ⚠️  Change this password immediately after first login.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
