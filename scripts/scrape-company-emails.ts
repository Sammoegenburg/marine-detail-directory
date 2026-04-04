// scripts/scrape-company-emails.ts
// Scrape publicly listed contact emails from company websites
// Run: npx tsx scripts/scrape-company-emails.ts

import { config } from "dotenv";
config({ path: new URL("../.env.local", import.meta.url).pathname });
config({ path: new URL("../.env", import.meta.url).pathname });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const DELAY_MS = 500;
const TIMEOUT_MS = 10_000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; DetailDirectoryBot/1.0; contact-scraper)";

const JUNK_PREFIXES = [
  "noreply@", "no-reply@", "donotreply@", "do-not-reply@",
  "admin@", "webmaster@", "postmaster@", "hostmaster@",
  "support@", "help@", "info@gmail.", "info@yahoo.", "info@hotmail.",
  "test@", "example@", "user@", "email@",
];

const JUNK_DOMAINS = [
  "sentry.io", "wix.com", "squarespace.com", "wordpress.com",
  "godaddy.com", "namecheap.com", "cloudflare.com", "amazonaws.com",
  "google.com", "facebook.com", "instagram.com", "twitter.com",
  "example.com", "yourdomain.com", "domain.com",
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isJunkEmail(email: string): boolean {
  const lower = email.toLowerCase();
  if (JUNK_PREFIXES.some((p) => lower.startsWith(p))) return true;
  const domain = lower.split("@")[1] ?? "";
  if (JUNK_DOMAINS.some((d) => domain === d || domain.endsWith("." + d))) return true;
  // skip image/asset paths that look like emails (contain file extensions before @)
  if (/\.(png|jpg|jpeg|gif|svg|webp|css|js|woff|ttf)$/i.test(lower.split("@")[0])) return true;
  return false;
}

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
      redirect: "follow",
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text/html")) return null;
    return await res.text();
  } catch {
    return null;
  }
}

function extractEmails(html: string): string[] {
  const raw = html.match(EMAIL_REGEX) ?? [];
  const seen = new Set<string>();
  const results: string[] = [];
  for (const e of raw) {
    const lower = e.toLowerCase();
    if (!seen.has(lower) && !isJunkEmail(lower)) {
      seen.add(lower);
      results.push(lower);
    }
  }
  return results;
}

async function scrapeWebsite(rawUrl: string): Promise<string | null> {
  // Normalise URL
  let base: string;
  try {
    const u = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
    base = new URL(u).origin;
  } catch {
    return null;
  }

  const pathsToTry = ["/", "/contact", "/contact-us", "/about", "/about-us"];

  for (const path of pathsToTry) {
    const html = await fetchHtml(`${base}${path}`);
    if (!html) continue;
    const emails = extractEmails(html);
    if (emails.length > 0) return emails[0];
  }
  return null;
}

async function main() {
  console.log("📧 Starting company email scraper...\n");

  const companies = await prisma.company.findMany({
    where: {
      website: { not: null },
      email: null,
    },
    select: { id: true, name: true, website: true },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${companies.length} companies with website but no email.\n`);

  let checked = 0;
  let found = 0;
  let missing = 0;

  for (const company of companies) {
    checked++;
    const website = company.website!;
    process.stdout.write(`[${checked}/${companies.length}] ${company.name} (${website}) → `);

    const email = await scrapeWebsite(website);

    if (email) {
      await prisma.company.update({
        where: { id: company.id },
        data: { email },
      });
      console.log(`✓ ${email}`);
      found++;
    } else {
      console.log("no email found");
      missing++;
    }

    await delay(DELAY_MS);
  }

  console.log("\n" + "─".repeat(50));
  console.log(`✅ Scrape complete`);
  console.log(`   Checked:      ${checked}`);
  console.log(`   Emails found: ${found}`);
  console.log(`   Still missing: ${missing}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
