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

// Hosted site builders whose domains don't represent the real business
const HOSTED_BUILDERS = [
  "godaddysites.com", "wixsite.com", "squarespace.com", "weebly.com",
  "wordpress.com", "webflow.io", "sites.google.com", "jimdo.com",
  "yolasite.com", "strikingly.com",
];

// TLDs that are actually file extensions — reject any email whose domain ends in these
const ASSET_TLDS = new Set([
  "png","jpg","jpeg","gif","svg","webp","ico","bmp","tiff",
  "css","js","ts","json","xml","txt","pdf","zip","gz",
  "woff","woff2","ttf","eot","otf","map","min",
]);

function siteBaseDomain(rawUrl: string): string | null {
  try {
    const u = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
    const host = new URL(u).hostname.replace(/^www\./, "");
    // If it's a hosted builder subdomain, no "own domain" to match against
    if (HOSTED_BUILDERS.some((b) => host.endsWith(b))) return null;
    // Return second-level domain (e.g. "mydetailer.com" from "book.mydetailer.com")
    const parts = host.split(".");
    return parts.slice(-2).join(".");
  } catch {
    return null;
  }
}

function isJunkEmail(email: string, siteDomain: string | null): boolean {
  const lower = email.toLowerCase();
  if (JUNK_PREFIXES.some((p) => lower.startsWith(p))) return true;
  const parts = lower.split("@");
  if (parts.length !== 2) return true;
  const localPart = parts[0];
  const domain = parts[1];

  // Reject file-extension TLDs
  const tld = domain.split(".").pop() ?? "";
  if (ASSET_TLDS.has(tld)) return true;

  // Reject asset-looking local parts
  if (/\b(icon|logo|badge|btn|img|image|photo|pic|banner|bg|background|sprite|thumb)\b/i.test(localPart)) return true;

  // Reject junk domains
  if (JUNK_DOMAINS.some((d) => domain === d || domain.endsWith("." + d))) return true;

  // If the site has its own domain, ONLY accept emails from that same domain.
  // This is the key filter: kills template/font author emails (e.g. impallari@gmail.com,
  // astigma@astigmatic.com) that appear on pages but belong to third-party libraries.
  if (siteDomain !== null) {
    const emailDomain = domain.split(".").slice(-2).join(".");
    if (emailDomain !== siteDomain) return true;
  }

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

function stripNonContent(html: string): string {
  // Remove script, style, and svg blocks — emails there are library/font artifacts, not contact info
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ");
}

function extractEmails(html: string, siteDomain: string | null): string[] {
  const clean = stripNonContent(html);
  const raw = clean.match(EMAIL_REGEX) ?? [];
  const seen = new Set<string>();
  const results: string[] = [];
  for (const e of raw) {
    const lower = e.toLowerCase();
    if (!seen.has(lower) && !isJunkEmail(lower, siteDomain)) {
      seen.add(lower);
      results.push(lower);
    }
  }
  return results;
}

async function scrapeWebsite(rawUrl: string): Promise<string | null> {
  let base: string;
  try {
    const u = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
    base = new URL(u).origin;
  } catch {
    return null;
  }

  const siteDomain = siteBaseDomain(rawUrl);
  const pathsToTry = ["/contact", "/contact-us", "/about", "/about-us", "/"];

  for (const path of pathsToTry) {
    const html = await fetchHtml(`${base}${path}`);
    if (!html) continue;
    const emails = extractEmails(html, siteDomain);
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
