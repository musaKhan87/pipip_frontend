import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bike,
  Calendar,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  MapPin,
  Activity,
  Bell,
  Boxes,
  Banknote,
  Globe,
  ChevronRight,
  Sparkles,
  Plus,
  ShieldCheck,
  Zap,
  TrendingUp,
} from "lucide-react";

import { Button } from "../ui/button";
import { cn } from "../../lib/util";
import { useAuth } from "../../lib/AuthProvider";
import { useAdminArea } from "../../lib/AreaContext";

const navSections = [
  {
    title: "Live Operations",
    items: [
      {
        path: "/admin/panel",
        icon: LayoutDashboard,
        label: "Dashboard",
        end: true,
        roles: ["super_admin", "admin", "manager", "staff"],
        iconColor: "text-blue-400 group-hover:text-blue-300",
      },
      {
        path: "/admin/panel/active-rentals",
        icon: Activity,
        label: "Active Rentals",
        roles: ["super_admin", "admin", "manager", "staff"],
        badge: "Live",
        iconColor: "text-emerald-400 group-hover:text-emerald-300",
      },
      {
        path: "/admin/panel/scheduler",
        icon: Calendar,
        label: "Scheduler",
        roles: ["super_admin", "admin", "manager", "staff"],
        iconColor: "text-amber-400 group-hover:text-amber-300",
      },
      {
        path: "/admin/panel/bookings",
        icon: ClipboardList,
        label: "Bookings",
        roles: ["super_admin", "admin", "manager", "staff"],
        iconColor: "text-indigo-400 group-hover:text-indigo-300",
      },
    ],
  },
  {
    title: "Fleet & Hubs",
    items: [
      {
        path: "/admin/panel/bikes",
        icon: Bike,
        label: "Vehicles Fleet",
        roles: ["super_admin", "admin", "manager", "staff"],
        iconColor: "text-cyan-400 group-hover:text-cyan-300",
      },
      {
        path: "/admin/panel/clusters",
        icon: Boxes,
        label: "Clusters",
        roles: ["super_admin", "admin", "manager", "staff"],
        iconColor: "text-violet-400 group-hover:text-violet-300",
      },
      {
        path: "/admin/panel/areas",
        icon: MapPin,
        label: "Hub Areas",
        roles: ["super_admin", "admin"],
        iconColor: "text-rose-400 group-hover:text-rose-300",
      },
      {
        path: "/admin/panel/customers",
        icon: Users,
        label: "Customers",
        roles: ["super_admin", "admin", "manager", "staff"],
        iconColor: "text-teal-400 group-hover:text-teal-300",
      },
    ],
  },
  {
    title: "Finance & Control",
    items: [
      {
        path: "/admin/panel/expenses",
        icon: Banknote,
        label: "Expenses",
        roles: ["super_admin", "admin", "manager", "staff"],
        iconColor: "text-amber-400 group-hover:text-amber-300",
      },
      {
        path: "/admin/panel/notifications",
        icon: Bell,
        label: "Notifications",
        roles: ["super_admin", "admin", "manager", "staff"],
        isNotification: true,
        iconColor: "text-rose-400 group-hover:text-rose-300",
      },
      {
        path: "/admin/panel/reports",
        icon: BarChart3,
        label: "Reports & KPIs",
        roles: ["super_admin", "admin", "manager"],
        iconColor: "text-emerald-400 group-hover:text-emerald-300",
      },
      {
        path: "/admin/panel/settings",
        icon: Settings,
        label: "System Settings",
        roles: ["super_admin", "admin"],
        iconColor: "text-slate-400 group-hover:text-slate-200",
      },
    ],
  },
];

const investorNav = [
  {
    title: "Investor Portal",
    items: [
      {
        path: "/admin/panel/investor-orders",
        icon: ClipboardList,
        label: "Orders & Revenue",
        iconColor: "text-blue-400",
      },
      {
        path: "/admin/panel/bikes",
        icon: Bike,
        label: "My Bikes",
        iconColor: "text-emerald-400",
      },
    ],
  },
];

