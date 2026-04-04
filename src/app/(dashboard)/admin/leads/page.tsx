// src/app/(dashboard)/admin/leads/page.tsx
// Admin lead management — full platform lead table

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700 border-blue-200",
  AVAILABLE: "bg-green-100 text-green-700 border-green-200",
  PURCHASED: "bg-purple-100 text-purple-700 border-purple-200",
  EXPIRED: "bg-slate-100 text-slate-500 border-slate-200",
  REFUNDED: "bg-red-100 text-red-600 border-red-200",
};

const boatSizeLabels: Record<string, string> = {
  UNDER_20FT: "<20 ft",
  TWENTY_TO_30FT: "20–30 ft",
  THIRTY_TO_40FT: "30–40 ft",
  OVER_40FT: ">40 ft",
};

export default async function AdminLeadsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      service: true,
      city: { include: { state: true } },
      purchases: { select: { id: true } },
    },
  });

  const totalRevenue = await prisma.leadPurchase.aggregate({
    _sum: { amountCharged: true },
    where: { paidAt: { not: null } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-500">
            {leads.length} most recent · ${Number(totalRevenue._sum.amountCharged ?? 0).toFixed(2)} total revenue
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Customer</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Phone</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Service</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Location</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Boat</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">Price</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400">
                    No leads yet.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{lead.customerName}</p>
                      <p className="text-slate-400 text-xs">{lead.zipCode}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-xs">
                      <a href={`mailto:${lead.customerEmail}`} className="hover:underline text-blue-700">
                        {lead.customerEmail}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-700 text-xs">
                      <a href={`tel:${lead.customerPhone}`} className="hover:underline">
                        {lead.customerPhone}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{lead.service.name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {lead.city.name}, {lead.city.state.abbreviation}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {boatSizeLabels[lead.boatSize] ?? lead.boatSize}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-xs ${statusColors[lead.status] ?? ""}`}
                      >
                        {lead.status}
                        {lead.purchases.length > 0 && (
                          <span className="ml-1 opacity-60">·{lead.purchases.length}</span>
                        )}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">
                      ${Number(lead.leadPrice).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
