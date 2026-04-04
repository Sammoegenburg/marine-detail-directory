// src/components/layout/Footer.tsx

import Link from "next/link";
import { Anchor } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-slate-50 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-blue-700 mb-3">
              <Anchor className="h-5 w-5" />
              MarineDetailDirectory
            </Link>
            <p className="text-sm text-slate-500 max-w-xs">
              The national marketplace connecting boat owners with trusted local
              marine detailing professionals.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-sm">For Boat Owners</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/florida" className="hover:text-blue-700">Browse Detailers</Link></li>
              <li><Link href="/florida/miami/full-detail" className="hover:text-blue-700">Get a Quote</Link></li>
              <li><Link href="/florida/miami/hull-cleaning" className="hover:text-blue-700">Hull Cleaning</Link></li>
              <li><Link href="/florida/miami/interior-detail" className="hover:text-blue-700">Interior Detail</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-sm">For Businesses</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/register" className="hover:text-blue-700">List Your Business</Link></li>
              <li><Link href="/login" className="hover:text-blue-700">Sign In</Link></li>
              <li><Link href="/company/leads" className="hover:text-blue-700">Buy Leads</Link></li>
              <li><Link href="/company/billing" className="hover:text-blue-700">Billing</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} MarineDetailDirectory.com. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-blue-700">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-700">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
