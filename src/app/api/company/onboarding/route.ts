// src/app/api/company/onboarding/route.ts
// POST: create Company record + CompanyService records from onboarding wizard data

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ServiceCategory values that exist in the DB
const VALID_CATEGORIES = new Set([
  "FULL_DETAIL", "HULL_CLEANING", "INTERIOR_DETAIL", "TEAK_RESTORATION",
  "WAXING_POLISHING", "BOTTOM_PAINT", "CANVAS_CLEANING", "BRIGHTWORK",
  "CAR_FULL_DETAIL", "CAR_INTERIOR", "CAR_EXTERIOR",
  "PAINT_CORRECTION", "CERAMIC_COATING", "WINDOW_TINT",
]);

// Flexible schema — accepts both old multi-step form and new simplified CompanyApp
const schema = z.object({
  // Company name — accept either field name
  companyName: z.string().min(2).max(120).optional(),
  name: z.string().min(2).max(120).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  zipcode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  // New CompanyApp fields
  specialization: z.string().optional(),
  services: z.array(z.string()).optional(),
  radius: z.number().optional(),
  serviceArea: z.string().optional(),
  // Old form fields (still supported)
  vehicleTypes: z.array(z.string()).optional(),
  carServices: z.array(z.string()).optional(),
  boatServices: z.array(z.string()).optional(),
  serviceRadius: z.string().optional(),
  notifyEmail: z.boolean().optional(),
  notifyCall: z.boolean().optional(),
  notifySms: z.boolean().optional(),
  agreeLeads: z.boolean().optional(),
  agreeToS: z.boolean().optional(),
}).passthrough();

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base);
  let suffix = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const exists = await prisma.company.findUnique({ where: { slug: candidate } });
    if (!exists) return candidate;
    suffix++;
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Block if user already has an active company
  const existing = await prisma.company.findUnique({ where: { userId } });
  if (existing) {
    return NextResponse.json({ error: "Company already exists for this account" }, { status: 409 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.error("[onboarding] Zod validation failed:", JSON.stringify(parsed.error.flatten()));
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const raw = parsed.data;

  // Normalize field names — accept both old and new format
  const data = {
    companyName: raw.companyName || raw.name || "Unnamed Company",
    city: raw.city || "",
    state: raw.state || "",
    zipCode: raw.zipCode || raw.zipcode || "",
    phone: raw.phone || "",
    email: raw.email || "",
    website: raw.website || "",
    address: raw.address || "",
    carServices: raw.carServices || [],
    boatServices: raw.boatServices || [],
    services: raw.services || [],
  };

  // Normalize website: prepend https:// if user omitted the protocol
  if (data.website && data.website !== "" && !/^https?:\/\//i.test(data.website)) {
    data.website = `https://${data.website}`;
  }

  // ── Resolve or create City ──────────────────────────────────────────
  // If no city/state provided, use a default
  if (!data.city || !data.state) {
    // Use Florida/St. Petersburg as default if not provided
    data.city = data.city || "St. Petersburg";
    data.state = data.state || "FL";
  }

  const stateRecord = await prisma.state.findUnique({
    where: { abbreviation: data.state.toUpperCase() },
  });

  if (!stateRecord) {
    return NextResponse.json(
      { error: `State "${data.state}" not found in our database. Please contact support.` },
      { status: 422 }
    );
  }

  let city = await prisma.city.findFirst({
    where: {
      stateId: stateRecord.id,
      name: { equals: data.city, mode: "insensitive" },
    },
  });

  if (!city) {
    // Create a minimal city record so the company can be linked
    const citySlug = slugify(data.city);
    // Handle slug uniqueness within state
    let slug = citySlug;
    let n = 0;
    while (await prisma.city.findUnique({ where: { stateId_slug: { stateId: stateRecord.id, slug } } })) {
      n++;
      slug = `${citySlug}-${n}`;
    }
    city = await prisma.city.create({
      data: {
        stateId: stateRecord.id,
        name: data.city,
        slug,
        isActive: true,
      },
    });
  }

  // ── Generate unique slug ─────────────────────────────────────────────
  const slug = await uniqueSlug(`${data.companyName}-${data.city}`);

  // ── Create Company ───────────────────────────────────────────────────
  const company = await prisma.company.create({
    data: {
      userId,
      cityId: city.id,
      name: data.companyName,
      slug,
      status: "ACTIVE",
      address: data.address ?? null,
      zipCode: data.zipCode,
      phone: data.phone,
      email: data.email,
      website: data.website || null,
    },
  });

  // ── Attach Services ──────────────────────────────────────────────────
  const allServiceValues = [
    ...data.carServices,
    ...data.boatServices,
    ...data.services,
  ].filter((v) => VALID_CATEGORIES.has(v));

  if (allServiceValues.length > 0) {
    // Prisma expects the enum type — cast via unknown
    const services = await prisma.service.findMany({
      where: { category: { in: allServiceValues as never[] } },
      select: { id: true },
    });

    if (services.length > 0) {
      await prisma.companyService.createMany({
        data: services.map((s) => ({
          companyId: company.id,
          serviceId: s.id,
          isActive: true,
        })),
        skipDuplicates: true,
      });
    }
  }

  return NextResponse.json({ success: true, companyId: company.id }, { status: 201 });
}
