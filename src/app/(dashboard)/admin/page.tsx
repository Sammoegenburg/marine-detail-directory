// src/app/(dashboard)/admin/page.tsx
// Admin Overview Dashboard

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Building2, Inbox, ShoppingCart, DollarSign, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [
    activeCompanyCount,
    totalLeadCount,
    totalPurchaseCount,
    revenueResult,
    recentLeads,
    recentClaims,
  ] = await Promise.all([
    prisma.company.count({ where: { status: "ACTIVE" } }),
    prisma.lead.count(),
    prisma.leadPurchase.count(),
    prisma.leadPurchase.aggregate({
      _sum: { amountCharged: true },
      where: { paidAt: { not: null } },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        service: true,
        city: { include: { state: true } },
      },
    }),
    prisma.company.findMany({
      where: { status: { in: ["PENDING", "ACTIVE"] }, userId: { not: null } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: {
        user: { select: { email: true } },
        city: { include: { state: true } },
      },
    }),
  ]);

  const totalRevenue = Number(revenueResult._sum.amountCharged ?? 0);

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700 border-green-200",
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    UNCLAIMED: "bg-slate-100 text-slate-500 border-slate-200",
    SUSPENDED: "bg-red-100 text-red-600 border-red-200",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
        <p className="text-slate-500">Platform-wide metrics and recent activity.</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <Building2 className="h-4 w-4" /> Active Companies
          </div>
          <p className="text-3xl font-bold text-slate-900">{activeCompanyCount}</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <Inbox className="h-4 w-4" /> Leads Submitted
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalLeadCount}</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <ShoppingCart className="h-4 w-4" /> Leads Purchased
          </div>
          <p className="text-3xl font-bold text-slate-900">{totalPurchaseCount}</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
            <DollarSign className="h-4 w-4" /> Total Revenue
          </div>
          <p className="text-3xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent leads */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Inbox className="h-4 w-4 text-slate-400" /> Recent Lead Submissions
          </h2>
          {recentLeads.length > 0 ? (
            <div className="space-y-3">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {lead.customerName.split(" ")[0]} · {lead.service.name}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {lead.city.name}, {lead.city.state.abbreviation}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-slate-700 font-medium">${Number(lead.leadPrice).toFixed(2)}</p>
                    <p className="text-slate-300 text-xs flex items-center justify-end gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-4">No leads yet.</p>
          )}
        </div>

        {/* Recent claims */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400" /> Recent Profile Claims
          </h2>
          {recentClaims.length > 0 ? (
            <div className="space-y-3">
              {recentClaims.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between text-sm py-2 border-b last:border-0"
                >
                  <div className="min-w-0 mr-3">
                    <p className="font-medium text-slate-800 truncate">{company.name}</p>
                    <p className="text-slate-400 text-xs truncate">
                      {company.user?.email ?? "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-xs ${statusColors[company.status] ?? ""}`}
                    >
                      {company.status}
                    </Badge>
                    <p className="text-slate-300 text-xs mt-1">
                      {new Date(company.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-4">No claims yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
