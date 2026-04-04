// src/app/(dashboard)/company/billing/page.tsx
// Billing is now handled inside CompanyDashboardApp at /company

import { redirect } from "next/navigation";

export default function BillingPage() {
  redirect("/company");
}
