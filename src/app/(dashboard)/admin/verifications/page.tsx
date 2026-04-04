// src/app/(dashboard)/admin/verifications/page.tsx
// Verification Queue — approve or reject pending company claims

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { approveCompany, rejectCompany } from "./actions";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Building2, Clock } from "lucide-react";

export default async function VerificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const pending = await prisma.company.findMany({
    where: { status: "PENDING" },
    orderBy: { updatedAt: "asc" },
    include: {
      user: { select: { email: true, name: true, createdAt: true } },
      city: { include: { state: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Verification Queue</h1>
          <p className="text-slate-500">Review and approve pending business claim requests.</p>
        </div>
        <Badge
          className={
            pending.length > 0
              ? "bg-amber-100 text-amber-800 border-amber-200 text-sm px-3 py-1"
              : "bg-slate-100 text-slate-500 border-slate-200 text-sm px-3 py-1"
          }
          variant="outline"
        >
          {pending.length} pending
        </Badge>
      </div>

      {pending.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-white p-16 text-center">
          <CheckCircle className="h-10 w-10 text-green-400 mx-auto mb-3" />
          <p className="font-medium text-slate-700">All clear — no pending claims</p>
          <p className="text-sm text-slate-400 mt-1">New claims will appear here for review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              {/* Company info */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Building2 className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{company.name}</p>
                  <p className="text-sm text-slate-500">
                    {company.city.name}, {company.city.state.abbreviation}
                  </p>
                  {company.user && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Claimed by <span className="font-medium text-slate-600">{company.user.email}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 shrink-0">
                <Clock className="h-3.5 w-3.5" />
                {company.user?.createdAt
                  ? new Date(company.user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <form
                  action={async () => {
                    "use server";
                    await approveCompany(company.id);
                  }}
                >
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                </form>

                <form
                  action={async () => {
                    "use server";
                    await rejectCompany(company.id);
                  }}
                >
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
