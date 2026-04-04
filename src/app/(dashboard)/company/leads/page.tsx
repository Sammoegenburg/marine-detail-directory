// src/app/(dashboard)/company/leads/page.tsx
// Lead inbox is now handled inside CompanyDashboardApp at /company

import { redirect } from "next/navigation";

export default function CompanyLeadsPage() {
  redirect("/company");
}
