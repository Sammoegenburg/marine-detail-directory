// src/app/(dashboard)/admin/companies/page.tsx
// Company management — searchable master table

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 border-green-200",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  UNCLAIMED: "bg-slate-100 text-slate-500 border-slate-200",
  SUSPENDED: "bg-red-100 text-red-600 border-red-200",
};

export default async function AdminCompaniesPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const companies = await prisma.company.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { city: { name: { contains: query, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      city: { include: { state: true } },
      _count: { select: { leadPurchases: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
        <p className="text-slate-500">All {companies.length} listings on the platform.</p>
      </div>

      {/* Search */}
      <form method="GET">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by name or city…"
            className="w-full rounded-lg border bg-white pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Company</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">City / State</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-700">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">Leads Purchased</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-700">Created</th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">
                    No companies found{query ? ` matching "${query}"` : ""}.
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/companies/${company.slug}`}
                        className="font-medium text-blue-700 hover:underline"
                        target="_blank"
                      >
                        {company.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {company.city.name}, {company.city.state.abbreviation}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`text-xs ${statusColors[company.status] ?? ""}`}
                      >
                        {company.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 font-medium">
                      {company._count.leadPurchases}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400">
                      {new Date(company.createdAt).toLocaleDateString()}
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
