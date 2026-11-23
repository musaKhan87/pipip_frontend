import { useState } from "react";
import { motion } from "framer-motion";
import {
  Phone,
  MessageCircle,
  Instagram,
  MapPin,
  Clock,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Navigation,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Bike,
  Flame,
} from "lucide-react";
import { Button } from "./ui/button";
import Footer from "./Footer";
import Header from "./Header";
import MobileBottomNav from "./MobileBottomNav";
import useSEO from "../hooks/useSEO";

const Contact = () => {
  useSEO({
    title: "Contact & Hub Locations | Pipip Self-Drive Bike Rentals Mumbai",
    description: "Get in touch with Pipip Rentals. Visit our central pickup hubs in Mumbai or call +91 9967406205 for instant, verified two-wheeler rentals.",
  });

  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    vehicleType: "scooter",
    message: "",
  });

  const fullAddress =
    "Rahat Tower, Nishanpada Road, Near City Heights, Khadak, Dongri, Mandvi, Mumbai, Maharashtra 400009";

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppSubmit = (e) => {
    e.preventDefault();
    const text = `Hi Pipip Rentals! I would like to inquire about renting a two-wheeler.%0A%0A*Name:* ${encodeURIComponent(
      formData.name || "Rider"
    )}%0A*Phone:* ${encodeURIComponent(formData.phone || "Not provided")}%0A*Vehicle Interest:* ${encodeURIComponent(
      formData.vehicleType === "scooter"
        ? "Scooter (Activa / Access 125)"
        : formData.vehicleType === "cruiser"
        ? "Cruiser (Royal Enfield Hunter 350)"
        : "Sports Bike / Other"
    )}${formData.message ? `%0A*Note:* ${encodeURIComponent(formData.message)}` : ""}`;

    window.open(`https://wa.me/919967406205?text=${text}`, "_blank");
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Direct Hub Helpline",
      description: "Speak directly with our Mumbai hub fleet manager",
      value: "+91 9967406205",
      href: "tel:9967406205",
      action: "Call Now",
      gradient: "from-blue-600 to-indigo-600",
      accent: "text-blue-600 bg-blue-50 border-blue-200",
      live: true,
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Quick Desk",
      description: "Instant bike verification & digital pickup tokens",
      value: "Chat on WhatsApp",
      href: "https://wa.me/919967406205?text=Hi%20Pipip%20Rentals%2C%20I%20want%20to%20rent%20a%20bike%2Fscooter%20in%20Mumbai",
      action: "Open WhatsApp",
      gradient: "from-emerald-600 to-teal-600",
      accent: "text-emerald-600 bg-emerald-50 border-emerald-200",
      live: true,
    },
    {
      icon: Instagram,
      title: "Official Instagram",
      description: "Follow rider reels, city routes & flash discount drops",
      value: "@pipip_mumbai",
      href: "https://instagram.com/pipip_mumbai",
      action: "Follow Profile",
      gradient: "from-purple-600 via-pink-600 to-amber-600",
      accent: "text-pink-600 bg-pink-50 border-pink-200",
      live: false,
    },
    {
      icon: Mail,
      title: "Corporate Email",
      description: "Corporate bookings & business partnerships",
      value: "hello@pipip.in",
      href: "mailto:pipip6296@gmail.com",
      action: "Write Email",
      gradient: "from-sky-600 to-blue-600",
      accent: "text-sky-600 bg-sky-50 border-sky-200",
      live: false,
    },
  ];

  const mapSrc =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.4567469432895!2d72.83309717466226!3d18.955425455747825!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7cf0507c305ad%3A0x7db754dae7717c61!2sPipip%20Bikes%20and%20Scooter%20Rental!5e0!3m2!1sen!2sin!4v1770816123179!5m2!1sen!2sin";

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-0">
      <Header />

      <main className="pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="relative py-14 sm:py-20 overflow-hidden bg-gradient-to-b from-[#F0F6FF]/70 via-[#F8FAFC] to-[#F1F5F9]/50 border-b border-slate-200/80">
          {/* Dynamic Ambient Aurora Glows */}
          <div className="absolute top-1/2 -left-32 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/2 -right-32 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-2xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-900 border border-blue-300/40 text-xs font-black shadow-2xs mb-3.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>OPEN 7 DAYS A WEEK • 7:00 AM – 11:00 PM</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-3">
                Get In Touch With{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">
                  Pipip
                </span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal">
                Need an Activa 6G, Suzuki Access, Burgman, or Royal Enfield Hunter? Our central Mumbai hub managers are on standby to verify your token and hand over the keys in 60 seconds.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Methods Cards Grid */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {contactMethods.map((method, index) => (
                <motion.a
                  key={index}
                  href={method.href}
                  target={method.href.startsWith("http") ? "_blank" : undefined}
                  rel={method.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="group relative bg-white border border-slate-200/90 rounded-3xl p-6 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] cursor-pointer overflow-hidden"
                >
                  {/* Shimmer sweep */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${method.gradient} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                      >
                        <method.icon className="w-6 h-6 stroke-[2.2]" />
                      </div>

                      {method.live && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/80">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          Live Now
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 font-display mb-1 group-hover:text-blue-600 transition-colors">
                      {method.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed font-normal">
                      {method.description}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs sm:text-[13px] font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      {method.value}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-black text-blue-600">
                      <span>{method.action}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 💬 QUICK INQUIRY & DISPATCH FORM WIDGET                   */}
        {/* ========================================================= */}
        <section className="py-6 sm:py-10 max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden"
          >
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 text-xs font-black border border-emerald-300/40 mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>DIRECT FLEET DISPATCH</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 tracking-tight">
                  Instant Rental Inquiry
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Have a custom schedule, corporate requirement, or need vehicle recommendations? Fill your details and our team will connect with you immediately on WhatsApp.
                </p>

                <div className="mt-6 space-y-3 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Average response time: <strong>under 3 minutes</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Instant token booking assistance over WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Free sanitized helmet with every vehicle</span>
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <form
                onSubmit={handleWhatsAppSubmit}
                className="w-full md:w-[380px] bg-slate-50/80 p-5 sm:p-6 rounded-2xl border border-slate-200/90 space-y-4 shrink-0"
              >
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Vehicle Preference
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                  >
                    <option value="scooter">Scooter (Honda Activa / Suzuki Access 125)</option>
                    <option value="cruiser">Cruiser (Royal Enfield Hunter 350 / Classic)</option>
                    <option value="sport">Sports / Maxi-Scooter (Burgman / Pulsar)</option>
                  </select>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send WhatsApp Inquiry</span>
                </Button>
              </form>
            </div>
          </motion.div>
        </section>

        {/* Map & Physical Hub Details */}
        <section className="py-12 sm:py-16 bg-gradient-to-b from-[#F1F5F9]/70 via-white to-[#F8FAFC] border-y border-slate-200/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50/90 px-3.5 py-1.5 rounded-full border border-blue-200">
                PHYSICAL HUB NETWORK
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-slate-900 tracking-tight mt-3">
                Visit Our Rental Hubs
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 font-normal">
                Convenient pickup points situated within walking distance of central Mumbai railway stations.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Map View */}
              <div className="lg:col-span-7 bg-white p-2.5 sm:p-3.5 rounded-3xl border border-slate-200/90 shadow-md overflow-hidden relative">
                <div className="relative rounded-2xl overflow-hidden h-[340px] sm:h-[420px]">
                  <iframe
                    src={mapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Pipip Bikes Location - Bhendi Bazar, Mumbai"
                  />
                  <a
                    href="https://www.google.com/maps/dir//Bhendi+Bazaar,+Mumbai,+Maharashtra+400003"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-lg shadow-blue-600/30 transition-all active:scale-95 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Google Directions</span>
                  </a>
                </div>
              </div>

              {/* Hub Cards Column */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Mumbai Main Hub Card */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs hover:border-blue-400 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/70">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <h3 className="text-sm sm:text-base font-black text-slate-900 font-display">
                          Main Mumbai Pickup Hub
                        </h3>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Open Now
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        {fullAddress}
                      </p>
                      
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleCopyAddress}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied to Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Address</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-2 font-medium">
                        (Near Sandhurst Road & Masjid Bunder Railway Stations)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hub Hours & Assistance */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/70">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 font-display mb-1">
                        Operating Schedule
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-normal">
                        Monday to Sunday: <span className="font-bold text-slate-900">7:00 AM – 11:00 PM</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        24/7 Roadside breakdown support line for all active rentals.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Direct Action Callout */}
                <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-md shadow-blue-500/20">
                  <div>
                    <h4 className="font-black text-sm sm:text-base font-display">
                      Need Immediate Handover?
                    </h4>
                    <p className="text-xs text-blue-100 mt-0.5">
                      Call our fleet dispatch directly.
                    </p>
                  </div>
                  <a
                    href="tel:9967406205"
                    className="px-4 py-2.5 rounded-xl bg-white text-blue-600 font-black text-xs hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
                  >
                    Call Now
                  </a>
                </div>

              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Contact;
