import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Calendar,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  Zap,
  FileCheck,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { Button } from "./ui/button";
import { NavLink } from "react-router-dom";

const plans = [
  {
    id: "daily",
    name: "Daily Explorer",
    icon: Calendar,
    price: "600",
    unit: "/day",
    badge: "Most Popular",
    popular: true,
    description: "Best value for full-day city commuting & sightseeing across Mumbai.",
    features: [
      "24 hours continuous rental",
      "Complimentary sanitized ISI helmet",
      "Full comprehensive insurance coverage",
      "Dedicated customer and fleet assistance",
      "Zero surge pricing guarantee",
    ],
    ctaText: "Book Daily Ride",
    color: "from-blue-600 to-indigo-600",
  },
  {
    id: "weekly",
    name: "Weekly Commuter",
    icon: Zap,
    price: "3,000",
    unit: "/week",
    badge: "Save 15%",
    popular: false,
    description: "Ideal for extended work trips, freelancers, and weekly explorations.",
    features: [
      "7 days unlimited city commute",
      "Complimentary sanitized ISI helmet",
      "Full RTO commercial permit insurance",
      "Priority customer and trip support",
      "15% flat multi-day discount applied",
    ],
    ctaText: "Choose Weekly",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "monthly",
    name: "Monthly Resident",
    icon: Clock,
    price: "9,000",
    unit: "/month",
    badge: "Best Value",
    popular: false,
    description: "Cheapest alternative to cab surge pricing for long-term Mumbai residents.",
    features: [
      "30 days full vehicle custody",
      "Complimentary sanitized ISI helmet",
      "Free scheduled monthly servicing & checkup",
      "VIP customer support line",
      "30% maximum savings tier applied",
    ],
    ctaText: "Choose Monthly",
    color: "from-emerald-500 to-teal-600",
  },
];

const guarantees = [
  {
    icon: ShieldCheck,
    title: "₹2,000 Refundable Deposit",
    desc: "100% returned immediately via UPI upon vehicle handover check.",
    color: "text-blue-600 bg-blue-50 border-blue-200/80",
  },
  {
    icon: Sparkles,
    title: "Sanitized ISI Helmet",
    desc: "Clean, ISI certified helmet provided with every single booking.",
    color: "text-amber-600 bg-amber-50 border-amber-200/80",
  },
  {
    icon: Wrench,
    title: "Dedicated Trip Support",
    desc: "Prompt customer support and assistance across our operating hubs.",
    color: "text-emerald-600 bg-emerald-50 border-emerald-200/80",
  },
  {
    icon: FileCheck,
    title: "Verified Commercial RTO",
    desc: "Full legal permits, valid insurance, and commercial registration.",
    color: "text-purple-600 bg-purple-50 border-purple-200/80",
  },
];

export default function Pricing() {
  const [hoveredPlan, setHoveredPlan] = useState(null);

  return (
    <section id="pricing" className="py-14 sm:py-20 relative bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] border-t border-slate-200/80 overflow-hidden">
      {/* Ambient Radial Background Lighting */}
      <div className="absolute top-1/4 left-1/3 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[350px] bg-amber-400/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-800 border border-blue-300/40 text-xs font-black shadow-2xs mb-3.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>TRANSPARENT & PREDICTABLE RATES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-900 tracking-tight leading-[1.15]">
            Flexible Rental{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500">
              Pricing
            </span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-slate-600 mt-3 max-w-xl mx-auto leading-relaxed font-normal">
            Affordable self-drive bike & scooter rental rates. Lock any plan with just a{" "}
            <span className="font-bold text-slate-900 underline decoration-amber-400 decoration-2 underline-offset-2">
              ₹200 token
            </span>
            , with 100% refundable security deposit upon vehicle return.
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto items-stretch">
          {plans.map((plan, index) => {
            const isHovered = hoveredPlan === plan.id;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`relative bg-white rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? "border-2 border-blue-600 shadow-xl shadow-blue-500/15 ring-4 ring-blue-500/10"
                    : "border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-xl hover:border-slate-300"
                }`}
              >
                {/* Popular Pill Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                    <span
                      className={`text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm text-white ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                          : "bg-slate-900"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  {/* Card Icon & Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-xs ${
                        plan.popular
                          ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <plan.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                      {plan.name.split(" ")[0]}
                    </span>
                  </div>

                  {/* Plan Name & Description */}
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display mb-1.5 tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 mb-6 leading-relaxed min-h-[38px]">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-slate-100">
                    <span className="text-base font-bold text-slate-400">₹</span>
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight tabular-nums font-display">
                      {plan.price}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-400 font-medium ml-1">
                      {plan.unit}
                    </span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8 text-xs sm:text-[13px]">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-start gap-2.5 text-slate-700 font-medium leading-snug"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call to Action Button */}
                <div className="pt-2">
                  <NavLink to="/catalog" className="block">
                    <Button
                      size="lg"
                      className={`relative overflow-hidden w-full h-12 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 active:scale-95"
                          : "border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-900 hover:border-slate-800 active:scale-95 shadow-2xs"
                      }`}
                    >
                      {plan.popular && (
                        <motion.div
                          animate={{
                            x: ["-100%", "200%"],
                          }}
                          transition={{
                            duration: 2.2,
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: "easeInOut",
                          }}
                          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
                        />
                      )}
                      <span className="relative z-10">{plan.ctaText}</span>
                      <ArrowRight className="relative z-10 w-4 h-4" />
                    </Button>
                  </NavLink>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Guarantees & Features Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-14 max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
        >
          <div className="text-center mb-6">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50/90 px-3.5 py-1.5 rounded-full border border-blue-200">
              STANDARD WITH ALL PLANS
            </span>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-2.5 font-display tracking-tight">
              Every Pipip Rental Includes
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            {guarantees.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col items-center text-center transition-all hover:bg-white hover:shadow-xs"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-2.5 ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {item.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom Banner Note */}
        <div className="text-center text-xs text-slate-500 mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span>• 100% Refundable Security Deposit</span>
          <span>• Instant ₹200 Token Confirmation</span>
          <span>• Zero Hidden Cancellation Fees</span>
        </div>

      </div>
    </section>
  );
}