export default function AdminSidebar({ unreadCount }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { signOut, user, role } = useAuth();
  const { selectedAreaObj, selectedAreaId } = useAdminArea();
  const location = useLocation();

  useEffect(() => {
    const handleOpen = () => setMobileMenuOpen(true);
    window.addEventListener("open-admin-menu", handleOpen);
    return () => window.removeEventListener("open-admin-menu", handleOpen);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/pipip-ops-mumbai";
  };

  const userRole = role === "admin" || role === "super_admin" ? "super_admin" : role;
  const sections = role === "investor" ? investorNav : navSections;

  const roleTitle =
    role === "super_admin"
      ? "Super Admin"
      : role === "manager"
      ? "Area Manager"
      : role === "staff"
      ? "Staff Operator"
      : role;

  const currentAreaLabel =
    role === "super_admin" || role === "admin"
      ? selectedAreaId === "all"
        ? "All Hubs"
        : selectedAreaObj?.name || "Selected Hub"
      : user?.areaId?.name || user?.assigned_areas?.[0]?.name || "Assigned Hub";

  return (
    <>
      {/* ======================================================== */}
      {/* 📱 MOBILE APP FULL DRAWER MODAL                         */}
      {/* ======================================================== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="lg:hidden md:hidden fixed inset-0 z-50">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer Sheet */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-80 max-w-[85vw] h-full bg-slate-950 text-white border-r border-white/10 flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Drawer Ambient Background Orbs */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/15 rounded-full blur-[70px] pointer-events-none" />
              <div className="absolute bottom-10 left-0 w-52 h-52 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />

              {/* Drawer Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden border border-white/20 shadow-lg shadow-blue-500/20 shrink-0">
                    <img src="/logo.jpeg" alt="Pipip" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-display font-black text-base text-white tracking-tight">
                        Pipip Control
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                        OPS
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="truncate max-w-[140px] font-medium">{currentAreaLabel}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Nav Items */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 relative z-10 scrollbar-hide">
                {sections.map((section, sIdx) => {
                  const visibleItems = section.items.filter((item) => {
                    if (role === "investor") return true;
                    return (
                      item.roles.includes(userRole) ||
                      (userRole === "super_admin" && item.roles.includes("admin"))
                    );
                  });

                  if (visibleItems.length === 0) return null;

                  return (
                    <div key={sIdx} className="space-y-1.5">
                      <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {section.title}
                      </p>
                      <div className="space-y-1">
                        {visibleItems.map((item) => (
                          <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) =>
                              cn(
                                "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 group",
                                isActive
                                  ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                                  : "text-slate-300 hover:text-white hover:bg-white/10"
                              )
                            }
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                              <span className="truncate">{item.label}</span>
                            </div>

                            {item.isNotification && unreadCount > 0 ? (
                              <span className="bg-rose-500 text-white text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 shadow-xs">
                                {unreadCount}
                              </span>
                            ) : item.badge ? (
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                {item.badge}
                              </span>
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Drawer Footer Profile */}
              <div className="p-4 border-t border-white/10 bg-slate-950/80 backdrop-blur-md space-y-3 relative z-10">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-black uppercase shadow-xs shrink-0">
                    {(user?.fullName || user?.email || "O")[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate text-white leading-tight">
                      {user?.fullName || user?.email}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize leading-tight mt-0.5 font-medium">
                      {roleTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Public Site</span>
                  </a>
                  <button
                    onClick={handleSignOut}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold text-rose-300 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Exit</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 🖥️ DESKTOP PREMIER EXECUTIVE SIDEBAR                    */}
      {/* ======================================================== */}
      <aside className="hidden md:flex lg:flex w-64 lg:w-72 xl:w-76 2xl:w-80 h-full bg-slate-950 text-slate-100 border-r border-white/10 flex-col shrink-0 relative overflow-hidden shadow-2xl">
        {/* Ambient Glow Lights */}
        <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/10 rounded-full blur-[70px] pointer-events-none" />
        <div className="absolute bottom-1/3 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />

        {/* Brand Header */}
        <div className="p-4 lg:p-5 border-b border-white/10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-white/15 bg-white/5 shadow-lg shadow-blue-500/20 shrink-0 p-0.5">
              <img
                src="/logo.jpeg"
                alt="Pipip"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm lg:text-base text-white tracking-tight">
                  Pipip Control
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  OPS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-sm shadow-emerald-400/50" />
                <span className="truncate font-medium">{currentAreaLabel}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 lg:px-4 py-4 space-y-5 overflow-y-auto scrollbar-hide relative z-10">
          {sections.map((section, sIdx) => {
            const visibleItems = section.items.filter((item) => {
              if (role === "investor") return true;
              return (
                item.roles.includes(userRole) ||
                (userRole === "super_admin" && item.roles.includes("admin"))
              );
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={sIdx} className="space-y-1.5">
                <p className="px-3 text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          "relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs lg:text-[13px] font-bold transition-all duration-200 cursor-pointer group active:scale-98",
                          isActive
                            ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 border border-white/20"
                            : "text-slate-300 hover:text-white hover:bg-white/10"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={cn(
                                "w-7 h-7 rounded-xl flex items-center justify-center transition-all",
                                isActive
                                  ? "bg-white/20 text-white"
                                  : "bg-white/5 text-slate-300 group-hover:bg-white/10 group-hover:text-white"
                              )}
                            >
                              <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                            </div>
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.isNotification && unreadCount > 0 ? (
                            <span className="bg-rose-500 text-white text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 shadow-md shadow-rose-500/40">
                              {unreadCount}
                            </span>
                          ) : item.badge ? (
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              {item.badge}
                            </span>
                          ) : isActive ? (
                            <motion.span
                              layoutId="activeSidePill"
                              className="w-1.5 h-1.5 rounded-full bg-white shadow-sm shadow-white"
                            />
                          ) : null}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Profile & Signout Footer */}
        <div className="p-3.5 lg:p-4 border-t border-white/10 space-y-2.5 bg-slate-950/80 backdrop-blur-md relative z-10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs lg:text-sm font-black uppercase shadow-xs shrink-0">
              {(user?.fullName || user?.email || "U")[0]}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs lg:text-sm font-bold truncate text-white leading-tight">
                {user?.fullName || user?.email}
              </p>
              <p className="text-[10px] lg:text-[11px] text-slate-400 capitalize leading-tight mt-0.5 font-medium">
                {roleTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] lg:text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
              title="Open public website in new tab"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Website</span>
            </a>

            <button
              onClick={handleSignOut}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] lg:text-xs font-bold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
              title="Sign out of operations"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 📱 MODERN MOBILE APP FLOATING DOCK WITH CENTER QUICK FAB */}
      {/* ======================================================== */}
      <nav className="lg:hidden md:hidden fixed bottom-3 left-3 right-3 z-40 bg-slate-950/95 backdrop-blur-2xl border border-white/15 px-2.5 py-1.5 rounded-3xl flex items-center justify-between shadow-[0_16px_48px_rgba(0,0,0,0.6)]">
        {/* 1. Home / Dashboard */}
        <NavLink
          to="/admin/panel"
          end
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer min-w-[50px] relative active:scale-90",
              isActive ? "text-blue-400 font-black" : "text-slate-400 hover:text-white font-semibold"
            )
          }
        >
          {({ isActive }) => (
            <>
              <LayoutDashboard className={`w-4 h-4 mb-0.5 ${isActive ? "text-blue-400 stroke-[2.5]" : ""}`} />
              <span className="text-[10px] leading-tight">Home</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 absolute -bottom-0.5 shadow-sm shadow-blue-400 animate-pulse" />
              )}
            </>
          )}
        </NavLink>

        {/* 2. Active Rentals */}
        <NavLink
          to="/admin/panel/active-rentals"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer min-w-[50px] relative active:scale-90",
              isActive ? "text-emerald-400 font-black" : "text-slate-400 hover:text-white font-semibold"
            )
          }
        >
          {({ isActive }) => (
            <>
              <Activity className={`w-4 h-4 mb-0.5 ${isActive ? "text-emerald-400 stroke-[2.5]" : ""}`} />
              <span className="text-[10px] leading-tight">Rentals</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute -bottom-0.5 shadow-sm shadow-emerald-400 animate-pulse" />
              )}
            </>
          )}
        </NavLink>

        {/* 3. Center Elevated Quick-Action Button (⚡ New Booking) */}
        <NavLink
          to="/admin/panel/booking"
          className={({ isActive }) =>
            cn(
              "relative -top-3 flex items-center justify-center w-12 h-12 rounded-2xl shadow-xl transition-all cursor-pointer active:scale-90 border-2 border-slate-950",
              isActive
                ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-amber-500/40 ring-2 ring-amber-400/50"
                : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-blue-500/40 hover:shadow-blue-500/60"
            )
          }
          title="Create New Booking"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </NavLink>

        {/* 4. Fleet Scheduler */}
        <NavLink
          to="/admin/panel/scheduler"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer min-w-[50px] relative active:scale-90",
              isActive ? "text-blue-400 font-black" : "text-slate-400 hover:text-white font-semibold"
            )
          }
        >
          {({ isActive }) => (
            <>
              <Calendar className={`w-4 h-4 mb-0.5 ${isActive ? "text-blue-400 stroke-[2.5]" : ""}`} />
              <span className="text-[10px] leading-tight">Plan</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 absolute -bottom-0.5 shadow-sm shadow-blue-400 animate-pulse" />
              )}
            </>
          )}
        </NavLink>

        {/* 5. Mobile Full Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all cursor-pointer min-w-[50px] text-slate-400 hover:text-white font-semibold relative active:scale-90"
          aria-label="Open Full App Menu"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-tight">Menu</span>
          {unreadCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-0.5 right-2 ring-2 ring-slate-950 animate-ping" />
          )}
        </button>
      </nav>
    </>
  );
}
