import { useState } from "react";
import {
  Bike,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Phone,
  Building2,
  ArrowRight,
  ShieldAlert,
  Award,
  Users,
  Compass,
  Check,
  MapPin,
  ChevronRight,
  Flame,
  BadgeCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

const stats = [
  {
    icon: Bike,
    value: "100%",
    label: "Verified Fleet",
    sub: "Activa, Access & Enfields",
    badge: "Quality Checked",
    color: "from-blue-600 to-indigo-600",
    glow: "shadow-blue-500/10",
  },
  {
    icon: Award,
    value: "4.9 / 5.0",
    label: "Customer Rating",
    sub: "Thousands of Happy Riders",
    badge: "Top Rated Fleet",
    color: "from-amber-500 to-orange-500",
    glow: "shadow-amber-500/10",
  },
  {
    icon: Zap,
    value: "₹200",
    label: "Online Token Lock",
    sub: "Instant Reservation Online",
    badge: "Zero High Advance",
    color: "from-purple-600 to-indigo-600",
    glow: "shadow-purple-500/10",
  },
  {
    icon: ShieldCheck,
    value: "₹2,000",
    label: "Security Deposit",
    sub: "100% Refundable at Return",
    badge: "Instant UPI Return",
    color: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/10",
  },
];

const journeySteps = [
  {
    step: "01",
    title: "Choose Your Ride",
    desc: "Browse our live fleet of Activa 6G, Suzuki Access 125, Burgman, or Royal Enfield Hunter 350. Filter by location and dates.",
    icon: Bike,
    tag: "60-Sec Selection",
  },
  {
    step: "02",
    title: "Lock for ₹200 Token",
    desc: "Pay only a minimal ₹200 commitment token online to lock your vehicle. Pay the remaining tariff upon physical handover.",
    icon: Zap,
    tag: "Instant Confirmation",
  },
  {
    step: "03",
    title: "60-Sec Hub Handover",
    desc: "Arrive at our central pickup hub. Quick verification of your original Driving License & Aadhaar, inspect fuel, and collect your sanitized helmet.",
    icon: ShieldCheck,
    tag: "Sanitized Helmet Included",
  },
  {
    step: "04",
    title: "Return & Instant Refund",
    desc: "Return the vehicle at your scheduled time. Our hub fleet manager inspects the ride and refunds your ₹2,000 deposit on the spot via UPI.",
    icon: CheckCircle2,
    tag: "100% Refundable",
  },
];

const features = [
  {
    icon: Bike,
    color: "from-blue-600 to-indigo-600",
    bg: "bg-blue-50 text-blue-600 border-blue-200/80",
    title: "Quality Verified & 25-Point Checked",
    description: "Every scooter and motorcycle undergoes a 25-point mechanical inspection before handover with complimentary sanitized helmet.",
    perk: "Zero Breakdown Guarantee",
  },
  {
    icon: Clock,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 text-amber-600 border-amber-200/80",
    title: "Flexible Hourly & Daily Tariff",
    description: "Rent by the hour (minimum 3 hours booking required) or full 24-hour day starting from ₹600/day. Perfect for quick city commutes, college, work meetings, or scenic weekend getaways across Mumbai, Thane, and Surat.",
    perk: "Zero Surge Pricing",
  },
  {
    icon: ShieldCheck,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 text-emerald-600 border-emerald-200/80",
    title: "Commercial RTO Yellow-Board Permits",
    description: "Drive legally and safely on all authorized routes across Maharashtra. All vehicles carry commercial permits, insurance, and active PUC.",
    perk: "100% Legal & Safe",
  },
  {
    icon: Zap,
    color: "from-purple-500 to-indigo-600",
    bg: "bg-purple-50 text-purple-600 border-purple-200/80",
    title: "Lock with Just ₹200 Token",
    description: "No need to pay large advance payments online. Reserve your vehicle with a ₹200 token and pay the remainder upon physical handover.",
    perk: "Pocket Friendly",
  },
  {
    icon: ShieldAlert,
    color: "from-teal-500 to-cyan-600",
    bg: "bg-teal-50 text-teal-600 border-teal-200/80",
    title: "Transparent ₹2,000 Refundable Deposit",
    description: "A standard ₹2,000 security deposit is collected during vehicle handover and refunded instantly via UPI upon vehicle return and inspection.",
    perk: "Instant UPI Payout",
  },
  {
    icon: Users,
    color: "from-rose-500 to-orange-500",
    bg: "bg-rose-50 text-rose-600 border-rose-200/80",
    title: "Daily Hub Hours: 7 AM – 11 PM",
    description: "Our hubs are open 7 days a week, supported by dedicated customer assistance and rapid on-call fleet managers.",
    perk: "Dedicated Support",
  },
];

const About = () => {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="about" className="py-14 sm:py-20 relative bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] overflow-hidden">
      {/* Ambient Dynamic Background Aurora Lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-2/3 -right-32 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-900 border border-blue-300/40 text-xs font-black shadow-2xs mb-3.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>THE PIPIP STORY • URBAN MOBILITY REIMAGINED</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.15] mb-4">
            Freedom to Ride on Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">
              Own Terms
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal">
            Pipip Services simplifies urban commuting across Mumbai, Thane, and Surat. No surge pricing, no taxi cancellations — just clean, well-maintained two-wheelers ready when you are.
          </p>
        </motion.div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 mb-16 max-w-5xl mx-auto">
          {stats.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              whileHover={{ y: -6 }}
              className={`group p-4 sm:p-6 rounded-3xl bg-white border border-slate-200/90 text-center shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-xl hover:border-blue-300 transition-all duration-300 relative overflow-hidden`}
            >
              {/* Shimmer sweep on card hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-blue-50/40 to-transparent pointer-events-none" />

              <div className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform`}>
                <item.icon className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="text-xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
                {item.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                {item.label}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-normal">
                {item.sub}
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100">
                <span className="inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {item.badge}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ========================================================= */}
        {/* 🗺️ INTERACTIVE 4-STEP JOURNEY PROGRESSION                 */}
        {/* ========================================================= */}
        <div className="mb-20 max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-900 border border-amber-300/40 text-xs font-black shadow-2xs mb-2">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
              <span>THE 4-STEP RIDE BLUEPRINT</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
              From Screen to Street in Minutes
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 font-normal">
              How renting a verified two-wheeler with Pipip actually works.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {journeySteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.1 }}
                whileHover={{ y: -6 }}
                onClick={() => setActiveStep(idx)}
                className={`relative p-5 sm:p-6 rounded-3xl bg-white border transition-all duration-300 cursor-pointer flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] ${
                  activeStep === idx
                    ? "border-blue-500 ring-2 ring-blue-500/20 shadow-xl shadow-blue-500/10"
                    : "border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="text-xs font-black font-mono text-blue-600 bg-blue-50 border border-blue-200/70 px-2.5 py-1 rounded-xl">
                      STEP {step.step}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                      <step.icon className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 font-display mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span className="text-blue-600 font-black">{step.tag}</span>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Corporate Trust Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto mb-16 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row items-center gap-5 sm:gap-6 text-center md:text-left"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
            <Building2 className="w-8 h-8 stroke-[2]" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1.5">
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-display">
                Part of Pipip Services
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Official RTO Registered Operator
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              Pipip is a flagship brand proudly operated under Pipip Services. We are committed to delivering the best self drive bike and scooty rentals across Mumbai and Surat. Whether you are looking for an affordable bike rental, daily scooty rental, or the cheapest two wheeler on rent, Pipip Services provides premium well-maintained fleets.
            </p>
          </div>
          <div className="shrink-0">
            <Link to="/contact">
              <Button
                variant="outline"
                className="h-10 px-4 rounded-xl text-xs font-black border-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all"
              >
                <span>View Pickup Hubs</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 max-w-6xl mx-auto mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              whileHover={{ y: -6 }}
              className="group bg-white border border-slate-200/90 hover:border-blue-400 rounded-3xl p-6 sm:p-7 transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between"
            >
              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${feature.bg} shadow-2xs group-hover:scale-105 transition-transform`}>
                  <feature.icon className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="inline-block text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded mb-2">
                  {feature.perk}
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mb-2 font-display tracking-tight group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                  {feature.description}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Standard with every booking</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-600/25 space-y-4 relative overflow-hidden"
        >
          {/* Subtle light sweep */}
          <div className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight leading-tight">
            Ready to experience hassle-free riding across our hubs?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-lg mx-auto font-normal leading-relaxed">
            Choose from Activa, Access, Burgman, or Royal Enfield Hunter 350. Lock your vehicle online in 60 seconds with just a ₹200 token.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link to="/catalog">
              <Button
                size="lg"
                className="h-12 px-7 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm bg-white text-blue-700 hover:bg-blue-50 shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Browse Fleet Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="tel:9967406205">
              <Button
                size="lg"
                className="h-12 px-6 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm bg-slate-950/70 hover:bg-slate-950/90 text-white border border-white/25 active:scale-95 transition-all flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Phone className="w-4 h-4 text-white" />
                <span>Call +91 9967406205</span>
              </Button>
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default About;
