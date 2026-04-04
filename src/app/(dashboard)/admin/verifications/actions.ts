"use server";

// src/app/(dashboard)/admin/verifications/actions.ts
// Server actions: approve and reject pending company claims

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendClaimApprovalEmail, sendClaimRejectionEmail } from "@/lib/brevo";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") throw new Error("Unauthorized");
}

export async function approveCompany(companyId: string): Promise<void> {
  await requireAdmin();

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      user: true,
      city: { include: { state: true } },
    },
  });

  if (!company) throw new Error("Company not found");

  await prisma.company.update({
    where: { id: companyId },
    data: { status: "ACTIVE" },
  });

  if (company.user?.email) {
    await sendClaimApprovalEmail(
      company.user.email,
      company.name,
      company.city.name,
      company.city.state.name
    );
  }

  revalidatePath("/admin/verifications");
  revalidatePath("/admin");
}

export async function rejectCompany(companyId: string): Promise<void> {
  await requireAdmin();

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      user: true,
      city: { include: { state: true } },
    },
  });

  if (!company) throw new Error("Company not found");

  await prisma.company.update({
    where: { id: companyId },
    data: {
      userId: null,
      status: "UNCLAIMED",
      email: null,
    },
  });

  if (company.user?.email) {
    await sendClaimRejectionEmail(
      company.user.email,
      company.name,
      company.city.name,
      company.city.state.name
    );
  }

  revalidatePath("/admin/verifications");
  revalidatePath("/admin");
}
