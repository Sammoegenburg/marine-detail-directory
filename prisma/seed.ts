// prisma/seed.ts
// Seed: US coastal states, major boating cities, and the full service catalog

import { config } from "dotenv";
// Load .env.local first (Next.js convention), then fall back to .env
config({ path: new URL("../.env.local", import.meta.url).pathname });
config({ path: new URL("../.env", import.meta.url).pathname });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import slugify from "slugify";

const adapter = new PrismaNeon({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

function toSlug(str: string): string {
  return slugify(str, { lower: true, strict: true });
}

const SERVICES = [
  {
    category: "FULL_DETAIL" as const,
    name: "Full Detail",
    slug: "full-detail",
    description:
      "Comprehensive inside-and-out cleaning, polishing, and protection for your vessel. Includes hull wash, interior vacuuming, upholstery cleaning, and full wax application.",
    baseLeadPrice: 18,
  },
  {
    category: "HULL_CLEANING" as const,
    name: "Hull Cleaning",
    slug: "hull-cleaning",
    description:
      "Professional underwater hull scrubbing to remove barnacles, growth, and marine fouling. Preserves speed, fuel efficiency, and hull integrity.",
    baseLeadPrice: 15,
  },
  {
    category: "INTERIOR_DETAIL" as const,
    name: "Interior Detail",
    slug: "interior-detail",
    description:
      "Deep-clean of all interior surfaces including upholstery, carpet, headliner, bilge, and storage compartments. Odor elimination and fabric protection included.",
    baseLeadPrice: 15,
  },
  {
    category: "TEAK_RESTORATION" as const,
    name: "Teak Restoration",
    slug: "teak-restoration",
    description:
      "Cleaning, sanding, and refinishing of teak decks, handrails, and trim. Restores natural color and protects against UV damage and weathering.",
    baseLeadPrice: 20,
  },
  {
    category: "WAXING_POLISHING" as const,
    name: "Waxing & Polishing",
    slug: "waxing-polishing",
    description:
      "Compound polishing to remove oxidation, swirls, and scratches followed by premium wax or ceramic coating application for lasting shine and protection.",
    baseLeadPrice: 16,
  },
  {
    category: "BOTTOM_PAINT" as const,
    name: "Bottom Paint",
    slug: "bottom-paint",
    description:
      "Haul-out prep, surface sanding, and antifouling bottom paint application to protect your hull from marine growth and corrosion.",
    baseLeadPrice: 22,
  },
  {
    category: "CANVAS_CLEANING" as const,
    name: "Canvas Cleaning",
    slug: "canvas-cleaning",
    description:
      "Professional cleaning and treatment of bimini tops, enclosures, sail covers, and cushion covers. Mildew removal and UV protectant application.",
    baseLeadPrice: 12,
  },
  {
    category: "BRIGHTWORK" as const,
    name: "Brightwork",
    slug: "brightwork",
    description:
      "Varnishing, oiling, and polishing of all stainless steel, chrome, and bright metal fittings. Prevents corrosion and maintains showroom appearance.",
    baseLeadPrice: 14,
  },
];

const COASTAL_STATES = [
  {
    name: "Florida",
    abbreviation: "FL",
    contentBlock:
      "Florida's 1,350 miles of coastline and year-round warm weather make it the undisputed boating capital of the US. With over 900,000 registered vessels, the demand for professional marine detailing has never been higher. {{state}} boat detailers serve marinas from the Panhandle to the Keys.",
    cities: [
      { name: "Miami", county: "Miami-Dade", lat: 25.7617, lng: -80.1918, pop: 470000, zips: ["33101", "33109", "33125", "33128", "33130", "33131", "33132", "33133"] },
      { name: "Fort Lauderdale", county: "Broward", lat: 26.1224, lng: -80.1373, pop: 182760, zips: ["33301", "33304", "33309", "33311", "33316"] },
      { name: "Tampa", county: "Hillsborough", lat: 27.9506, lng: -82.4572, pop: 399700, zips: ["33601", "33602", "33606", "33607", "33609"] },
      { name: "Jacksonville", county: "Duval", lat: 30.3322, lng: -81.6557, pop: 949611, zips: ["32099", "32202", "32204", "32207", "32208"] },
      { name: "Key West", county: "Monroe", lat: 24.5551, lng: -81.7800, pop: 24649, zips: ["33040", "33041"] },
      { name: "Naples", county: "Collier", lat: 26.1420, lng: -81.7948, pop: 21702, zips: ["34101", "34102", "34103", "34108", "34110"] },
      { name: "Clearwater", county: "Pinellas", lat: 27.9659, lng: -82.8001, pop: 116946, zips: ["33755", "33756", "33759", "33761", "33762"] },
      { name: "Sarasota", county: "Sarasota", lat: 27.3364, lng: -82.5307, pop: 57738, zips: ["34230", "34231", "34232", "34233", "34234"] },
      { name: "Stuart", county: "Martin", lat: 27.1975, lng: -80.2528, pop: 15593, zips: ["34994", "34995", "34996", "34997"] },
      { name: "Pensacola", county: "Escambia", lat: 30.4213, lng: -87.2169, pop: 54312, zips: ["32501", "32502", "32503", "32504", "32507"] },
    ],
  },
  {
    name: "California",
    abbreviation: "CA",
    contentBlock:
      "With over 73 miles of Pacific coastline and numerous inland lakes, {{state}} boaters require premium marine care to protect their investment from salt air, UV exposure, and heavy use. From San Diego's yacht clubs to the San Francisco Bay, professional detailers keep California's fleet pristine.",
    cities: [
      { name: "San Diego", county: "San Diego", lat: 32.7157, lng: -117.1611, pop: 1423851, zips: ["92101", "92106", "92108", "92109", "92110"] },
      { name: "Los Angeles", county: "Los Angeles", lat: 34.0522, lng: -118.2437, pop: 3979576, zips: ["90015", "90021", "90024", "90025", "90034"] },
      { name: "Marina del Rey", county: "Los Angeles", lat: 33.9803, lng: -118.4517, pop: 8866, zips: ["90292"] },
      { name: "Newport Beach", county: "Orange", lat: 33.6189, lng: -117.9289, pop: 85239, zips: ["92657", "92658", "92659", "92660", "92661", "92663"] },
      { name: "San Francisco", county: "San Francisco", lat: 37.7749, lng: -122.4194, pop: 881549, zips: ["94101", "94102", "94105", "94107", "94108"] },
      { name: "Long Beach", county: "Los Angeles", lat: 33.7701, lng: -118.1937, pop: 466742, zips: ["90801", "90802", "90803", "90804", "90806"] },
      { name: "Oxnard", county: "Ventura", lat: 34.1975, lng: -119.1771, pop: 208643, zips: ["93030", "93033", "93035", "93036"] },
    ],
  },
  {
    name: "Texas",
    abbreviation: "TX",
    contentBlock:
      "Texas's Gulf Coast stretches 367 miles, offering excellent boating in Galveston Bay, Corpus Christi Bay, and the Laguna Madre. {{state}}'s hot, humid climate and saltwater exposure make regular professional boat detailing essential for vessel longevity.",
    cities: [
      { name: "Houston", county: "Harris", lat: 29.7604, lng: -95.3698, pop: 2304580, zips: ["77001", "77002", "77003", "77004", "77005"] },
      { name: "Corpus Christi", county: "Nueces", lat: 27.8006, lng: -97.3964, pop: 326586, zips: ["78401", "78402", "78403", "78404", "78405"] },
      { name: "Galveston", county: "Galveston", lat: 29.3013, lng: -94.7977, pop: 53682, zips: ["77550", "77551", "77553", "77554"] },
      { name: "Rockport", county: "Aransas", lat: 28.0206, lng: -97.0541, pop: 10469, zips: ["78380", "78382"] },
    ],
  },
  {
    name: "New York",
    abbreviation: "NY",
    contentBlock:
      "{{state}}'s 1,850 miles of tidal shoreline—including Long Island Sound, the Hudson River, and Lake Champlain—supports a thriving recreational boating community. Seasonal salt exposure and winter storage prep make professional detailing critical for {{state}} boat owners.",
    cities: [
      { name: "New York City", county: "New York", lat: 40.7128, lng: -74.0060, pop: 8336817, zips: ["10001", "10002", "10003", "10004", "10005"] },
      { name: "Southampton", county: "Suffolk", lat: 40.8840, lng: -72.3857, pop: 60000, zips: ["11968", "11969"] },
      { name: "Oyster Bay", county: "Nassau", lat: 40.8676, lng: -73.5329, pop: 293214, zips: ["11771", "11804"] },
      { name: "Montauk", county: "Suffolk", lat: 41.0354, lng: -71.9543, pop: 3326, zips: ["11954"] },
    ],
  },
  {
    name: "Washington",
    abbreviation: "WA",
    contentBlock:
      "Puget Sound and the San Juan Islands make {{state}} one of the premier boating destinations in North America. The Pacific Northwest's cold, rainy climate demands frequent detailing to combat mildew, algae, and the relentless moisture that threatens marine finishes.",
    cities: [
      { name: "Seattle", county: "King", lat: 47.6062, lng: -122.3321, pop: 737255, zips: ["98101", "98103", "98104", "98105", "98107"] },
      { name: "Tacoma", county: "Pierce", lat: 47.2529, lng: -122.4443, pop: 217827, zips: ["98401", "98402", "98403", "98404", "98405"] },
      { name: "Anacortes", county: "Skagit", lat: 48.5126, lng: -122.6127, pop: 17291, zips: ["98221"] },
      { name: "Olympia", county: "Thurston", lat: 47.0379, lng: -122.9007, pop: 53050, zips: ["98501", "98502", "98503"] },
    ],
  },
  {
    name: "North Carolina",
    abbreviation: "NC",
    contentBlock:
      "{{state}}'s Outer Banks, Crystal Coast, and Intracoastal Waterway offer some of the East Coast's best boating. Saltwater exposure and high humidity make professional boat detailing a necessity rather than a luxury for {{state}} vessel owners.",
    cities: [
      { name: "Wilmington", county: "New Hanover", lat: 34.2257, lng: -77.9447, pop: 120161, zips: ["28401", "28403", "28405", "28409", "28411"] },
      { name: "Beaufort", county: "Carteret", lat: 34.7182, lng: -76.6613, pop: 4039, zips: ["28516"] },
      { name: "Morehead City", county: "Carteret", lat: 34.7232, lng: -76.7291, pop: 9223, zips: ["28557"] },
    ],
  },
  {
    name: "Maryland",
    abbreviation: "MD",
    contentBlock:
      "The Chesapeake Bay is one of the world's great boating estuaries, and {{state}} sits at its heart. From Annapolis's famed sailing scene to the Eastern Shore's working waterfronts, professional marine detailers are in constant demand across the Bay State.",
    cities: [
      { name: "Annapolis", county: "Anne Arundel", lat: 38.9784, lng: -76.4922, pop: 40812, zips: ["21401", "21402", "21403", "21405", "21409"] },
      { name: "Baltimore", county: "Baltimore City", lat: 39.2904, lng: -76.6122, pop: 593490, zips: ["21201", "21202", "21205", "21206", "21209"] },
      { name: "Easton", county: "Talbot", lat: 38.7743, lng: -76.0763, pop: 16624, zips: ["21601"] },
    ],
  },
  {
    name: "Massachusetts",
    abbreviation: "MA",
    contentBlock:
      "Cape Cod, Martha's Vineyard, Nantucket, and Boston Harbor make {{state}} a boating paradise with a rich maritime heritage. The short but intense boating season and nor'easter exposure create strong demand for professional detailing and seasonal prep services.",
    cities: [
      { name: "Boston", county: "Suffolk", lat: 42.3601, lng: -71.0589, pop: 675647, zips: ["02101", "02108", "02109", "02110", "02111"] },
      { name: "Hyannis", county: "Barnstable", lat: 41.6528, lng: -70.2845, pop: 14120, zips: ["02601"] },
      { name: "Gloucester", county: "Essex", lat: 42.6159, lng: -70.6612, pop: 30273, zips: ["01930"] },
      { name: "Marblehead", county: "Essex", lat: 42.5001, lng: -70.8573, pop: 20377, zips: ["01945"] },
    ],
  },
];

async function main() {
  console.log("🌊 Seeding MarineDetailDirectory database...\n");

  // 1. Upsert Services
  console.log("📋 Seeding services...");
  for (const svc of SERVICES) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: { name: svc.name, description: svc.description, baseLeadPrice: svc.baseLeadPrice },
      create: svc,
    });
  }
  console.log(`   ✓ ${SERVICES.length} services seeded\n`);

  // 2. Upsert States and Cities
  let totalCities = 0;
  let totalZips = 0;

  for (const stateData of COASTAL_STATES) {
    const stateSlug = toSlug(stateData.name);

    const state = await prisma.state.upsert({
      where: { slug: stateSlug },
      update: {
        name: stateData.name,
        abbreviation: stateData.abbreviation,
        contentBlock: stateData.contentBlock,
      },
      create: {
        name: stateData.name,
        slug: stateSlug,
        abbreviation: stateData.abbreviation,
        contentBlock: stateData.contentBlock,
      },
    });

    console.log(`📍 ${stateData.name} (${stateData.abbreviation})`);

    for (const cityData of stateData.cities) {
      const citySlug = toSlug(cityData.name);

      const city = await prisma.city.upsert({
        where: { stateId_slug: { stateId: state.id, slug: citySlug } },
        update: {
          name: cityData.name,
          county: cityData.county,
          latitude: cityData.lat,
          longitude: cityData.lng,
          population: cityData.pop,
        },
        create: {
          stateId: state.id,
          name: cityData.name,
          slug: citySlug,
          county: cityData.county,
          latitude: cityData.lat,
          longitude: cityData.lng,
          population: cityData.pop,
          isActive: true,
        },
      });

      totalCities++;

      // Upsert zip codes
      for (const zip of cityData.zips) {
        await prisma.zipCode.upsert({
          where: { code: zip },
          update: { cityId: city.id },
          create: { code: zip, cityId: city.id },
        });
        totalZips++;
      }

      console.log(`   ↳ ${cityData.name} (${cityData.zips.length} zips)`);
    }
  }

  console.log(`\n✅ Seed complete:`);
  console.log(`   ${SERVICES.length} services`);
  console.log(`   ${COASTAL_STATES.length} states`);
  console.log(`   ${totalCities} cities`);
  console.log(`   ${totalZips} zip codes`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
