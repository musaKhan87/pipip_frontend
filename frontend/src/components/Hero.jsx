import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Clock,
  ChevronDown,
  Sparkles,
  Check,
  ShieldCheck,
  ArrowRight,
  Bike as BikeIcon,
  Star,
  ChevronRight,
  Shield,
  Zap,
  Play,
} from "lucide-react";
import { Button } from "./ui/button";
import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { useNavigate } from "react-router-dom";
import { useActiveAreas } from "../hooks/useAreas";

// =========================================================================
// 🎬 SEAMLESS INFINITE LOOP MOTORCYCLE VIDEO
// Uses the engineered seamless 12s video where end and start frames
// are mathematically continuous for a 100% smooth, infinite highway ride.
// Tuned for mobile viewport framing and guaranteed iOS/Android autoplay.
// =========================================================================
const SeamlessHeroVideo = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Explicitly enforce muted and playsinline for iOS Safari & Android Chrome
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    const playVideo = () => {
      const promise = video.play();
      if (promise !== undefined) {
        promise.catch(() => { });
      }
    };

    video.addEventListener("canplay", playVideo);
    video.addEventListener("loadedmetadata", playVideo);
    playVideo();

    return () => {
      video.removeEventListener("canplay", playVideo);
      video.removeEventListener("loadedmetadata", playVideo);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover object-[center_62%] md:object-center"
      >
        <source src="/hero-motorcycle.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

const vehicleTabs = [
  { id: "all", label: "All Fleet", icon: "🛵" },
  { id: "scooter", label: "Scooters", icon: "⚡" },
  { id: "motorcycle", label: "Bikes & Cruisers", icon: "🏍️" },
];

const Hero = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const navigate = useNavigate();
  const { data: areas = [] } = useActiveAreas();

  // Smoothly rotating city list (Mumbai, Thane, Surat, and any additional branch cities)
  const rotatingCities = useMemo(() => {
    const dbCities = Array.from(new Set(areas.map((a) => a.city).filter(Boolean)));
    const base = ["Mumbai", "Thane", "Surat"];
    return Array.from(new Set([...base, ...dbCities]));
  }, [areas]);

  const [cityIndex, setCityIndex] = useState(0);

  useEffect(() => {
    if (rotatingCities.length <= 1) return;
    const interval = setInterval(() => {
      setCityIndex((prev) => (prev + 1) % rotatingCities.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [rotatingCities.length]);

  const [selectedArea, setSelectedArea] = useState("");
  const [isAreaOpen, setIsAreaOpen] = useState(false);
  const [areaError, setAreaError] = useState(false);

  // --- MIN/MAX & DEFAULT DATE LOGIC ---
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const minDate = getLocalDateString(today);

  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(today.getDate() + 7);
  const maxDate = getLocalDateString(sevenDaysLater);

  const [startDate, setStartDate] = useState(() => getLocalDateString(today));
  const [startTime, setStartTime] = useState("10:00");
  const [endDate, setEndDate] = useState(() => getLocalDateString(tomorrow));
  const [endTime, setEndTime] = useState("10:00");

  // Dynamic Trip Duration Calculator Pill
  const durationText = useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const diffMs = end - start;
    if (diffMs <= 0) return null;
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (diffHours < 24) return `${diffHours} hrs trip`;
    const days = Math.floor(diffHours / 24);
    const remHours = diffHours % 24;
    return remHours > 0 ? `${days}d ${remHours}h rental` : `${days} day${days > 1 ? "s" : ""} rental`;
  }, [startDate, startTime, endDate, endTime]);

  const handleSearch = () => {
    if (!selectedArea) {
      setAreaError(true);
      setTimeout(() => setAreaError(false), 3000);
      return;
    }

    const params = new URLSearchParams();
    params.set("area", selectedArea);
    if (activeCategory === "scooter") params.set("cc", "under125");
    if (activeCategory === "motorcycle") params.set("cc", "above150");
    if (startDate) params.set("start", `${startDate}T${startTime}`);
    if (endDate) params.set("end", `${endDate}T${endTime}`);

    navigate(`/catalog?${params.toString()}`);
  };

  const selectedAreaName =
    areas.find((a) => a._id === selectedArea)?.name || "Select Pickup Hub";

  useEffect(() => {
    const getServer = async () => {
      try {
        await axios.get(`${API_BASE_URL}/rentals`);
      } catch (err) {
        console.error("Server ping failed", err);
      }
    };
    getServer();
  }, []);

  const scrollToFeatured = () => {
    const el = document.getElementById("featured-rides");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleRentScooter = () => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
    if (isMobile) {
      const mobileEl = document.getElementById("booking-card-mobile");
      if (mobileEl) {
        mobileEl.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    navigate("/catalog?cc=under125");
  };

  // Reusable interactive booking card (rendered on the right on desktop, docked right below video on mobile)
  const renderBookingCard = (cardId, isMobile = false) => (
    <div className="relative">
      {/* Ambient Glowing Halo Behind Widget */}
      <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-amber-500/20 rounded-[2.5rem] blur-2xl pointer-events-none" />

      <div
        id={cardId}
        className={`relative bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.35)] rounded-[32px] ${isMobile ? "p-5 sm:p-6" : "p-6 sm:p-8"
          } text-slate-900 overflow-visible`}
      >
        {/* Decorative Accent Sunbeam Rays on top right (matching mockup) */}
        <svg
          className="absolute -top-3.5 -right-3.5 w-7 h-7 text-amber-500 pointer-events-none select-none overflow-visible"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="4" y1="18" x2="8" y2="8" />
          <line x1="12" y1="18" x2="16" y2="4" />
          <line x1="18" y1="20" x2="24" y2="12" />
        </svg>

        {/* Decorative Scooter Silhouette Watermark on Top-Right */}
        <div className="absolute top-5 right-6 opacity-25 pointer-events-none select-none text-5xl">
          🛵
        </div>

        {/* Card Header */}
        <div className="mb-4 sm:mb-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
              Book Your Ride
            </h3>
            {isMobile && (
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                Instant Lock
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Find a bike or scooter and ride instantly.
          </p>
        </div>

        {/* 2 Big Pill Tabs: Scooter & Bike (Matching Mockup Side-by-Side Pill Design) */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
          <button
            type="button"
            onClick={() => setActiveCategory("scooter")}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${activeCategory === "scooter"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/35 border border-blue-500"
              : "text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-white border border-slate-200/90 shadow-2xs"
              }`}
          >
            <span className="text-base">🛵</span>
            <span>Scooter</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory("motorcycle")}
            className={`py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${activeCategory === "motorcycle"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/35 border border-blue-500"
              : "text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-white border border-slate-200/90 shadow-2xs"
              }`}
          >
            <span className="text-base">🏍️</span>
            <span>Bike</span>
          </button>
        </div>

        {/* Pickup Hub Dropdown */}
        <div className="mb-3.5 sm:mb-4">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>Pickup Hub</span>
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAreaOpen(!isAreaOpen)}
              className={`w-full flex items-center justify-between bg-slate-50/90 hover:bg-white border rounded-2xl px-4 py-3 text-left text-xs sm:text-sm transition-all shadow-2xs cursor-pointer text-slate-900 ${areaError
                ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/50"
                : "border-slate-200/90 hover:border-blue-400"
                }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span
                  className={
                    selectedArea
                      ? "text-slate-900 font-bold truncate"
                      : "text-slate-400 font-medium"
                  }
                >
                  {selectedAreaName}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${isAreaOpen ? "rotate-180 text-blue-600" : ""
                  }`}
              />
            </button>

            <AnimatePresence>
              {isAreaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-56 overflow-auto p-2 divide-y divide-slate-100"
                >
                  {areas.map((area) => (
                    <button
                      key={area._id}
                      type="button"
                      onClick={() => {
                        setSelectedArea(area._id);
                        setIsAreaOpen(false);
                      }}
                      className="w-full px-3 py-2.5 text-left hover:bg-blue-50/80 transition-colors rounded-xl flex items-center gap-2.5 text-xs cursor-pointer font-bold text-slate-800"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{area.name}</span>
                      <span className="text-[10px] text-slate-500 ml-auto bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                        {area.city}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {areaError && (
            <p className="text-xs text-rose-500 mt-1 font-bold">
              ⚠️ Please select a pickup hub to check fleet availability
            </p>
          )}
        </div>

        {/* Schedule Row (Pickup Date & Pickup Time side-by-side) */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
          {/* Pickup Date */}
          <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/90 shadow-2xs hover:bg-white transition-all">
            <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3 text-blue-600" />
              <span>Pickup Date</span>
            </label>
            <input
              type="date"
              value={startDate}
              min={minDate}
              max={maxDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-transparent text-slate-900 text-xs sm:text-sm font-bold focus:outline-none cursor-pointer"
            />
          </div>

          {/* Pickup Time */}
          <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/90 shadow-2xs hover:bg-white transition-all">
            <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-blue-600" />
              <span>Pickup Time</span>
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-transparent text-slate-900 text-xs sm:text-sm font-bold focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Big Full-Width CTA Button: Search Available Rides -> */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSearch}
          className="w-full h-12 rounded-full font-black text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-xl shadow-blue-500/35 transition-all cursor-pointer flex items-center justify-center gap-2 group"
        >
          <span>Search Available Rides</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      <section
        id="home"
        className="relative min-h-[75vh] sm:min-h-[82vh] lg:min-h-[92vh] flex flex-col justify-center pt-24 md:pt-32 pb-12 lg:pb-16 overflow-hidden bg-slate-950"
      >
        {/* Visually Hidden SEO Header for search engines */}
        <h1 className="sr-only">
          Self Drive Bike & Scooty Rentals | Pipip Services
        </h1>

        {/* ======================================================== */}
        {/* 🎨 100% CRYSTAL CLEAR MOTORCYCLE VIDEO BACKGROUND         */}
        {/* Video is completely visible and centered for mobile & web */}
        {/* ======================================================== */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          <SeamlessHeroVideo />
        </div>

        {/* ======================================================== */}
        {/* 🌊 AMBER/GOLD SWOOP CURVE ON BOTTOM RIGHT                 */}
        {/* ======================================================== */}
        <svg
          className="absolute -bottom-1 right-0 w-[42vw] max-w-[580px] h-20 sm:h-28 pointer-events-none z-10 overflow-visible hidden sm:block"
          viewBox="0 0 500 120"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 120 C 180 120, 310 25, 500 0 L 500 120 Z"
            fill="url(#heroAmberWaveGradient)"
          />
          <defs>
            <linearGradient id="heroAmberWaveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
              <stop offset="35%" stopColor="#F59E0B" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>

        <div className="container mx-auto px-4 lg:px-8 relative z-20 my-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">

            {/* ======================================================== */}
            {/* HERO CONTENT: APP-LIKE, CLEAN & HIGH VISIBILITY          */}
            {/* ======================================================== */}
            <div className="w-full lg:w-7/12 text-center lg:text-left">

              {/* Brand Header: Pipip SERVICES */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mb-2 sm:mb-3"
              >
                <div className="flex items-baseline gap-2 justify-center lg:justify-start">
                  <span className="text-4xl sm:text-5xl font-display font-black text-amber-500 tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                    Pipip
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs font-black tracking-[0.28em] text-white/90 uppercase block mt-0.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                  SERVICES
                </span>
              </motion.div>

              {/* Bold Headline: Explore [Rotating City] Your Way! */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="mb-4"
              >
                <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-display font-black tracking-tight text-white leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)]">
                  Explore{" "}
                  <span className="relative inline-block">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={rotatingCities[cityIndex]}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="inline-block text-[#00D2FF] drop-shadow-[0_0_24px_rgba(0,210,255,0.45)]"
                      >
                        {rotatingCities[cityIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </span>{" "}
                  Your Way!
                </h1>
              </motion.div>

              {/* 3 Checklist Bullet Points (with Cyan Checkmarks) */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="space-y-2 sm:space-y-2.5 mb-5 sm:mb-6 max-w-md mx-auto lg:mx-0 inline-block text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-base font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    Self-Drive Scooters & Bikes
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-base font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    Save Time & Money
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-base font-bold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    Freedom to Explore
                  </span>
                </div>
              </motion.div>

              {/* Price Badge Pill: ₹ Scooters from Rs. 600/day */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="block mb-6 sm:mb-7"
              >
                <div className="inline-flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/20 shadow-xl">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs sm:text-sm shadow-md">
                    ₹
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white">
                    Scooters from <span className="text-amber-400 font-extrabold">Rs. 600/day</span>
                  </span>
                </div>
              </motion.div>

              {/* Action Row: Rent a Scooter & View Pricing */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.25 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-3.5 w-full"
              >
                {/* Primary Pill Button: Rent a Scooter */}
                <button
                  type="button"
                  onClick={handleRentScooter}
                  className="w-full sm:w-auto h-12 px-8 rounded-full font-black text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Rent a Scooter</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Secondary Pill Button: View Pricing */}
                <button
                  type="button"
                  onClick={() => navigate("/pricing")}
                  className="w-full sm:w-auto h-12 px-7 rounded-full font-black text-sm bg-white/10 hover:bg-white/20 text-white border border-white/25 backdrop-blur-md shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>View Pricing</span>
                </button>
              </motion.div>
            </div>

            {/* ======================================================== */}
            {/* DESKTOP RIGHT COLUMN: FLOATING "BOOK YOUR RIDE" CARD     */}
            {/* Stays on right on desktop; hidden on mobile               */}
            {/* ======================================================== */}
            <motion.div
              initial={{ opacity: 0, y: 25, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
              className="hidden lg:block w-full lg:w-5/12 max-w-md ml-auto relative"
            >
              {renderBookingCard("booking-card", false)}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 📱 MOBILE APP DOCKED SEARCH CARD (BELOW THE VIDEO)        */}
      {/* Leaves the video 100% visible on mobile, exactly like an app*/}
      {/* ======================================================== */}
      <section className="block lg:hidden px-4 -mt-6 sm:-mt-8 relative z-30 pb-12 max-w-md mx-auto">
        {renderBookingCard("booking-card-mobile", true)}
      </section>
    </>
  );
};

export default Hero;
