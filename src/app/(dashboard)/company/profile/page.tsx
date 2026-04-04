// src/app/(dashboard)/company/profile/page.tsx
// Company profile editor

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default async function CompanyProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
    include: {
      city: { include: { state: true } },
      services: { include: { service: true } },
      claimRequest: true,
    },
  });

  if (!company) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-slate-500 mb-4">
            Your account isn&apos;t linked to a business listing yet.
          </p>
          <p className="text-sm text-slate-400">
            Search for your business in our directory and click &ldquo;Claim this listing&rdquo;, or contact support to add a new listing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{company.name}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {company.city.name}, {company.city.state.abbreviation}
          </p>
        </div>
        <div className="flex items-center gap-2">
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
          <Link
            href={`/companies/${company.slug}`}
            className="text-sm text-blue-700 hover:underline"
            target="_blank"
          >
            View public listing ↗
          </Link>
        </div>
      </div>

      {/* Profile editing form will be wired in Phase 2 */}
      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Business Details</h2>
        <Separator />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Website</p>
            <p className="text-slate-800">{company.website ?? "—"}</p>
          </div>
          <div>
            <p className="text-slate-400">Year Established</p>
            <p className="text-slate-800">{company.yearEstablished ?? "—"}</p>
          </div>
          <div>
            <p className="text-slate-400">License Number</p>
            <p className="text-slate-800">{company.licenseNumber ?? "—"}</p>
          </div>
          <div>
            <p className="text-slate-400">Insured</p>
            <p className="text-slate-800">{company.isInsured ? "Yes" : "No"}</p>
          </div>
        </div>
        <p className="text-xs text-slate-400 pt-2">
          Profile editing will be available in the next update. Contact support to update your details.
        </p>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Services</h2>
        <Separator />
        {company.services.length > 0 ? (
          <div className="space-y-2">
            {company.services.map((cs) => (
              <div key={cs.id} className="flex items-center justify-between text-sm">
                <span className="text-slate-800">{cs.service.name}</span>
                <span className="text-slate-500">{cs.customPrice ?? "Price not set"}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No services added yet.</p>
        )}
      </div>
    </div>
  );
}
