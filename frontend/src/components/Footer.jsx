import { useState } from "react";
import {
  Phone,
  MessageCircle,
  Instagram,
  Heart,
  MapPin,
  Clock,
  ShieldCheck,
  Zap,
  Lock,
  Bike,
  Sparkles,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [openDrawer, setOpenDrawer] = useState(null);

  return (
    <footer className="bg-slate-50 border-t border-slate-200/90 text-slate-600 pt-8 md:pt-14 pb-24 md:pb-12 relative overflow-hidden">
      {/* Subtle ambient light gradient background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* ======================================================== */}
        {/* MOBILE APP-STYLE COMPACT FOOTER (< md)                  */}
        {/* ======================================================== */}
        <div className="md:hidden space-y-3.5 mb-2">
          {/* App Brand Header Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo.jpeg"
                  alt="Pipip Logo"
                  width="36"
                  height="36"
                  className="h-9 w-9 object-cover rounded-xl border border-slate-200 shadow-2xs"
                />
                <div>
                  <h4 className="font-display font-black text-slate-900 text-base leading-none">
                    Pipip
                  </h4>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">
                    Self-Drive Rentals
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                RTO Fleet
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
              Verified Activas, Access 125s & Royal Enfields. Book with a ₹200 online token.
            </p>

            {/* Quick Contact Action Bar */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:9967406205"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200/80 transition-all active:scale-95 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Call Helpline</span>
              </a>
              <a
                href="https://wa.me/919967406205?text=Hi%20Pipip%20Rentals%2C%20I%20want%20to%20rent%20a%20bike%2Fscooter"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200/80 transition-all active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Collapsible App Drawers */}
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-2xs">
            {/* Drawer 1: Quick Navigation */}
            <div>
              <button
                onClick={() => setOpenDrawer(openDrawer === "links" ? null : "links")}
                className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-800 cursor-pointer"
              >
                <span>Quick Navigation</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openDrawer === "links" ? "rotate-180 text-blue-600" : ""}`} />
              </button>
              {openDrawer === "links" && (
                <div className="p-3.5 pt-1 grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/60 border-t border-slate-100">
                  <Link to="/" className="py-1 text-slate-700 hover:text-blue-600 font-medium">Home</Link>
                  <Link to="/catalog" className="py-1 text-slate-700 hover:text-blue-600 font-medium">Browse Fleet</Link>
                  <Link to="/pricing" className="py-1 text-slate-700 hover:text-blue-600 font-medium">Tariff Rates</Link>
                  <Link to="/about" className="py-1 text-slate-700 hover:text-blue-600 font-medium">About Pipip</Link>
                  <Link to="/contact" className="py-1 text-slate-700 hover:text-blue-600 font-medium">Contact & Hubs</Link>
                </div>
              )}
            </div>

            {/* Drawer 2: Policies & Terms */}
            <div>
              <button
                onClick={() => setOpenDrawer(openDrawer === "policies" ? null : "policies")}
                className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-800 cursor-pointer"
              >
                <span>Policies & Terms</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openDrawer === "policies" ? "rotate-180 text-blue-600" : ""}`} />
              </button>
              {openDrawer === "policies" && (
                <div className="p-3.5 pt-1 flex flex-col gap-1.5 text-xs text-slate-600 bg-slate-50/60 border-t border-slate-100">
                  <Link to="/privacy-policy" className="py-1 text-slate-700 hover:text-blue-600 font-medium">Privacy Policy</Link>
                  <Link to="/terms-and-conditions" className="py-1 text-slate-700 hover:text-blue-600 font-medium">Terms & Conditions</Link>
                  <Link to="/refund-policy" className="py-1 text-slate-700 hover:text-blue-600 font-medium">Refund Policy</Link>
                </div>
              )}
            </div>

            {/* Drawer 3: Pickup Hubs & Hours */}
            <div>
              <button
                onClick={() => setOpenDrawer(openDrawer === "hubs" ? null : "hubs")}
                className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-800 cursor-pointer"
              >
                <span>Pickup Hubs & Timings</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${openDrawer === "hubs" ? "rotate-180 text-blue-600" : ""}`} />
              </button>
              {openDrawer === "hubs" && (
                <div className="p-3.5 pt-1 space-y-2 text-xs text-slate-600 bg-slate-50/60 border-t border-slate-100">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-slate-700">Multiple city hubs: Mumbai Hub (Dongri), Surat Hubs (Adajan & Vesu)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Operating Hours: 7:00 AM – 11:00 PM (All 7 Days)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Minimal Mobile Copyright */}
          <div className="text-center space-y-1 pt-2 text-[11px] text-slate-500 font-medium">
            <p>© {currentYear} Pipip Services. All Rights Reserved.</p>
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1"><Lock className="w-2.5 h-2.5 text-emerald-600" /> 100% Secure</span>
              <span>•</span>
              <span>UPI • Cards • Cashfree</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP FULL DIRECTORY FOOTER (hidden on mobile)        */}
        {/* ======================================================== */}
        <div className="hidden md:block">
          {/* Top Highlight Banner: Clean Light Porcelain Card */}
          <div className="mb-12 p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/70 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Bike className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-slate-900 font-extrabold text-base sm:text-lg">
                  Self-Drive Bike & Scooty Rentals
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Lock your ride online with just a ₹200 Token. Free sanitized helmet & refundable security deposit at pickup.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/catalog"
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Fleet</span>
                <Sparkles className="w-3.5 h-3.5" />
              </Link>
              <a
                href="https://wa.me/919967406205?text=Hi%20Pipip%20Rentals%2C%20I%20want%20to%20rent%20a%20bike%2Fscooter"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* 4-Column Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 mb-12">
            
            {/* Col 1: Brand & Bio (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo.jpeg"
                  alt="Pipip Logo"
                  width="36"
                  height="36"
                  className="h-9 w-9 object-cover rounded-xl border border-slate-200 shadow-2xs"
                />
                <div className="flex flex-col">
                  <span className="font-display text-xl font-black text-slate-900 tracking-tight leading-none">
                    Pipip
                  </span>
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">
                    Pipip Services
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
                Pipip is India's modern self-drive two-wheeler rental platform, actively expanding to multiple cities. We offer verified Honda Activas, Access 125s, Burgmans, and Royal Enfields starting at ₹100/hr or ₹600/day with transparent digital bookings.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-700">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  RTO Approved Fleet
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                  ₹200 Token Lock
                </span>
              </div>

              <div className="flex gap-2 pt-1">
                <a
                  href="tel:9967406205"
                  className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/90 text-slate-700 hover:text-blue-600 flex items-center justify-center transition-colors shadow-2xs active:scale-95"
                  aria-label="Call support"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/919967406205"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200/90 text-emerald-600 flex items-center justify-center transition-colors shadow-2xs active:scale-95"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a
                  href="https://instagram.com/pipip_mumbai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white hover:bg-pink-50 border border-slate-200/90 text-pink-600 flex items-center justify-center transition-colors shadow-2xs active:scale-95"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Fleet & Models (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Our Rental Fleet
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link to="/catalog?cc=under125" className="hover:text-blue-600 transition-colors">
                    Honda Activa 6G (110cc)
                  </Link>
                </li>
                <li>
                  <Link to="/catalog?cc=under125" className="hover:text-blue-600 transition-colors">
                    Suzuki Access 125
                  </Link>
                </li>
                <li>
                  <Link to="/catalog?cc=under125" className="hover:text-blue-600 transition-colors">
                    Suzuki Burgman Street
                  </Link>
                </li>
                <li>
                  <Link to="/catalog?cc=above150" className="hover:text-blue-600 transition-colors">
                    Royal Enfield Hunter 350
                  </Link>
                </li>
                <li>
                  <Link to="/catalog?cc=above150" className="hover:text-blue-600 transition-colors">
                    Classic 350 & Cruisers
                  </Link>
                </li>
                <li>
                  <Link to="/catalog" className="text-blue-600 font-bold hover:underline flex items-center gap-1 pt-1">
                    <span>Browse Available Fleet</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Quick Links & Legal Policies (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Navigation & Policies
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li>
                  <Link to="/" className="hover:text-blue-600 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/catalog" className="hover:text-blue-600 transition-colors">
                    Vehicle Catalog
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-blue-600 transition-colors">
                    Tariff & Rental Rates
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-blue-600 transition-colors">
                    About Pipip Services
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-blue-600 transition-colors">
                    Contact & Hubs
                  </Link>
                </li>
                <li className="pt-2 border-t border-slate-200/80">
                  <Link to="/privacy-policy" className="hover:text-blue-600 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-and-conditions" className="hover:text-blue-600 transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="hover:text-blue-600 transition-colors">
                    Refund & Cancellation
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Hub Locations & Operations (4 cols) */}
            <div className="lg:col-span-4 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Pickup Hubs & Operations
              </h4>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-900 font-bold">Mumbai Pickup Hub</p>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Rahat Tower, Nishanpada Road, Khadak, Dongri, Mandvi, Mumbai 400009
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-900 font-bold">Surat Operations Hub</p>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Adajan & Vesu Hubs, Surat, Gujarat
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Operating Hours: 7:00 AM – 11:00 PM (All 7 Days)</span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100/90 text-[11px] space-y-1">
                  <p className="text-blue-900 font-bold flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Helpline: +91 9967406205</span>
                  </p>
                  <p className="text-blue-800/80 text-[10.5px]">
                    24/7 Roadside breakdown & emergency assistance included with every rental.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Payment Badges */}
          <div className="pt-6 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <p>© {currentYear} Pipip Services. All Rights Reserved.</p>
              <span className="hidden sm:inline text-slate-300">•</span>
              <p className="flex items-center gap-1">
                Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for riders everywhere
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                <Lock className="w-3 h-3 text-emerald-600" /> 100% Secure Payments
              </span>
              <span className="text-slate-300">•</span>
              <span>UPI • RuPay • Cards • Cashfree</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;