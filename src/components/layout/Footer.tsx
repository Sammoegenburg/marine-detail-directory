// src/components/layout/Footer.tsx

import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-slate-50 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-[#1d1d1f] mb-3">
              <img src="/images/logo.png" alt="Marine Detail Directory" className="h-6 w-auto" />
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
              <li><Link href="/#quote-form" className="hover:text-black">Get Free Quotes</Link></li>
              <li><Link href="/florida" className="hover:text-black">Browse Areas</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 mb-3 text-sm">For Businesses</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/register" className="hover:text-black">List Your Business</Link></li>
              <li><Link href="/login" className="hover:text-black">Sign In</Link></li>
              <li><Link href="/company/leads" className="hover:text-black">Buy Leads</Link></li>
              <li><Link href="/company/billing" className="hover:text-black">Billing</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} MarineDetailDirectory.com. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-black">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-black">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
