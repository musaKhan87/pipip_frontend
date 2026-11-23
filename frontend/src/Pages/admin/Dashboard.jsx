import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  useBookingStats,
  useDailyRevenueReport,
  useIdleBikesReport,
  useActiveBookingsEndingSoon,
} from "../../hooks/useReports";
import { useBookings } from "../../hooks/useBooking";
import { useBikes } from "../../hooks/useBikes";
import {
  Bike,
  Calendar,
  IndianRupee,
  Clock,
  AlertTriangle,
  TrendingUp,
  Bell,
  Timer,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Search,
  Activity,
  Plus,
  ArrowUpRight,
  Boxes,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Layers,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useAuth } from "../../lib/AuthProvider";

const statusColors = {
  pending: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40",
  active: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40",
  completed: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [selectedFleet, setSelectedFleet] = useState(null);
  const [fleetSearch, setFleetSearch] = useState("");
  const [revenueDays, setRevenueDays] = useState(14);

  const isStaff = role === "staff";

  // Data fetching
  const { data: stats, isLoading: statsLoading } = useBookingStats("month", null, null, { enabled: !isStaff });
  const { data: todayStats } = useBookingStats("today", null, null, { enabled: !isStaff });
  const { data: recentBookings } = useBookings("all", { enabled: !isStaff });
  const { data: bikes } = useBikes({}, { enabled: !isStaff });
  const { data: idleBikes } = useIdleBikesReport({ enabled: !isStaff });
  const { data: dailyRevenue } = useDailyRevenueReport(revenueDays, { enabled: !isStaff });
  const { data: expiringBookings } = useActiveBookingsEndingSoon();

  // Special Staff Dashboard View: Only show "Bookings Ending Soon" for staff's assigned area
  if (isStaff) {
    const staffAreaName = user?.areaId?.name || user?.assigned_areas?.[0]?.name;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground font-display">
                Staff Operations Desk
              </h1>
              {staffAreaName && (
                <Badge variant="outline" className="text-xs font-semibold border-slate-300 dark:border-slate-700">
                  📍 {staffAreaName}
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 font-normal">
              Real-time vehicle status and active returns for {staffAreaName || "assigned area"}.
            </p>
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        {/* Bookings Ending Soon Card for Staff */}
        <Card className="bg-card border border-border/80 rounded-3xl shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
            <CardTitle className="flex items-center justify-between text-sm sm:text-base font-bold text-foreground font-display">
              <span className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>
                <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Bookings Ending Soon {staffAreaName ? `(${staffAreaName})` : ""}
              </span>
              <Badge className="bg-amber-500 text-white font-bold text-xs rounded-full px-2.5">
                {expiringBookings?.length || 0}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {expiringBookings && expiringBookings.length > 0 ? (
              <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                {expiringBookings.map((booking) => {
                  const hours = Math.floor(booking.minutesRemaining / 60);
                  const mins = booking.minutesRemaining % 60;
                  const timeDisplay =
                    hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

                  const isUrgent = booking.minutesRemaining <= 30;

                  return (
                    <motion.div
                      key={booking._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        isUrgent
                          ? "bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 shadow-xs"
                          : "bg-card border-border/70 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <div
                          className={`p-2.5 rounded-xl shrink-0 ${
                            isUrgent
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          <Timer className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-foreground truncate font-display">
                            {booking.bike_id?.model} —{" "}
                            <span className="font-mono text-xs font-semibold text-muted-foreground">
                              {booking.bike_id?.number_plate}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            Customer: <span className="font-semibold text-foreground">{booking.customer_id?.name || "N/A"}</span>
                          </p>
                          {(booking.areaName || booking.bike_id?.area_id?.name || booking.cluster_id?.area_id?.name) && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-primary shrink-0" />
                              <span className="truncate">{booking.areaName || booking.bike_id?.area_id?.name || booking.cluster_id?.area_id?.name}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                        <div className="text-left sm:text-right">
                          <p
                            className={`text-sm font-black tabular-nums ${
                              isUrgent
                                ? "text-rose-600 dark:text-rose-400"
                                : "text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {timeDisplay} left
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Ends: {format(new Date(booking.end_datetime), "h:mm a")}
                          </p>
                        </div>
                        {booking.customer_id?.phone && (
                          <a
                            href={`tel:${booking.customer_id.phone}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm text-xs font-bold cursor-pointer shrink-0 active:scale-95"
                            title={`Call ${booking.customer_id?.name}`}
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3 opacity-80" />
                <p className="text-base font-bold text-foreground font-display">
                  All Clear
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  All active rentals in {staffAreaName || "your area"} are running smoothly on schedule.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Active rentals
  const activeRentals = (recentBookings || []).filter(
    (booking) => booking.status === "active"
  );

  // Rented bike IDs
  const rentedBikeIds = new Set(
    activeRentals
      .map((booking) => booking.bike_id?._id || booking.bike_id)
      .filter(Boolean)
      .flatMap((id) => [String(id), id])
  );

  // Maintenance bikes
  const maintenanceBikeList = (bikes || []).filter(
    (bike) => bike.status === "maintenance"
  );

  // Available bikes
  const availableBikeList = (bikes || []).filter(
    (bike) =>
      !rentedBikeIds.has(String(bike._id)) &&
      !rentedBikeIds.has(bike._id) &&
      bike.status !== "maintenance"
  );

  // Booked bikes from fleet
  const bookedBikeListInFleet = (bikes || []).filter(
    (bike) =>
      (rentedBikeIds.has(String(bike._id)) || rentedBikeIds.has(bike._id)) &&
      bike.status !== "maintenance"
  );

  const bookedBikeList = activeRentals.filter((booking) => {
    const bId = booking.bike_id?._id || booking.bike_id;
    return (
      bId &&
      (bikes || []).some(
        (b) =>
          (String(b._id) === String(bId) || b._id === bId) &&
          b.status !== "maintenance"
      )
    );
  });

  const availableBikes = availableBikeList.length;
  const bookedBikes = bookedBikeListInFleet.length;
  const maintenanceBikes = maintenanceBikeList.length;
  const totalFleetCount = (bikes || []).length;

  const availablePct = totalFleetCount > 0 ? (availableBikes / totalFleetCount) * 100 : 0;
  const bookedPct = totalFleetCount > 0 ? (bookedBikes / totalFleetCount) * 100 : 0;
  const maintenancePct = totalFleetCount > 0 ? (maintenanceBikes / totalFleetCount) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* ========================================================= */}
      {/* 🚀 MODERN COMMAND CENTER HERO HEADER                       */}
      {/* ========================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-7 shadow-xl border border-white/10"
      >
        {/* Dynamic Glow Aurora Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE FLEET SYNC
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold border border-blue-400/20">
                <ShieldCheck className="w-3 h-3 text-blue-400" />
                {role === "super_admin" ? "Super Admin Operations" : "Fleet Operations"}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-display tracking-tight text-white">
              Welcome back, {user?.fullName || "Operator"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-normal leading-relaxed">
              Managing <strong className="text-white font-bold">{totalFleetCount} vehicles</strong> across active Mumbai hubs with real-time slot telemetry.
            </p>
          </div>

          {/* Quick Launch Buttons (Desktop Toolbar) */}
          <div className="hidden sm:flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              size="sm"
              onClick={() => navigate("/admin/panel/bookings")}
              className="h-10 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              <span>New Booking</span>
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/admin/panel/active-rentals")}
              className="h-10 px-4 rounded-xl text-xs font-black bg-white/10 hover:bg-white/20 text-white border border-white/15 active:scale-95 transition-all cursor-pointer"
            >
              <Activity className="w-4 h-4 mr-1.5 text-emerald-400" />
              <span>Active Rentals</span>
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/admin/panel/scheduler")}
              className="h-10 px-4 rounded-xl text-xs font-black bg-white/10 hover:bg-white/20 text-white border border-white/15 active:scale-95 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4 mr-1.5 text-blue-400" />
              <span>Scheduler</span>
            </Button>
          </div>
        </div>

        {/* Mobile Quick Native Action App Grid (visible only on mobile) */}
        <div className="sm:hidden grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/10">
          <button
            onClick={() => navigate("/admin/panel/bookings")}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-blue-600 text-white active:scale-90 transition-transform shadow-md shadow-blue-600/20"
          >
            <Plus className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-black">Book</span>
          </button>
          <button
            onClick={() => navigate("/admin/panel/active-rentals")}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/10 text-white active:scale-90 transition-transform border border-white/15"
          >
            <Activity className="w-5 h-5 mb-1 text-emerald-400" />
            <span className="text-[10px] font-bold">Active</span>
          </button>
          <button
            onClick={() => navigate("/admin/panel/scheduler")}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/10 text-white active:scale-90 transition-transform border border-white/15"
          >
            <Calendar className="w-5 h-5 mb-1 text-blue-400" />
            <span className="text-[10px] font-bold">Plan</span>
          </button>
          <button
            onClick={() => navigate("/admin/panel/bikes")}
            className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white/10 text-white active:scale-90 transition-transform border border-white/15"
          >
            <Bike className="w-5 h-5 mb-1 text-amber-400" />
            <span className="text-[10px] font-bold">Fleet</span>
          </button>
        </div>
      </motion.div>

      {/* ========================================================= */}
      {/* ⚠️ EXPIRING BOOKINGS URGENT RADAR DESK                    */}
      {/* ========================================================= */}
      <AnimatePresence>
        {expiringBookings && expiringBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="overflow-hidden"
          >
            <Card className="bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-orange-500/10 dark:from-amber-950/40 dark:to-orange-950/20 border-amber-300 dark:border-amber-800 rounded-3xl shadow-md overflow-hidden">
              <CardHeader className="pb-3 border-b border-amber-200/80 dark:border-amber-900/60 bg-amber-100/40 dark:bg-amber-900/30">
                <CardTitle className="flex items-center justify-between text-sm sm:text-base font-black text-slate-900 dark:text-amber-200 font-display">
                  <span className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-600" />
                    </span>
                    <Bell className="w-4 h-4 text-amber-600" />
                    <span>Urgent: Bookings Ending Soon</span>
                  </span>
                  <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-full px-2.5 shadow-xs">
                    {expiringBookings.length} Active Returns
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3.5">
                <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                  {expiringBookings.map((booking) => {
                    const hours = Math.floor(booking.minutesRemaining / 60);
                    const mins = booking.minutesRemaining % 60;
                    const timeDisplay =
                      hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

                    const isUrgent = booking.minutesRemaining <= 30;

                    return (
                      <div
                        key={booking._id}
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          isUrgent
                            ? "bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/60 shadow-xs"
                            : "bg-white/80 dark:bg-slate-900/80 border-amber-200/80 dark:border-amber-900/40 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3 min-w-0">
                          <div
                            className={`p-2.5 rounded-xl shrink-0 ${
                              isUrgent
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                            }`}
                          >
                            <Timer className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-sm text-foreground truncate font-display">
                              {booking.bike_id?.model} —{" "}
                              <span className="font-mono text-xs font-bold text-muted-foreground">
                                {booking.bike_id?.number_plate}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              Customer: <span className="font-bold text-foreground">{booking.customer_id?.name || "N/A"}</span>
                            </p>
                            {(booking.areaName || booking.bike_id?.area_id?.name || booking.cluster_id?.area_id?.name) && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                                <span className="truncate">{booking.areaName || booking.bike_id?.area_id?.name || booking.cluster_id?.area_id?.name}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2.5 sm:mt-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-border/50">
                          <div className="text-left sm:text-right">
                            <p
                              className={`text-sm font-black tabular-nums ${
                                isUrgent
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {timeDisplay} left
                            </p>
                            <p className="text-[11px] text-muted-foreground font-medium">
                              Ends: {format(new Date(booking.end_datetime), "h:mm a")}
                            </p>
                          </div>
                          {booking.customer_id?.phone && (
                            <a
                              href={`tel:${booking.customer_id?.phone}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-sm text-xs font-bold cursor-pointer shrink-0 active:scale-95"
                              title={`Call ${booking.customer_id?.name}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* 📊 MAIN KPI EXECUTIVE METRICS CARDS                       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {[
          {
            title: "Total Bookings",
            subtitle: "This Month",
            val: stats?.total_bookings,
            trend: "+12% vs last month",
            icon: Calendar,
            gradient: "from-blue-600 to-indigo-600",
            bgGlow: "bg-blue-500/10",
            borderAccent: "border-blue-500/30",
          },
          {
            title: "Gross Revenue",
            subtitle: "This Month",
            val: `₹${(stats?.total_revenue || 0).toLocaleString()}`,
            trend: "98% collection rate",
            icon: IndianRupee,
            gradient: "from-emerald-600 to-teal-600",
            bgGlow: "bg-emerald-500/10",
            borderAccent: "border-emerald-500/30",
            hideForStaff: true,
          },
          {
            title: "Active On Road",
            subtitle: "Live Telemetry",
            val: stats?.active_bookings,
            trend: "Currently dispatched",
            icon: TrendingUp,
            gradient: "from-violet-600 to-purple-600",
            bgGlow: "bg-violet-500/10",
            borderAccent: "border-violet-500/30",
          },
          {
            title: "Pending Confirm",
            subtitle: "Action Required",
            val: stats?.pending_bookings,
            trend: stats?.pending_bookings > 0 ? "Requires review" : "All cleared",
            icon: Clock,
            gradient: "from-amber-500 to-orange-500",
            bgGlow: "bg-amber-500/10",
            borderAccent: "border-amber-500/30",
          },
        ]
          .filter((item) => !(role === "staff" && item.hideForStaff))
          .map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <Card className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl hover:shadow-xl hover:border-blue-400 transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]">
                {/* Top Subtle Gradient Stripe */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${item.gradient}`} />

                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                        {item.title}
                      </p>
                      <p className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground tabular-nums tracking-tight font-display mt-1">
                        {item.val || 0}
                      </p>
                      <div className="text-[10px] sm:text-[11px] font-bold text-muted-foreground mt-1.5 flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{item.trend}</span>
                      </div>
                    </div>

                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shrink-0 shadow-md`}>
                      <item.icon className="w-5 h-5 stroke-[2.2]" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
      </div>

      {/* ========================================================= */}
      {/* 🛵 FLEET CAPACITY & REVENUE TREND SECTION                  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Fleet Real-Time Status Card with Segmented Progress Bar */}
        <Card className={`bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] ${role === "staff" ? "lg:col-span-3" : ""}`}>
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm sm:text-base font-bold font-display flex items-center gap-2 text-foreground">
                <Bike className="w-4 h-4 text-primary" />
                Fleet Live Status
              </CardTitle>
              <span className="text-xs font-black text-muted-foreground">
                {totalFleetCount} Vehicles Total
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            
            {/* Visual Segmented Capacity Bar */}
            <div className="mb-5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="font-bold text-foreground">Fleet Allocation</span>
                <span className="text-blue-600 dark:text-blue-400 font-mono font-black">{Math.round(bookedPct)}% on road</span>
              </div>
              <div className="w-full bg-slate-200/80 dark:bg-slate-700 h-3 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                <div
                  style={{ width: `${availablePct}%` }}
                  className="bg-emerald-500 h-full rounded-l-full transition-all duration-500 shadow-2xs"
                  title={`Available: ${availableBikes}`}
                />
                <div
                  style={{ width: `${bookedPct}%` }}
                  className="bg-blue-600 h-full transition-all duration-500 shadow-2xs"
                  title={`On Rent: ${bookedBikes}`}
                />
                <div
                  style={{ width: `${maintenancePct}%` }}
                  className="bg-amber-500 h-full rounded-r-full transition-all duration-500 shadow-2xs"
                  title={`Maintenance: ${maintenanceBikes}`}
                />
              </div>
            </div>

            {/* Interactive Fleet Status Mini-Cards */}
            <div className="space-y-2.5">
              {[
                {
                  label: "Available",
                  count: availableBikes,
                  color: "bg-emerald-500",
                  bg: "bg-emerald-50/70 hover:bg-emerald-50 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-900/40",
                  text: "text-emerald-700 dark:text-emerald-400",
                  sub: "Ready for immediate walk-in",
                },
                {
                  label: "On Rent",
                  count: bookedBikes,
                  color: "bg-blue-500",
                  bg: "bg-blue-50/70 hover:bg-blue-50 dark:bg-blue-950/25 border-blue-200 dark:border-blue-900/40",
                  text: "text-blue-700 dark:text-blue-400",
                  sub: "With customers on street",
                },
                {
                  label: "Maintenance",
                  count: maintenanceBikes,
                  color: "bg-amber-500",
                  bg: "bg-amber-50/70 hover:bg-amber-50 dark:bg-amber-950/25 border-amber-200 dark:border-amber-900/40",
                  text: "text-amber-700 dark:text-amber-400",
                  sub: "Under service or inspection",
                },
              ].map((status, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedFleet(status.label)}
                  className={`flex items-center justify-between p-3.5 border rounded-2xl cursor-pointer hover:shadow-xs transition-all active:scale-[0.99] ${status.bg}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3.5 h-3.5 rounded-full ${status.color} shadow-xs animate-pulse`} />
                    <div>
                      <span className="text-sm font-bold text-foreground font-display">{status.label}</span>
                      <p className="text-[11px] text-muted-foreground">{status.sub}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-black tabular-nums text-xl font-display ${status.text}`}>
                      {status.count}
                    </span>
                    <p className="text-[10px] text-muted-foreground font-semibold flex items-center justify-end gap-0.5">
                      <span>Inspect</span>
                      <ChevronRight className="w-3 h-3" />
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {idleBikes?.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-300 dark:border-amber-900/50 flex items-center gap-2 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span className="text-xs font-semibold">
                  {idleBikes.length} bike(s) idle for 30+ days. Consider running fleet promotions.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Trend Area Chart with Range Toggles */}
        {role !== "staff" && (
          <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] overflow-hidden">
            <CardHeader className="pb-2 border-b border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm sm:text-base font-bold font-display text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Revenue Analytics
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Daily collection trend across active and completed bookings</p>
                </div>

                {/* Range Toggle Buttons */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-border/60 self-start sm:self-auto">
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => setRevenueDays(d)}
                      className={`px-3 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                        revenueDays === d
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {d} Days
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={dailyRevenue || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="2 2"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => format(new Date(val), "MMM d")}
                    fontSize={11}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    fontSize={11}
                    stroke="hsl(var(--muted-foreground))"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Revenue"]}
                    labelFormatter={(label) =>
                      format(new Date(label), "MMMM d, yyyy")
                    }
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "16px",
                      boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563EB"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ========================================================= */}
      {/* 📅 ACTIVITY OVERVIEW & RECENT BOOKINGS FEED               */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Activity Card */}
        <Card className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm sm:text-base font-bold font-display text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Today's Quick Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3.5">
              {[
                {
                  label: "New Bookings Today",
                  val: todayStats?.total_bookings,
                  color: "text-foreground",
                  icon: Plus,
                  bg: "bg-blue-50 text-blue-600",
                },
                {
                  label: "Completed Returns",
                  val: todayStats?.completed_bookings,
                  color: "text-emerald-600 dark:text-emerald-400",
                  icon: CheckCircle2,
                  bg: "bg-emerald-50 text-emerald-600",
                },
                {
                  label: "Pending Confirmations",
                  val: todayStats?.pending_bookings,
                  color: "text-amber-600 dark:text-amber-400",
                  icon: Clock,
                  bg: "bg-amber-50 text-amber-600",
                },
                {
                  label: "Today's Collection",
                  val: `₹${(todayStats?.total_revenue || 0).toLocaleString()}`,
                  color: "text-blue-600 dark:text-blue-400",
                  icon: IndianRupee,
                  bg: "bg-indigo-50 text-indigo-600",
                  hideForStaff: true,
                },
              ]
                .filter((item) => !(role === "staff" && item.hideForStaff))
                .map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl ${activity.bg} flex items-center justify-center shrink-0`}>
                        <activity.icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs text-muted-foreground font-semibold">
                        {activity.label}
                      </span>
                    </div>
                    <span className={`text-sm sm:text-base font-black tabular-nums font-display ${activity.color}`}>
                      {activity.val || 0}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings Live Stream */}
        <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)]">
          <CardHeader className="pb-3 border-b border-border/60 flex flex-row items-center justify-between">
            <CardTitle className="text-sm sm:text-base font-bold font-display text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Recent Bookings Feed
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/panel/bookings")}
              className="text-xs text-blue-600 font-bold hover:underline p-0 h-auto cursor-pointer"
            >
              View Full List →
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {recentBookings?.slice(0, 5).map((booking) => (
                <div
                  key={booking._id}
                  onClick={() => navigate("/admin/panel/bookings")}
                  className="flex items-center justify-between p-3.5 bg-slate-50/70 hover:bg-slate-100/90 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 transition-all rounded-2xl border border-slate-200/60 dark:border-slate-700 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-black uppercase shrink-0 shadow-xs">
                      {(booking.customer_id?.name || "W")[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-foreground truncate font-display">
                        {booking.customer_id?.name || "Walk-in Customer"}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {booking.bike_id?.model} {booking.bike_id?.number_plate ? `(${booking.bike_id.number_plate})` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge
                      className={`${statusColors[booking.status] || "bg-slate-100 text-slate-700"} text-[10px] font-bold capitalize rounded-lg px-2 py-0.5`}
                    >
                      {booking.status}
                    </Badge>
                    <p className="text-[11px] text-muted-foreground mt-1 tabular-nums font-medium">
                      {booking.start_datetime
                        ? format(
                          new Date(booking.start_datetime),
                          "MMM d, h:mm a",
                        )
                        : "N/A"}
                    </p>
                  </div>
                </div>
              ))}
              {(!recentBookings || recentBookings.length === 0) && (
                <div className="flex flex-col items-center justify-center py-10 opacity-60">
                  <Calendar className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">No bookings recorded yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Inspect Modal Dialog */}
      <Dialog
        open={!!selectedFleet}
        onOpenChange={() => {
          setSelectedFleet(null);
          setFleetSearch("");
        }}
      >
        <DialogContent className="max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-3xl">
          <DialogHeader className="p-5 border-b border-border bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-black font-display flex items-center gap-2">
                <Bike className="w-5 h-5 text-primary" />
                {selectedFleet} Fleet List
              </DialogTitle>
              <Badge variant="outline" className="text-xs font-bold">
                {selectedFleet === "Available"
                  ? availableBikes
                  : selectedFleet === "On Rent"
                  ? bookedBikes
                  : maintenanceBikes}{" "}
                Vehicles
              </Badge>
            </div>
          </DialogHeader>

          <div className="p-4 border-b border-border/60 bg-card">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bike model, number plate, or customer..."
                value={fleetSearch}
                onChange={(e) => setFleetSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
              />
            </div>
          </div>

          <div className="p-4 space-y-2.5 overflow-y-auto max-h-[50vh]">
            {selectedFleet === "Available" &&
              availableBikeList
                .filter(
                  (bike) =>
                    bike.model?.toLowerCase().includes(fleetSearch.toLowerCase()) ||
                    bike.number_plate?.toLowerCase().includes(fleetSearch.toLowerCase())
                )
                .map((bike) => (
                  <div
                    key={bike._id}
                    className="p-3.5 border border-border/80 rounded-2xl bg-card hover:bg-muted/40 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Bike className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground font-display">{bike.model}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {bike.number_plate} {bike.bike_colour ? `· ${bike.bike_colour}` : ""}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-bold">
                      Available
                    </Badge>
                  </div>
                ))}

            {selectedFleet === "On Rent" &&
              bookedBikeList
                .filter(
                  (booking) =>
                    booking.bike_id?.model?.toLowerCase().includes(fleetSearch.toLowerCase()) ||
                    booking.bike_id?.number_plate?.toLowerCase().includes(fleetSearch.toLowerCase()) ||
                    booking.customer_id?.name?.toLowerCase().includes(fleetSearch.toLowerCase())
                )
                .map((booking) => (
                  <div
                    key={booking._id}
                    className="p-3.5 border border-border/80 rounded-2xl bg-card hover:bg-muted/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Bike className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground font-display">{booking.bike_id?.model}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Customer: <span className="font-bold text-foreground">{booking.customer_id?.name || "N/A"}</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {booking.bike_id?.number_plate}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex items-center sm:flex-col justify-between">
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold">
                        Return {format(new Date(booking.end_datetime), "MMM d, h:mm a")}
                      </Badge>
                      {booking.customer_id?.phone && (
                        <a
                          href={`tel:${booking.customer_id.phone}`}
                          className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-1"
                        >
                          <Phone className="w-3 h-3" /> Call
                        </a>
                      )}
                    </div>
                  </div>
                ))}

            {selectedFleet === "Maintenance" &&
              maintenanceBikeList
                .filter(
                  (bike) =>
                    bike.model?.toLowerCase().includes(fleetSearch.toLowerCase()) ||
                    bike.number_plate?.toLowerCase().includes(fleetSearch.toLowerCase())
                )
                .map((bike) => (
                  <div
                    key={bike._id}
                    className="p-3.5 border border-border/80 rounded-2xl bg-card hover:bg-muted/40 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground font-display">{bike.model}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          {bike.number_plate}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs font-bold">
                      Maintenance
                    </Badge>
                  </div>
                ))}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
