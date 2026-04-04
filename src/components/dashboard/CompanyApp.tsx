"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, Inbox, UserCircle, CreditCard, MapPin, ChevronRight,
  Zap, CheckCircle2, Ship, Car, TrendingUp, Plus, Globe, Phone, Mail,
  Building2, ShieldCheck, Lock, User, Navigation, Maximize2, Info, X,
  Search, Check, Receipt, CreditCard as CardIcon, Download, LockKeyhole,
  Sparkles, Loader2, LogOut
} from 'lucide-react';

// --- Global Stylings ---
function TypographyStyle() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
      :root { --font-main: 'Inter', sans-serif; }
      body { font-family: var(--font-main); -webkit-font-smoothing: antialiased; background-color: #F8F9FA; color: #1d1d1f; font-size: 13px; }
      .tactical-glass { background: rgba(10, 10, 12, 0.95); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); }
      @media (min-width: 768px) { .tactical-glass:hover { border: 1px solid rgba(255, 56, 92, 0.4); box-shadow: 0 15px 35px -10px rgba(255, 56, 92, 0.2); } }
      input[type='range'] { -webkit-appearance: none; background: transparent; }
      input[type='range']::-webkit-slider-runnable-track { width: 100%; height: 4px; background: #E2E8F0; border-radius: 4px; }
      input[type='range']::-webkit-slider-thumb { height: 16px; width: 16px; border-radius: 50%; background: #ff385c; cursor: pointer; -webkit-appearance: none; margin-top: -7px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
      ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .animate-spin-custom { animation: spin 1s linear infinite; }
    `}} />
  );
}

// --- Constants ---
const MARINE_SERVICES = ['Boat Full Detail', 'Hull Cleaning', 'Wax & Polish', 'Teak Restoration', 'Bottom Paint', 'Brightwork', 'Ceramic Coating', 'Gelcoat Repair'];
const AUTO_SERVICES = ['Car Full Detail', 'Car Interior', 'Car Exterior Wash', 'Paint Correction', 'Ceramic Coating', 'Window Tint', 'Engine Bay Detail', 'Headlight Restoration'];

// --- Types ---
interface Lead {
  id: string;
  type: string;
  title: string;
  service: string;
  subService: string;
  location: string;
  price: number;
  specs: string;
  customerName?: string;
  phone?: string;
  email?: string;
  customerAddress?: string;
  servicesRequested?: string[];
  purchasedAt?: string;
}

// --- Sub-components ---
function SidebarItem({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all duration-300 ${active ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}`}>
      <Icon size={15} strokeWidth={active ? 2.5 : 2} />
      <span className={`text-[12px] font-bold ${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
      {active && <div className="ml-auto w-1 h-1 rounded-full bg-[#ff385c]" />}
    </button>
  );
}

function MobileNavItem({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all ${active ? 'text-[#ff385c]' : 'text-gray-400'}`}>
      <Icon size={18} strokeWidth={active ? 2.5 : 2} />
      <span className="text-[9px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );
}

