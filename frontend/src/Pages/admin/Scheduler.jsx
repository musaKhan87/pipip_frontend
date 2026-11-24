import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useBookings } from "../../hooks/useBooking";
import { useBikes } from "../../hooks/useBikes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Badge } from "../../components/ui/badge";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isToday,
  parseISO,
  isSameDay,
} from "date-fns";
import {
  Bike,
  Calendar,
  Phone,
  Clock,
  IndianRupee,
  CheckCircle2,
  Wrench,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  List,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  X,
  Timer,
  ChevronDown,
} from "lucide-react";
import { cn } from "../../lib/util";

const statusColors = {
  pending: "#F59E0B",
  confirmed: "#2563EB",
  active: "#10B981",
  completed: "#64748B",
  cancelled: "#EF4444",
};

const statusBadgeClasses = {
  pending: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300/40",
  confirmed: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-300/40",
  active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300/40 font-bold",
  completed: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
  cancelled: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-300/40",
};

export default function Scheduler() {
  const { data: bookings, isLoading: bookingsLoading } = useBookings();
  const { data: bikes, isLoading: bikesLoading } = useBikes();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // 'month' | 'agenda'

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Day of week for padding (0 = Sunday)
  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array(startDayOfWeek).fill(null);

  // Map bookings to days (includes active, confirmed, pending, completed; excludes cancelled)
  const bookingsByDay = useMemo(() => {
    if (!bookings) return new Map();

    const map = new Map();

    bookings
      .filter((b) => b.status !== "cancelled")
      .forEach((booking) => {
        try {
          const start = parseISO(booking.start_datetime);
          const end = parseISO(booking.end_datetime);

          // Handle single-day or valid intervals safely
          const validEnd = end >= start ? end : start;
          const days = eachDayOfInterval({ start, end: validEnd });
          days.forEach((day) => {
            const key = format(day, "yyyy-MM-dd");
            const existing = map.get(key) || [];
            if (!existing.find((b) => b._id === booking._id)) {
              existing.push({
                _id: booking._id,
                status: booking.status,
                bike_model: booking.bike_id?.model || booking.bikes?.model || "Two Wheeler",
                customer_name:
                  booking.customer_id?.name || booking.customers?.name || "Rider",
                customer_phone:
                  booking.customer_id?.phone || booking.customers?.phone || "",
                bike_plate:
                  booking.bike_id?.number_plate || booking.bikes?.number_plate || "",
                start: booking.start_datetime,
                end: booking.end_datetime,
                amount: booking.total_amount || 0,
                source: booking.booking_source || "Online",
              });
            }
            map.set(key, existing);
          });
        } catch (e) {
          // ignore date parse issues for corrupted dates
        }
      });

    return map;
  }, [bookings]);

  // Clean Fleet status logic
  const fleetStatus = useMemo(() => {
    if (!bikes || !bookings) {
      return { available: 0, booked: 0, maintenance: 0 };
    }

    const activeRentals = (bookings || []).filter(
      (booking) => booking.status === "active"
    );

    const rentedBikeIds = new Set(
      activeRentals
        .map((booking) => booking.bike_id?._id || booking.bike_id)
        .filter(Boolean)
        .flatMap((id) => [String(id), id])
    );

    const maintenance = bikes.filter((bike) => bike.status === "maintenance").length;
    const booked = bikes.filter(
      (bike) =>
        (rentedBikeIds.has(String(bike._id)) || rentedBikeIds.has(bike._id)) &&
        bike.status !== "maintenance"
    ).length;
    const available = Math.max(0, bikes.length - booked - maintenance);

    return { available, booked, maintenance };
  }, [bikes, bookings]);

  const handleDayClick = (day) => {
    setSelectedDay(day);
  };

  const handleBookingClick = (booking) => {
    setSelectedEvent({
      id: booking._id,
      customer_name: booking.customer_name,
      customer_phone: booking.customer_phone,
      bike_model: booking.bike_model,
      bike_plate: booking.bike_plate,
      start: parseISO(booking.start),
      end: parseISO(booking.end),
      status: booking.status,
      amount: booking.amount,
      source: booking.source,
    });
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Selected Day Bookings for the inline drawer
  const selectedDayKey = selectedDay ? format(selectedDay, "yyyy-MM-dd") : null;
  const currentDayBookings = selectedDayKey ? bookingsByDay.get(selectedDayKey) || [] : [];

  // Days that have bookings for agenda view
  const daysWithBookings = useMemo(() => {
    return daysInMonth
      .map((day) => {
        const key = format(day, "yyyy-MM-dd");
        const list = bookingsByDay.get(key) || [];
        return { day, bookings: list };
      })
      .filter((item) => item.bookings.length > 0);
  }, [daysInMonth, bookingsByDay]);

  return (
    <div className="space-y-5 pb-8">
      {/* ======================================================== */}
      {/* 🚀 COMMAND CENTER HEADER (Mobile-First Scheduling)      */}
      {/* ======================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-5 sm:p-7 shadow-xl border border-white/10"
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-amber-500/15 rounded-full blur-[70px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-black border border-blue-500/30">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                DISPATCH SCHEDULER
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-slate-200 text-[11px] font-semibold border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {format(currentMonth, "MMMM yyyy")}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-display tracking-tight text-white">
              Fleet Booking Timeline
            </h1>
            <p className="text-xs sm:text-sm text-slate-300/90 mt-1 max-w-xl">
              Real-time fleet availability matrix, customer dispatch agenda, and pickup schedules.
            </p>
          </div>

          {/* View Mode Switcher Pill */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/15">
            <button
              onClick={() => setViewMode("month")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "month"
                  ? "bg-white text-slate-950 shadow-md font-black"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setViewMode("agenda")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === "agenda"
                  ? "bg-white text-slate-950 shadow-md font-black"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <List className="w-4 h-4" />
              <span>Agenda</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ======================================================== */}
      {/* 📊 KPI FLEET METRICS BAR                                 */}
      {/* ======================================================== */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-3xl bg-card border border-border/80 p-4 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Available
              </p>
              <p className="text-xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-display tabular-nums mt-0.5">
                {fleetStatus.available}
              </p>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">Hub Ready</span>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-3xl bg-card border border-border/80 p-4 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                On Rent
              </p>
              <p className="text-xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 font-display tabular-nums mt-0.5">
                {fleetStatus.booked}
              </p>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">Active Rides</span>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <Bike className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="rounded-3xl bg-card border border-border/80 p-4 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Service Bay
              </p>
              <p className="text-xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-display tabular-nums mt-0.5">
                {fleetStatus.maintenance}
              </p>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">Inspection</span>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
              <Wrench className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ======================================================== */}
      {/* 📅 CALENDAR MATRIX OR AGENDA VIEW                        */}
      {/* ======================================================== */}
      {viewMode === "month" ? (
        <div className="space-y-4">
          <Card className="bg-card border border-border/80 rounded-3xl shadow-sm overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              {/* Month Navigation Bar */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="h-9 w-9 rounded-xl cursor-pointer hover:bg-muted"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="h-9 w-9 rounded-xl cursor-pointer hover:bg-muted"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const now = new Date();
                      setCurrentMonth(now);
                      setSelectedDay(now);
                    }}
                    className="h-9 px-3 text-xs font-bold text-primary hover:bg-primary/10 rounded-xl cursor-pointer"
                  >
                    Today
                  </Button>
                </div>

                <h2 className="text-base sm:text-xl font-black font-display text-foreground">
                  {format(currentMonth, "MMMM yyyy")}
                </h2>

                <div className="hidden sm:flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Active
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Confirmed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pending
                  </span>
                </div>
              </div>

              {/* Weekday Names */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[11px] sm:text-xs font-black text-muted-foreground uppercase tracking-wider py-2 border-b border-border/50">
                {weekDays.map((day) => (
                  <div key={day} className="py-0.5">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day[0]}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Days Matrix */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {paddingDays.map((_, index) => (
                  <div
                    key={`pad-${index}`}
                    className="min-h-[50px] sm:min-h-[82px] rounded-xl sm:rounded-2xl bg-muted/10 opacity-30"
                  />
                ))}

                {daysInMonth.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const dayBookingsList = bookingsByDay.get(key) || [];
                  const count = dayBookingsList.length;
                  const today = isToday(day);
                  const isDaySelected = selectedDay && isSameDay(day, selectedDay);

                  return (
                    <button
                      key={key}
                      onClick={() => handleDayClick(day)}
                      className={cn(
                        "min-h-[50px] sm:min-h-[82px] p-1 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all duration-150 flex flex-col justify-between items-start text-left border cursor-pointer active:scale-95 group",
                        isDaySelected
                          ? "bg-primary/10 border-primary ring-2 ring-primary/30 shadow-md"
                          : today
                          ? "bg-blue-500/5 border-blue-400 dark:border-blue-600"
                          : count > 0
                          ? "bg-card border-border/80 hover:border-slate-400 dark:hover:border-slate-600 hover:bg-muted/30"
                          : "bg-card/40 border-border/40 hover:bg-muted/20"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span
                          className={cn(
                            "text-[10px] sm:text-xs font-black w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg sm:rounded-xl tabular-nums",
                            today
                              ? "bg-primary text-primary-foreground font-black shadow-xs"
                              : isDaySelected
                              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                              : "text-foreground group-hover:text-primary"
                          )}
                        >
                          {format(day, "d")}
                        </span>

                        {count > 0 && (
                          <span className="text-[9px] sm:text-[10px] font-black text-primary bg-primary/15 px-1 sm:px-1.5 py-0.5 rounded-md">
                            {count}
                          </span>
                        )}
                      </div>

                      {/* Day Bookings Visual Dots */}
                      <div className="w-full mt-0.5 sm:mt-1">
                        {count > 0 ? (
                          <div className="flex flex-wrap gap-0.5 sm:gap-1 items-center">
                            {dayBookingsList.slice(0, 3).map((b, idx) => (
                              <span
                                key={idx}
                                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                                style={{
                                  backgroundColor: statusColors[b.status] || "#2563EB",
                                }}
                              />
                            ))}
                            {count > 3 && (
                              <span className="text-[8px] sm:text-[9px] text-muted-foreground font-bold">
                                +{count - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/30 hidden sm:inline">
                            —
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* ===================================================== */}
          {/* 🔍 INLINE DAY INSPECTOR DRAWER (App Feel on Mobile)   */}
          {/* ===================================================== */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-card border border-border/80 p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-sm sm:text-base text-foreground">
                    {selectedDay ? format(selectedDay, "EEEE, MMMM d, yyyy") : "Select a Date"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {currentDayBookings.length} {currentDayBookings.length === 1 ? "booking" : "bookings"} scheduled on this date
                  </p>
                </div>
              </div>

              {selectedDay && isToday(selectedDay) && (
                <Badge className="bg-primary text-white font-bold text-xs px-2.5 py-0.5 rounded-full">
                  Today
                </Badge>
              )}
            </div>

            {currentDayBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bike className="w-10 h-10 opacity-30 mx-auto mb-2" />
                <p className="text-sm font-semibold">No active bookings scheduled for this date</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Vehicles are available for new reservations.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentDayBookings.map((b) => (
                  <motion.div
                    key={b._id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleBookingClick(b)}
                    className="p-4 rounded-2xl bg-muted/30 hover:bg-muted/60 border border-border/80 cursor-pointer transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: statusColors[b.status] || "#2563EB" }}
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-foreground truncate">
                            {b.bike_model}
                          </p>
                          <span className="font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-border/60">
                            {b.bike_plate || "Verified"}
                          </span>
                        </div>
                      </div>

                      <Badge className={`${statusBadgeClasses[b.status]} text-[10px] px-2 py-0.5 rounded-full capitalize`}>
                        {b.status}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground font-bold block uppercase">
                          Rider
                        </span>
                        <span className="font-semibold text-foreground truncate max-w-[120px] block">
                          {b.customer_name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-muted-foreground font-bold block uppercase">
                          Tariff
                        </span>
                        <span className="font-bold text-foreground">
                          ₹{(b.amount || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-primary" />
                        {format(parseISO(b.start), "h:mm a")} – {format(parseISO(b.end), "h:mm a")}
                      </span>
                      {b.customer_phone && (
                        <a
                          href={`tel:${b.customer_phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-emerald-600 font-bold flex items-center gap-1 hover:underline"
                        >
                          <Phone className="w-3 h-3" /> Call
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        /* ======================================================== */
        /* 📋 AGENDA VIEW (Full Mobile Timeline)                    */
        /* ======================================================== */
        <div className="space-y-4">
          {daysWithBookings.length === 0 ? (
            <div className="text-center py-16 bg-card border border-dashed border-border/80 rounded-3xl p-8 shadow-xs">
              <Calendar className="w-12 h-12 text-muted-foreground opacity-40 mx-auto mb-3" />
              <p className="text-base font-bold text-foreground font-display">
                No Bookings Scheduled This Month
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                There are no active or confirmed fleet bookings recorded for {format(currentMonth, "MMMM yyyy")}.
              </p>
            </div>
          ) : (
            daysWithBookings.map(({ day, bookings: list }) => {
              const today = isToday(day);

              return (
                <div key={format(day, "yyyy-MM-dd")} className="space-y-2.5">
                  <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md py-2 z-10">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          today ? "bg-primary animate-pulse" : "bg-slate-400"
                        }`}
                      />
                      <h3 className="text-sm sm:text-base font-black font-display text-foreground">
                        {format(day, "EEEE, MMMM d, yyyy")}
                        {today && (
                          <Badge className="ml-2 bg-primary text-white text-[10px] font-black rounded-full px-2 py-0.5">
                            Today
                          </Badge>
                        )}
                      </h3>
                    </div>
                    <Badge variant="outline" className="text-xs font-bold">
                      {list.length} {list.length === 1 ? "Booking" : "Bookings"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {list.map((b) => (
                      <motion.div
                        key={b._id}
                        whileHover={{ y: -2 }}
                        onClick={() => handleBookingClick(b)}
                        className="bg-card border border-border/80 rounded-3xl p-4 sm:p-5 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm cursor-pointer transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-primary flex items-center justify-center shrink-0 border border-blue-500/20">
                              <Bike className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-display font-black text-sm sm:text-base text-foreground truncate">
                                {b.bike_model}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-border/60">
                                  {b.bike_plate || "Verified"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <Badge
                              className={`text-[10px] font-bold capitalize px-2.5 py-0.5 rounded-full ${
                                statusBadgeClasses[b.status] || "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {b.status}
                            </Badge>
                            <p className="text-sm sm:text-base font-black text-foreground mt-1 tabular-nums">
                              ₹{(b.amount || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Customer & Call Strip */}
                        <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                          <div className="min-w-0 flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {b.customer_name[0]?.toUpperCase() || "R"}
                            </div>
                            <span className="font-semibold text-foreground truncate max-w-[130px]">
                              {b.customer_name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono text-muted-foreground text-[11px]">
                              {format(parseISO(b.start), "h:mm a")} – {format(parseISO(b.end), "h:mm a")}
                            </span>
                            {b.customer_phone && (
                              <a
                                href={`tel:${b.customer_phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                              >
                                <Phone className="w-3 h-3" /> Call
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 📱 NATIVE APP BOOKING DETAILS MODAL                     */}
      {/* ======================================================== */}
      <Dialog
        open={!!selectedEvent}
        onOpenChange={() => setSelectedEvent(null)}
      >
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl border border-border shadow-2xl">
          <DialogHeader className="p-5 border-b border-border bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-black font-display text-white">
                <Calendar className="w-5 h-5 text-blue-400" />
                Rental Dispatch Card
              </DialogTitle>
            </div>
          </DialogHeader>

          {selectedEvent && (
            <div className="p-5 space-y-4">
              {/* Vehicle & Status Card */}
              <div className="flex items-center justify-between gap-3 p-4 bg-muted/40 rounded-2xl border border-border/70">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                    <Bike className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-black text-sm sm:text-base text-foreground truncate">
                      {selectedEvent.bike_model}
                    </p>
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-border/60">
                      {selectedEvent.bike_plate || "Verified Fleet"}
                    </span>
                  </div>
                </div>

                <Badge
                  className={`text-xs font-bold capitalize px-3 py-1 rounded-full ${
                    statusBadgeClasses[selectedEvent.status] || "bg-slate-100 text-slate-700"
                  }`}
                >
                  {selectedEvent.status}
                </Badge>
              </div>

              {/* Customer Contact & Call Widget */}
              <div className="p-4 rounded-2xl border border-border/80 bg-card space-y-2">
                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">
                  Customer & Contact
                </span>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-black text-sm text-foreground">
                      {selectedEvent.customer_name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {selectedEvent.customer_phone || "No phone provided"}
                    </p>
                  </div>

                  {selectedEvent.customer_phone && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${selectedEvent.customer_phone}`}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" /> Call
                      </a>
                      <a
                        href={`https://wa.me/91${selectedEvent.customer_phone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Hello ${selectedEvent.customer_name}, this is Pipip Self-Drive Rentals regarding your reservation on ${selectedEvent.bike_model}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 rounded-xl transition-all"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Start & End Times */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                    Pickup Schedule
                  </span>
                  <p className="font-bold text-xs sm:text-sm text-foreground mt-1">
                    {format(new Date(selectedEvent.start), "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {format(new Date(selectedEvent.start), "h:mm a")}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <span className="text-[10px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                    Return Deadline
                  </span>
                  <p className="font-bold text-xs sm:text-sm text-foreground mt-1">
                    {format(new Date(selectedEvent.end), "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {format(new Date(selectedEvent.end), "h:mm a")}
                  </p>
                </div>
              </div>

              {/* Financials & Channel */}
              <div className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border border-border/70">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">
                    Tariff Amount
                  </span>
                  <p className="text-xl font-black text-foreground flex items-center gap-0.5 mt-0.5 font-display">
                    <IndianRupee className="w-4 h-4 text-muted-foreground" />
                    {(selectedEvent.amount || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-black tracking-wider block">
                    Channel
                  </span>
                  <Badge variant="outline" className="text-xs font-bold capitalize mt-1">
                    {selectedEvent.source || "Online"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
