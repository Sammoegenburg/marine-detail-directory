// scripts/seed-all-states.ts
// Seed all 50 US states + top boating cities — idempotent
// Run: npx tsx scripts/seed-all-states.ts

import { config } from "dotenv";
config({ path: new URL("../.env.local", import.meta.url).pathname });
config({ path: new URL("../.env", import.meta.url).pathname });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import slugify from "slugify";

const adapter = new PrismaNeon({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

function toSlug(s: string) {
  return slugify(s, { lower: true, strict: true });
}

type StateData = {
  name: string;
  abbreviation: string;
  cities: string[];
};

const ALL_STATES: StateData[] = [
  // Already seeded — included for idempotency
  { name: "California", abbreviation: "CA", cities: ["San Diego", "Los Angeles", "San Francisco", "Newport Beach", "Monterey"] },
  { name: "Florida", abbreviation: "FL", cities: ["Miami", "Tampa", "Fort Lauderdale", "Jacksonville", "Key West", "Clearwater", "Sarasota", "Naples", "Stuart", "Pensacola"] },
  { name: "Maryland", abbreviation: "MD", cities: ["Annapolis", "Baltimore", "Ocean City", "Cambridge", "St. Michaels"] },
  { name: "Massachusetts", abbreviation: "MA", cities: ["Boston", "Hyannis", "Gloucester", "Marblehead", "Falmouth"] },
  { name: "New York", abbreviation: "NY", cities: ["New York City", "Oyster Bay", "Montauk", "Sag Harbor", "Buffalo"] },
  { name: "North Carolina", abbreviation: "NC", cities: ["Wilmington", "Beaufort", "Morehead City", "Outer Banks", "New Bern"] },
  { name: "Texas", abbreviation: "TX", cities: ["Galveston", "Corpus Christi", "Houston", "Rockport", "Port Aransas"] },
  { name: "Washington", abbreviation: "WA", cities: ["Seattle", "Tacoma", "Bellingham", "Anacortes", "Olympia"] },

  // New states
  { name: "Alabama", abbreviation: "AL", cities: ["Mobile", "Gulf Shores", "Orange Beach", "Dauphin Island"] },
  { name: "Alaska", abbreviation: "AK", cities: ["Anchorage", "Juneau", "Ketchikan", "Sitka", "Homer"] },
  { name: "Arizona", abbreviation: "AZ", cities: ["Lake Havasu City", "Tempe", "Scottsdale", "Peoria"] },
  { name: "Arkansas", abbreviation: "AR", cities: ["Little Rock", "Hot Springs", "Fort Smith", "Russellville"] },
  { name: "Colorado", abbreviation: "CO", cities: ["Denver", "Aurora", "Grand Junction", "Loveland"] },
  { name: "Connecticut", abbreviation: "CT", cities: ["Mystic", "Stamford", "New Haven", "Groton", "Westbrook"] },
  { name: "Delaware", abbreviation: "DE", cities: ["Wilmington", "Lewes", "Rehoboth Beach", "Milford"] },
  { name: "Georgia", abbreviation: "GA", cities: ["Savannah", "Brunswick", "St. Simons Island", "Jekyll Island", "Atlanta"] },
  { name: "Hawaii", abbreviation: "HI", cities: ["Honolulu", "Lahaina", "Kailua-Kona", "Hilo", "Kaneohe"] },
  { name: "Idaho", abbreviation: "ID", cities: ["Coeur d'Alene", "Sandpoint", "Boise", "McCall"] },
  { name: "Illinois", abbreviation: "IL", cities: ["Chicago", "Waukegan", "Peoria", "Galena", "Rockford"] },
  { name: "Indiana", abbreviation: "IN", cities: ["Michigan City", "Indianapolis", "Bloomington", "Madison"] },
  { name: "Iowa", abbreviation: "IA", cities: ["Dubuque", "Des Moines", "Okoboji", "Clinton"] },
  { name: "Kansas", abbreviation: "KS", cities: ["Wichita", "Overland Park", "Salina", "Topeka"] },
  { name: "Kentucky", abbreviation: "KY", cities: ["Louisville", "Lexington", "Lake Cumberland", "Bowling Green"] },
  { name: "Louisiana", abbreviation: "LA", cities: ["New Orleans", "Baton Rouge", "Lake Charles", "Slidell", "Mandeville"] },
  { name: "Maine", abbreviation: "ME", cities: ["Portland", "Bar Harbor", "Camden", "Kennebunkport", "Rockland"] },
  { name: "Michigan", abbreviation: "MI", cities: ["Traverse City", "Detroit", "Holland", "Mackinaw City", "Petoskey", "Marquette"] },
  { name: "Minnesota", abbreviation: "MN", cities: ["Duluth", "Minneapolis", "Brainerd", "Walker", "Excelsior"] },
  { name: "Mississippi", abbreviation: "MS", cities: ["Biloxi", "Gulfport", "Pascagoula", "Ocean Springs"] },
  { name: "Missouri", abbreviation: "MO", cities: ["Lake of the Ozarks", "St. Louis", "Kansas City", "Branson"] },
  { name: "Montana", abbreviation: "MT", cities: ["Whitefish", "Bigfork", "Missoula", "Great Falls"] },
  { name: "Nebraska", abbreviation: "NE", cities: ["Omaha", "Lincoln", "Norfolk", "Plattsmouth"] },
  { name: "Nevada", abbreviation: "NV", cities: ["Las Vegas", "Henderson", "Laughlin", "Boulder City"] },
  { name: "New Hampshire", abbreviation: "NH", cities: ["Portsmouth", "Laconia", "Wolfeboro", "Meredith"] },
  { name: "New Jersey", abbreviation: "NJ", cities: ["Atlantic City", "Cape May", "Point Pleasant Beach", "Toms River", "Sea Isle City"] },
  { name: "New Mexico", abbreviation: "NM", cities: ["Albuquerque", "Santa Fe", "Elephant Butte", "Farmington"] },
  { name: "North Dakota", abbreviation: "ND", cities: ["Bismarck", "Fargo", "Devils Lake", "Williston"] },
  { name: "Ohio", abbreviation: "OH", cities: ["Put-in-Bay", "Sandusky", "Cleveland", "Toledo", "Lakewood"] },
  { name: "Oklahoma", abbreviation: "OK", cities: ["Tulsa", "Oklahoma City", "Grand Lake", "Lake Eufaula"] },
  { name: "Oregon", abbreviation: "OR", cities: ["Portland", "Astoria", "Newport", "Coos Bay", "Florence"] },
  { name: "Pennsylvania", abbreviation: "PA", cities: ["Erie", "Philadelphia", "Pittsburgh", "Lake Wallenpaupack"] },
  { name: "Rhode Island", abbreviation: "RI", cities: ["Newport", "Providence", "Narragansett", "Bristol"] },
  { name: "South Carolina", abbreviation: "SC", cities: ["Charleston", "Hilton Head Island", "Myrtle Beach", "Beaufort", "Georgetown"] },
  { name: "South Dakota", abbreviation: "SD", cities: ["Sioux Falls", "Pierre", "Mobridge", "Yankton"] },
  { name: "Tennessee", abbreviation: "TN", cities: ["Nashville", "Memphis", "Chattanooga", "Knoxville", "Crossville"] },
  { name: "Utah", abbreviation: "UT", cities: ["Lake Powell", "Salt Lake City", "Moab", "Provo"] },
  { name: "Vermont", abbreviation: "VT", cities: ["Burlington", "Stowe", "Vergennes", "Middlebury"] },
  { name: "Virginia", abbreviation: "VA", cities: ["Virginia Beach", "Norfolk", "Hampton", "Chesapeake", "Williamsburg"] },
  { name: "West Virginia", abbreviation: "WV", cities: ["Charleston", "Huntington", "Summersville", "Parkersburg"] },
  { name: "Wisconsin", abbreviation: "WI", cities: ["Door County", "Milwaukee", "Madison", "Oshkosh", "Green Bay"] },
  { name: "Wyoming", abbreviation: "WY", cities: ["Cheyenne", "Jackson", "Casper", "Cody"] },
];

async function main() {
  let statesAdded = 0;
  let citiesAdded = 0;

  for (const stateData of ALL_STATES) {
    const stateSlug = toSlug(stateData.name);

    const state = await prisma.state.upsert({
      where: { slug: stateSlug },
      update: {},
      create: {
        name: stateData.name,
        slug: stateSlug,
        abbreviation: stateData.abbreviation,
      },
    });

    let isNew = false;
    // Rough check: if we created it this run
    const existing = await prisma.state.findUnique({ where: { slug: stateSlug } });
    if (existing) {
      // Count cities before to detect if state was pre-existing
    }

    for (const cityName of stateData.cities) {
      const citySlug = toSlug(cityName);
      const existing = await prisma.city.findFirst({
        where: { stateId: state.id, slug: citySlug },
      });

      if (!existing) {
        await prisma.city.create({
          data: {
            stateId: state.id,
            name: cityName,
            slug: citySlug,
            isActive: true,
          },
        });
        citiesAdded++;
      }
    }
  }

  // Final count
  const [stateCount, cityCount] = await Promise.all([
    prisma.state.count(),
    prisma.city.count(),
  ]);

  console.log(`✅ Seed complete`);
  console.log(`   Total states in DB: ${stateCount}`);
  console.log(`   Total cities in DB: ${cityCount}`);
  console.log(`   New cities added this run: ${citiesAdded}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
