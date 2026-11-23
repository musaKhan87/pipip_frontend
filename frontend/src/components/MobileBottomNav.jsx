import React from "react";
import {
  Home,
  Bike,
  Sparkles,
  IndianRupee,
  Phone,
  MessageCircle,
  MapPin,
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isCatalog = location.pathname === "/catalog";
  const isPricing = location.pathname === "/pricing";
  const isContact = location.pathname === "/contact";

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-2 inset-x-2 max-w-md mx-auto z-50 pointer-events-auto"
    >
      <div className="bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-[0_12px_40px_-6px_rgba(15,23,42,0.22)] p-1.5 flex items-center justify-between">
        
        {/* 1. Home / Discover */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
            isHome ? "text-blue-600 font-extrabold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 ${isHome ? "text-blue-600 stroke-[2.5]" : "text-slate-500"}`} />
            {isHome && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Home</span>
        </Link>

        {/* 2. All Fleet / Catalog */}
        <Link
          to="/catalog"
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
            isCatalog ? "text-blue-600 font-extrabold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="relative">
            <Bike className={`w-5 h-5 ${isCatalog ? "text-blue-600 stroke-[2.5]" : "text-slate-500"}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {isCatalog && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Fleet</span>
        </Link>

        {/* 3. CENTER HERO ACTION: Book Ride with ₹200 Token */}
        <button
          onClick={() => {
            if (isCatalog) {
              const el = document.getElementById("featured-rides") || document.querySelector("main");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            } else {
              navigate("/catalog");
            }
          }}
          className="flex flex-col items-center justify-center flex-1.3 py-1.5 px-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 active:scale-95 transition-all cursor-pointer relative overflow-hidden group mx-0.5"
        >
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: "3s" }} />
            <span className="text-[11px] font-black tracking-tight leading-none">₹200 Token</span>
          </div>
          <span className="text-[9px] font-bold text-blue-100 mt-0.5 leading-none">Book Ride</span>
        </button>

        {/* 4. Tariff Rates */}
        <Link
          to="/pricing"
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
            isPricing ? "text-blue-600 font-extrabold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="relative">
            <IndianRupee className={`w-5 h-5 ${isPricing ? "text-blue-600 stroke-[2.5]" : "text-slate-500"}`} />
            {isPricing && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Tariff</span>
        </Link>

        {/* 5. Contact & Hubs */}
        <Link
          to="/contact"
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
            isContact ? "text-blue-600 font-extrabold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="relative">
            <MapPin className={`w-5 h-5 ${isContact ? "text-blue-600 stroke-[2.5]" : "text-slate-500"}`} />
            {isContact && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Hubs</span>
        </Link>

      </div>
    </nav>
  );
};

export default MobileBottomNav;
