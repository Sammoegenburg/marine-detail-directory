// src/components/layout/Navbar.tsx

import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export async function Navbar() {
  const session = await auth();
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="max-w-[1200px] mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <img src="/images/logo.png" alt="Marine Detail Directory" className="h-8 w-auto" />
          <span className="text-xl font-bold tracking-tight text-[#1d1d1f]">MarineDirectory.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-[14px] font-semibold tracking-wide">
          <Link href="/#quote-form" className="text-gray-600 hover:text-black transition-colors">
            Get Free Quotes
          </Link>
          <Link href="/#for-detailers" className="text-gray-600 hover:text-black transition-colors">
            For Pros
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-gray-100 hover:ring-gray-300 transition-all">
                  <AvatarFallback className="bg-[#1d1d1f] text-white font-bold text-sm">
                    {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl border-gray-100 shadow-lg">
                <DropdownMenuItem className="rounded-lg font-medium">
                  <Link href="/company" className="w-full">Dashboard</Link>
                </DropdownMenuItem>
                {userRole === "ADMIN" && (
                  <DropdownMenuItem className="rounded-lg font-medium">
                    <Link href="/admin" className="w-full">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-lg font-medium text-gray-500">
                  <Link href="/api/auth/signout" className="w-full">Sign out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[14px] font-semibold text-gray-600 hover:text-black transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="bg-black text-white px-5 py-2 rounded-full text-[14px] font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
              >
                For Pros
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
