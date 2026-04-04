// src/app/(dashboard)/admin/layout.tsx
// Strict ADMIN role guard — redirects non-admins to homepage

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;

  if (role !== "ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}
