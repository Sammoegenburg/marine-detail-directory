// scripts/import-google-places.ts
// Import real boat detailing companies from Google Places API into the database
// Run: npx tsx scripts/import-google-places.ts

import { config } from "dotenv";
config({ path: new URL("../.env.local", import.meta.url).pathname });
config({ path: new URL("../.env", import.meta.url).pathname });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import slugify from "slugify";

const adapter = new PrismaNeon({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const DELAY_MS = 250;

// Only search cities that exist in the DB
const FL_CITIES = [
  "Tampa",
  "Miami",
  "Fort Lauderdale",
  "Clearwater",
  "Sarasota",
  "Jacksonville",
  "Key West",
  "Naples",
  "Stuart",
  "Pensacola",
];

const SEARCH_TERMS = [
  "boat detailing",
  "marine detailing",
  "boat cleaning",
  "car detailing",
  "auto detailing",
  "mobile detailing",
];

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeCompanyName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, " ");
}

function extractZipFromAddress(address: string): string | null {
  const match = address.match(/\b(\d{5})(?:-\d{4})?\b/);
  return match ? match[1] : null;
}

function generateSlug(name: string, existingSlugs: Set<string>): string {
  let base = slugify(name, { lower: true, strict: true });
  if (!base) base = "company";
  let slug = base;
  let counter = 2;
  while (existingSlugs.has(slug)) {
    slug = `${base}-${counter++}`;
  }
  existingSlugs.add(slug);
  return slug;
}

type PlaceResult = {
  place_id: string;
  name: string;
};

type PlaceDetails = {
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  geometry?: { location: { lat: number; lng: number } };
};

async function textSearch(query: string, pageToken?: string): Promise<{ results: PlaceResult[]; nextPageToken?: string }> {
  const params = new URLSearchParams({
    query,
    key: GOOGLE_API_KEY,
    type: "establishment",
  });
  if (pageToken) params.set("pagetoken", pageToken);

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`
  );
  const data = await res.json() as { results: PlaceResult[]; next_page_token?: string; status: string };

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    console.warn(`  ⚠ Text search status: ${data.status} for query "${query}"`);
  }

  return {
    results: data.results ?? [],
    nextPageToken: data.next_page_token,
  };
}

async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: "name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,geometry",
    key: GOOGLE_API_KEY,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params}`
  );
  const data = await res.json() as { result?: PlaceDetails; status: string };

  if (data.status !== "OK") {
    console.warn(`  ⚠ Details status: ${data.status} for place ${placeId}`);
    return null;
  }

  return data.result ?? null;
}

async function main() {
  if (!GOOGLE_API_KEY) {
    console.error("❌ GOOGLE_PLACES_API_KEY is not set");
    process.exit(1);
  }

  console.log("🚗🚢 Starting Google Places import for Florida detailers (car + boat)...\n");

  // Load all FL cities from DB
  const dbCities = await prisma.city.findMany({
    where: { state: { abbreviation: "FL" } },
    select: { id: true, name: true },
  });

  const cityMap = new Map(dbCities.map((c) => [c.name.toLowerCase(), c]));

  // Load existing company slugs and normalized names for deduplication
  const existing = await prisma.company.findMany({
    select: { slug: true, name: true },
  });
  const existingSlugs = new Set(existing.map((c) => c.slug));
  const existingNames = new Set(existing.map((c) => normalizeCompanyName(c.name)));

  // Collect all unique place IDs and their source city across all queries
  const placeIdToCity = new Map<string, string>(); // placeId -> city name

  // Phase 1: Text search — collect all place IDs
  for (const city of FL_CITIES) {
    const dbCity = cityMap.get(city.toLowerCase());
    if (!dbCity) {
      console.log(`⚠  Skipping "${city}" — not found in DB`);
      continue;
    }

    for (const term of SEARCH_TERMS) {
      const query = `${term} in ${city}, Florida`;
      let pageToken: string | undefined;
      let page = 1;
      let totalFound = 0;

      do {
        if (pageToken) await delay(2000); // Google requires 2s before using nextPageToken
        else await delay(DELAY_MS);

        const { results, nextPageToken } = await textSearch(query, pageToken);
        totalFound += results.length;

        for (const place of results) {
          if (!placeIdToCity.has(place.place_id)) {
            placeIdToCity.set(place.place_id, city);
          }
        }

        pageToken = nextPageToken;
        page++;
      } while (pageToken && page <= 3); // max 3 pages (60 results) per query
    }
  }

  console.log(`\n📍 Found ${placeIdToCity.size} unique places across all searches\n`);

  // Phase 2: Get details and insert into DB
  const stats: Record<string, number> = {};
  let imported = 0;
  let skipped = 0;
  let withPhone = 0;
  let withWebsite = 0;

  const placeEntries = [...placeIdToCity.entries()];

  for (let i = 0; i < placeEntries.length; i++) {
    const [placeId, cityName] = placeEntries[i];

    await delay(DELAY_MS);

    const details = await getPlaceDetails(placeId);
    if (!details) { skipped++; continue; }

    const normalizedName = normalizeCompanyName(details.name);

    // Skip duplicates
    if (existingNames.has(normalizedName)) {
      console.log(`  ↩  Skipping duplicate: "${details.name}"`);
      skipped++;
      continue;
    }

    const dbCity = cityMap.get(cityName.toLowerCase());
    if (!dbCity) { skipped++; continue; }

    const slug = generateSlug(details.name, existingSlugs);
    const zipCode = details.formatted_address
      ? extractZipFromAddress(details.formatted_address)
      : null;

    try {
      await prisma.company.create({
        data: {
          cityId: dbCity.id,
          name: details.name,
          slug,
          status: "UNCLAIMED",
          phone: details.formatted_phone_number ?? null,
          website: details.website ?? null,
          address: details.formatted_address ?? null,
          zipCode,
          averageRating: details.rating ?? null,
          reviewCount: details.user_ratings_total ?? 0,
          isInsured: false,
          isFeatured: false,
          photoUrls: [],
        },
      });

      existingNames.add(normalizedName);
      stats[cityName] = (stats[cityName] ?? 0) + 1;
      imported++;
      if (details.formatted_phone_number) withPhone++;
      if (details.website) withWebsite++;

      console.log(`  ✓ [${i + 1}/${placeEntries.length}] ${details.name} (${cityName})`);
    } catch (err) {
      console.error(`  ✗ Failed to insert "${details.name}":`, err);
      skipped++;
    }
  }

  // Summary
  console.log("\n" + "─".repeat(50));
  console.log(`✅ Import complete`);
  console.log(`   Imported:  ${imported} companies`);
  console.log(`   Skipped:   ${skipped} (duplicates / irrelevant / errors)`);
  console.log(`   With phone: ${withPhone}`);
  console.log(`   With website: ${withWebsite}`);
  console.log("\n   Breakdown by city:");
  for (const [city, count] of Object.entries(stats).sort()) {
    console.log(`     ${city}: ${count}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
