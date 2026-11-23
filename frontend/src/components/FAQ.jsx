import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Plus,
  Minus,
  HelpCircle,
  MessageCircle,
  Phone,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { Button } from "./ui/button";

const categories = [
  { id: "all", label: "All Questions" },
  { id: "booking", label: "₹200 Token & Booking" },
  { id: "deposit", label: "Deposit & Pricing" },
  { id: "documents", label: "Documents & Rules" },
  { id: "support", label: "Support & Safety" },
];

const faqs = [
  {
    category: "documents",
    question: "What documents are required to rent a two-wheeler from Pipip?",
    answer:
      "You need an original valid Driving License (Motorcycle with Gear / Non-Gear), original Aadhaar Card, and the refundable security deposit. All documents must be original physical copies for quick physical verification at pickup — digital copies or photocopies are not accepted per RTO guidelines.",
  },
  {
    category: "booking",
    question: "How does the ₹200 online token booking work?",
    answer:
      "When you select a bike or category pool on our website, you only pay a ₹200 commitment token online. This locks the vehicle exclusively for your chosen pickup date and time. The remaining rental tariff and the refundable security deposit are paid at the hub during physical handover.",
  },
  {
    category: "deposit",
    question: "How does the ₹2,000 security deposit work, and when is it refunded?",
    answer:
      "A standard ₹2,000 security deposit is collected during vehicle handover. Upon returning the vehicle at the end of your rental period, our hub manager inspects the ride and immediately initiates the full 100% deposit refund directly to your UPI ID or bank account within 5 to 10 minutes.",
  },
  {
    category: "documents",
    question: "What is the minimum age requirement to rent a bike?",
    answer:
      "You must be at least 18 years of age with a valid permanent driving license. Learners licenses (LL) are not accepted per commercial vehicle regulations in Maharashtra.",
  },
  {
    category: "deposit",
    question: "What are your rental tariffs and are there hidden charges?",
    answer:
      "Our daily rentals start from ₹600/day for Honda Activa 6G / Suzuki Access 125, and go up for premium cruisers like Royal Enfield Hunter 350. There are zero hidden costs: transparent pricing, complimentary sanitized helmet, and standard maintenance are all included.",
  },
  {
    category: "support",
    question: "Is fuel included with the vehicle?",
    answer:
      "Fuel is not included in the standard tariff. You will receive the two-wheeler with sufficient fuel to reach the nearest fuel station. Simply return the vehicle with approximately the same fuel level as recorded during the physical handover inspection.",
  },
  {
    category: "support",
    question: "What happens in case of a flat tyre or mechanical breakdown?",
    answer:
      "We provide 24/7 emergency roadside assistance across Mumbai. Simply call our hub hotline at +91 9967406205 or message us on WhatsApp. Our mobile fleet support team will assist you on-site or provide an immediate replacement vehicle at zero extra cost.",
  },
  {
    category: "booking",
    question: "Can I extend my rental duration after picking up the vehicle?",
    answer:
      "Yes! You can extend your active rental by calling our hub manager at least 2 hours before your scheduled return time. Extensions are granted subject to fleet availability at the standard daily/hourly rate without penalty fees.",
  },
  {
    category: "documents",
    question: "Are helmets provided with the rental?",
    answer:
      "Yes, a complimentary ISI-certified sanitized helmet is provided free with every vehicle rental.",
  },
];

// JSON-LD Schema for SEO
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredFaqs =
    activeCategory === "all"
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-16 sm:py-24 relative bg-gradient-to-b from-white via-[#F8FAFC] to-white border-t border-slate-200/80 overflow-hidden">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Ambient Glows */}
      <div className="absolute top-1/3 -right-32 w-80 h-80 bg-blue-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-10 sm:mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-900 border border-blue-300/40 text-xs font-black shadow-2xs mb-3">
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-slate-900 mb-3 leading-tight">
              Everything You Need to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">
                Know
              </span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-xl mx-auto font-normal leading-relaxed">
              Transparent answers regarding the ₹200 token lock, original documents, ₹2,000 refundable security deposit, and 24/7 roadside assistance.
            </p>
          </motion.div>

          {/* Interactive Category Filter Pills */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setOpenIndex(0);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all duration-200 shrink-0 cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
                    : "bg-white text-slate-700 border border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 shadow-2xs"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-3.5">
            <AnimatePresence mode="wait">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <motion.div
                    key={`${activeCategory}-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                    className={`rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? "bg-white border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/20"
                        : "bg-white/90 border-slate-200/90 hover:border-slate-300 hover:bg-white shadow-2xs"
                    }`}
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer group"
                    >
                      <span
                        className={`text-sm sm:text-base font-black font-display transition-colors duration-200 pr-6 ${
                          isOpen ? "text-blue-600" : "text-slate-900 group-hover:text-blue-600"
                        }`}
                      >
                        {faq.question}
                      </span>
                      <span
                        className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isOpen
                            ? "bg-blue-600 text-white rotate-180 shadow-xs"
                            : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600"
                        }`}
                      >
                        <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-slate-100/90">
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                              {faq.answer}
                            </p>
                            <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-emerald-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Verified Pipip Policy • Zero Ambiguity</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Bottom Live Support Callout */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mt-12 p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left"
          >
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black border border-emerald-500/30 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>HUB DESK ONLINE NOW</span>
              </div>
              <h3 className="text-base sm:text-lg font-black font-display text-white">
                Still have a specific question about your trip?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Chat directly with our Mumbai hub manager for immediate answers and custom plans.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://wa.me/919967406205?text=Hi%20Pipip%20Rentals%2C%20I%20have%20a%20question%20about%20renting%20a%20scooter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="h-11 px-5 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 flex items-center gap-2 active:scale-95 transition-all">
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Desk</span>
                </Button>
              </a>
              <a href="tel:9967406205">
                <button
                  type="button"
                  className="h-11 px-5 rounded-xl font-black text-xs bg-white hover:bg-slate-100 text-slate-900 border border-slate-200 flex items-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-slate-900 font-black">Call Hub</span>
                </button>
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default FAQ;
