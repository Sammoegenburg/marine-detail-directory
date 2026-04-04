"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MapPin, ArrowRight, Menu, X, ChevronRight, ShieldCheck, Clock, Search, Ship } from 'lucide-react';

const useScrollReveal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); }
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, isVisible };
};

const FadeUp = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div ref={ref} className={`transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
  }, [isMobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const locations = [
    { city: "St. Petersburg", href: "/florida/st-petersburg", img: "https://images.unsplash.com/photo-1643403233860-1925b64c010a?auto=format&fit=crop&w=800&q=80" },
    { city: "Miami", href: "/florida/miami", img: "https://images.unsplash.com/photo-1514214246283-d427a95c5d2f?auto=format&fit=crop&w=800&q=80" },
    { city: "Fort Lauderdale", href: "/florida/fort-lauderdale", img: "https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?auto=format&fit=crop&w=800&q=80" },
    { city: "Tampa", href: "/florida/tampa", img: "https://images.unsplash.com/photo-1506501139174-099022df5260?auto=format&fit=crop&w=800&q=80" }
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F9] font-sans text-[#1d1d1f] selection:bg-blue-200 selection:text-black overflow-x-hidden">

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled || isMobileMenuOpen ? 'bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group z-50">
            <div className="bg-black text-white p-2 rounded-lg group-hover:scale-105 transition-transform"><Ship size={20} strokeWidth={2.5} /></div>
            <span className="text-xl md:text-2xl font-bold tracking-tight">MarineDirectory.</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[14px] font-semibold tracking-wide">
            <Link href="/florida" className="text-gray-600 hover:text-black transition-colors">Locations</Link>
            <Link href="#services" className="text-gray-600 hover:text-black transition-colors">Services</Link>
            <Link href="#for-detailers" className="text-gray-600 hover:text-black transition-colors">For Detailers</Link>
            <Link href="/login" className="bg-black text-white px-6 py-2.5 rounded-full hover:bg-gray-800 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5">Sign In</Link>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden z-50 p-2 -mr-2 text-black" aria-label="Toggle Menu">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="pt-28 px-6 flex flex-col gap-8 text-2xl font-bold tracking-tight">
          <Link href="/florida" className="text-gray-900 border-b border-gray-100 pb-4">Locations</Link>
          <Link href="#services" className="text-gray-900 border-b border-gray-100 pb-4">Services</Link>
          <Link href="#for-detailers" className="text-gray-900 border-b border-gray-100 pb-4">For Detailers</Link>
          <Link href="/register" className="bg-[#ff385c] text-white w-full py-4 rounded-full mt-4 text-xl shadow-lg shadow-red-500/20 text-center">Sign In / Register</Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-36 md:pt-48 pb-20 md:pb-32 px-6 max-w-[1200px] mx-auto text-center z-10">
        <FadeUp><h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-bold tracking-tighter leading-[1.05] mb-6">The perfect finish.<br /><span className="text-gray-400">Zero friction.</span></h1></FadeUp>
        <FadeUp delay={100}><p className="text-lg md:text-2xl text-gray-500 font-medium tracking-tight mb-10 md:mb-16 max-w-2xl mx-auto px-4">Skip the phone tag. Connect instantly with top-tier, vetted marine professionals right at your slip.</p></FadeUp>
        <FadeUp delay={200} className="w-full max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="bg-white rounded-[2rem] md:rounded-full p-2 shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-gray-100 flex flex-col md:flex-row items-center divide-y md:divide-y-0 md:divide-x divide-gray-100 transition-all hover:shadow-[0_12px_50px_rgba(0,0,0,0.12)]">
            <div className="w-full md:flex-1 px-6 py-4 md:py-3 text-left hover:bg-gray-50 rounded-t-[1.5rem] md:rounded-l-full md:rounded-tr-none transition-colors cursor-text">
              <label htmlFor="location" className="block text-xs font-bold tracking-widest uppercase text-gray-800 mb-1">Where is your boat?</label>
              <input id="location" type="text" className="w-full bg-transparent border-none focus:ring-0 text-base md:text-lg p-0 text-black placeholder:text-gray-400 font-medium outline-none truncate" placeholder="Marina, City, or Zip Code" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="w-full md:flex-1 px-6 py-4 md:py-3 text-left hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="text-xs font-bold tracking-widest uppercase text-gray-800 mb-1">What does it need?</div>
              <div className="text-base md:text-lg text-gray-400 font-medium truncate">Wash, Wax, Teak...</div>
            </div>
            <div className="w-full md:w-auto p-2">
              <button type="submit" className="w-full md:w-auto bg-[#ff385c] hover:bg-[#d90b34] text-white p-4 md:px-8 rounded-[1.5rem] md:rounded-full font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/30">
                <Search size={20} strokeWidth={3} /><span className="md:hidden">Find Professionals</span>
              </button>
            </div>
          </form>
        </FadeUp>
      </section>

      {/* Cinematic Image */}
      <section className="px-4 md:px-8 max-w-[1600px] mx-auto mb-20 md:mb-32">
        <FadeUp delay={300}>
          <div className="w-full h-[40vh] md:h-[60vh] lg:h-[70vh] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-gray-900 relative shadow-2xl">
            <img src="https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=2400&q=80" alt="Luxury Yacht" className="absolute inset-0 w-full h-full object-cover opacity-90 scale-105 hover:scale-100 transition-transform duration-[10s] ease-out" />
          </div>
        </FadeUp>
      </section>

      {/* Value Props */}
      <section id="services" className="py-16 md:py-24 px-6 bg-white rounded-[2rem] md:rounded-[3rem] max-w-[1400px] mx-4 md:mx-auto shadow-sm border border-gray-100 mb-20 md:mb-32">
        <div className="max-w-[1100px] mx-auto">
          <FadeUp><h2 className="text-3xl md:text-5xl lg:text-[56px] font-bold tracking-tighter mb-12 md:mb-20 text-center leading-tight">Expert marine care, <br className="hidden md:block" /> completely simplified.</h2></FadeUp>
          <div className="grid md:grid-cols-3 gap-10 md:gap-16">
            {[
              { icon: <MapPin size={32}/>, title: "Dockside Service", desc: "We match you with top-rated professionals actively servicing your exact marina." },
              { icon: <Clock size={32}/>, title: "Transparent Pricing", desc: "Submit one request. Get exact quotes and availability from local experts in minutes." },
              { icon: <ShieldCheck size={32}/>, title: "Verified Excellence", desc: "Every detailer on our network is rigorously vetted, reviewed, and fully insured." }
            ].map((feature, i) => (
              <FadeUp key={i} delay={i * 100} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-black mb-6 shadow-sm border border-gray-100">{feature.icon}</div>
                <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-3">{feature.title}</h3>
                <p className="text-gray-500 text-base md:text-lg font-medium leading-relaxed max-w-xs md:max-w-sm">{feature.desc}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="py-10 md:py-20 px-6 max-w-[1400px] mx-auto mb-10 md:mb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4 px-2 md:px-4">
          <FadeUp>
            <h2 className="text-3xl md:text-5xl lg:text-[48px] font-bold tracking-tighter">Prime Locations</h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium mt-2">Find premium detailing services in America&apos;s top maritime hubs.</p>
          </FadeUp>
          <FadeUp delay={100} className="hidden md:block">
            <Link href="/florida" className="text-black font-bold flex items-center gap-2 hover:gap-3 transition-all">Explore all regions <ArrowRight size={18} /></Link>
          </FadeUp>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {locations.map((loc, i) => (
            <FadeUp key={i} delay={i * 100}>
              <Link href={loc.href} className="block group relative rounded-2xl md:rounded-[2rem] overflow-hidden aspect-square md:aspect-[3/4] bg-gray-200 shadow-md hover:shadow-2xl transition-all duration-500">
                <img src={loc.img} alt={loc.city} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1 md:mb-2">{loc.city}</h3>
                  <div className="flex items-center gap-2 text-white/80 text-sm md:text-base font-medium md:opacity-0 md:translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">Find Detailers <ChevronRight size={16} /></div>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>
        <Link href="/florida" className="w-full md:hidden mt-6 bg-white border-2 border-gray-200 text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2">Explore all regions <ArrowRight size={18} /></Link>
      </section>

      {/* For Businesses */}
      <section id="for-detailers" className="bg-black text-white py-20 md:py-32 px-6 overflow-hidden">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 md:gap-20">
          <div className="lg:w-1/2 text-center lg:text-left">
            <FadeUp>
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white text-xs md:text-sm font-bold tracking-widest uppercase mb-6 md:mb-8 border border-white/20">For Detailing Professionals</div>
              <h2 className="text-4xl sm:text-5xl md:text-[72px] font-bold tracking-tighter mb-6 md:mb-8 leading-[1.1] md:leading-[1.05]">Stop chasing leads.<br className="hidden md:block" /> Let them find you.</h2>
              <p className="text-gray-400 text-lg md:text-2xl font-medium tracking-tight mb-8 md:mb-10 max-w-md mx-auto lg:mx-0 leading-relaxed">Join the fastest-growing network of elite marine professionals. Claim your free profile, get instant dockside job alerts, and only pay for the leads you want.</p>
              <Link href="/register" className="inline-block w-full md:w-auto bg-white text-black px-8 py-4 rounded-xl md:rounded-full font-bold text-lg hover:bg-gray-200 md:hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] text-center">List your business free</Link>
            </FadeUp>
          </div>
          <div className="lg:w-1/2 w-full">
            <FadeUp delay={200}>
              <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:shadow-[0_30px_80px_rgba(0,0,0,0.8)] transform md:-rotate-2 md:hover:rotate-0 transition-transform duration-500 ease-out">
                <div className="flex justify-between items-center mb-6 md:mb-10 border-b border-white/10 pb-4 md:pb-6">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#ff385c] flex items-center justify-center font-bold text-base md:text-lg">MD</div>
                    <div>
                      <div className="text-white font-bold tracking-tight text-base md:text-lg">Directory Pro</div>
                      <div className="text-xs md:text-sm font-medium text-green-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl md:rounded-3xl p-5 md:p-6 border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-[#ff385c]"></div>
                  <div className="text-[10px] md:text-xs font-bold tracking-widest text-[#ff385c] uppercase mb-2">New Job Request</div>
                  <h3 className="text-xl md:text-3xl font-bold mb-2 tracking-tight">42ft Azimut Flybridge</h3>
                  <p className="text-base md:text-xl text-gray-400 mb-4 md:mb-6 font-medium">Wash, Compound, and Wax</p>
                  <div className="flex items-center gap-2 md:gap-3 text-sm md:text-base text-gray-300 mb-6 md:mb-8 bg-black/40 w-fit px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl border border-white/5">
                    <MapPin size={18} className="text-[#ff385c]" /><span className="font-semibold truncate">St. Petersburg, FL</span>
                  </div>
                  <button className="w-full bg-white hover:bg-gray-200 text-black font-bold text-base md:text-lg py-3 md:py-4 rounded-lg md:rounded-xl transition-colors flex justify-between items-center px-4 md:px-6 group">
                    <span>Unlock Details</span>
                    <span className="flex items-center gap-1 md:gap-2 bg-black/5 px-2 md:px-3 py-1 rounded-md md:rounded-lg">$20 <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></span>
                  </button>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-16 md:pt-24 pb-8 md:pb-12 px-6 border-t border-gray-200">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-16 md:mb-20">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4"><Ship size={24} strokeWidth={2.5} className="text-black" /><div className="text-xl md:text-2xl font-bold tracking-tight text-black">MarineDirectory.</div></div>
            <p className="text-gray-500 font-medium max-w-sm text-base md:text-lg">The smartest way to connect with elite local detailing professionals.</p>
          </div>
          <div>
            <h4 className="font-bold text-black mb-4 md:mb-6 tracking-tight text-base md:text-lg">Platform</h4>
            <ul className="space-y-3 md:space-y-4 text-gray-500 font-medium text-sm md:text-base">
              <li><Link href="/florida" className="hover:text-black transition-colors">Find a Detailer</Link></li>
              <li><Link href="/register" className="hover:text-black transition-colors">List your Business</Link></li>
              <li><Link href="#" className="hover:text-black transition-colors">How Pricing Works</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-black mb-4 md:mb-6 tracking-tight text-base md:text-lg">Legal</h4>
            <ul className="space-y-3 md:space-y-4 text-gray-500 font-medium text-sm md:text-base">
              <li><Link href="#" className="hover:text-black transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-black transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-black transition-colors">Contact Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto pt-8 border-t border-gray-200 text-gray-500 font-medium flex flex-col md:flex-row justify-between items-center gap-4 text-sm md:text-base">
          <p className="text-center md:text-left">&copy; 2026 Marine Detail Directory. All rights reserved.</p>
          <div className="flex gap-6 md:gap-8">
            <Link href="#" className="hover:text-black transition-colors font-bold">X (Twitter)</Link>
            <Link href="#" className="hover:text-black transition-colors font-bold">Instagram</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
