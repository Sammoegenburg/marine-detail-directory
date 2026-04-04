// src/app/api/admin/companies/[id]/route.ts
// PATCH: admin actions — verify (set ACTIVE) or toggle featured

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("verify") }),
  z.object({ action: z.literal("feature"), isFeatured: z.boolean() }),
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (parsed.data.action === "verify") {
    await prisma.company.update({
      where: { id },
      data: { status: "ACTIVE" },
    });
    return NextResponse.json({ success: true, status: "ACTIVE" });
  }

  if (parsed.data.action === "feature") {
    await prisma.company.update({
      where: { id },
      data: { isFeatured: parsed.data.isFeatured },
    });
    return NextResponse.json({ success: true, isFeatured: parsed.data.isFeatured });
  }
}
