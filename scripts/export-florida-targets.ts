// scripts/export-florida-targets.ts
// Export unclaimed Florida companies to CSV for GTM outreach
// Run: npx tsx scripts/export-florida-targets.ts

import { config } from "dotenv";
import { writeFileSync } from "fs";
import { join } from "path";

config({ path: new URL("../.env.local", import.meta.url).pathname });
config({ path: new URL("../.env", import.meta.url).pathname });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const BASE_URL = "https://marine-detail-directory.vercel.app";

const FL_CITIES = [
  "St. Petersburg",
  "Tampa",
  "Miami",
  "Fort Lauderdale",
  "Clearwater",
  "Sarasota",
  "Jacksonville",
  "Key West",
  "Naples",
  "Stuart",
];

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

async function main() {
  const companies = await prisma.company.findMany({
    where: {
      status: "UNCLAIMED",
      city: {
        state: { abbreviation: "FL" },
        name: { in: FL_CITIES },
      },
      OR: [
        { email: { not: null } },
        { website: { not: null } },
      ],
    },
    orderBy: [
      { city: { name: "asc" } },
      { name: "asc" },
    ],
    include: {
      city: { include: { state: true } },
    },
  });

  if (companies.length === 0) {
    console.log("No unclaimed Florida companies found with contact info.");
    await prisma.$disconnect();
    return;
  }

  const headers = [
    "Company Name",
    "City",
    "State",
    "Email",
    "Website",
    "Phone",
    "Profile URL",
  ];

  const rows = companies.map((c) => [
    escapeCsv(c.name),
    escapeCsv(c.city.name),
    escapeCsv(c.city.state.abbreviation),
    escapeCsv(c.email),
    escapeCsv(c.website),
    escapeCsv(c.phone),
    escapeCsv(`${BASE_URL}/companies/${c.slug}`),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const outputPath = join(process.cwd(), "florida-outreach.csv");
  writeFileSync(outputPath, csv, "utf-8");

  console.log(`✓ Exported ${companies.length} companies to florida-outreach.csv`);
  console.log(`  Breakdown by city:`);

  const byCityMap: Record<string, number> = {};
  for (const c of companies) {
    byCityMap[c.city.name] = (byCityMap[c.city.name] ?? 0) + 1;
  }
  for (const [city, count] of Object.entries(byCityMap).sort()) {
    console.log(`    ${city}: ${count}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
