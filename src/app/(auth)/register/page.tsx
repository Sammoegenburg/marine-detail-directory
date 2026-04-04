// src/app/(auth)/register/page.tsx
// Server component: resolves ?claim= param and passes company context to form

import { prisma } from "@/lib/prisma";
import { RegisterForm } from "@/components/auth/RegisterForm";

type Props = {
  searchParams: Promise<{ claim?: string }>;
};

export default async function RegisterPage({ searchParams }: Props) {
  const { claim } = await searchParams;

  let claimCompany: { name: string; cityName: string; stateName: string } | null = null;

  if (claim) {
    const company = await prisma.company.findUnique({
      where: { slug: claim, status: "UNCLAIMED" },
      include: { city: { include: { state: true } } },
    });

    if (company) {
      claimCompany = {
        name: company.name,
        cityName: company.city.name,
        stateName: company.city.state.name,
      };
    }
  }

  return <RegisterForm claimSlug={claim} claimCompany={claimCompany} />;
}
