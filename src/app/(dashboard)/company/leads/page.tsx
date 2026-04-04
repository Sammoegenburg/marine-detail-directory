// src/app/(dashboard)/company/leads/page.tsx
// Company lead inbox — available leads (redacted) and purchased leads (full contact)

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { LeadCard } from "@/components/dashboard/LeadCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BoatSize, ServiceCategory, LeadStatus } from "@/types";

export default async function CompanyLeadsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });

  if (!company) redirect("/company");

  const [availableLeads, purchasedLeads] = await Promise.all([
    prisma.lead.findMany({
      where: {
        cityId: company.cityId,
        status: { in: ["NEW", "AVAILABLE"] },
        purchases: { none: { companyId: company.id } },
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      include: {
        service: true,
        city: { include: { state: true } },
      },
    }),
    prisma.leadPurchase.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      include: {
        lead: {
          include: {
            service: true,
            city: { include: { state: true } },
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lead Inbox</h1>
        <p className="text-slate-500">Purchase leads to unlock customer contact information.</p>
      </div>

      <Tabs defaultValue="available">
        <TabsList>
          <TabsTrigger value="available">
            Available ({availableLeads.length})
          </TabsTrigger>
          <TabsTrigger value="purchased">
            Purchased ({purchasedLeads.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6">
          {availableLeads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  isPurchased={false}
                  lead={{
                    id: lead.id,
                    // Only expose first name for available leads
                    customerName: lead.customerName.split(" ")[0],
                    status: lead.status as LeadStatus,
                    boatSize: lead.boatSize as BoatSize,
                    boatType: lead.boatType,
                    boatMake: lead.boatMake,
                    boatYear: lead.boatYear,
                    zipCode: lead.zipCode,
                    notes: lead.notes,
                    preferredDate: lead.preferredDate,
                    leadPrice: Number(lead.leadPrice),
                    createdAt: lead.createdAt,
                    service: {
                      name: lead.service.name,
                      category: lead.service.category as ServiceCategory,
                    },
                    city: {
                      name: lead.city.name,
                      state: { abbreviation: lead.city.state.abbreviation },
                    },
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-12 text-center text-slate-400">
              No available leads in your area right now. Check back soon.
            </div>
          )}
        </TabsContent>

        <TabsContent value="purchased" className="mt-6">
          {purchasedLeads.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchasedLeads.map((purchase) => {
                const lead = purchase.lead;
                return (
                  <LeadCard
                    key={purchase.id}
                    isPurchased={true}
                    lead={{
                      id: lead.id,
                      customerName: lead.customerName,
                      customerEmail: lead.customerEmail,
                      customerPhone: lead.customerPhone,
                      status: lead.status as LeadStatus,
                      boatSize: lead.boatSize as BoatSize,
                      boatType: lead.boatType,
                      boatMake: lead.boatMake,
                      boatYear: lead.boatYear,
                      zipCode: lead.zipCode,
                      notes: lead.notes,
                      preferredDate: lead.preferredDate,
                      leadPrice: Number(lead.leadPrice),
                      createdAt: lead.createdAt,
                      service: {
                        name: lead.service.name,
                        category: lead.service.category as ServiceCategory,
                      },
                      city: {
                        name: lead.city.name,
                        state: { abbreviation: lead.city.state.abbreviation },
                      },
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed p-12 text-center text-slate-400">
              You haven&apos;t purchased any leads yet.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
