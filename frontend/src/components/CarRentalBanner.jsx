import { useState, useMemo } from "react";
import axios from "axios";
import {
  Car,
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  Gauge,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Loader2,
  KeyRound,
  Sparkles,
  ShieldCheck,
  Check,
  MessageSquare,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const initialFormState = {
  startDate: "",
  endDate: "",
  preference: "",
  distance: "",
  startLocation: "",
  endLocation: "",
  withDriver: false,
  name: "",
  phone: "",
  email: "",
};

export default function CarRentalBanner() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      setErrorMsg("");
      setSubmitted(false);
      setForm(initialFormState);
      setSubmittedData(null);
    }
  };

  const tripDuration = useMemo(() => {
    if (!form.startDate || !form.endDate) return null;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const diffMs = end - start;
    if (diffMs <= 0) return null;

    const totalHours = Math.round(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    if (days === 0) return `${totalHours} hours`;
    if (hours === 0) return `${days} day${days > 1 ? "s" : ""}`;
    return `${days}d ${hours}h`;
  }, [form.startDate, form.endDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (
      !form.startDate ||
      !form.endDate ||
      !form.preference ||
      !form.distance ||
      !form.startLocation.trim() ||
      !form.endLocation.trim() ||
      !form.name.trim() ||
      !form.phone.trim()
    ) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    if (new Date(form.endDate) <= new Date(form.startDate)) {
      setErrorMsg("Return date must be after pickup date.");
      return;
    }

    if (Number(form.distance) <= 0) {
      setErrorMsg("Estimated distance must be greater than 0 kms.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        startDate: form.startDate,
        endDate: form.endDate,
        preference: form.preference,
        distance: Number(form.distance),
        startLocation: form.startLocation.trim(),
        endLocation: form.endLocation.trim(),
        withDriver: form.withDriver,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
      };

      await axios.post(`${API_BASE_URL}/car-rentals`, payload);

      setSubmittedData({ ...payload, duration: tripDuration });
      setSubmitted(true);
      setForm(initialFormState);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
          "Could not submit your inquiry. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* ======================================================== */}
      {/* 🚗 CAR RENTAL PROMOTIONAL BANNER                         */}
      {/* ======================================================== */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setSubmitted(false);
            setErrorMsg("");
            setForm(initialFormState);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSubmitted(false);
              setErrorMsg("");
              setForm(initialFormState);
              setOpen(true);
            }
          }}
          className="group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer border border-slate-800/90 hover:border-teal-400/50 bg-slate-950 transition-all duration-300 shadow-xl shadow-slate-950/40"
        >
          {/* Subtle Ambient Glows */}
          <div
            className="absolute -top-24 -left-20 w-80 h-80 rounded-full pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity"
            style={{
              background:
                "radial-gradient(circle, rgba(20, 184, 166, 0.35) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity"
            style={{
              background:
                "radial-gradient(circle, rgba(245, 158, 11, 0.4) 0%, transparent 65%)",
            }}
          />

          {/* ---------------------------------------------------- */}
          {/* 📱 MOBILE: Full Uncropped Car View + Clean Text Below */}
          {/* ---------------------------------------------------- */}
          <div className="lg:hidden flex flex-col">
            {/* 16:9 Image Window: The entire car and skyline are 100% visible with zero text obstruction */}
            <div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-900">
              <img
                src="/Car_Bg2.png"
                alt="Pipip Car Rentals"
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent pointer-events-none" />
            </div>

            {/* Structured Text & Actions Below the Image */}
            <div className="p-4 sm:p-5 space-y-3 bg-slate-950">
              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight leading-snug">
                  We Have Started{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-amber-300">
                    Car Rentals Too!
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed font-medium">
                  Planning a family trip, airport transfer, or weekend getaway? Book comfortable{" "}
                  <span className="text-white font-bold">5-seater</span> &amp;{" "}
                  <span className="text-white font-bold">7-seater</span> cars available{" "}
                  <span className="text-teal-300 font-bold">Self-Drive</span> or{" "}
                  <span className="text-amber-300 font-bold">With Driver</span>.
                </p>
              </div>

              {/* Quick Feature Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-teal-400" />
                  5 &amp; 7 Seater
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-teal-400" />
                  Self-Drive
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-200 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-teal-400" />
                  With Chauffeur
                </span>
              </div>

              {/* Mobile CTA Button */}
              <button
                type="button"
                className="w-full h-11 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25 transition-all mt-1 cursor-pointer"
              >
                <span>Inquire for Car Rental</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* ---------------------------------------------------- */}
          {/* 💻 DESKTOP: Widescreen Editorial Structured Banner   */}
          {/* ---------------------------------------------------- */}
          <div className="hidden lg:block relative min-h-[320px]">
            {/* Background Image: Sunset Skyline + Turquoise Sedan */}
            <img
              src="/Car_Bg2.png"
              alt="Pipip Car Rentals"
              className="absolute inset-0 w-full h-full object-cover object-[center_right] transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Clean cinematic gradient scrim: deep slate on left, smoothly revealing the car on right */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 via-48% to-slate-950/20 pointer-events-none" />

            {/* Desktop Structured Inner Content */}
            <div className="relative z-10 p-10 xl:p-14 flex items-center justify-between gap-8 max-w-7xl mx-auto">
              <div className="max-w-2xl space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl lg:text-4xl xl:text-5xl font-display font-black text-white tracking-tight leading-[1.15]">
                    We Have Started{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-amber-300">
                      Car Rentals Too!
                    </span>
                  </h2>
                  <p className="text-sm lg:text-base text-slate-200/90 leading-relaxed max-w-xl font-medium">
                    Planning a family trip, airport transfer, or weekend getaway? Book comfortable{" "}
                    <span className="text-white font-bold">5-seater</span> &amp;{" "}
                    <span className="text-white font-bold">7-seater</span> cars available{" "}
                    <span className="text-teal-300 font-bold">Self-Drive</span> or{" "}
                    <span className="text-amber-300 font-bold">With Driver</span>.
                  </p>
                </div>

                {/* Structured Feature List */}
                <div className="flex items-center gap-6 text-xs sm:text-sm text-slate-300 pt-1 font-semibold">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-teal-400" />
                    <span>5 &amp; 7 Seater fleet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-teal-400" />
                    <span>Self-drive freedom</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-400" />
                    <span>Chauffeur available</span>
                  </div>
                </div>
              </div>

              {/* Right Action Button */}
              <div className="shrink-0 flex flex-col items-end justify-center gap-2.5">
                <button
                  type="button"
                  className="h-12 px-8 rounded-2xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-black text-sm flex items-center gap-2.5 shadow-xl shadow-teal-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
                >
                  <span>Inquire for Car Rental</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
                <span className="text-[11px] text-slate-400 font-medium">
                  Zero advance booking required to inquire
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 📋 LIGHT & REFINED CAR RENTAL INQUIRY DIALOG             */}
      {/* ======================================================== */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90dvh] sm:max-h-[85vh] overflow-y-auto overscroll-contain p-0 rounded-2xl sm:rounded-3xl bg-white border border-slate-200 text-slate-900 shadow-2xl">
          {/* Clean Dialog Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/70">
            <div>
              <DialogTitle className="text-lg sm:text-xl font-display font-black text-slate-900 tracking-tight">
                Car Rental Information Form
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-slate-500 pt-0.5">
                Share your trip details and our team will contact you with the best quote.
              </DialogDescription>
            </div>
          </div>

          <div className="p-5 sm:p-6 bg-white">
            {submitted ? (
              /* Success Confirmation */
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-display font-black text-slate-900">
                    Inquiry Received!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                    Inquiry received! Our admin will contact you shortly.
                  </p>
                </div>

                {submittedData && (
                  <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-bold text-slate-800">
                      <span>{submittedData.name}</span>
                      <span className="text-teal-700">{submittedData.phone}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-semibold">Preference</span>
                        <span className="font-bold text-slate-900 capitalize">{submittedData.preference}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block font-semibold">Mode</span>
                        <span className="font-bold text-slate-900">
                          {submittedData.withDriver ? "With Chauffeur" : "Self-Drive"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block font-semibold">Route</span>
                        <span className="font-semibold text-slate-900 truncate block">
                          {submittedData.startLocation} → {submittedData.endLocation}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block font-semibold">Distance</span>
                        <span className="font-semibold text-slate-900">{submittedData.distance} km</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <Button
                    type="button"
                    onClick={() => handleOpenChange(false)}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold px-7 py-2 rounded-xl text-xs sm:text-sm h-11"
                  >
                    Close
                  </Button>
                  <a
                    href="https://wa.me/919999999999?text=Hello%20Pipip%20Team%2C%20I%20just%20submitted%20a%20Car%20Rental%20inquiry."
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm h-11 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp Support</span>
                  </a>
                </div>
              </div>
            ) : (
              /* Inquiry Form */
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold">
                    {errorMsg}
                  </div>
                )}

                {/* 1. Vehicle Selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    Car Preference *
                  </Label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, preference: "5 seater" }))}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        form.preference === "5 seater"
                          ? "bg-teal-50/80 border-teal-600 ring-2 ring-teal-500/20 text-slate-900 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs sm:text-sm font-black">5 Seater</span>
                        <Car className={`w-4 h-4 ${form.preference === "5 seater" ? "text-teal-600" : "text-slate-400"}`} />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Sedans &amp; Hatchbacks
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, preference: "7 seater" }))}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        form.preference === "7 seater"
                          ? "bg-teal-50/80 border-teal-600 ring-2 ring-teal-500/20 text-slate-900 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs sm:text-sm font-black">7 Seater</span>
                        <Users className={`w-4 h-4 ${form.preference === "7 seater" ? "text-teal-600" : "text-slate-400"}`} />
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Spacious SUVs &amp; MUVs
                      </p>
                    </button>
                  </div>
                </div>

                {/* 2. Driver Option */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    Driver Option *
                  </Label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, withDriver: false }))}
                      className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        !form.withDriver
                          ? "bg-white text-teal-800 shadow-sm border border-slate-200/60 font-black"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Without Driver (Self Drive)
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, withDriver: true }))}
                      className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        form.withDriver
                          ? "bg-white text-teal-800 shadow-sm border border-slate-200/60 font-black"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      With Driver
                    </button>
                  </div>
                </div>

                {/* 3. Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      Start Date &amp; Time *
                    </Label>
                    <Input
                      type="datetime-local"
                      required
                      value={form.startDate}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, startDate: e.target.value }))
                      }
                      className="rounded-xl bg-slate-50 border-slate-200 text-xs sm:text-sm h-11 [color-scheme:light]"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      End Date &amp; Time *
                    </Label>
                    <Input
                      type="datetime-local"
                      required
                      min={form.startDate || undefined}
                      value={form.endDate}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, endDate: e.target.value }))
                      }
                      className="rounded-xl bg-slate-50 border-slate-200 text-xs sm:text-sm h-11 [color-scheme:light]"
                    />
                  </div>
                </div>

                {/* 4. Locations & Distance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      Start Location / Pickup Location *
                    </Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. Airport Terminal / Central Hub"
                      value={form.startLocation}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, startLocation: e.target.value }))
                      }
                      className="rounded-xl bg-slate-50 border-slate-200 text-xs sm:text-sm h-11 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      End Location / Return Location *
                    </Label>
                    <Input
                      type="text"
                      required
                      placeholder="e.g. City Hub / Destination"
                      value={form.endLocation}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, endLocation: e.target.value }))
                      }
                      className="rounded-xl bg-slate-50 border-slate-200 text-xs sm:text-sm h-11 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Estimated Distance */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-amber-500" />
                      Estimated Distance (in kms) *
                    </Label>
                    {form.distance && (
                      <span className="text-xs text-teal-700 font-semibold">
                        Approx. {form.distance} km trip
                      </span>
                    )}
                  </div>
                  <Input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 150"
                    value={form.distance}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, distance: e.target.value }))
                    }
                    className="rounded-xl bg-slate-50 border-slate-200 text-xs sm:text-sm h-11"
                  />
                </div>

                {/* 5. Customer Details */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <Label className="text-xs font-bold text-slate-700">
                    Customer Details *
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <Input
                      type="text"
                      required
                      placeholder="Full Name *"
                      value={form.name}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="rounded-xl bg-slate-50 border-slate-200 text-xs sm:text-sm h-11"
                    />

                    <Input
                      type="tel"
                      required
                      placeholder="Phone Number *"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      className="rounded-xl bg-slate-50 border-slate-200 text-xs sm:text-sm h-11"
                    />

                    <Input
                      type="email"
                      placeholder="Email Address (Optional)"
                      value={form.email}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                      className="rounded-xl bg-slate-50 border-slate-200 text-xs sm:text-sm h-11"
                    />
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleOpenChange(false)}
                    className="rounded-xl text-xs text-slate-600 hover:text-slate-900 h-10 px-4"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-950 font-black text-xs sm:text-sm h-11 px-6 shadow-md shadow-teal-500/20"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      "Submit Car Rental Inquiry"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
