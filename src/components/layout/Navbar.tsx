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
import { Anchor } from "lucide-react";

export async function Navbar() {
  const session = await auth();
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-700">
          <Anchor className="h-5 w-5" />
          MarineDetailDirectory
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/florida" className="hover:text-blue-700 transition-colors">
            Browse by State
          </Link>
          <Link href="/florida/miami/full-detail" className="hover:text-blue-700 transition-colors">
            Services
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                    {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <Link href="/company" className="w-full">Dashboard</Link>
                </DropdownMenuItem>
                {userRole === "ADMIN" && (
                  <DropdownMenuItem>
                    <Link href="/admin" className="w-full">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/api/auth/signout" className="w-full">Sign out</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium bg-blue-700 text-white hover:bg-blue-800 transition-colors"
              >
                List Your Business
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
