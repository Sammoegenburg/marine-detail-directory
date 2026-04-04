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
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
      <div className="max-w-[1200px] mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/images/logo.png" alt="DetailHub" className="h-8 w-8" />
          <span className="text-[22px] font-black tracking-tight italic uppercase text-[#1d1d1f]">
            Detail<span className="text-[#ff385c]">Hub</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-[13px] font-semibold tracking-wide">
          <Link href="/#how-it-works" className="text-gray-600 hover:text-black transition-colors">
            How it works
          </Link>
          <Link href="/#professionals" className="text-gray-600 hover:text-black transition-colors">
            For Professionals
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-gray-100 hover:ring-gray-300 transition-all">
                  <AvatarFallback className="bg-[#ff385c] text-white font-bold text-sm">
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
                className="text-[13px] font-semibold text-gray-600 hover:text-black transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-[#ff385c] text-white px-5 py-2 rounded-full text-[13px] font-bold hover:opacity-90 transition-all shadow-sm"
              >
                List Your Company
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
