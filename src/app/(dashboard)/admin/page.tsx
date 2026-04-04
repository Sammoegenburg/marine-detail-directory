// src/app/(dashboard)/admin/page.tsx
// Admin overview dashboard

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Building2, Inbox, MapPin, DollarSign } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/company");
  }

  const [companyCount, leadCount, cityCount, pendingClaims] = await Promise.all([
    prisma.company.count(),
    prisma.lead.count(),
    prisma.city.count(),
    prisma.claimRequest.count({ where: { status: "PENDING" } }),
  ]);

  const recentLeads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { service: true, city: { include: { state: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
        <p className="text-slate-500">Platform-wide stats and management.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Building2 className="h-4 w-4" /> Companies
          </div>
          <p className="text-3xl font-bold text-slate-900">{companyCount}</p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Inbox className="h-4 w-4" /> Total Leads
          </div>
          <p className="text-3xl font-bold text-slate-900">{leadCount}</p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <MapPin className="h-4 w-4" /> Cities
          </div>
          <p className="text-3xl font-bold text-slate-900">{cityCount}</p>
        </div>
        <div className="rounded-lg border bg-amber-50 border-amber-200 p-5">
          <div className="flex items-center gap-2 text-amber-600 text-sm mb-1">
            <DollarSign className="h-4 w-4" /> Pending Claims
          </div>
          <p className="text-3xl font-bold text-amber-700">{pendingClaims}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Recent Leads</h2>
        {recentLeads.length > 0 ? (
          <div className="space-y-3">
            {recentLeads.map((lead) => (
              <div key={lead.id} className="flex items-center justify-between text-sm py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-slate-800">{lead.service.name}</p>
                  <p className="text-slate-400 text-xs">
                    {lead.city.name}, {lead.city.state.abbreviation} · {lead.zipCode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">${Number(lead.leadPrice).toFixed(2)}</p>
                  <p className="text-slate-300 text-xs">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No leads yet.</p>
        )}
      </div>
    </div>
  );
}
