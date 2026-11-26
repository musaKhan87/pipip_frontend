import { useLocation, useNavigate } from "react-router-dom";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Hero from "../components/Hero";
import RentalForm from "../components/RentalForm";
import { useEffect, useState, useMemo, useRef } from "react";
import FeaturedBikes from "../components/FeaturedBIke";
import CustomerReviews from "../components/CustomerReviews";
import CustomerStories from "../components/CustomerStories";
import MobileBottomNav from "../components/MobileBottomNav";
import useSEO from "../hooks/useSEO";
import { useBikes } from "../hooks/useBikes";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  Key,
  Zap,
  ArrowRight,
  Bike,
  Check,
  Star,
  Lock,
  Cpu,
  Flame,
  Radio,
  Fuel,
  CreditCard,
  XCircle,
} from "lucide-react";

const stepsData = [
  {
    id: 0,
    stepNum: "01",
    label: "Choose Vehicle",
    title: "Browse & Select Your Preferred Ride",
    desc: "Choose from our verified fleet of Honda Activa 6G, Suzuki Access 125, Burgman Street, or Royal Enfield with live hub availability.",
    icon: Bike,
    color: "from-blue-600 to-indigo-600",
    glowColor: "rgba(37, 99, 235, 0.3)",
    models: [
      { name: "Honda Activa 6G", cc: "110cc", rate: "₹600/day", tag: "Most Popular" },
      { name: "Suzuki Access 125", cc: "125cc", rate: "₹650/day", tag: "Top Comfort" },
      { name: "Burgman Street", cc: "125cc", rate: "₹700/day", tag: "Max Storage" },
      { name: "Royal Enfield 350", cc: "350cc", rate: "₹1,100/day", tag: "Cruiser" },
    ],
  },
  {
    id: 1,
    stepNum: "02",
    label: "Pay ₹200 Token",
    title: "Freeze Vehicle Online With Just ₹200",
    desc: "Why risk paying full advance? Secure your vehicle pool online for only ₹200 token. Pay the remaining rental tariff only when you pick up at our hub.",
    icon: Sparkles,
    color: "from-amber-500 to-orange-500",
    glowColor: "rgba(245, 158, 11, 0.3)",
    comparison: {
      traditional: "Pay full ₹2,500 – ₹5,000 upfront online with zero flexibility",
      pipip: "Pay just ₹200 token now. Inspect your ride first, pay remainder on pickup!",
    },
  },
  {
    id: 2,
    stepNum: "03",
    label: "Pick Up & Ride",
    title: "60-Second Handover & Hit The Road",
    desc: "Arrive at your selected hub, complete a lightning-fast digital KYC check, inspect your ride, and hit the road!",
    icon: Key,
    color: "from-emerald-500 to-teal-600",
    glowColor: "rgba(16, 185, 129, 0.3)",
    perks: [
      "Instant hub handover in under 60 seconds",
      "Zero paperwork — 100% digital KYC check-in",
      "Pay remaining rental balance only at hub during pickup",
      "Refundable security deposit returned on drop-off",
    ],
  },
];

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: bikes } = useBikes();
  const [activeStep, setActiveStep] = useState(0);
  const journeyRef = useRef(null);
  const activeStepRef = useRef(0);
  activeStepRef.current = activeStep;

  // Native sticky scroll (zero spring-loop overhead, zero wheel hijacking):
  // Only triggers a state update when crossing 0.33 / 0.67 thresholds.
  const { scrollYProgress } = useScroll({
    target: journeyRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const next = latest < 0.33 ? 0 : latest < 0.67 ? 1 : 2;
    if (next !== activeStepRef.current) {
      setActiveStep(next);
    }
  });

  const handleStepClick = (index) => {
    const el = journeyRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollable = el.offsetHeight - window.innerHeight;
    const targets = [0.06, 0.5, 0.94];
    const targetY = scrollTop + rect.top + Math.max(0, scrollable * targets[index]);
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  // Horizontal touch swipe support on mobile (scrolls smoothly to corresponding step)
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0 && activeStepRef.current < 2) {
        handleStepClick(activeStepRef.current + 1);
      } else if (deltaX > 0 && activeStepRef.current > 0) {
        handleStepClick(activeStepRef.current - 1);
      }
    }
  };

  // Dynamic live bike cards with actual rates from catalog & direct booking navigation
  const fleetModels = useMemo(() => {
    const defaultList = [
      { key: "activa", name: "Honda Activa 6G", cc: "110cc", defaultRate: 600, tag: "Most Popular", fallbackCc: "under125" },
      { key: "access", name: "Suzuki Access 125", cc: "125cc", defaultRate: 650, tag: "Top Comfort", fallbackCc: "under125" },
      { key: "burgman", name: "Burgman Street", cc: "125cc", defaultRate: 700, tag: "Max Storage", fallbackCc: "under125" },
      { key: "enfield", name: "Royal Enfield 350", cc: "350cc", defaultRate: 1100, tag: "Cruiser", fallbackCc: "above150" },
    ];

    return defaultList.map((item) => {
      const match = (bikes || []).find((b) => {
        const m = `${b.bike_name || ""} ${b.model || ""}`.toLowerCase();
        return m.includes(item.key);
      });

      return {
        ...item,
        bikeId: match?._id,
        name: match?.bike_name || match?.model || item.name,
        cc: match?.cc ? `${match.cc}cc` : item.cc,
        rate: `₹${match?.price_per_day || item.defaultRate}/day`,
      };
    });
  }, [bikes]);

  useSEO({
    title: "Pipip Services | Self-Drive Bike & Scooty Rental",
    description:
      "Affordable self-drive bike and scooty rentals starting at ₹600/day. Rent Activa, Burgman, and Royal Enfield with easy online ₹200 token reservation and refundable deposit.",
  });

  useEffect(() => {
    if (location.state?.scrollTo) {
      const id = location.state.scrollTo;
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const scrollToFeatured = () => {
    const el = document.getElementById("featured-rides");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-0">
      <Header />

      <main>
        <Hero />

        {/* ======================================================== */}
        {/* 🛣️ INTERACTIVE CONNECTED HIGHWAY: 3-STEP JOURNEY        */}
        {/* ======================================================== */}
        <section
          ref={journeyRef}
          id="effortless-journey"
          className="relative h-[280vh] sm:h-[300vh] bg-gradient-to-b from-[#F1F5F9]/90 via-white to-[#F8FAFC] border-y border-slate-200/80"
        >
          {/* Sticky Viewport-Aligned Frame */}
          <div className="sticky top-14 sm:top-20 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-5rem)] flex flex-col justify-center py-2 sm:py-6 overflow-hidden">
            {/* Subtle Ambient Radial Lighting (GPU-light gradient, zero blur filter lag) */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[380px] rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0) 70%)",
              }}
            />

            <div className="container mx-auto px-3 sm:px-6 lg:px-8 relative z-10 w-full max-w-4xl">
              {/* Section Header */}
              <div className="text-center max-w-2xl mx-auto mb-3 sm:mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-800 border border-blue-300/40 text-[10px] sm:text-xs font-black shadow-2xs mb-1.5 sm:mb-2.5">
                  <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
                  <span>EFFORTLESS 3-STEP JOURNEY</span>
                </div>

                <h2 className="text-xl sm:text-3xl lg:text-4xl font-display font-black text-slate-900 tracking-tight leading-[1.15]">
                  Rent in Minutes,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">
                    Ride for Hours.
                  </span>
                </h2>

                <p className="text-[11px] sm:text-xs md:text-sm text-slate-600 mt-1 sm:mt-1.5 max-w-xl mx-auto leading-relaxed">
                  Choose your ride, reserve with a{" "}
                  <span className="font-bold text-slate-900 underline decoration-amber-400 decoration-2 underline-offset-2">
                    ₹200 token
                  </span>
                  , and pick up from any Mumbai hub in under 60 seconds.
                </p>
              </div>

              {/* Highway Connected Station Rail */}
              <div className="max-w-4xl mx-auto mb-3 sm:mb-6">
                <div className="relative flex items-start justify-between">
                  {/* Connecting Neon Track Line (pure CSS compositor scaleX) */}
                  <div className="absolute left-6 sm:left-7 right-6 sm:right-7 top-5 sm:top-7 -translate-y-1/2 h-1.5 bg-slate-200 rounded-full z-0 overflow-hidden">
                    <div
                      className="h-full w-full bg-gradient-to-r from-blue-600 via-amber-500 to-emerald-500 will-change-transform"
                      style={{
                        transformOrigin: "left center",
                        transform: `scaleX(${activeStep === 0 ? 0 : activeStep === 1 ? 0.5 : 1})`,
                        transition: "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                    />
                  </div>

                  {/* 3 Interactive Station Stops */}
                  {stepsData.map((step) => {
                    const isActive = activeStep === step.id;
                    const isDone = activeStep > step.id;

                    return (
                      <button
                        key={step.id}
                        onClick={() => handleStepClick(step.id)}
                        className="relative z-10 flex flex-col items-center group cursor-pointer active:scale-95 transition-transform"
                      >
                        {/* Station Disc */}
                        <div
                          className={`w-10 sm:w-14 h-10 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform duration-300 shadow-md ${
                            isActive
                              ? `bg-gradient-to-br ${step.color} text-white ring-4 ring-blue-500/20 scale-105 sm:scale-110 shadow-lg`
                              : isDone
                              ? "bg-slate-900 text-emerald-400"
                              : "bg-white text-slate-400 border-2 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {isDone ? (
                            <Check className="w-4 sm:w-5 h-4 sm:h-5 stroke-[3]" />
                          ) : (
                            <step.icon className="w-4 sm:w-6 h-4 sm:h-6" />
                          )}
                        </div>

                        {/* Station Label */}
                        <div className="mt-1.5 text-center">
                          <span
                            className={`text-[10px] sm:text-xs font-black tracking-tight block transition-colors duration-300 ${
                              isActive
                                ? "text-blue-700 font-extrabold"
                                : "text-slate-600 group-hover:text-slate-900"
                            }`}
                          >
                            {step.label}
                          </span>
                          <span className="text-[8px] sm:text-[10px] text-slate-400 font-semibold uppercase">
                            Step {step.stepNum}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interactive Live Stage Display */}
              <div
                className="max-w-4xl mx-auto"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 shadow-xl shadow-slate-900/5 relative overflow-hidden">
                  {/* Subtle Accent Glow (lightweight radial gradient for 60fps transitions) */}
                  <div
                    className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none opacity-45"
                    style={{
                      background: `radial-gradient(circle, ${stepsData[activeStep].glowColor} 0%, transparent 70%)`,
                    }}
                  />

                  {/* Header info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-3 sm:pb-4 border-b border-slate-100 relative z-10">
                    <div>
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        PHASE {stepsData[activeStep].stepNum} OF 03
                      </span>
                      <h3 className="text-base sm:text-2xl font-display font-black text-slate-900 mt-1 transition-opacity duration-300">
                        {stepsData[activeStep].title}
                      </h3>
                    </div>
                    <p className="text-[11px] sm:text-xs md:text-sm text-slate-500 max-w-md sm:text-right transition-opacity duration-300">
                      {stepsData[activeStep].desc}
                    </p>
                  </div>

                  {/* Pure CSS GPU Compositor Sliding Track (zero JS frame overhead, always lands on full card) */}
                  <div className="pt-3 sm:pt-5 overflow-hidden relative z-10" style={{ contain: "layout paint" }}>
                    <div
                      className="flex will-change-transform"
                      style={{
                        transform: `translate3d(-${activeStep * 100}%, 0, 0)`,
                        transition: "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)",
                      }}
                    >
                      {/* STEP 1: FLEET SHOWCASE */}
                      <div className="w-full shrink-0">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                            {fleetModels.map((model, i) => (
                              <div
                                key={i}
                                className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50/80 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 transition-all text-center group cursor-pointer"
                                onClick={() => {
                                  if (model.bikeId) {
                                    navigate(`/book/${model.bikeId}`);
                                  } else {
                                    navigate(`/catalog?cc=${model.fallbackCc}`);
                                  }
                                }}
                              >
                                <span className="text-[8px] sm:text-[9px] font-bold text-blue-700 bg-blue-100/70 px-1.5 sm:px-2 py-0.5 rounded-full inline-block mb-1">
                                  {model.tag}
                                </span>
                                <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                  {model.name}
                                </p>
                                <p className="text-[10px] sm:text-[11px] text-slate-500">{model.cc}</p>
                                <p className="text-xs sm:text-sm font-black text-blue-600 mt-0.5 sm:mt-1">
                                  {model.rate}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-1 sm:pt-2">
                            <span className="text-[10px] sm:text-xs font-bold text-slate-500 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              Live Hub Availability • Sanity Inspected
                            </span>
                            <button
                              onClick={() => handleStepClick(1)}
                              className="text-[11px] sm:text-xs font-extrabold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                            >
                              <span>Next: See How ₹200 Token Works</span>
                              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* STEP 2: ₹200 TOKEN VALUE COMPARISON */}
                      <div className="w-full shrink-0">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                            {/* Traditional Way */}
                            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-1.5 sm:space-y-2">
                              <div className="flex items-center gap-2 text-rose-700 font-bold text-[11px] sm:text-xs uppercase tracking-wider">
                                <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
                                <span>Traditional Rentals</span>
                              </div>
                              <p className="text-[11px] sm:text-xs text-rose-900/80 leading-relaxed">
                                {stepsData[1].comparison.traditional}
                              </p>
                              <span className="inline-block text-[9px] sm:text-[10px] font-extrabold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                                Heavy Cash Locked Upfront ❌
                              </span>
                            </div>

                            {/* Pipip Flexi-Token */}
                            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/80 border border-emerald-300 space-y-1.5 sm:space-y-2 shadow-xs">
                              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-[11px] sm:text-xs uppercase tracking-wider">
                                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                                <span>Pipip Flexi-Reserve</span>
                              </div>
                              <p className="text-[11px] sm:text-xs text-emerald-950 leading-relaxed font-medium">
                                {stepsData[1].comparison.pipip}
                              </p>
                              <span className="inline-block text-[9px] sm:text-[10px] font-black text-emerald-800 bg-emerald-200/70 px-2.5 py-0.5 rounded-md">
                                Just ₹200 to Lock • 100% Peace of Mind ✅
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 sm:pt-2">
                            <button
                              onClick={() => handleStepClick(0)}
                              className="text-[11px] sm:text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                            >
                              ← Back to Fleet
                            </button>
                            <button
                              onClick={() => handleStepClick(2)}
                              className="text-[11px] sm:text-xs font-extrabold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                            >
                              <span>Next: See 60-Second Pickup & Perks</span>
                              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* STEP 3: PICKUP CHECKLIST & HANDOVER */}
                      <div className="w-full shrink-0">
                        <div className="space-y-3 sm:space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            {stepsData[2].perks.map((perk, i) => (
                              <div
                                key={i}
                                className="p-2.5 sm:p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-2 sm:gap-2.5"
                              >
                                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
                                </div>
                                <span className="text-[11px] sm:text-xs font-semibold text-slate-800">
                                  {perk}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-1 sm:pt-2">
                            <button
                              onClick={() => handleStepClick(1)}
                              className="text-[11px] sm:text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                            >
                              ← Back to ₹200 Token
                            </button>
                            <button
                              onClick={scrollToFeatured}
                              className="text-[11px] sm:text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                            >
                              <span>Ready to Ride? Browse Available Vehicles</span>
                              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 💳 MINIMAL & ANIMATED VIP ₹200 TOKEN CAPSULE             */}
        {/* ======================================================== */}
        <section className="container mx-auto px-4 lg:px-8 py-4 sm:py-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative rounded-2xl sm:rounded-3xl p-[1.5px] overflow-hidden group shadow-[0_12px_40px_-10px_rgba(245,158,11,0.22)]"
          >
            {/* Animated Rotating Conic Gradient Border */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,#f59e0b,#fbbf24,#3b82f6,#10b981,#f59e0b)] opacity-70 group-hover:opacity-100 transition-opacity"
            />

            {/* Inner Dark Luxury Body (opaque gradient, no heavy backdrop-blur-xl over rotating border) */}
            <div className="relative bg-gradient-to-r from-slate-950 via-[#0A1020] to-slate-950 rounded-2xl sm:rounded-3xl px-4 py-4 sm:px-7 sm:py-5">
              {/* Ambient Glowing Halo (lightweight radial-gradient, zero blur-3xl lag) */}
              <div
                className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(245,158,11,0.16) 0%, transparent 70%)" }}
              />
              <div
                className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(59,130,246,0.16) 0%, transparent 70%)" }}
              />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Left: Animated 3D Floating Token & Headline */}
                <div className="flex items-center gap-3.5 sm:gap-5 w-full md:w-auto">
                  {/* Floating Golden Coin */}
                  <div className="relative shrink-0">
                    <motion.div
                      animate={{
                        scale: [1, 1.25, 1],
                        opacity: [0.4, 0.8, 0.4],
                      }}
                      transition={{
                        duration: 2.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 bg-amber-400 rounded-full blur-md"
                    />
                    <motion.div
                      animate={{
                        y: [-2, 3, -2],
                        rotate: [-3, 3, -3],
                      }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-200 p-[1.5px] shadow-lg shadow-amber-500/30 flex items-center justify-center"
                    >
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-black text-amber-400/90 leading-none">PIPIP</span>
                        <span className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200 leading-tight">
                          ₹200
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Text details */}
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-[10px] sm:text-xs font-black text-amber-300 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 text-amber-300 animate-spin" style={{ animationDuration: "6s" }} />
                        Smart Token Lock
                      </span>
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Live Hub Guarantee
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base lg:text-lg font-display font-extrabold text-white tracking-tight flex flex-wrap items-center gap-1.5">
                      <span>Reserve any scooter or bike for just</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-black">
                        ₹200 Token
                      </span>
                    </h3>

                    <p className="text-[11px] sm:text-xs text-slate-300/80 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className="inline-flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                        Pay rest at pickup
                      </span>
                      <span className="text-slate-600 hidden sm:inline">•</span>
                      <span className="inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-blue-400" />
                        100% Refundable deposit
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right: Animated Magnetic CTA */}
                <div className="w-full md:w-auto shrink-0 flex items-center justify-end">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/catalog")}
                    className="relative w-full md:w-auto overflow-hidden bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 font-black text-xs sm:text-sm py-2.5 sm:py-3 px-5 sm:px-6 rounded-xl sm:rounded-2xl shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    {/* Light Sweep Reflection Animation */}
                    <motion.div
                      animate={{
                        x: ["-100%", "200%"],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        repeatDelay: 1.5,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12 pointer-events-none"
                    />
                    <span className="relative z-10 font-black">Lock with ₹200 Now</span>
                    <ArrowRight className="relative z-10 w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Featured Rides Section */}
        <div>
          <FeaturedBikes />
        </div>

        {/* Customer Reviews & Live Mumbai Activity */}
        <div className="content-auto">
          <CustomerReviews />
        </div>

        {/* What Our Users Have to Say — Interactive Story Carousel */}
        <div className="content-auto">
          <CustomerStories />
        </div>
      </main>

      <div className="content-auto">
        <Footer />
      </div>

      {/* Mobile App Bottom Floating Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
};

export default Index;
