// src/app/(dashboard)/company/profile/page.tsx
// Profile editing is now handled inside CompanyDashboardApp at /company

import { redirect } from "next/navigation";

export default function CompanyProfilePage() {
  redirect("/company");
}
