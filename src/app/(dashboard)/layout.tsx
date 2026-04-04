// src/app/(dashboard)/layout.tsx
// Dashboard layout — session guard + sidebar

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role as "ADMIN" | "COMPANY";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar role={role} />
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
