// scripts/scrub-auto-detailers.ts
// Remove auto/car detailers from the marine-only database
// Run: npx tsx scripts/scrub-auto-detailers.ts

import { config } from "dotenv";
config({ path: new URL("../.env.local", import.meta.url).pathname });
config({ path: new URL("../.env", import.meta.url).pathname });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const AUTO_KEYWORDS = [
  "auto detail",
  "auto spa",
  "car detail",
  "car wash",
  "automotive",
  "auto clean",
  "vehicle detail",
];

const MARINE_KEYWORDS = [
  "boat",
  "marine",
  "yacht",
  "hull",
  "watercraft",
  "vessel",
  "nautical",
  "dock",
  "marina",
];

function hasKeyword(lower: string, keywords: string[]): boolean {
  return keywords.some((kw) => lower.includes(kw));
}

function shouldDelete(name: string): boolean {
  const lower = name.toLowerCase();

  // Flag if contains auto-related keywords but NOT marine keywords
  if (hasKeyword(lower, AUTO_KEYWORDS) && !hasKeyword(lower, MARINE_KEYWORDS)) {
    return true;
  }

  // Flag generic "mobile detailing" without marine keywords
  if (lower.includes("mobile detail") && !hasKeyword(lower, MARINE_KEYWORDS)) {
    return true;
  }

  return false;
}

async function main() {
  console.log("🔍 Scanning database for non-marine companies...\n");

  const allCompanies = await prisma.company.findMany({
    select: { id: true, name: true },
  });

  const toDelete = allCompanies.filter((c) => shouldDelete(c.name));

  if (toDelete.length === 0) {
    console.log("✅ No auto/car detailers found. Database is clean.");
    return;
  }

  console.log(`Found ${toDelete.length} companies flagged for deletion:\n`);
  for (const company of toDelete) {
    console.log(`  • ${company.name}`);
  }
  console.log();

  const ids = toDelete.map((c) => c.id);

  // Delete related records without cascade first
  const deletedPurchases = await prisma.leadPurchase.deleteMany({
    where: { companyId: { in: ids } },
  });
  const deletedClaims = await prisma.claimRequest.deleteMany({
    where: { companyId: { in: ids } },
  });

  // Delete companies — CompanyService and Review cascade automatically
  const deleted = await prisma.company.deleteMany({
    where: { id: { in: ids } },
  });

  console.log("─".repeat(50));
  console.log("✅ Scrub complete");
  console.log(`   Deleted companies:      ${deleted.count}`);
  console.log(`   Deleted lead purchases: ${deletedPurchases.count}`);
  console.log(`   Deleted claim requests: ${deletedClaims.count}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
