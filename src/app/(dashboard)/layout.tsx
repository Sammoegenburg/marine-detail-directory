// src/app/(dashboard)/layout.tsx
// Dashboard layout — session guard + sidebar + company status check

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  // Fetch pending verification count for admins to display in sidebar
  const pendingVerifications =
    role === "ADMIN"
      ? await prisma.company.count({ where: { status: "PENDING" } })
      : 0;

  // For company users, enforce status-based access
  if (role === "COMPANY") {
    const company = await prisma.company.findUnique({
      where: { userId: session.user.id },
      select: { status: true },
    });

    if (!company || company.status === "UNCLAIMED" || company.status === "SUSPENDED") {
      redirect("/");
    }

    if (company.status === "PENDING") {
      return (
        <div className="flex min-h-screen bg-slate-50">
          <DashboardSidebar role={role} pendingVerifications={0} />
          <div className="flex-1 overflow-auto">
            <div className="max-w-5xl mx-auto px-6 py-8">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-10 text-center">
                <h1 className="text-2xl font-bold text-amber-900 mb-3">Your profile is under review</h1>
                <p className="text-amber-700 max-w-md mx-auto">
                  Our team is verifying your business. You&apos;ll receive an email once your profile is approved and you can start receiving leads.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar role={role} pendingVerifications={pendingVerifications} />
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
