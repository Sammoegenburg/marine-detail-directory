// src/app/api/leads/route.ts
// POST: submit a quote request (public endpoint)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { headers } from "next/headers";
import { sendNewLeadNotification } from "@/lib/brevo";

const leadSchema = z
  .object({
    customerName: z.string().min(2),
    customerEmail: z.string().email(),
    customerPhone: z.string().min(10),
    boatSize: z.enum(["UNDER_20FT", "TWENTY_TO_30FT", "THIRTY_TO_40FT", "OVER_40FT"]),
    vehicleType: z.enum(["yachting", "automotive"]).optional(),
    vehicleDetails: z.string().optional(),
    boatType: z.string().optional(),
    boatYear: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
    boatMake: z.string().optional(),
    // Accept either a direct cityId OR a 5-digit zipCode for location lookup
    cityId: z.string().optional(),
    zipCode: z.string().optional(),
    serviceId: z.string().cuid(),
    notes: z.string().max(500).optional(),
    preferredDate: z.string().optional(),
  })
  .refine((d) => d.cityId || (d.zipCode && /^\d{5}$/.test(d.zipCode)), {
    message: "Provide a valid cityId or a 5-digit zipCode",
    path: ["zipCode"],
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // ── Resolve city ──────────────────────────────────────────────────────────
    let resolvedCityId: string;
    let cityNameForEmail: string;
    let stateNameForEmail: string;
    let zipForLead: string;

    if (data.cityId) {
      const city = await prisma.city.findUnique({
        where: { id: data.cityId },
        include: { state: true },
      });
      if (!city) {
        return NextResponse.json({ error: "City not found" }, { status: 422 });
      }
      resolvedCityId = city.id;
      cityNameForEmail = city.name;
      stateNameForEmail = city.state.name;
      zipForLead = data.zipCode ?? "00000";
    } else {
      const zipRecord = await prisma.zipCode.findUnique({
        where: { code: data.zipCode! },
        include: { city: { include: { state: true } } },
      });
      if (!zipRecord) {
        return NextResponse.json(
          { error: "We don't currently serve this zip code." },
          { status: 422 }
        );
      }
      resolvedCityId = zipRecord.city.id;
      cityNameForEmail = zipRecord.city.name;
      stateNameForEmail = zipRecord.city.state.name;
      zipForLead = data.zipCode!;
    }

    // ── Verify service ────────────────────────────────────────────────────────
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: "Invalid service" }, { status: 422 });
    }

    // ── Determine lead price (city/service page override > service default) ──
    const servicePage = await prisma.servicePage.findUnique({
      where: {
        cityId_serviceId: {
          cityId: resolvedCityId,
          serviceId: service.id,
        },
      },
    });

    const leadPrice = servicePage
      ? Number(servicePage.leadPrice)
      : Number(service.baseLeadPrice);

    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      null;
    const userAgent = headersList.get("user-agent") ?? null;
    const referer = headersList.get("referer") ?? null;

    // ── Build notes ───────────────────────────────────────────────────────────
    const noteParts: string[] = [];
    if (data.vehicleType === "automotive") noteParts.push("AUTOMOTIVE VEHICLE");
    if (data.vehicleDetails) noteParts.push(`Make/Model: ${data.vehicleDetails}`);
    if (data.notes) noteParts.push(data.notes);
    const combinedNotes = noteParts.length > 0 ? noteParts.join(" | ") : undefined;

    // ── Create lead ───────────────────────────────────────────────────────────
    const lead = await prisma.lead.create({
      data: {
        cityId: resolvedCityId,
        serviceId: service.id,
        status: "NEW",
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        boatSize: data.boatSize,
        boatType: data.boatType,
        boatYear: data.boatYear,
        boatMake: data.boatMake ?? data.vehicleDetails,
        zipCode: zipForLead,
        notes: combinedNotes,
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
        leadPrice,
        ipAddress,
        userAgent,
        referrerUrl: referer,
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
      },
    });

    // ── Broadcast to ACTIVE companies in city — fire and forget ──────────────
    prisma.company
      .findMany({
        where: {
          cityId: resolvedCityId,
          status: "ACTIVE",
          email: { not: null },
        },
        select: { name: true, email: true },
      })
      .then((companies) => {
        const recipients = companies.filter(
          (c): c is { name: string; email: string } => c.email !== null
        );
        if (recipients.length > 0) {
          return sendNewLeadNotification(
            {
              leadId: lead.id,
              cityName: cityNameForEmail,
              stateName: stateNameForEmail,
              serviceName: service.name,
              boatSize: data.boatSize,
              leadPrice,
            },
            recipients
          );
        }
      })
      .catch((err) => {
        console.error("[leads/route] Email broadcast error:", err);
      });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
