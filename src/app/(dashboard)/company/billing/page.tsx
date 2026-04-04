// src/app/(dashboard)/company/billing/page.tsx
// Billing page — payment method management and purchase history

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";
import { DollarSign, Receipt, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PaymentMethodForm } from "@/components/dashboard/PaymentMethodForm";
import type Stripe from "stripe";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
    include: {
      leadPurchases: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { lead: { include: { service: true } } },
      },
    },
  });

  if (!company) redirect("/company");

  const totalSpend = company.leadPurchases.reduce(
    (sum, p) => sum + Number(p.amountCharged),
    0
  );

  // Fetch current default payment method from Stripe
  type PaymentMethodData = {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;

  let currentPaymentMethod: PaymentMethodData = null;

  if (company.stripeCustomerId) {
    try {
      const customer = await stripe.customers.retrieve(
        company.stripeCustomerId
      ) as Stripe.Customer;

      const defaultPmId = customer.invoice_settings
        ?.default_payment_method as string | null;

      if (defaultPmId) {
        const pm = await stripe.paymentMethods.retrieve(defaultPmId);
        if (pm.card) {
          currentPaymentMethod = {
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          };
        }
      }
    } catch {
      // Customer may not exist yet — ignore
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="text-slate-500">Manage your payment method and view lead purchase history.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <DollarSign className="h-4 w-4" /> Credit Balance
          </div>
          <p className="text-3xl font-bold text-slate-900">
            ${Number(company.leadCreditBalance).toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-5">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Receipt className="h-4 w-4" /> Total Spent (Lifetime)
          </div>
          <p className="text-3xl font-bold text-slate-900">${totalSpend.toFixed(2)}</p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="h-5 w-5 text-slate-500" />
          <h2 className="font-semibold text-slate-900">Payment Method</h2>
        </div>
        <Separator className="mb-5" />
        <PaymentMethodForm currentPaymentMethod={currentPaymentMethod} />
      </div>

      {/* Purchase History */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Purchase History</h2>
        <Separator className="mb-4" />
        {company.leadPurchases.length > 0 ? (
          <div className="space-y-3">
            {company.leadPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between text-sm py-2 border-b last:border-0"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    {purchase.lead.service.name} Lead
                  </p>
                  <p className="text-slate-400 text-xs">
                    {new Date(purchase.createdAt).toLocaleDateString()}
                    {purchase.isRefunded && (
                      <span className="ml-2 text-red-500 font-medium">Refunded</span>
                    )}
                    {purchase.stripePaymentIntentId && (
                      <span className="ml-2 text-slate-300">
                        · {purchase.stripePaymentIntentId.slice(-8)}
                      </span>
                    )}
                  </p>
                </div>
                <p className={`font-semibold ${purchase.isRefunded ? "line-through text-slate-400" : "text-slate-900"}`}>
                  ${Number(purchase.amountCharged).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">
            No purchases yet. Browse your lead inbox to get started.
          </p>
        )}
      </div>
    </div>
  );
}