function LeadTile({ lead, purchased = false, onOpen }: { lead: Lead; purchased?: boolean; onOpen: (l: Lead) => void }) {
  return (
    <div onClick={() => onOpen(lead)} className="tactical-glass group relative rounded-2xl p-4 transition-all duration-500 cursor-pointer flex flex-col gap-3 overflow-hidden border border-white/5 shadow-md active:scale-95 md:active:scale-100">
      <div className="absolute -top-4 -right-4 opacity-[0.04] group-hover:opacity-[0.1] transition-opacity text-white pointer-events-none">
        {lead.type === 'boat' ? <Ship size={70} /> : <Car size={70} />}
      </div>
      <div className="flex justify-between items-center relative z-10">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${purchased ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-[#ff385c]/10 border-[#ff385c]/20 text-[#ff385c]'}`}>
          {lead.type === 'boat' ? <Ship size={14} /> : <Car size={14} />}
        </div>
        {!purchased ? (
          <div className="text-[14px] font-black text-white tracking-tighter">${lead.price}</div>
        ) : (
          <div className="text-[7px] font-black uppercase tracking-[0.2em] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">Claimed</div>
        )}
      </div>
      <div className="relative z-10 flex-1">
        <h3 className="text-[13px] font-bold text-white tracking-tight leading-tight group-hover:text-[#ff385c] transition-colors line-clamp-1">{lead.title}</h3>
        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mt-1">{lead.service}</span>
      </div>
      <div className="space-y-1.5 relative z-10">
        <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-medium truncate"><MapPin size={9} className="text-[#ff385c]" />{lead.location}</div>
        <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
          <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.1em]">{lead.specs}</span>
          <ChevronRight size={12} className="text-[#ff385c] group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}

function LeadDetailPanel({ lead, onClose, purchased, onPurchase }: { lead: Lead | null; onClose: () => void; purchased: boolean; onPurchase: (id: string) => void }) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState('');
  if (!lead) return null;

  const handlePurchase = async () => {
    setIsPurchasing(true);
    setError('');
    try {
      const res = await fetch(`/api/leads/${lead.id}/unlock`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to unlock lead');
      onPurchase(lead.id);
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[400] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-lg bg-white h-full shadow-2xl overflow-y-auto border-l border-gray-100 rounded-t-[2.5rem] md:rounded-none mt-12 md:mt-0">
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${purchased ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-[#ff385c]/10 border-[#ff385c]/20 text-[#ff385c]'}`}>
              {lead.type === 'boat' ? <Ship size={16} /> : <Car size={16} />}
            </div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block leading-none">Lead #{String(lead.id).slice(-6)}</span>
              <h2 className="text-base font-bold text-black tracking-tight leading-tight">{lead.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-6 pb-24 md:pb-20">
          <div className="bg-[#0D0D0E] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl border border-white/5">
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-0.5">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#ff385c]">Service Scope</span>
                <h3 className="text-lg font-bold tracking-tight">{lead.service}</h3>
                <p className="text-zinc-400 text-[11px] font-medium italic">{lead.subService}</p>
              </div>
              {!purchased && <div className="text-xl font-black tracking-tighter">${lead.price}</div>}
            </div>
            <div className="flex flex-wrap gap-2 mt-5 relative z-10">
              <div className="bg-white/5 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/10"><Maximize2 size={10} className="text-blue-400" /><span className="text-[10px] font-bold">{lead.specs}</span></div>
              <div className="bg-white/5 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/10"><MapPin size={10} className="text-[#ff385c]" /><span className="text-[10px] font-bold">{lead.location}</span></div>
            </div>
            {!purchased && (
              <>
                {error && <div className="mt-3 text-[10px] text-red-400 font-bold">{error}</div>}
                <button onClick={handlePurchase} disabled={isPurchasing} className="w-full mt-5 bg-[#ff385c] text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-[#e31c5f] transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                  {isPurchasing ? <><Loader2 size={14} className="animate-spin-custom" />Processing...</> : <>Purchase Lead — ${lead.price}</>}
                </button>
              </>
            )}
          </div>

          {purchased && lead.customerName && (
            <div className="space-y-6">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest px-1"><User size={12} className="text-blue-500" /><span>Customer Contact</span></div>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { label: 'Name', value: lead.customerName, icon: User },
                    { label: 'Phone', value: lead.phone || '—', icon: Phone, color: 'text-[#ff385c]' },
                    { label: 'Email', value: lead.email || '—', icon: Mail },
                    { label: 'Location', value: lead.customerAddress || lead.location, icon: MapPin },
                  ].map((field, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2.5"><field.icon size={12} className="text-gray-300" /><span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{field.label}</span></div>
                      <span className={`text-[11px] font-bold ${field.color || 'text-black'}`}>{String(field.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Onboarding ---
function OnboardingView({ onComplete }: { onComplete: (data: any) => void }) {
  const [step, setStep] = useState(1);
  const [specialization, setSpecialization] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', website: '', phone: '', email: '', city: '', state: '', zipCode: '', address: '', serviceArea: '', radius: 35, services: [] as string[] });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
  const toggleService = (s: string) => setFormData(prev => ({ ...prev, services: prev.services.includes(s) ? prev.services.filter(x => x !== s) : [...prev.services, s] }));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/company/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, specialization }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');
      onComplete({ ...formData, specialization });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] bg-[#F8F9FA] flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 md:mb-10 px-4">
          <div className="bg-black w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mx-auto text-white shadow-2xl mb-4 md:mb-6"><Sparkles size={24} /></div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-black uppercase mb-1 md:mb-2 leading-tight">Welcome to DetailHub</h1>
          <p className="text-gray-400 font-bold text-[11px] md:text-base tracking-tight uppercase">Let&apos;s configure your terminal settings.</p>
        </div>
        <div className="flex gap-1.5 md:gap-2 mb-8 md:mb-10 px-8 md:px-12">
          {[1, 2, 3, 4].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#ff385c]' : 'bg-gray-200'}`} />)}
        </div>
        <div className="bg-white border border-gray-200 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)]">
          {step === 1 && (
            <div className="space-y-6 md:space-y-8 text-center">
              <div><h2 className="text-lg md:text-xl font-black uppercase tracking-tight mb-1">Identify Specialization</h2><p className="text-gray-400 font-medium text-[11px] md:text-sm">Which assets do you primarily service?</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <button onClick={() => { setSpecialization('boat'); nextStep(); }} className="group h-32 md:h-48 border-2 border-gray-100 rounded-2xl md:rounded-[2.5rem] flex md:flex-col items-center justify-center gap-4 px-6 md:px-0 hover:border-[#ff385c] hover:bg-[#ff385c]/5 transition-all text-left md:text-center"><Ship size={32} className="text-gray-300 group-hover:text-[#ff385c]" /><span className="font-black uppercase tracking-widest text-[10px] md:text-[11px]">Marine Detailing</span></button>
                <button onClick={() => { setSpecialization('car'); nextStep(); }} className="group h-32 md:h-48 border-2 border-gray-100 rounded-2xl md:rounded-[2.5rem] flex md:flex-col items-center justify-center gap-4 px-6 md:px-0 hover:border-[#ff385c] hover:bg-[#ff385c]/5 transition-all text-left md:text-center"><Car size={32} className="text-gray-300 group-hover:text-[#ff385c]" /><span className="font-black uppercase tracking-widest text-[10px] md:text-[11px]">Automotive Detailing</span></button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6 md:space-y-8">
              <div className="text-center"><h2 className="text-lg md:text-xl font-black uppercase tracking-tight mb-1 md:mb-2">Business Profile</h2></div>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Company Name', icon: Building2, name: 'name', ph: 'Your Business Name' },
                  { label: 'Business Email', icon: Mail, name: 'email', ph: 'contact@yourbusiness.com' },
                  { label: 'Phone', icon: Phone, name: 'phone', ph: '(555) 000-0000' },
                  { label: 'Website (optional)', icon: Globe, name: 'website', ph: 'www.yourbusiness.com' },
                ].map((f, i) => (
                  <div key={i} className="space-y-1"><label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1">{f.label}</label><div className="relative group"><f.icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#ff385c]" /><input type="text" placeholder={f.ph} value={(formData as any)[f.name] || ''} onChange={e => setFormData({...formData, [f.name]: e.target.value})} className="w-full bg-gray-50 border border-transparent rounded-xl py-3.5 pl-11 pr-5 font-bold text-sm outline-none focus:bg-white focus:border-[#ff385c] transition-all" /></div></div>
                ))}
              </div>
              <button onClick={nextStep} className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">Continue <ChevronRight size={16} /></button>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6 md:space-y-8">
              <div className="text-center"><h2 className="text-lg md:text-xl font-black uppercase tracking-tight mb-2">Select Your Services</h2></div>
              <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                {(specialization === 'boat' ? MARINE_SERVICES : AUTO_SERVICES).map(s => (
                  <button key={s} onClick={() => toggleService(s)} className={`px-4 py-2.5 md:px-5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${formData.services.includes(s) ? 'bg-[#ff385c] border-[#ff385c] text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-black'}`}>{formData.services.includes(s) && <Check size={12} className="inline mr-1" />}{s}</button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={prevStep} className="px-5 border border-gray-100 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-gray-50 transition-all py-4">Back</button>
                <button onClick={nextStep} className="flex-1 bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-all">Set Location</button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-6 md:space-y-8">
              <div className="text-center"><h2 className="text-lg md:text-xl font-black uppercase tracking-tight mb-2">Service Territory</h2></div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-center mb-4"><span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Travel Radius</span><span className="text-2xl font-black text-[#ff385c] tracking-tighter">{formData.radius} mi</span></div>
                  <input type="range" min="5" max="150" step="5" value={formData.radius} onChange={e => setFormData({...formData, radius: parseInt(e.target.value)})} className="w-full" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1">City</label><input type="text" placeholder="Your City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-gray-50 border border-transparent rounded-xl py-3.5 px-5 font-bold text-sm outline-none focus:bg-white focus:border-[#ff385c]" /></div>
                  <div className="space-y-1"><label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1">State</label><input type="text" placeholder="FL" maxLength={2} value={formData.state} onChange={e => setFormData({...formData, state: e.target.value.toUpperCase()})} className="w-full bg-gray-50 border border-transparent rounded-xl py-3.5 px-5 font-bold text-sm outline-none focus:bg-white focus:border-[#ff385c] uppercase" /></div>
                </div>
              </div>
              {error && <div className="text-red-500 text-[11px] font-bold text-center">{error}</div>}
              <button onClick={handleSubmit} disabled={isSubmitting} className="w-full bg-[#ff385c] text-white py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-[11px] hover:bg-[#e31c5f] transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 size={16} className="animate-spin-custom" /> Saving...</> : 'Complete Terminal Setup'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Dashboard View ---
function DashboardView({ leads, purchasedLeads, setActiveTab, onOpenLead }: { leads: Lead[]; purchasedLeads: Lead[]; setActiveTab: (t: string) => void; onOpenLead: (l: Lead) => void }) {
  const lifetimeSpent = purchasedLeads.reduce((acc, l) => acc + l.price, 0);
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Zap, label: 'Available Leads', value: leads.length, color: 'text-[#ff385c]' },
          { icon: TrendingUp, label: 'Lifetime Spent', value: `$${lifetimeSpent}.00` },
          { icon: CheckCircle2, label: 'Purchased Leads', value: purchasedLeads.length }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 p-5 rounded-[1.75rem] relative overflow-hidden group shadow-sm">
            <div className="flex items-center gap-2 mb-3"><stat.icon size={14} className="text-gray-400" /><span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">{stat.label}</span></div>
            <div className={`text-3xl font-black mb-1 tracking-tighter ${stat.color || 'text-black'}`}>{String(stat.value)}</div>
          </div>
        ))}
      </div>
      {leads.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[12px] font-black tracking-tight uppercase text-gray-400">Available Opportunities</h2>
            <button onClick={() => setActiveTab('leads')} className="text-[#ff385c] text-[9px] font-black uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {leads.slice(0, 4).map(lead => <LeadTile key={lead.id} lead={lead} onOpen={onOpenLead} />)}
          </div>
        </div>
      ) : (
        <div className="py-20 text-center bg-white border border-dashed border-gray-200 rounded-[2rem]">
          <Inbox size={40} className="mx-auto text-gray-200 mb-4" />
          <h4 className="font-black text-black text-[13px] uppercase mb-2">No Leads Yet</h4>
          <p className="text-[11px] text-gray-400 max-w-sm mx-auto">When customers in your area request detailing services, their leads will appear here for you to unlock.</p>
        </div>
      )}
    </div>
  );
}

// --- Leads View ---
function LeadsView({ leads, purchasedLeads, onOpenLead }: { leads: Lead[]; purchasedLeads: Lead[]; onOpenLead: (l: Lead) => void }) {
  const [subTab, setSubTab] = useState('available');
  const displayLeads = subTab === 'available' ? leads : purchasedLeads;
  return (
    <div className="space-y-6">
      <div className="flex bg-gray-200/50 p-1 rounded-xl w-fit shadow-inner">
        <button onClick={() => setSubTab('available')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'available' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Available ({leads.length})</button>
        <button onClick={() => setSubTab('purchased')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'purchased' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>Purchased ({purchasedLeads.length})</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 pb-12">
        {displayLeads.length > 0 ? displayLeads.map(lead => <LeadTile key={lead.id} lead={lead} purchased={subTab === 'purchased'} onOpen={onOpenLead} />) : (
          <div className="col-span-full py-32 text-center bg-white border border-dashed border-gray-200 rounded-[2rem]">
            <Inbox size={32} className="mx-auto text-gray-200 mb-4" />
            <h4 className="font-bold text-black text-[12px] uppercase">No {subTab} leads</h4>
            <p className="text-[10px] text-gray-400">{subTab === 'available' ? 'New leads will appear when customers request service in your area.' : 'Leads you unlock will appear here with full contact details.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Billing View ---
function BillingView({ purchasedLeads }: { purchasedLeads: Lead[] }) {
  const totalSpent = purchasedLeads.reduce((acc, l) => acc + l.price, 0);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 p-8 rounded-[2rem] shadow-sm flex flex-col items-center justify-center min-h-[200px] text-center space-y-4">
          <CardIcon size={32} className="text-gray-300" />
          <h4 className="font-bold text-black uppercase text-[10px] tracking-widest">Payment Method</h4>
          <p className="text-[10px] text-gray-400 max-w-xs">Payment is handled securely through Stripe when you unlock a lead. Your card details are never stored on our servers.</p>
          <a href="/company/billing" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-blue-700 shadow-lg">Manage Payment</a>
        </div>
        <div className="bg-white border border-gray-200 p-8 rounded-[2rem] shadow-sm">
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Total Investment</span>
          <div className="text-5xl font-black tracking-tighter text-black mt-4">${totalSpent}.00</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Lifetime Lead Spend</div>
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
        <h3 className="text-base font-black tracking-tight text-black uppercase flex items-center gap-2 mb-8"><Receipt size={18} className="text-gray-400" /> Transaction Log</h3>
        {purchasedLeads.length > 0 ? (
          <div className="space-y-2">
            {purchasedLeads.map((lead, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center border bg-white border-gray-200 text-gray-400">{lead.type === 'boat' ? <Ship size={14} /> : <Car size={14} />}</div>
                  <div><div className="text-[12px] font-bold text-black">{lead.title}</div><div className="text-[9px] text-gray-400 font-bold uppercase">{lead.purchasedAt}</div></div>
                </div>
                <div className="text-[14px] font-black text-black">-${lead.price}.00</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-300 font-black uppercase tracking-widest text-[10px]">No transactions yet</div>
        )}
      </div>
    </div>
  );
}

// --- Main App ---
export default function CompanyApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [availableLeads, setAvailableLeads] = useState<Lead[]>([]);
  const [purchasedLeads, setPurchasedLeads] = useState<Lead[]>([]);
  const [profile, setProfile] = useState({ name: '', specialization: 'boat' });

  // Check if user has completed onboarding
  useEffect(() => {
    fetch('/api/company/profile')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('No profile');
      })
      .then(data => {
        if (data.company) {
          setIsOnboarded(true);
          setProfile({ name: data.company.name || '', specialization: 'boat' });
          // TODO: fetch real leads when API is ready
        }
      })
      .catch(() => {
        setIsOnboarded(false);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleOnboardingComplete = (data: any) => {
    setProfile({ name: data.name, specialization: data.specialization });
    setIsOnboarded(true);
  };

  const handlePurchaseLead = (leadId: string) => {
    const lead = availableLeads.find(l => l.id === leadId);
    if (lead) {
      setPurchasedLeads(prev => [{ ...lead, purchasedAt: 'Just now' }, ...prev]);
      setAvailableLeads(prev => prev.filter(l => l.id !== leadId));
    }
    setSelectedLead(null);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <TypographyStyle />
        <Loader2 size={32} className="animate-spin-custom text-[#ff385c]" />
      </div>
    );
  }

  if (!isOnboarded) {
    return (
      <>
        <TypographyStyle />
        <OnboardingView onComplete={handleOnboardingComplete} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8F9FA] pb-20 md:pb-0">
      <TypographyStyle />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-56 bg-white border-r border-gray-200 flex-col p-5 fixed h-full z-30">
        <div className="flex items-center gap-2 mb-10 px-1">
          <div className="bg-[#ff385c] p-1.5 rounded-xl text-white shadow-xl"><Zap size={18} fill="currentColor" /></div>
          <span className="text-base font-extrabold tracking-tighter uppercase italic text-black leading-none">DetailHub<span className="text-gray-300">Pro</span></span>
        </div>
        <nav className="space-y-1.5 flex-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Inbox} label="Lead Inbox" active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} />
          <SidebarItem icon={CreditCard} label="Billing" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
        </nav>
        <div className="mt-auto space-y-3 pt-6 border-t border-gray-100">
          <div className="bg-gray-50 rounded-2xl p-3.5 flex items-center gap-3 border border-gray-100 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center font-black text-black border border-gray-200 text-sm shadow-sm">{profile.name?.[0]?.toUpperCase() || 'U'}</div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[12px] font-black tracking-tight truncate text-black uppercase">{profile.name?.split(' ')[0] || 'Member'}</div>
              <div className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-none mt-1 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Active</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">
            <LogOut size={15} />
            <span className="text-[12px] font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-t border-gray-200 flex items-center justify-around px-4 z-[350]">
        <MobileNavItem icon={LayoutDashboard} label="Home" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={Inbox} label="Leads" active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} />
        <MobileNavItem icon={CreditCard} label="Billing" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
        <MobileNavItem icon={LogOut} label="Logout" active={false} onClick={handleLogout} />
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#F8F9FA] z-[30] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-[#ff385c] p-1 rounded-lg text-white shadow-lg"><Zap size={14} fill="currentColor" /></div>
          <span className="font-extrabold uppercase italic text-black tracking-tighter text-xs">DetailHub</span>
        </div>
        <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-[10px] text-white font-black">{profile.name?.[0]?.toUpperCase() || 'U'}</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 md:ml-56 p-4 md:p-12 mt-14 md:mt-0">
        <header className="mb-6 md:mb-10">
          <h1 className="text-xl md:text-2xl font-black tracking-tighter text-black mb-0.5 uppercase">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'leads' && 'Lead Inbox'}
            {activeTab === 'billing' && 'Billing & Payments'}
          </h1>
        </header>

        <div className="pb-12">
          {activeTab === 'dashboard' && <DashboardView leads={availableLeads} purchasedLeads={purchasedLeads} setActiveTab={setActiveTab} onOpenLead={setSelectedLead} />}
          {activeTab === 'leads' && <LeadsView leads={availableLeads} purchasedLeads={purchasedLeads} onOpenLead={setSelectedLead} />}
          {activeTab === 'billing' && <BillingView purchasedLeads={purchasedLeads} />}
        </div>

        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          purchased={purchasedLeads.some(l => l.id === selectedLead?.id)}
          onPurchase={handlePurchaseLead}
        />
      </main>
    </div>
  );
}
