// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Menu, X, Phone } from "lucide-react";
// import { Button } from "./ui/button";


// const Header = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   const navLinks = [
//     { href: "#home", label: "Home" },
//     { href: "#about", label: "About" },
//     { href: "#pricing", label: "Pricing" },
//     { href: "#rent", label: "Rent Now" },
//     { href: "#contact", label: "Contact" },
//   ];

  


//   return (
//     <motion.header
//       initial={{ y: -100 }}
//       animate={{ y: 0 }}
//       className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
//     >
//       <div className="container mx-auto px-4 py-4 flex items-center justify-between">
//         {/* Logo */}
//         <a href="#home" className="flex items-center gap-2">
            
//           <img
//             src="/logo.jpeg"
//             alt="Pipip Logo"
//             className="h-20 w-20 object-cover rounded-full "
//           />
//         </a>

//         {/* Desktop Navigation */}
//         <nav className="hidden md:flex items-center gap-16">
//           {navLinks.map((link) => (
//             <a
//               key={link.href}
//               href={link.href}
//               className="text-foreground/80 hover:text-primary transition-colors font-medium"
//             >
//               {link.label}
//             </a>
//           ))}
//         </nav>

//         {/* CTA Button */}
//         <div className="hidden md:flex items-center gap-4">
//           <a href="tel:9967406205">
//             <Button variant="hero" size="lg" className="gap-2">
//               <Phone className="w-4 h-4" />
//               Call Now
//             </Button>
//           </a>
          

//         </div>

//         {/* Mobile Menu Toggle */}
//         <button
//           className="md:hidden text-foreground p-2"
//           onClick={() => setIsMenuOpen(!isMenuOpen)}
//         >
//           {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//         </button>
//       </div>

//       {/* Mobile Menu */}
//       <AnimatePresence>
//         {isMenuOpen && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: "auto" }}
//             exit={{ opacity: 0, height: 0 }}
//             className="md:hidden bg-card border-b border-border"
//           >
//             <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
//               {navLinks.map((link) => (
//                 <a
//                   key={link.href}
//                   href={link.href}
//                   className="text-foreground/80 hover:text-primary transition-colors font-medium py-2"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   {link.label}
//                 </a>
//               ))}
//               <a href="tel:9967406205" className="mt-2">
//                 <Button variant="hero" size="lg" className="w-full gap-2">
//                   <Phone className="w-4 h-4" />
//                   Call Now
//                 </Button>
//               </a>
//             </nav>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.header>
//   );
// };

// export default Header;



import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Phone,
  Bike,
  Home,
  Tag,
  Star,
  MapPin,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { Button } from "./ui/button";

const HEADER_OFFSET = 88;

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { id: "home", label: "Home", type: "section", icon: Home, badge: null },
    { id: "/catalog", label: "Fleet & Catalog", type: "page", icon: Bike, badge: null },
    { id: "/pricing", label: "Tariff Rates", type: "page", icon: Tag, badge: null },
    { id: "/about", label: "About Pipip", type: "page", icon: ShieldCheck, badge: null },
    { id: "/contact", label: "Contact & Hubs", type: "page", icon: MapPin, badge: null },
  ];

  const handleNavigation = (link) => {
    setIsMenuOpen(false);

    if (link.type === "page") {
      navigate(link.id);
      return;
    }

    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: link.id } });
      return;
    }

    setTimeout(() => {
      const el = document.getElementById(link.id);
      if (!el) return;

      const y = el.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
      window.scrollTo({
        top: y,
        behavior: "smooth",
      });

      window.history.pushState(null, "", `#${link.id}`);
    }, 10);
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)]"
    >
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Operational Beacon */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavigation({ id: "home", type: "section" })}
            className="flex items-center gap-2.5 cursor-pointer group text-left"
            aria-label="Pipip Home"
          >
            <div className="relative">
              <img
                src="/logo.jpeg"
                alt="Pipip Logo"
                width="40"
                height="40"
                decoding="async"
                className="h-10 w-10 object-cover rounded-xl border border-slate-200/90 shadow-2xs group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">
                  Pipip
                </span>
                <span className="text-[10px] font-black text-blue-700 bg-blue-50/90 border border-blue-200/80 px-1.5 py-0.2 rounded-md leading-tight">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium tracking-tight leading-tight mt-0.5">
                Self-Drive Rentals
              </span>
            </div>
          </button>

          {/* City Live Badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700 bg-slate-100/90 border border-slate-200/70 px-2.5 py-1 rounded-full shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live Fleet Active</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              (link.type === "page" && location.pathname === link.id) ||
              (link.type === "section" && location.pathname === "/" && location.hash === `#${link.id}`);

            return (
              <button
                key={link.id}
                onClick={() => handleNavigation(link)}
                className={`text-xs font-bold transition-all cursor-pointer px-3 py-1.5 rounded-lg flex items-center gap-1.5 ${
                  isActive
                    ? "text-blue-600 bg-blue-50/90 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] font-extrabold bg-blue-100/80 text-blue-800 px-1.5 py-0.2 rounded-full">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2">
          {/* Quick WhatsApp Support Pill */}
          <a
            href="https://wa.me/919967406205?text=Hi%20Pipip%20Rentals%2C%20I%20want%20to%20rent%20a%20bike%2Fscooter"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Support"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200/70 text-xs font-bold shadow-2xs active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-emerald-600/20 text-emerald-600" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          {/* Desktop Direct Call Button */}
          <a href="tel:9967406205" className="hidden sm:inline-block">
            <Button
              size="sm"
              className="gap-1.5 h-9 px-3.5 font-bold text-xs bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-500/20 rounded-xl active:scale-95 transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>9967406205</span>
            </Button>
          </a>

          {/* Mobile Menu Drawer Trigger */}
          <button
            className="lg:hidden text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer active:scale-95"
            aria-label="Toggle Navigation Menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Modern App-Like Drawer Sheet */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="lg:hidden bg-white/98 backdrop-blur-2xl border-b border-slate-200/90 overflow-hidden shadow-2xl"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              {/* Fleet status card inside mobile menu */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/60 to-blue-50 border border-blue-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    🛵
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-tight">Live Fleet Available</p>
                    <p className="text-[10px] text-slate-500">Pickup Hubs & Support</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Open 7am-11pm
                </span>
              </div>

              {/* Navigation list */}
              <nav className="grid grid-cols-1 gap-1">
                {navLinks.map((link) => {
                  const isActive =
                    (link.type === "page" && location.pathname === link.id) ||
                    (link.type === "section" && location.pathname === "/" && location.hash === `#${link.id}`);

                  const IconComp = link.icon;

                  return (
                    <button
                      key={link.id}
                      onClick={() => handleNavigation(link)}
                      className={`text-left text-xs font-bold py-2.5 px-3 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? "text-blue-600 bg-blue-50/90 shadow-2xs font-extrabold"
                          : "text-slate-700 hover:bg-slate-100/80"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <IconComp className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                        <span>{link.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {link.badge && (
                          <span className="text-[9px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {link.badge}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Quick Contact Bar */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <a href="tel:9967406205">
                  <Button
                    size="sm"
                    className="w-full gap-1.5 h-10 font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call 9967406205</span>
                  </Button>
                </a>
                <a
                  href="https://wa.me/919967406205?text=Hi%20Pipip%20Rentals%2C%20I%20want%20to%20rent%20a%20bike%2Fscooter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="sm"
                    className="w-full gap-1.5 h-10 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;