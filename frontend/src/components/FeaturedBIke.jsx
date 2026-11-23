import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Bike,
  ArrowRight,
  IndianRupee,
  Star,
  MapPin,
  Shield,
  Zap,
  Sparkles,
  Gauge,
  Fuel,
  LayoutGrid,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Check,
  Flame,
  ShieldCheck,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { useBikes } from "../hooks/useBikes";

const categoryFilters = [
  { id: "all", label: "All Vehicles", icon: "🛵" },
  { id: "scooter", label: "Scooters (Activa/Access)", icon: "⚡" },
  { id: "bike", label: "Cruisers & Royal Enfield", icon: "🏍️" },
];

const FeaturedBikes = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: bikes, isLoading } = useBikes();
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState("marquee"); // "marquee" (RTL animation) or "grid"
  const [isPaused, setIsPaused] = useState(false);

  const urlStart = searchParams.get("start");
  const urlEnd = searchParams.get("end");

  // Filter available bikes according to selected category
  const filteredBikes = (bikes || [])
    .filter((bike) => bike.status === "available")
    .filter((bike) => {
      if (activeCategory === "scooter") return bike.cc <= 125;
      if (activeCategory === "bike") return bike.cc > 125;
      return true;
    });

  const featuredBikes = filteredBikes.length > 0 ? filteredBikes : (bikes || []).slice(0, 8);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const handleBookNow = (bikeId) => {
    const params = new URLSearchParams();
    if (urlStart) params.set("start", urlStart);
    if (urlEnd) params.set("end", urlEnd);
    navigate(`/book/${bikeId}?${params.toString()}`);
  };

  return (
    <section id="featured-rides" className="py-16 md:py-24 bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9]/60 to-[#F8FAFC] relative overflow-hidden">
      {/* Dynamic Background Aurora Glows */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* Section Header & View Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-900 text-xs font-black mb-3 border border-amber-300/40 shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>LIVE FLEET ACTIVE • VERIFIED TOP PICKS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-display font-black text-slate-900 tracking-tight leading-[1.15]">
              Featured Active{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">
                Rides
              </span>
            </h2>
            <p className="text-sm md:text-base text-slate-600 mt-2.5 max-w-xl font-normal leading-relaxed">
              100% sanitized, full fuel telemetry inspected, and hub-ready. Lock any ride online for just a{" "}
              <strong className="text-slate-900 font-black underline decoration-amber-400 decoration-2 underline-offset-2">₹200 token</strong> — pay the remainder upon physical handover!
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end shrink-0">
            {/* View Mode Switcher */}
            <div className="inline-flex items-center p-1 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("marquee")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "marquee"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                title="Continuous Right to Left Animation"
              >
                <span className={`w-2 h-2 rounded-full ${viewMode === "marquee" ? "bg-white" : "bg-blue-600"} animate-pulse`} />
                <span>Auto-Glide</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs font-black"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid View</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-10 px-4 rounded-xl text-xs font-black border-slate-200/90 bg-white hover:bg-slate-50 text-slate-800 shadow-2xs hover:border-blue-400 transition-all cursor-pointer"
              onClick={() => navigate("/catalog")}
            >
              <span>View Full Fleet</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>

        {/* Interactive App-Style Category Filter Chips */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
            {categoryFilters.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 font-black"
                    : "bg-white border border-slate-200/80 text-slate-700 hover:border-blue-300 hover:bg-slate-50"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {viewMode === "marquee" && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold bg-white/80 border border-slate-200/60 px-3 py-1 rounded-full shadow-2xs">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Right-to-Left auto glide • Hover or tap any card to pause</span>
            </div>
          )}
        </div>

        {/* Skeleton Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3 p-4 bg-white border border-slate-200 rounded-3xl">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : viewMode === "marquee" ? (
          /* ========================================================= */
          /* RIGHT-TO-LEFT CONTINUOUS ANIMATION STREAM */
          /* ========================================================= */
          <div
            className="relative overflow-hidden py-3 -mx-4 px-4 sm:mx-0 sm:px-0"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Subtle Gradient Fog Masks on edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10 pointer-events-none" />

            {/* RTL Marquee Track */}
            <div
              className={`animate-marquee-rtl flex gap-6 py-2 ${
                isPaused ? "[animation-play-state:paused]" : ""
              }`}
            >
              {/* Duplicate array 2x to ensure infinite seamless gliding from Right to Left */}
              {[...featuredBikes, ...featuredBikes].map((bike, idx) => (
                <div
                  key={`${bike._id}-${idx}`}
                  className="w-[290px] sm:w-[325px] shrink-0"
                >
                  <BikeCard bike={bike} onBook={handleBookNow} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* RESPONSIVE GRID VIEW */
          /* ========================================================= */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {featuredBikes.map((bike) => (
              <motion.div key={bike._id} variants={itemVariants}>
                <BikeCard bike={bike} onBook={handleBookNow} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Bottom Pipip Assurance Strip */}
        <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-black text-slate-900">Pipip Guarantee:</span>
            <span>100% Refundable Deposit • Clean Physical Handover • Commercial RTO Permits</span>
          </div>
          <div className="flex items-center gap-3 font-semibold text-slate-500">
            <span>⚡ 60-Sec Handover</span>
            <span>•</span>
            <span>🛡️ Zero Hidden Charges</span>
            <span>•</span>
            <span>📞 24/7 Roadside Assistance</span>
          </div>
        </div>

      </div>
    </section>
  );
};

// =========================================================================
// 🎨 DYNAMIC TIER/PERSONALITY SYSTEM FOR FEATURED BIKES
// Customizes animations, spotlight, badge, and hover interactions based on
// vehicle type (Cruiser, Sport, Executive Touring, or City Commuter).
// =========================================================================
function getVehicleProfile(bike) {
  const modelLower = (bike?.model || "").toLowerCase();
  const cc = Number(bike?.cc) || 110;

  // 1. Heavy Cruiser / Royal Enfield
  if (
    cc > 200 ||
    modelLower.includes("enfield") ||
    modelLower.includes("bullet") ||
    modelLower.includes("hunter") ||
    modelLower.includes("classic") ||
    modelLower.includes("cruiser")
  ) {
    return {
      type: "cruiser",
      badge: "👑 Royal Cruiser",
      badgeColor: "bg-amber-500/15 text-amber-950 border-amber-300/80",
      stageGradient: "from-amber-100/70 via-orange-50/30 to-white",
      borderColor: "rgba(245, 158, 11, 0.55)",
      spotlight: "rgba(245, 158, 11, 0.22)",
      buttonGradient: "from-amber-600 via-yellow-500 to-amber-700 hover:from-amber-700 hover:to-yellow-600",
      buttonShadow: "shadow-amber-500/25",
      tag: "Pure Power & Comfort",
      perk: "Highway Touring",
      hoverAnimation: { x: 8, y: -4, scale: 1.12, rotate: 0 },
    };
  }

  // 2. Sport / High-Performance
  if (
    cc > 125 ||
    modelLower.includes("sport") ||
    modelLower.includes("r15") ||
    modelLower.includes("pulsar") ||
    modelLower.includes("apache") ||
    modelLower.includes("fargo")
  ) {
    return {
      type: "sport",
      badge: "⚡ Dynamic Sport",
      badgeColor: "bg-violet-500/15 text-violet-950 border-violet-300/80",
      stageGradient: "from-violet-100/70 via-purple-50/30 to-white",
      borderColor: "rgba(139, 92, 246, 0.55)",
      spotlight: "rgba(139, 92, 246, 0.22)",
      buttonGradient: "from-violet-600 via-indigo-600 to-purple-700 hover:from-violet-700 hover:to-indigo-700",
      buttonShadow: "shadow-violet-500/25",
      tag: "Punchy Acceleration",
      perk: "Street Agility",
      hoverAnimation: { x: 10, y: -6, scale: 1.14, rotate: -2 },
    };
  }

  // 3. Maxi-Scooter / Executive Touring
  if (
    modelLower.includes("burgman") ||
    modelLower.includes("aerox") ||
    modelLower.includes("access") ||
    modelLower.includes("ntorq")
  ) {
    return {
      type: "touring",
      badge: "🛋️ Executive Comfort",
      badgeColor: "bg-cyan-500/15 text-cyan-950 border-cyan-300/80",
      stageGradient: "from-cyan-100/70 via-blue-50/30 to-white",
      borderColor: "rgba(6, 182, 212, 0.55)",
      spotlight: "rgba(6, 182, 212, 0.20)",
      buttonGradient: "from-cyan-600 via-blue-600 to-indigo-700 hover:from-cyan-700 hover:to-blue-700",
      buttonShadow: "shadow-cyan-500/25",
      tag: "Plush Seat & Extra Storage",
      perk: "Smooth City Touring",
      hoverAnimation: { x: 0, y: -9, scale: 1.11, rotate: 0 },
    };
  }

  // 4. Default: Top City Commuter (Activa, Jupiter, EV, etc.)
  return {
    type: "commuter",
    badge: "🔥 Top City Pick",
    badgeColor: "bg-emerald-500/15 text-emerald-950 border-emerald-300/80",
    stageGradient: "from-emerald-100/70 via-teal-50/30 to-white",
    borderColor: "rgba(16, 185, 129, 0.55)",
    spotlight: "rgba(16, 185, 129, 0.20)",
    buttonGradient: "from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800",
    buttonShadow: "shadow-blue-500/25",
    tag: "High Mileage & Reliability",
    perk: "Easy Traffic Zip",
    hoverAnimation: { x: 4, y: -7, scale: 1.12, rotate: 1 },
  };
}

// =========================================================================
// 🚀 CLASSY, HIGH-CONVERTING & MULTI-THEMED ANIMATED BIKE CARD COMPONENT
// =========================================================================
function BikeCard({ bike, onBook }) {
  const profile = getVehicleProfile(bike);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onBook(bike._id)}
      className="group relative bg-white border border-slate-200/90 rounded-[2rem] overflow-hidden hover:border-slate-300 hover:shadow-[0_22px_50px_-12px_rgba(15,23,42,0.18)] shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      {/* Dynamic Colored Glowing Border Hue on Hover */}
      <div
        className="absolute inset-0 rounded-[2rem] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30"
        style={{
          boxShadow: `inset 0 0 0 2px ${profile.borderColor}`,
        }}
      />

      {/* ========================================================= */}
      {/* 🎨 VEHICLE SHOWCASE STAGE WITH TIER-SPECIFIC ANIMATIONS   */}
      {/* ========================================================= */}
      <div className={`relative h-56 bg-gradient-to-b ${profile.stageGradient} overflow-hidden border-b border-slate-100 flex items-center justify-center p-4`}>
        
        {/* Tier 1 (Cruiser): Shimmering Gold Orbit + Amber Light Sheen Sweep */}
        {profile.type === "cruiser" && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.22)_0%,transparent_70%)] pointer-events-none" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute w-52 h-52 rounded-full border border-dashed border-amber-400/30 pointer-events-none"
            />
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent skew-x-12 pointer-events-none"
            />
          </>
        )}

        {/* Tier 2 (Sport): Aerodynamic Neon Speed Lines Streaking Past */}
        {profile.type === "sport" && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.22)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
              <motion.div
                animate={{ x: ["100%", "-100%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 h-[1.5px] w-28 bg-gradient-to-l from-violet-500 to-transparent"
              />
              <motion.div
                animate={{ x: ["100%", "-100%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear", delay: 0.6 }}
                className="absolute top-2/3 h-[1.5px] w-36 bg-gradient-to-l from-fuchsia-500 to-transparent"
              />
            </div>
            <div className="absolute w-44 h-44 rounded-full border border-violet-300/30 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
          </>
        )}

        {/* Tier 3 (Touring): Smooth Expanding Sonar / Radar Pulse Rings */}
        {profile.type === "touring" && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.20)_0%,transparent_70%)] pointer-events-none" />
            <motion.div
              animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-44 h-44 rounded-full border border-cyan-400/40 pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1.2, 1.55, 1.2], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute w-56 h-56 rounded-full border border-blue-400/25 pointer-events-none"
            />
          </>
        )}

        {/* Tier 4 (Commuter): Fresh Emerald Energy Halo & Expanding Rings */}
        {profile.type === "commuter" && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18)_0%,transparent_70%)] pointer-events-none" />
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute w-48 h-48 rounded-full border border-emerald-300/35 pointer-events-none"
            />
          </>
        )}

        {/* Vehicle Image with Tier-Specific 3D Motion */}
        {bike.image_url ? (
          <motion.img
            src={bike.image_url}
            alt={bike.model}
            loading="lazy"
            decoding="async"
            animate={
              isHovered
                ? {
                    x: profile.hoverAnimation.x,
                    y: profile.hoverAnimation.y,
                    scale: profile.hoverAnimation.scale,
                    rotate: profile.hoverAnimation.rotate,
                  }
                : { x: 0, y: 0, scale: 1, rotate: 0 }
            }
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative z-10 w-full h-full object-contain drop-shadow-[0_12px_14px_rgba(0,0,0,0.12)] group-hover:drop-shadow-[0_18px_22px_rgba(15,23,42,0.24)]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative z-10">
            <Bike className="w-16 h-16 text-slate-300" />
          </div>
        )}

        {/* Engine CC Badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-slate-200/90 px-2.5 py-1 rounded-xl text-slate-800 text-[11px] font-black shadow-xs">
          <Gauge className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>{bike.cc}cc</span>
        </div>

        {/* Tier Distinctive Personality Badge */}
        <div className="absolute top-3 right-3 z-20">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10.5px] font-black border shadow-2xs backdrop-blur-md ${profile.badgeColor}`}>
            {profile.badge}
          </span>
        </div>

        {/* Floating Live Stock & Token Badge Strip */}
        <div className="absolute bottom-2.5 left-3 right-3 z-20 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 font-bold text-[10px] shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            Hub Ready
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] shadow-xs">
            <Sparkles className="w-2.5 h-2.5 text-slate-950" />
            ₹200 Token Lock
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📄 CARD CONTENT BODY                                      */}
      {/* ========================================================= */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          {/* Vehicle Model & Registration Plate */}
          <div className="flex items-start justify-between gap-1 mb-1.5">
            <h3 className="text-base sm:text-lg font-black font-display text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight truncate">
              {bike.model}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
              {bike.number_plate}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              100% Sanitized
            </span>
          </div>

          {/* Quick Vehicle Highlight Tag */}
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
            <span className="inline-block w-1 h-1 rounded-full bg-blue-500 shrink-0" />
            <span className="font-semibold text-slate-700">{profile.tag}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 truncate">{profile.perk}</span>
          </div>
        </div>

        {/* Clean, High-Converting Daily Pricing Engine Box (Zero Hourly Tariff on Home) */}
        <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/90 hover:bg-white transition-colors">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">
                Daily Rental Tariff
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
                  ₹{bike.price_per_day}
                </span>
                <span className="text-xs text-slate-500 font-bold">/day</span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-950 font-black text-xs border border-amber-300 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-500" />
                ₹200 Token
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                Lock vehicle online
              </span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>₹2,000 Security Deposit</span>
            <span className="text-emerald-700 font-black">100% Refundable at Hub</span>
          </div>
        </div>

        {/* Magnetic High-Converting CTA Button with Card Theme */}
        <div className="pt-0.5 mt-auto">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onBook(bike._id);
            }}
            className={`relative overflow-hidden w-full h-11 sm:h-12 rounded-2xl font-black text-xs sm:text-sm text-white shadow-md ${profile.buttonShadow} bg-gradient-to-r ${profile.buttonGradient} active:scale-[0.98] transition-all cursor-pointer group/btn`}
            disabled={bike.status !== "available"}
          >
            {/* Shimmer Light Reflection Sweep */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
            />
            {bike.status === "available" ? (
              <span className="relative z-10 flex items-center justify-center gap-2 font-black">
                <span>Reserve with ₹200 Token</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
              </span>
            ) : (
              "Currently In Ride"
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default FeaturedBikes;
