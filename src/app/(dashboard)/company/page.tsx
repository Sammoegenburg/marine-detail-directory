// src/app/(dashboard)/company/page.tsx
// Company dashboard home

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LeadCard } from "@/components/dashboard/LeadCard";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Inbox, DollarSign, Star, ArrowRight } from "lucide-react";
import type { BoatSize, ServiceCategory, LeadStatus } from "@/types";

export default async function CompanyDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
    include: {
      city: { include: { state: true } },
      leadPurchases: { select: { amountCharged: true } },
    },
  });

  if (!company) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-slate-900 mb-3">No listing found</h1>
        <p className="text-slate-500 mb-6">
          Your account is not yet linked to a business listing.
        </p>
        <Link
          href="/company/profile"
          className="text-blue-700 hover:underline font-medium"
        >
          Claim or create your listing →
        </Link>
      </div>
    );
  }

  const totalSpend = company.leadPurchases.reduce(
    (sum, p) => sum + Number(p.amountCharged),
    0
  );

  const recentLeads = await prisma.lead.findMany({
    where: {
      cityId: company.cityId,
      status: { in: ["NEW", "AVAILABLE"] },
    },
    orderBy: { createdAt: "desc" },
    take: 4,
    include: {
      service: true,
      city: { include: { state: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
        <p className="text-slate-500">
          {company.city.name}, {company.city.state.abbreviation}
          {" · "}
          <Badge
            className={
              company.status === "ACTIVE"
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-amber-100 text-amber-700 border-amber-200"
            }
            variant="outline"
          >
            {company.status}
          </Badge>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Inbox className="h-4 w-4" /> Available Leads
          </div>
          <p className="text-3xl font-bold text-slate-900">{recentLeads.length}</p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <DollarSign className="h-4 w-4" /> Total Spend
          </div>
          <p className="text-3xl font-bold text-slate-900">${totalSpend.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Star className="h-4 w-4" /> Avg. Rating
          </div>
          <p className="text-3xl font-bold text-slate-900">
            {company.averageRating ? Number(company.averageRating).toFixed(1) : "—"}
          </p>
        </div>
      </div>

      {company.status === "UNCLAIMED" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">
            Your listing is not yet active.{" "}
            <Link href="/company/profile" className="underline">
              Complete your profile
            </Link>{" "}
            to go live and receive leads.
          </p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Recent Leads in Your Area</h2>
          <Link href="/company/leads" className="text-sm text-blue-700 hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {recentLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={{
                  ...lead,
                  status: lead.status as LeadStatus,
                  boatSize: lead.boatSize as BoatSize,
                  leadPrice: Number(lead.leadPrice),
                  service: { ...lead.service, category: lead.service.category as ServiceCategory },
                }}
                isPurchased={false}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-8 text-center text-slate-400">
            No new leads in your area yet. Check back soon.
          </div>
        )}
      </div>
    </div>
  );
}
