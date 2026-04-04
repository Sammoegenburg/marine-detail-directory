// src/components/layout/DashboardSidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Anchor,
  LayoutDashboard,
  Users,
  DollarSign,
  Settings,
  CreditCard,
  Inbox,
  ShieldCheck,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
};

function buildAdminNav(pendingVerifications: number): NavItem[] {
  return [
    { href: "/admin", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
    {
      href: "/admin/verifications",
      label: "Verifications",
      icon: <ShieldCheck className="h-4 w-4" />,
      badge: pendingVerifications,
    },
    { href: "/admin/companies", label: "Companies", icon: <Users className="h-4 w-4" /> },
    { href: "/admin/leads", label: "Leads", icon: <Inbox className="h-4 w-4" /> },
    { href: "/admin/pricing", label: "Lead Pricing", icon: <DollarSign className="h-4 w-4" /> },
  ];
}

const companyNav: NavItem[] = [
  { href: "/company", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/company/leads", label: "Lead Inbox", icon: <Inbox className="h-4 w-4" /> },
  { href: "/company/profile", label: "My Profile", icon: <Settings className="h-4 w-4" /> },
  { href: "/company/billing", label: "Billing", icon: <CreditCard className="h-4 w-4" /> },
];

type Props = {
  role: "ADMIN" | "COMPANY";
  pendingVerifications?: number;
};

export function DashboardSidebar({ role, pendingVerifications = 0 }: Props) {
  const pathname = usePathname();
  const items = role === "ADMIN" ? buildAdminNav(pendingVerifications) : companyNav;

  return (
    <aside className="w-60 shrink-0 border-r bg-white min-h-screen px-3 py-6">
      <Link href="/" className="flex items-center gap-2 font-bold text-blue-700 px-3 mb-6">
        <Anchor className="h-5 w-5" />
        <span className="text-sm">MarineDetail</span>
      </Link>

      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-amber-500 text-white text-xs font-bold px-1">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
