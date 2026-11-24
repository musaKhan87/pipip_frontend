import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Bike,
  Clock,
  User,
  Phone,
  Calendar,
  Search,
  ChevronDown,
  Timer,
  AlertCircle,
  AlertTriangle,
  MessageSquare,
  CheckCircle2,
  X,
  IndianRupee,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowUpDown,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import {
  format,
  formatDistanceToNow,
  differenceInMinutes,
  isAfter,
} from "date-fns";
import { Input } from "../../components/ui/input";
import { useBookings } from "../../hooks/useBooking";
import { useBikes } from "../../hooks/useBikes";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";

export default function ActiveRentals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'ending-soon' | 'overdue' | 'active'
  const [sortBy, setSortBy] = useState("urgency"); // 'urgency' | 'model' | 'time'
  const [expandedBikes, setExpandedBikes] = useState({}); // bikeId -> boolean

  const { data: allBookings, isLoading: bookingsLoading, refetch } = useBookings();
  const { data: bikes, isLoading: bikesLoading } = useBikes();

  // Get all active and confirmed bookings (current and upcoming)
  const activeBookings = useMemo(() => {
    return (
      allBookings?.filter(
        (b) => b.status === "active" || b.status === "confirmed"
      ) || []
    );
  }, [allBookings]);

  // Group bookings by bike
  const bookingsByBike = useMemo(() => {
    return (
      bikes?.reduce((acc, bike) => {
        const bikeBookings = activeBookings
          .filter((b) => {
            const bId = b.bike_id?._id || b.bike_id;
            return String(bId) === String(bike._id);
          })
          .sort(
            (a, b) => new Date(a.start_datetime) - new Date(b.start_datetime)
          );

        if (bikeBookings.length > 0) {
          acc[bike._id] = { bike, bookings: bikeBookings };
        }
        return acc;
      }, {}) || {}
    );
  }, [bikes, activeBookings]);

  const getBookingStatus = (booking) => {
    const now = new Date();
    const end = new Date(booking.end_datetime);

    if (booking.status === "active") {
      const minutesLeft = differenceInMinutes(end, now);
      if (minutesLeft <= 30 && minutesLeft > 0) {
        return {
          status: "ending-soon",
          label: "Ending Soon",
          badgeClass: "bg-amber-500 text-white shadow-xs font-bold",
          dotColor: "bg-amber-400",
          minutesLeft,
        };
      } else if (minutesLeft <= 0) {
        return {
          status: "overdue",
          label: "Overdue Return",
          badgeClass: "bg-rose-600 text-white shadow-xs font-bold animate-pulse",
          dotColor: "bg-rose-500",
          minutesLeft,
        };
      }
      return {
        status: "active",
        label: "On Road",
        badgeClass: "bg-emerald-600 text-white shadow-xs font-bold",
        dotColor: "bg-emerald-400",
        minutesLeft,
      };
    }
    return {
      status: "upcoming",
      label: "Upcoming Dispatch",
      badgeClass: "bg-blue-600 text-white shadow-xs font-bold",
      dotColor: "bg-blue-400",
      minutesLeft: null,
    };
  };

  const getTimeRemaining = (endDatetime) => {
    const end = new Date(endDatetime);
    const now = new Date();

    if (isAfter(now, end)) {
      return `Overdue by ${formatDistanceToNow(end)}`;
    }
    return `${formatDistanceToNow(end, { addSuffix: true })}`;
  };

  // Counts for filter pills
  const counts = useMemo(() => {
    let overdue = 0;
    let endingSoon = 0;
    let active = 0;

    Object.values(bookingsByBike).forEach((data) => {
      data.bookings.forEach((booking) => {
        const info = getBookingStatus(booking);
        if (info.status === "overdue") overdue++;
        if (info.status === "ending-soon") endingSoon++;
        if (info.status === "active") active++;
      });
    });

    return {
      all: Object.keys(bookingsByBike).length,
      overdue,
      endingSoon,
      active,
    };
  }, [bookingsByBike]);

  // Filter & Sort based on search, status filter & sorting option
  const filteredBikes = useMemo(() => {
    const entries = Object.entries(bookingsByBike).filter(([_, data]) => {
      // 1. Search filter
      const query = searchQuery.trim().toLowerCase();
      let matchesSearch = true;
      if (query) {
        matchesSearch =
          data.bike.model.toLowerCase().includes(query) ||
          data.bike.number_plate.toLowerCase().includes(query) ||
          data.bookings.some(
            (b) =>
              b.customer_id?.name?.toLowerCase().includes(query) ||
              b.customers?.name?.toLowerCase().includes(query) ||
              b.customer_id?.phone?.includes(query) ||
              b.customers?.phone?.includes(query)
          );
      }
      if (!matchesSearch) return false;

      // 2. Status filter
      if (activeFilter === "all") return true;

      return data.bookings.some((booking) => {
        const info = getBookingStatus(booking);
        return info.status === activeFilter;
      });
    });

    // 3. Sorting
    return entries.sort((a, b) => {
      const firstA = a[1].bookings[0];
      const firstB = b[1].bookings[0];

      if (sortBy === "urgency") {
        const statusPriority = { overdue: 3, "ending-soon": 2, active: 1, upcoming: 0 };
        const pA = statusPriority[getBookingStatus(firstA).status] || 0;
        const pB = statusPriority[getBookingStatus(firstB).status] || 0;
        if (pA !== pB) return pB - pA;
        return new Date(firstA.end_datetime) - new Date(firstB.end_datetime);
      } else if (sortBy === "time") {
        return new Date(firstA.end_datetime) - new Date(firstB.end_datetime);
      } else if (sortBy === "model") {
        return a[1].bike.model.localeCompare(b[1].bike.model);
      }
      return 0;
    });
  }, [bookingsByBike, searchQuery, activeFilter, sortBy]);

  const toggleBikeExpanded = (bikeId) => {
    setExpandedBikes((prev) => ({
      ...prev,
      [bikeId]: prev[bikeId] === undefined ? false : !prev[bikeId],
    }));
  };

  const isExpanded = (bikeId) => {
    return expandedBikes[bikeId] !== false; // expanded by default
  };

  return (
    <div className="space-y-5 pb-8">
      {/* ======================================================== */}
      {/* 🚀 COMMAND CENTER HEADER (Mobile-First Operations)      */}
      {/* ======================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-7 shadow-xl border border-white/10"
      >
        {/* Glow ambient lights */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-emerald-500/15 rounded-full blur-[70px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE FLEET TELEMETRY
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-slate-200 text-[11px] font-semibold border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                {filteredBikes.length} Active Vehicles
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-display tracking-tight text-white">
              Active Rentals Tracker
            </h1>
            <p className="text-xs sm:text-sm text-slate-300/90 mt-1 max-w-xl">
              Live countdowns, return deadlines, direct customer call actions, and fleet rebooking schedules.
            </p>
          </div>

          {/* Quick Metrics Bar on Header */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-2 rounded-2xl text-center">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                On Road
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-400 font-display">
                {counts.all}
              </span>
            </div>
            {counts.endingSoon > 0 && (
              <div className="bg-amber-500/20 backdrop-blur-md border border-amber-400/30 px-3.5 py-2 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                  Ending Soon
                </span>
                <span className="text-lg sm:text-xl font-black text-amber-300 font-display flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  {counts.endingSoon}
                </span>
              </div>
            )}
            {counts.overdue > 0 && (
              <div className="bg-rose-500/20 backdrop-blur-md border border-rose-400/30 px-3.5 py-2 rounded-2xl text-center">
                <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">
                  Overdue
                </span>
                <span className="text-lg sm:text-xl font-black text-rose-300 font-display flex items-center justify-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                  {counts.overdue}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ======================================================== */}
      {/* 🧭 FILTER TABS & SEARCH BAR (Sticky App Feel)           */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Filter Chips Rail */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-hide py-0.5">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                activeFilter === "all"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md ring-2 ring-slate-900/10"
                  : "bg-card border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <span>All Vehicles</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-white/20 dark:bg-slate-900/20">
                {counts.all}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter("ending-soon")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                activeFilter === "ending-soon"
                  ? "bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400/30"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 hover:bg-amber-100/60"
              }`}
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Ending Soon</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-600/20">
                {counts.endingSoon}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter("overdue")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                activeFilter === "overdue"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/25 ring-2 ring-rose-400/30"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/80 hover:bg-rose-100/60"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Overdue</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600/20">
                {counts.overdue}
              </span>
            </button>

            <button
              onClick={() => setActiveFilter("active")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                activeFilter === "active"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-400/30"
                  : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 hover:bg-emerald-100/60"
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Healthy Active</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600/20">
                {counts.active}
              </span>
            </button>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                placeholder="Search bike, plate, rider..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-8 h-10 rounded-2xl bg-card border-border/80 text-xs sm:text-sm font-medium shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer z-10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Toggle */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 bg-card border border-border/80 rounded-2xl text-xs font-bold text-foreground cursor-pointer shadow-xs focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="urgency">⚡ Sort: Urgency First</option>
              <option value="time">⏱️ Sort: End Time</option>
              <option value="model">🛵 Sort: Model Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 🛵 NATIVE APP VEHICLE CARDS LIST                        */}
      {/* ======================================================== */}
      <div className="space-y-4">
        {bookingsLoading || bikesLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse rounded-3xl border border-border/60">
                <CardContent className="h-36 p-5 bg-muted/20" />
              </Card>
            ))}
          </div>
        ) : filteredBikes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-card border border-dashed border-border/80 rounded-3xl p-8 shadow-xs"
          >
            <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Bike className="w-8 h-8 opacity-80" />
            </div>
            <h3 className="text-base sm:text-lg font-bold font-display text-foreground mb-1">
              {searchQuery || activeFilter !== "all"
                ? "No Matching Active Rentals"
                : "No Vehicles Currently on Road"}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto mb-5">
              {searchQuery || activeFilter !== "all"
                ? "No rentals matched your current search or status filter. Try clearing filters."
                : "All fleet scooters and bikes are currently stationed safely at their designated hubs."}
            </p>
            {(searchQuery || activeFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
                className="rounded-xl text-xs font-bold cursor-pointer"
              >
                Reset All Filters
              </Button>
            )}
          </motion.div>
        ) : (
          filteredBikes.map(([bikeId, data], index) => {
            const expanded = isExpanded(bikeId);
            const firstBooking = data.bookings[0];
            const primaryStatus = getBookingStatus(firstBooking);
            const customerName =
              firstBooking.customer_id?.name ||
              firstBooking.customers?.name ||
              "Rider";
            const customerPhone =
              firstBooking.customer_id?.phone ||
              firstBooking.customers?.phone ||
              "";

            const isUrgent =
              primaryStatus.status === "ending-soon" ||
              primaryStatus.status === "overdue";

            // Duration Progress Calculation
            const start = new Date(firstBooking.start_datetime);
            const end = new Date(firstBooking.end_datetime);
            const now = new Date();
            const totalDurationMin = Math.max(1, differenceInMinutes(end, start));
            const elapsedMin = differenceInMinutes(now, start);
            const progressPct = Math.min(
              100,
              Math.max(0, Math.round((elapsedMin / totalDurationMin) * 100))
            );

            return (
              <motion.div
                key={bikeId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(0.2, index * 0.04), duration: 0.3 }}
              >
                <div
                  className={`relative rounded-3xl bg-card border transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden ${
                    primaryStatus.status === "overdue"
                      ? "border-rose-400/60 dark:border-rose-900/60 ring-2 ring-rose-500/10"
                      : primaryStatus.status === "ending-soon"
                      ? "border-amber-400/60 dark:border-amber-900/60 ring-2 ring-amber-500/10"
                      : "border-border/80 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  {/* Top Ambient Glow Edge for Urgent Vehicles */}
                  {isUrgent && (
                    <div
                      className={`h-1.5 w-full ${
                        primaryStatus.status === "overdue"
                          ? "bg-gradient-to-r from-rose-500 via-rose-600 to-rose-400"
                          : "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-400"
                      }`}
                    />
                  )}

                  {/* ================================================= */}
                  {/* VEHICLE MAIN HEADER BAR                           */}
                  {/* ================================================= */}
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Bike Info & License Plate */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {data.bike.image_url ? (
                          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-border/80 bg-muted/30 shrink-0 shadow-2xs">
                            <img
                              src={data.bike.image_url}
                              alt={data.bike.model}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-primary flex items-center justify-center shrink-0 border border-blue-500/20 shadow-2xs">
                            <Bike className="w-7 h-7" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display font-black text-base sm:text-lg text-foreground truncate">
                              {data.bike.model}
                            </h3>

                            {/* Indian High-Security Plate Badge */}
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              {data.bike.number_plate}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-medium">
                            <span className="text-foreground font-semibold">
                              {customerName}
                            </span>
                            <span>•</span>
                            <span className="tabular-nums">
                              {data.bike.cc ? `${data.bike.cc}cc` : "Two Wheeler"}
                            </span>
                            <span>•</span>
                            <span>
                              {data.bookings.length} {data.bookings.length === 1 ? "Booking" : "Bookings"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Status Pill & Fast Action Controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                        {/* Live Countdown Badge */}
                        <div className="text-left sm:text-right">
                          <Badge className={`${primaryStatus.badgeClass} text-xs px-3 py-1 rounded-full`}>
                            {primaryStatus.label}
                          </Badge>
                          <p
                            className={`text-xs font-bold tabular-nums mt-1 flex items-center gap-1 sm:justify-end ${
                              primaryStatus.status === "overdue"
                                ? "text-rose-600 dark:text-rose-400"
                                : primaryStatus.status === "ending-soon"
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-muted-foreground"
                            }`}
                          >
                            <Timer className="w-3.5 h-3.5 shrink-0" />
                            {getTimeRemaining(firstBooking.end_datetime)}
                          </p>
                        </div>

                        {/* Direct 1-Tap Customer Phone & WhatsApp Action */}
                        {customerPhone && (
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${customerPhone}`}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer min-h-[40px]"
                              title={`Call ${customerName}`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Call</span>
                            </a>
                            <a
                              href={`https://wa.me/91${customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                `Hello ${customerName}, this is Pipip Fleet Operations regarding your rental of ${data.bike.model} (${data.bike.number_plate}).`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center p-2.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 active:scale-95 rounded-xl text-xs transition-all min-h-[40px] min-w-[40px]"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </a>
                          </div>
                        )}

                        {/* Accordion Expand/Collapse */}
                        <button
                          onClick={() => toggleBikeExpanded(bikeId)}
                          className="p-2 rounded-xl bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                          aria-label="Toggle details"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              expanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* ================================================= */}
                    {/* LIVE RENTAL DURATION PROGRESS TRACK               */}
                    {/* ================================================= */}
                    {firstBooking.status === "active" && (
                      <div className="mt-4 pt-3.5 border-t border-border/50">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            <span>Rental Duration Timeline</span>
                          </span>
                          <span className="font-mono font-bold text-foreground">
                            {progressPct}% elapsed
                          </span>
                        </div>

                        {/* Visual Progress Bar with Glow Indicator */}
                        <div className="w-full bg-muted/70 h-2.5 rounded-full overflow-hidden p-0.5 border border-border/40">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className={`h-full rounded-full transition-all ${
                              primaryStatus.status === "overdue"
                                ? "bg-gradient-to-r from-rose-500 to-rose-600 shadow-xs shadow-rose-500/50"
                                : primaryStatus.status === "ending-soon"
                                ? "bg-gradient-to-r from-amber-400 to-amber-500 shadow-xs shadow-amber-500/50"
                                : "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-xs shadow-emerald-500/50"
                            }`}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
                          <span>
                            Start: <strong className="text-foreground">{format(start, "MMM d, h:mm a")}</strong>
                          </span>
                          <span>
                            Return: <strong className="text-foreground">{format(end, "MMM d, h:mm a")}</strong>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Urgent Warning Desk */}
                    {isUrgent && (
                      <div
                        className={`mt-3.5 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold ${
                          primaryStatus.status === "overdue"
                            ? "bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <AlertTriangle className="w-4 h-4 shrink-0 text-current" />
                          <span className="truncate">
                            {primaryStatus.status === "overdue"
                              ? "Overdue Return: Vehicle is past scheduled return time!"
                              : "Ending Soon: Return inspection bay required within 30 mins."}
                          </span>
                        </div>
                        {customerPhone && (
                          <a
                            href={`tel:${customerPhone}`}
                            className="px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg text-[11px] font-black shrink-0 shadow-2xs hover:scale-105 active:scale-95 transition-all"
                          >
                            Call Rider
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* ================================================= */}
                  {/* EXPANDABLE ACCORDION: BOOKINGS BREAKDOWN          */}
                  {/* ================================================= */}
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-border/60 bg-muted/15"
                      >
                        <div className="p-4 sm:p-5 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                              Assigned Bookings Schedule ({data.bookings.length})
                            </h4>
                            <span className="text-[11px] text-muted-foreground">
                              Hub Rebooking Ready:{" "}
                              <strong className="text-foreground font-semibold">
                                {format(
                                  new Date(
                                    data.bookings[data.bookings.length - 1].end_datetime
                                  ),
                                  "MMM d, h:mm a"
                                )}
                              </strong>
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {data.bookings.map((booking, bIdx) => {
                              const bStatus = getBookingStatus(booking);
                              const bCustName =
                                booking.customer_id?.name ||
                                booking.customers?.name ||
                                "Customer";
                              const bCustPhone =
                                booking.customer_id?.phone ||
                                booking.customers?.phone ||
                                "";
                              const bStart = new Date(booking.start_datetime);
                              const bEnd = new Date(booking.end_datetime);

                              return (
                                <div
                                  key={booking._id || bIdx}
                                  className="p-4 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center text-xs font-black shrink-0">
                                        {bCustName[0]?.toUpperCase() || "R"}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="font-bold text-xs sm:text-sm text-foreground truncate">
                                          {bCustName}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground">
                                          {bCustPhone || "No contact"}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge className={`${bStatus.badgeClass} text-[10px] px-2 py-0.5 rounded-full`}>
                                      {bStatus.label}
                                    </Badge>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/40">
                                    <div>
                                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                                        Schedule
                                      </span>
                                      <span className="font-semibold text-foreground text-[11px]">
                                        {format(bStart, "MMM d, h:mm a")} – {format(bEnd, "h:mm a")}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                                        Tariff
                                      </span>
                                      <span className="font-bold text-foreground text-xs sm:text-sm flex items-center justify-end gap-0.5">
                                        <IndianRupee className="w-3 h-3 text-muted-foreground" />
                                        {(booking.total_amount || 0).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Quick WhatsApp Reminder Action */}
                                  {bCustPhone && (
                                    <div className="flex items-center gap-2 pt-1">
                                      <a
                                        href={`tel:${bCustPhone}`}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-bold transition-all"
                                      >
                                        <Phone className="w-3 h-3 text-emerald-600" />
                                        <span>Call</span>
                                      </a>
                                      <a
                                        href={`https://wa.me/91${bCustPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                                          `Hi ${bCustName}, reminder from Pipip regarding your ride on ${data.bike.model}. Your drop-off is scheduled for ${format(bEnd, "h:mm a")}. Let us know if you need to extend!`
                                        )}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition-all border border-emerald-500/20"
                                      >
                                        <MessageSquare className="w-3 h-3" />
                                        <span>Send WhatsApp</span>
                                      </a>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
