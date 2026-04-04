// src/components/layout/Footer.tsx

import Link from "next/link";
import { Handshake } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="max-w-[1200px] mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#ff385c] flex items-center justify-center">
                <Handshake size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-black tracking-tight italic uppercase text-[#1d1d1f]">
                Detail<span className="text-[#ff385c]">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-xs font-medium leading-relaxed">
              The national marketplace connecting boat and vehicle owners with
              elite, vetted detailing professionals.
            </p>
          </div>

          <div>
            <h4 className="font-black text-[#1d1d1f] mb-4 text-sm uppercase tracking-tight">For Owners</h4>
            <ul className="space-y-3 text-sm text-slate-500 font-medium">
              <li><Link href="/#how-it-works" className="hover:text-black transition-colors">How It Works</Link></li>
              <li><Link href="/" className="hover:text-black transition-colors">Find Specialists</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-[#1d1d1f] mb-4 text-sm uppercase tracking-tight">For Businesses</h4>
            <ul className="space-y-3 text-sm text-slate-500 font-medium">
              <li><Link href="/register" className="hover:text-black transition-colors">List Your Company</Link></li>
              <li><Link href="/login" className="hover:text-black transition-colors">Sign In</Link></li>
              <li><Link href="/company/leads" className="hover:text-black transition-colors">Buy Leads</Link></li>
              <li><Link href="/company/billing" className="hover:text-black transition-colors">Billing</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium">
          <p>&copy; {new Date().getFullYear()} DetailHub. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
