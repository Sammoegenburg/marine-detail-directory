// src/app/(dashboard)/company/page.tsx
// Company dashboard — lead inbox, stats, quick links

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LeadCard } from "@/components/dashboard/LeadCard";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  Inbox, DollarSign, Star, ArrowRight, CreditCard, UserCircle,
  CheckCircle2, Sparkles,
} from "lucide-react";
import type { BoatSize, ServiceCategory, LeadStatus } from "@/types";

export default async function CompanyDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
    include: {
      city: { include: { state: true } },
      services: { include: { service: true } },
      leadPurchases: {
        select: { id: true, amountCharged: true },
      },
    },
  });

  // No company → layout should have already redirected, but guard here too
  if (!company) redirect("/company/onboarding");

  const totalSpend = company.leadPurchases.reduce(
    (sum, p) => sum + Number(p.amountCharged),
    0
  );

  // Leads in the company's city that haven't expired
  const availableLeads = await prisma.lead.findMany({
    where: {
      cityId: company.cityId,
      status: { in: ["NEW", "AVAILABLE"] },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      service: true,
      city: { include: { state: true } },
      purchases: { where: { companyId: company.id }, select: { id: true } },
    },
  });

  // Purchased lead IDs for this company
  const purchasedLeadIds = new Set(
    availableLeads
      .filter((l) => l.purchases.length > 0)
      .map((l) => l.id)
  );

  // Profile completeness
  const profileFields = [company.name, company.phone, company.email, company.address, company.website];
  const filledFields = profileFields.filter(Boolean).length;
  const profilePct = Math.round((filledFields / profileFields.length) * 100);

  const hasPayment = !!company.stripeCustomerId;

  const onboarded = false; // banner controlled by ?onboarded= param (client only)
  void onboarded;

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-[#1d1d1f]">{company.name}</h1>
            <Badge
              className={
                company.status === "ACTIVE"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : company.status === "PENDING"
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-slate-100 text-slate-600"
              }
              variant="outline"
            >
              {company.status}
            </Badge>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            {company.city.name}, {company.city.state.abbreviation}
            {company.services.length > 0 && (
              <> · {company.services.length} service{company.services.length !== 1 ? "s" : ""} listed</>
            )}
          </p>
        </div>
        <Link
          href="/company/leads"
          className="inline-flex items-center gap-1.5 bg-[#ff385c] hover:bg-[#e0334f] text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <Inbox className="h-4 w-4" /> View All Leads
        </Link>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Inbox className="h-3.5 w-3.5" /> Available in Your Area
          </div>
          <p className="text-3xl font-bold text-[#1d1d1f]">{availableLeads.length}</p>
          <p className="text-xs text-gray-400 mt-1">leads ready to unlock</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <DollarSign className="h-3.5 w-3.5" /> Total Spend
          </div>
          <p className="text-3xl font-bold text-[#1d1d1f]">${totalSpend.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{company.leadPurchases.length} leads unlocked</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Star className="h-3.5 w-3.5" /> Avg. Rating
          </div>
          <p className="text-3xl font-bold text-[#1d1d1f]">
            {company.averageRating ? Number(company.averageRating).toFixed(1) : "—"}
          </p>
          <p className="text-xs text-gray-400 mt-1">{company.reviewCount} reviews</p>
        </div>
      </div>

      {/* ── Setup Cards (sidebar-style) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Payment Method */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-start gap-4">
          <div className={`p-2.5 rounded-xl ${hasPayment ? "bg-green-100" : "bg-[#ff385c]/10"}`}>
            <CreditCard className={`h-5 w-5 ${hasPayment ? "text-green-600" : "text-[#ff385c]"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#1d1d1f] text-sm">Payment Method</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {hasPayment ? "Card on file — ready to unlock leads" : "Add a card to unlock leads instantly"}
            </p>
          </div>
          <Link
            href="/company/billing"
            className="text-xs font-semibold text-[#ff385c] hover:underline flex items-center gap-0.5 shrink-0"
          >
            {hasPayment ? "Manage" : "Add"} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Profile */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-start gap-4">
          <div className={`p-2.5 rounded-xl ${profilePct === 100 ? "bg-green-100" : "bg-blue-50"}`}>
            <UserCircle className={`h-5 w-5 ${profilePct === 100 ? "text-green-600" : "text-blue-500"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#1d1d1f] text-sm">Business Profile</p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ff385c] rounded-full transition-all"
                  style={{ width: `${profilePct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-500">{profilePct}%</span>
            </div>
          </div>
          <Link
            href="/company/profile"
            className="text-xs font-semibold text-[#ff385c] hover:underline flex items-center gap-0.5 shrink-0"
          >
            Edit <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* ── Lead Inbox ── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-[#1d1d1f] text-lg">Lead Inbox</h2>
            <p className="text-sm text-gray-500 mt-0.5">Customers requesting quotes in your area</p>
          </div>
          <Link
            href="/company/leads"
            className="text-sm text-[#ff385c] hover:underline font-semibold flex items-center gap-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {availableLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={{
                  ...lead,
                  status: lead.status as LeadStatus,
                  boatSize: lead.boatSize as BoatSize,
                  leadPrice: Number(lead.leadPrice),
                  service: {
                    ...lead.service,
                    category: lead.service.category as ServiceCategory,
                  },
                }}
                isPurchased={purchasedLeadIds.has(lead.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-50 mb-4">
              <Sparkles className="h-6 w-6 text-gray-300" />
            </div>
            <h3 className="font-semibold text-[#1d1d1f] mb-2">No leads yet</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              When a customer in your area requests a quote, you&apos;ll see it here. We&apos;ll notify you right away.
            </p>
          </div>
        )}
      </div>

      {/* ── Pro tip ── */}
      {!hasPayment && (
        <div className="rounded-2xl border border-[#ff385c]/20 bg-[#ff385c]/5 p-5 flex items-start gap-4">
          <CheckCircle2 className="h-5 w-5 text-[#ff385c] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[#1d1d1f] text-sm">Add a payment method to unlock leads</p>
            <p className="text-xs text-gray-500 mt-0.5">
              You&apos;re only charged when you choose to unlock a lead. No monthly fees.{" "}
              <Link href="/company/billing" className="text-[#ff385c] underline font-semibold">
                Set up billing →
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
