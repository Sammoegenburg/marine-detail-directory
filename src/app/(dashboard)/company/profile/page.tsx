// src/app/(dashboard)/company/profile/page.tsx
// Company profile editor — pre-populated form with save functionality

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileEditForm } from "@/components/dashboard/ProfileEditForm";

export default async function CompanyProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
    include: {
      city: { include: { state: true } },
      services: { include: { service: true } },
    },
  });

  if (!company) redirect("/company/onboarding");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1d1d1f]">Business Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Update your business details. Changes are reflected on your public listing.
        </p>
      </div>

      <ProfileEditForm
        company={{
          name: company.name,
          address: company.address ?? "",
          phone: company.phone ?? "",
          email: company.email ?? "",
          website: company.website ?? "",
          description: company.description ?? "",
          city: company.city.name,
          state: company.city.state.abbreviation,
          zipCode: company.zipCode ?? "",
          status: company.status,
          slug: company.slug,
          services: company.services.map((cs) => cs.service.category),
        }}
      />
    </div>
  );
}
