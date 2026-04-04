// src/app/company/page.tsx
// Company dashboard server component — isolated from the old (dashboard) layout

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import CompanyApp from "@/components/dashboard/CompanyApp";
import type {
  SerializedCompany,
  SerializedAvailableLead,
  SerializedPurchasedLead,
  PaymentMethodData,
} from "@/components/dashboard/CompanyDashboardApp";
import type Stripe from "stripe";

export default async function CompanyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const role = (session.user as { role?: string }).role;
  if (role === "ADMIN") redirect("/admin");

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
    include: {
      city: { include: { state: true } },
      services: { include: { service: true } },
      leadPurchases: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { lead: { include: { service: true } } },
      },
    },
  });

  // No company → show onboarding inside CompanyApp (company prop is null)
  if (!company) {
    return (
      <CompanyApp
        company={null}
        availableLeads={[]}
        purchasedLeads={[]}
        paymentMethod={null}
      />
    );
  }

  // Leads available in this company's city
  const rawAvailable = await prisma.lead.findMany({
    where: {
      cityId: company.cityId,
      status: { in: ["NEW", "AVAILABLE"] },
      expiresAt: { gt: new Date() },
      purchases: { none: { companyId: company.id } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      service: true,
      city: { include: { state: true } },
    },
  });

  // Purchased leads for this company
  const rawPurchased = await prisma.leadPurchase.findMany({
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
  });

  // Fetch Stripe payment method
  let paymentMethod: PaymentMethodData | null = null;
  if (company.stripeCustomerId) {
    try {
      const customer = (await stripe.customers.retrieve(
        company.stripeCustomerId
      )) as Stripe.Customer;
      const defaultPmId =
        customer.invoice_settings?.default_payment_method as string | null;
      if (defaultPmId) {
        const pm = await stripe.paymentMethods.retrieve(defaultPmId);
        if (pm.card) {
          paymentMethod = {
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          };
        }
      }
    } catch {
      // Stripe customer may not exist yet
    }
  }

  const totalSpend = company.leadPurchases.reduce(
    (sum, p) => sum + Number(p.amountCharged),
    0
  );

  // Anonymize available leads: first name + last initial
  const availableLeads: SerializedAvailableLead[] = rawAvailable.map((lead) => {
    const parts = lead.customerName.trim().split(" ");
    const first = parts[0] ?? "";
    const lastInitial = parts.length > 1 ? ` ${parts[parts.length - 1][0]}.` : "";
    return {
      id: lead.id,
      vehicleType: lead.vehicleType,
      customerName: `${first}${lastInitial}`,
      serviceName: lead.service.name,
      serviceCategory: lead.service.category,
      cityName: lead.city.name,
      stateAbbr: lead.city.state.abbreviation,
      leadPrice: Number(lead.leadPrice),
      boatSize: lead.boatSize ?? null,
      boatType: lead.boatType ?? null,
      boatMake: lead.boatMake ?? null,
      boatYear: lead.boatYear ?? null,
      notes: lead.notes ?? null,
      createdAt: lead.createdAt.toISOString(),
    };
  });

  const purchasedLeads: SerializedPurchasedLead[] = rawPurchased.map((purchase) => {
    const lead = purchase.lead;
    return {
      id: lead.id,
      purchaseId: purchase.id,
      vehicleType: lead.vehicleType,
      customerName: lead.customerName,
      customerEmail: lead.customerEmail,
      customerPhone: lead.customerPhone,
      serviceName: lead.service.name,
      cityName: lead.city.name,
      stateAbbr: lead.city.state.abbreviation,
      leadPrice: Number(lead.leadPrice),
      amountCharged: Number(purchase.amountCharged),
      boatSize: lead.boatSize ?? null,
      boatType: lead.boatType ?? null,
      boatMake: lead.boatMake ?? null,
      boatYear: lead.boatYear ?? null,
      notes: lead.notes ?? null,
      createdAt: lead.createdAt.toISOString(),
    };
  });

  const serializedCompany: SerializedCompany = {
    id: company.id,
    name: company.name,
    slug: company.slug,
    status: company.status,
    email: company.email ?? null,
    phone: company.phone ?? null,
    website: company.website ?? null,
    address: company.address ?? null,
    description: company.description ?? null,
    stripeCustomerId: company.stripeCustomerId ?? null,
    leadCreditBalance: Number(company.leadCreditBalance),
    averageRating: company.averageRating ? Number(company.averageRating) : null,
    reviewCount: company.reviewCount,
    totalSpend,
    cityName: company.city.name,
    stateAbbr: company.city.state.abbreviation,
    services: company.services.map((cs) => ({
      category: cs.service.category,
      serviceName: cs.service.name,
    })),
    billingHistory: company.leadPurchases.map((p) => ({
      id: p.id,
      serviceName: p.lead.service.name,
      amountCharged: Number(p.amountCharged),
      createdAt: p.createdAt.toISOString(),
      isRefunded: p.isRefunded,
      stripePaymentIntentId: p.stripePaymentIntentId ?? null,
    })),
  };

  return (
    <CompanyApp
      company={serializedCompany}
      availableLeads={availableLeads}
      purchasedLeads={purchasedLeads}
      paymentMethod={paymentMethod}
    />
  );
}
