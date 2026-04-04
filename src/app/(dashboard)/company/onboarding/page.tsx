// src/app/(dashboard)/company/onboarding/page.tsx
// Onboarding is now handled inside CompanyDashboardApp at /company

import { redirect } from "next/navigation";

export default function OnboardingPage() {
  redirect("/company");
}
