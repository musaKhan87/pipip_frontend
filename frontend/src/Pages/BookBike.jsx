import { Turnstile } from "@marsidev/react-turnstile";
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInHours } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  User,
  CreditCard,
  Check,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Bike,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Upload,
  Clock,
  ShieldCheck,
  Mail,
  Shield,
  Download,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

import { toast } from "sonner";
import { Button } from "../components/ui/button";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useBike } from "../hooks/useBikes";
import { useActiveAreas } from "../hooks/useAreas";
import { useBikeAvailability } from "../hooks/useBikeAvailability";
import { useCreateCustomer } from "../hooks/useCustomer";
import { useCreateBooking } from "../hooks/useBooking";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Alert, AlertDescription } from "../components/ui/alert";
import useSEO from "../hooks/useSEO";
import { useCluster } from "../hooks/useClusters";
import MobileBottomNav from "../components/MobileBottomNav";

const initialCustomerData = {
  name: "",
  phone: "",
  email: "",
  address: "",
  id_proof_type: "aadhaar",
  id_proof_number: "",
  aadhaar_image: null,
  license_image: null,
};

const POLICY_DATA = {
  privacy: {
    title: "Privacy Policy",
    content: [
      {
        title: "1. What We Collect",
        items: [
          "Identity & Contact Info: Name, email, address",
          "Government ID: Aadhaar, Driving License",
          "Vehicle Info: Registration, insurance, permits",
          "Payment Details: Bank account, UPI, transaction history",
          "Location Data: GPS tracking during trips (with consent)",
        ],
      },
      {
        title: "2. How We Use Your Data",
        items: [
          "Provide and improve services",
          "Process bookings and payments",
          "Ensure safety and security",
          "Communicate with you",
          "Comply with laws and regulations",
        ],
      },
      {
        title: "3. Sharing Your Data",
        items: [
          "Service providers and partners",
          "Law enforcement and regulatory authorities",
          "Hosts and Guests (for trip-related info)",
        ],
      },
      {
        title: "4. Your Rights",
        items: [
          "Access and correct your data",
          "Withdraw consent",
          "Delete your data",
          "Nominate someone to manage your data",
        ],
      },
    ],
  },
  refund: {
    title: "Refund Policy",
    content: [
      {
        title: "1. Cancellation by User (Before Trip)",
        items: [
          "24 hours or more: Full refund minus convenience fee (if applicable).",
          "Less than 24 hours: 50% of rental amount refunded.",
        ],
      },
      {
        title: "2. Cancellation by User (During Trip)",
        items: ["No refund for remaining rental period."],
      },
      {
        title: "3. Cancellation by Pipip",
        items: [
          "If we cancel due to unforeseen circumstances, you'll receive a full refund.",
        ],
      },
      {
        title: "4. Refund Process",
        items: [
          "Refunds are processed within 5-7 business days to the original payment method.",
        ],
      },
      {
        title: "5. Security Deposit",
        items: [
          "Refunded within 24-48 hours after vehicle return and inspection.",
        ],
      },
      {
        title: "6. Damages and Charges",
        items: [
          "Any damages, fines, or charges will be deducted from the security deposit.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    content: [
      {
        title: "1. Introduction",
        items: [
          "Welcome to Pipip! These Terms and Conditions govern your use of our Platform. By accessing or using our Platform, you agree to be bound by these Terms.",
        ],
      },
      {
        title: "2. User Responsibilities",
        items: [
          "Provide accurate information for registration and booking.",
          "Ensure you have a valid driving license and follow traffic rules.",
          "Use vehicles responsibly and return them in the same condition.",
        ],
      },
      {
        title: "3. Booking and Payment",
        items: [
          "Bookings are subject to vehicle availability.",
          "Payments are processed through our secure payment gateway.",
          "Rental charges, security deposits, and additional fees apply.",
        ],
      },
      {
        title: "4. Cancellation Policy",
        items: [
          "Cancellations 48 hours before trip start: Complete refund in 3-5 working days (exc. GST)",
          "Cancellations 24 hours before trip starts: 50% of the amount (exc. GST)",
          "Cancellations 12 hours before trip starts: No refund",
        ],
      },
      {
        title: "5. Liability and Insurance",
        items: [
          "Pipip is not liable for damages or losses due to User negligence.",
          "Users are responsible for insurance excess and damages.",
        ],
      },
    ],
  },
};

export default function BookBike() {
  const { bikeId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const areaParam = searchParams.get("area");

  const [step, setStep] = useState(1);
  const [customerData, setCustomerData] = useState(initialCustomerData);
  const [startDate, setStartDate] = useState(startParam || "");
  const [endDate, setEndDate] = useState(endParam || "");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState(null);
  const [isAvailable, setIsAvailable] = useState(null);

  const [paymentFailed, setPaymentFailed] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("online");

  const isCluster = searchParams.get("type") === "cluster";
  const { data: bikeData, isLoading: bikeLoading } = useBike(
    isCluster ? "" : bikeId || ""
  );
  const { data: clusterData, isLoading: clusterLoading } = useCluster(
    isCluster ? bikeId || "" : ""
  );
  const bike = isCluster ? clusterData : bikeData;
  const activeLoading = isCluster ? clusterLoading : bikeLoading;

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const clusterImages = useMemo(() => {
    if (!isCluster || !bike || !bike.bikes) return [];
    const imgs = [];
    bike.bikes.forEach((b) => {
      if (b.image_url && !imgs.includes(b.image_url)) imgs.push(b.image_url);
    });
    return imgs;
  }, [isCluster, bike]);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex(
      (prev) => (prev - 1 + clusterImages.length) % clusterImages.length
    );
  };
  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % clusterImages.length);
  };

  const { data: areas } = useActiveAreas();
  useSEO({
    title: bike
      ? `Book ${bike.name || bike.model} on Rent | Pipip Rentals`
      : "Book a Bike on Rent - Pipip",
    description: bike
      ? `Rent ${bike.name || bike.model} starting at just Rs. ${bike.price_per_day}/day. Easy online bike booking with ₹200 token lock.`
      : "Book your self-drive bike rental online with Pipip.",
  });

  const createCustomer = useCreateCustomer();
  const createBooking = useCreateBooking();
  const { checkAvailability, checking } = useBikeAvailability();

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [activePolicy, setActivePolicy] = useState(null);

  const SECURITY_DEPOSIT = 2000;

  const tripHours = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return 0;
    return differenceInHours(end, start);
  }, [startDate, endDate]);

  const durationFormatted = useMemo(() => {
    if (tripHours <= 0) return "";
    const days = Math.floor(tripHours / 24);
    const remainingHours = tripHours % 24;
    if (days === 0) return `${tripHours} Hours`;
    if (remainingHours === 0) return `${days} Day${days > 1 ? "s" : ""}`;
    return `${days} Day${days > 1 ? "s" : ""} ${remainingHours} Hr${remainingHours > 1 ? "s" : ""
      }`;
  }, [tripHours]);

  const isEligibleForDailyRate = useMemo(() => {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return false;
    const totalHours = differenceInHours(end, start);
    if (totalHours < 3) return false;
    const remainingHours = totalHours % 24;
    return remainingHours >= 6;
  }, [startDate, endDate]);

  const getRoundedISO = (date) => {
    const d = new Date(date);
    d.setMinutes(0, 0, 0);
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d - tzOffset).toISOString().slice(0, 16);
  };

  const now = new Date();
  const minDateTime = getRoundedISO(now);
  const maxLimitDate = new Date();
  maxLimitDate.setDate(now.getDate() + 30);
  const maxDateTime = getRoundedISO(maxLimitDate);

  /* =========================
     AVAILABILITY CHECK
  ========================= */
  useEffect(() => {
    const checkDates = async () => {
      if (!bikeId || !startDate || !endDate) {
        setAvailabilityMessage(null);
        setIsAvailable(null);
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        setAvailabilityMessage("⚠️ Return date must be after pickup date");
        setIsAvailable(false);
        return;
      }

      const totalHours = differenceInHours(end, start);
      if (totalHours < 3) {
        setAvailabilityMessage("⚠️ Minimum booking duration is 3 hours");
        setIsAvailable(false);
        return;
      }

      const isTimeInInactiveHours = (dateTimeStr) => {
        if (!dateTimeStr) return false;
        const date = new Date(dateTimeStr);
        const hour = date.getHours();
        const minutes = date.getMinutes();
        if (hour > 22 || hour < 10) return true;
        if (hour === 22 && minutes > 0) return true;
        return false;
      };

      if (isTimeInInactiveHours(startDate) || isTimeInInactiveHours(endDate)) {
        setAvailabilityMessage(
          "⚠️ Hub is closed for pickup/returns between 10:00 PM and 10:00 AM"
        );
        setIsAvailable(false);
        return;
      }

      const result = await checkAvailability(bikeId, start, end, isCluster);

      if (!result.isAvailable) {
        const fromDate = new Date(result.bookedFrom).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }
        );
        const fromTime = new Date(result.bookedFrom).toLocaleTimeString(
          "en-IN",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );
        const toDate = new Date(result.bookedTo).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const toTime = new Date(result.bookedTo).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        });

        setAvailabilityMessage(
          `Vehicle is reserved from ${fromDate} ${fromTime} to ${toDate} ${toTime}`
        );
      } else {
        setAvailabilityMessage(
          result.message ||
          "Vehicle is ready & available for your selected dates!"
        );
      }
      setIsAvailable(result.isAvailable);
    };

    checkDates();
  }, [bikeId, startDate, endDate, checkAvailability, isCluster]);

  /* =========================
     HELPERS
  ========================= */
  const getAreaName = (area) => {
    if (!area) return "Designated Hub";
    if (typeof area === "object" && area.name) return area.name;
    const targetId = typeof area === "object" ? area._id || area.id : area;
    if (!targetId) return "Designated Hub";
    const matched = (areas || []).find(
      (a) =>
        String(a._id || a.id) === String(targetId) ||
        (a.name && a.name.toLowerCase() === String(targetId).toLowerCase())
    );
    if (matched?.name) return matched.name;
    if (
      typeof targetId === "string" &&
      targetId.trim() !== "" &&
      !/^[0-9a-fA-F]{24}$/.test(targetId)
    ) {
      return targetId;
    }
    return "Designated Hub";
  };

  const calculatePrice = (includeDeposit = false) => {
    if (!bike || !startDate || !endDate) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalHours = Math.max(1, differenceInHours(end, start));

    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;

    let rentalPrice = 0;
    const hourlyRate = Number(bike.price_per_hour || 0);
    const dailyRate = Number(bike.price_per_day || 0);

    if (days === 0) {
      if (totalHours < 3) {
        rentalPrice = 3 * hourlyRate;
      } else if (totalHours <= 5) {
        rentalPrice = totalHours * hourlyRate;
      } else {
        rentalPrice = dailyRate;
      }
    } else {
      rentalPrice = days * dailyRate;
      if (remainingHours > 0) {
        if (remainingHours >= 6) {
          rentalPrice += dailyRate;
        } else {
          rentalPrice += Math.min(remainingHours * hourlyRate, dailyRate);
        }
      }
    }

    return includeDeposit ? rentalPrice + SECURITY_DEPOSIT : rentalPrice;
  };

  const roundToHour = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const date = new Date(dateTimeStr);
    const minutes = date.getMinutes();

    if (minutes > 0) {
      date.setMinutes(0);
      date.setHours(date.getHours() + 1);
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:00`;
  };

  const handleStartDateChange = (value) => {
    setStartDate(roundToHour(value));
  };

  const handleEndDateChange = (value) => {
    setEndDate(roundToHour(value));
  };

  /* =========================
     CUSTOMER STEP
  ========================= */
  const handleCustomerSubmit = (e) => {
    if (e) e.preventDefault();

    if (!startDate || !endDate) {
      toast.error("Please select pickup and return dates");
      return;
    }

    if (isAvailable === false) {
      toast.error("Vehicle is not available for selected dates");
      return;
    }

    if (!customerData.name.trim() || !customerData.phone.trim()) {
      toast.error("Please enter your name and contact phone number");
      return;
    }

    if (customerData.phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    if (!customerData.aadhaar_image && !customerData.license_image) {
      toast.error(
        "Please upload at least one ID proof (Aadhaar or Driving License)"
      );
      return;
    }

    if (!termsAccepted) {
      toast.error(
        "Please agree to the Terms, Privacy, and Refund policies to continue"
      );
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* =========================
     PAYMENT & BOOKING SUBMISSION
  ========================= */
  const handleBookingSubmit = async () => {
    if (!bike || !startDate || !endDate) return;
    if (!turnstileToken) {
      toast.error(
        "Bot verification check in progress. Please complete the verification."
      );
      return;
    }
    setIsSubmitting(true);

    try {
      // 1. Create Cashfree Order for ₹200 Token
      const res = await fetch(`${API_BASE_URL}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: 200,
          customerName: customerData.name,
          customerEmail: customerData.email || "customer@pipip.com",
          customerPhone: customerData.phone,
        }),
      });

      const paymentOrder = await res.json();
      if (!paymentOrder.paymentSessionId) {
        throw new Error(
          "Failed to initialize payment session. Please try again."
        );
      }

      // 2. Open Cashfree Checkout Modal
      const cashfree = new window.Cashfree({ mode: "production" });
      await cashfree.checkout({
        paymentSessionId: paymentOrder.paymentSessionId,
        redirectTarget: "_modal",
      });

      // 3. Verify Payment Status with Backend
      const verifyRes = await fetch(
        `${API_BASE_URL}/payment/verify/${paymentOrder.orderId}`
      );
      const verifyData = await verifyRes.json();

      if (verifyData.status === "PAID") {
        // 4. Save Customer and Booking Records
        const formData = new FormData();
        Object.entries(customerData).forEach(([key, value]) => {
          if (value !== null) formData.append(key, value);
        });

        const targetAreaId =
          bike?.area_id?._id ||
          bike?.area_id ||
          (Array.isArray(bike?.area_ids)
            ? bike.area_ids[0]?._id || bike.area_ids[0]
            : null) ||
          areaParam ||
          null;

        if (targetAreaId) {
          formData.append(
            "area_id",
            typeof targetAreaId === "object"
              ? targetAreaId._id || targetAreaId
              : targetAreaId
          );
        }

        const customer = await createCustomer.mutateAsync(formData);

        const tokenPaid = 200;
        const totalRental = calculatePrice(false);
        const isPaidInFull = tokenPaid >= totalRental;

        const booking = await createBooking.mutateAsync({
          bike_id: isCluster ? null : bike._id,
          cluster_id: isCluster ? bike._id : null,
          vehicle_make_model: bike?.name || bike?.model || "Bike",
          customer_id: customer._id,
          customer_name: customerData.name,
          contact_number: customerData.phone,
          customer_email: customerData.email || undefined,
          start_datetime: new Date(startDate).toISOString(),
          end_datetime: new Date(endDate).toISOString(),
          total_amount: totalRental,
          paid_amount: tokenPaid,
          deposit_amount: SECURITY_DEPOSIT,
          notes: notes || undefined,
          booking_source: "online",
          status: "confirmed",
          payment_status: isPaidInFull ? "paid" : "partial",
          payment_order_id: paymentOrder.orderId,
          supports_partial_payments: true,
          payments: [
            {
              amount: tokenPaid,
              payment_method: "online",
              transaction_id: paymentOrder.orderId,
              paid_at: new Date().toISOString(),
              notes: "Online token advance payment via Cashfree",
              recorded_by: "Customer (Online)",
            },
          ],
          turnstile_token: turnstileToken,
        });

        setConfirmedBookingId(booking._id);
        setBookingComplete(true);
        toast.success("Payment Received & Booking Confirmed!");
      } else {
        setPaymentFailed(true);
        toast.error("Payment could not be verified");
      }
    } catch (err) {
      console.error("BOOKING ERROR:", err);
      toast.error(err.message || "An error occurred during booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =========================
     LOADING & NOT FOUND STATES
  ========================= */
  if (activeLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center pt-28 pb-20">
          <div className="relative flex items-center justify-center mb-5">
            {/* Soft Ambient Pulse Ring */}
            <div className="absolute w-20 h-20 rounded-full bg-blue-500/10 animate-ping pointer-events-none" />
            <div className="relative w-16 h-16 rounded-3xl bg-white border border-slate-200/90 shadow-md flex items-center justify-center">
              <Bike className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <div className="absolute -inset-1 rounded-3xl border-2 border-blue-600 border-t-transparent animate-spin" />
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 font-display tracking-tight">
            Loading Vehicle Details...
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            Fetching verified fleet rates & live hub availability
          </p>
        </main>
        <MobileBottomNav />
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 text-slate-400">
          <Bike className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">Vehicle Not Found</h2>
        <p className="text-sm text-slate-500 max-w-sm mb-6">
          This vehicle is currently unavailable or may have been unlisted. Explore other premium bikes in our fleet catalog.
        </p>
        <Button
          onClick={() => navigate("/bikes")}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6"
        >
          Browse Catalog
        </Button>
      </div>
    );
  }

  /* =========================
     PAYMENT FAILED VIEW
  ========================= */
  if (paymentFailed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full text-center p-6 sm:p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50"
        >
          <div className="w-18 h-18 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-600">
            <XCircle className="w-9 h-9" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Payment Not Completed
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            The transaction was not finalized or was canceled at the gateway. No funds were captured. If any amount was deducted, your bank will auto-refund it in 3-5 business days.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => setPaymentFailed(false)}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/25 cursor-pointer"
            >
              Try Again with ₹200 Token
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full h-11 rounded-xl border-slate-200 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Return to Home
            </Button>
          </div>

          <p className="text-[11px] text-slate-400 mt-6 flex items-center justify-center gap-1.5 font-medium">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            Cashfree 256-Bit Encrypted Payment Security
          </p>
        </motion.div>
      </div>
    );
  }

  /* =========================
     BOOKING CONFIRMED RECEIPT VIEW
  ========================= */
  if (bookingComplete) {
    const handleDownload = async () => {
      const element = document.getElementById("receipt-content");
      try {
        const { default: html2canvas } = await import("html2canvas");
        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });
        const image = canvas.toDataURL("image/png", 1.0);
        const link = document.createElement("a");
        link.href = image;
        link.download = `Pipip-Receipt-${confirmedBookingId}.png`;
        link.click();
      } catch (err) {
        console.error("Receipt download failed", err);
        toast.error("Could not export receipt image");
      }
    };

    return (
      <div className="min-h-screen bg-slate-900 py-8 sm:py-16 px-4">
        <div className="max-w-md mx-auto">
          {/* Action Header */}
          <div className="flex items-center justify-between mb-4 px-1">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Save Bill
            </button>
          </div>

          {/* Ticket Card Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            id="receipt-content"
            className="bg-white rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Top Brand Banner */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white text-center relative overflow-hidden">
              <div className="w-14 h-14 bg-white/15 backdrop-blur-md rounded-2xl border border-white/25 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-400 text-slate-950 mb-1">
                Booking Confirmed
              </span>
              <h2 className="text-xl font-black tracking-tight">Pipip Self-Drive Rentals</h2>
              <p className="text-xs text-blue-100 mt-0.5 font-mono">
                Order #{confirmedBookingId.slice(-8).toUpperCase()}
              </p>
            </div>

            {/* Ride Details Ticket Section */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Reserved Vehicle
                  </span>
                  <p className="text-sm font-extrabold text-slate-900 truncate">
                    {bike?.name || bike?.model}
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                  {isCluster ? "Cluster Fleet" : bike?.number_plate}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Rider Name
                  </span>
                  <p className="font-bold text-slate-800 truncate">{customerData.name}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Contact Phone
                  </span>
                  <p className="font-bold text-slate-800">+91 {customerData.phone}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs border-b border-slate-100 pb-3">
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 font-medium">Pickup Schedule</span>
                  <span className="font-bold text-slate-900 text-right">
                    {format(new Date(startDate), "dd MMM yyyy, hh:mm a")}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-slate-500 font-medium">Return Schedule</span>
                  <span className="font-bold text-slate-900 text-right">
                    {format(new Date(endDate), "dd MMM yyyy, hh:mm a")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Pickup Location</span>
                  <span className="font-bold text-blue-700">{getAreaName(bike.area_id)}</span>
                </div>
              </div>

              {/* Financial Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Rental Tariff ({durationFormatted})</span>
                  <span className="font-bold text-slate-900">₹{calculatePrice(false)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Security Deposit (Refundable)</span>
                  <span className="font-bold text-slate-900">₹{SECURITY_DEPOSIT}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-700">Total Estimation</span>
                  <span className="text-slate-900">₹{calculatePrice(false) + SECURITY_DEPOSIT}</span>
                </div>
                <div className="border-t border-slate-200 border-dashed pt-2 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-black tracking-wider text-emerald-700 block">
                      Token Paid Online
                    </span>
                    <span className="text-sm font-black text-emerald-600">₹200</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                      Due at Pickup
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      ₹{calculatePrice(false) + SECURITY_DEPOSIT - 200}
                    </span>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-900 leading-relaxed space-y-1">
                <p className="font-bold">Next Steps at Pickup:</p>
                <p>1. Carry your original Aadhaar Card and Driving License for swift physical check-in.</p>
                <p>2. Pay the remaining rental balance + ₹2,000 security deposit via UPI or Cash.</p>
                <p>3. Complimentary sanitized helmet included with every vehicle.</p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row gap-2.5">
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex-1 h-11 rounded-xl font-bold border-slate-300 text-slate-700 hover:bg-white cursor-pointer"
              >
                <Download className="w-4 h-4 mr-2" /> Download Bill
              </Button>
              <Button
                onClick={() => navigate("/")}
                className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
              >
                Done
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  /* =========================
     MAIN FORM / PAGE VIEW
  ========================= */
  return (
    <div className="min-h-screen bg-slate-50/70 pb-28 md:pb-12 text-slate-900">
      <Header />

      <main className="pt-20 md:pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Action */}
          <Button
            variant="ghost"
            onClick={() => {
              if (step === 2) setStep(1);
              else navigate(-1);
            }}
            className="mb-4 text-slate-600 hover:text-slate-900 font-semibold p-0 h-auto hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>{step === 2 ? "Back to Trip & Rider Info" : "Back"}</span>
          </Button>

          {/* Mobile-Only Small Compact Vehicle Card (<lg) - App-like compact banner */}
          <div className="lg:hidden mb-4 bg-white border border-slate-200/90 rounded-2xl p-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-1 shrink-0 overflow-hidden">
                {isCluster && clusterImages.length > 0 ? (
                  <img
                    src={clusterImages[0]}
                    alt={bike?.name || "Vehicle"}
                    className="w-full h-full object-contain"
                  />
                ) : bike?.image_url ? (
                  <img
                    src={bike.image_url}
                    alt={bike.model}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Bike className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <h2 className="text-sm font-extrabold text-slate-900 truncate">
                    {bike?.name || bike?.model}
                  </h2>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60 shrink-0">
                    {isCluster ? bike?.bikes?.[0]?.cc || 125 : bike?.cc}cc
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                  <span className="truncate">{getAreaName(bike.area_id)}</span>
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="font-bold text-slate-900">
                    ₹{bike.price_per_hour}
                    <span className="text-[10px] font-normal text-slate-400">/hr</span>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="font-bold text-blue-600">
                    ₹{bike.price_per_day}
                    <span className="text-[10px] font-normal text-blue-400">/day</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-600 font-medium">
                Online Token: <strong className="text-blue-600 font-bold">₹200</strong>
              </span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                ₹{SECURITY_DEPOSIT} Ref. Deposit at Pickup
              </span>
            </div>

            {/* Mobile live estimated total when dates are selected */}
            {tripHours > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs bg-blue-50/70 px-2.5 py-1.5 rounded-xl border border-blue-100">
                <span className="text-[11px] font-bold text-slate-700">
                  Rental ({durationFormatted}): <strong className="text-slate-900 font-extrabold">₹{calculatePrice(false)}</strong>
                </span>
                <span className="text-[11px] font-bold text-blue-700">
                  Total: ₹{calculatePrice(true)}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Desktop-Only Sticky Vehicle Summary Card (hidden on mobile) */}
            <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-24">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-[0_4px_25px_-5px_rgba(15,23,42,0.06)] overflow-hidden">
                {/* Vehicle Image Container */}
                <div className="aspect-[16/10] relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
                  {isCluster && clusterImages.length > 0 ? (
                    <div className="relative w-full h-full">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={currentImgIndex}
                          src={clusterImages[currentImgIndex]}
                          alt={bike?.name || "Cluster"}
                          className="w-full h-full object-contain p-3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25 }}
                        />
                      </AnimatePresence>
                      {clusterImages.length > 1 && (
                        <>
                          <button
                            onClick={handlePrevImage}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 rounded-full p-1.5 shadow-sm border border-slate-200 cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-800 rounded-full p-1.5 shadow-sm border border-slate-200 cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2.5 right-2.5 flex gap-1 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {clusterImages.map((_, idx) => (
                              <span
                                key={idx}
                                className={`h-1.5 rounded-full transition-all ${idx === currentImgIndex
                                  ? "w-3 bg-white"
                                  : "w-1.5 bg-white/50"
                                  }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ) : bike?.image_url ? (
                    <img
                      src={bike.image_url}
                      alt={bike.model}
                      className="w-full h-full object-contain p-3"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Bike className="w-12 h-12 stroke-[1.5]" />
                      <span className="text-xs mt-1">Vehicle Image</span>
                    </div>
                  )}

                  {/* Top CC pill */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-200/80 text-[11px] font-extrabold text-slate-800 shadow-2xs">
                    {isCluster ? bike?.bikes?.[0]?.cc || 125 : bike?.cc} CC
                  </div>

                  {/* RTO Fleet verified */}
                  <div className="absolute top-3 right-3 bg-emerald-500/90 text-white backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Fleet</span>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="space-y-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                      {bike?.name || bike?.model}
                    </h2>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-700">
                        {getAreaName(bike.area_id)}
                      </span>
                      <span>•</span>
                      <span>
                        {isCluster ? "Fleet Cluster" : bike?.number_plate}
                      </span>
                    </p>
                  </div>

                  {/* Tariffs Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-center">
                      <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                        Hourly Rate
                      </span>
                      <p className="text-base font-black text-slate-900">
                        ₹{bike.price_per_hour}
                        <span className="text-xs font-normal text-slate-400">/hr</span>
                      </p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-blue-200/80 text-center">
                      <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider block">
                        24-Hr Daily Rate
                      </span>
                      <p className="text-base font-black text-blue-700">
                        ₹{bike.price_per_day}
                        <span className="text-xs font-normal text-blue-400">/day</span>
                      </p>
                    </div>
                  </div>

                  {/* Security Deposit & Token Callouts */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs py-1 px-1">
                      <span className="text-slate-500 font-medium">
                        Security Deposit
                      </span>
                      <span className="font-bold text-slate-800">
                        ₹{SECURITY_DEPOSIT}{" "}
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 ml-1">
                          100% Refundable
                        </span>
                      </span>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 border border-blue-200/90 rounded-xl p-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="text-[10px] font-extrabold uppercase text-blue-800 tracking-wider block">
                          Reserve Online
                        </span>
                        <p className="text-xs text-slate-600 font-medium truncate">
                          Pay remaining balance at pickup
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-base font-black text-blue-700 block">
                          ₹200 Token
                        </span>
                      </div>
                    </div>

                    {tripHours > 0 && (
                      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-blue-50/90 border border-blue-200/90 rounded-2xl p-3.5 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between pb-1.5 border-b border-blue-200/60">
                          <span className="text-[10px] uppercase font-extrabold text-blue-900 tracking-wider flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                            Estimated Fare ({durationFormatted})
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200/70">
                            ₹{SECURITY_DEPOSIT} Ref. Deposit
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">
                              Rental Tariff
                            </span>
                            <span className="text-base font-black text-slate-900">
                              ₹{calculatePrice(false)}
                            </span>
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] uppercase font-bold text-blue-700 block">
                              Pay Online
                            </span>
                            <span className="text-xs font-black text-blue-600 bg-white px-2 py-0.5 rounded-lg border border-blue-200/80 shadow-2xs">
                              ₹200 Token
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">
                              Total with Deposit
                            </span>
                            <span className="text-base font-black text-blue-700">
                              ₹{calculatePrice(true)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fleet Inclusions */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Sanitized Helmet</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Dedicated Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Mobile-Friendly Compact Form Card */}
            <div className="lg:col-span-7">
              {/* Stepper Header */}
              <div className="flex items-center gap-2 sm:gap-4 mb-4">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${step >= 1
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-200 text-slate-600"
                    }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Rider Details</span>
                </div>
                <div
                  className={`flex-1 h-1 rounded-full transition-all ${step >= 2 ? "bg-blue-600" : "bg-slate-200"
                    }`}
                />
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${step >= 2
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-500"
                    }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Review & Pay</span>
                </div>
              </div>

              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
                    <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-3.5 sm:p-5">
                      <CardTitle className="text-slate-900 font-extrabold text-sm sm:text-base flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>Rider & Booking Information</span>
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-3.5 sm:p-6">
                      <form onSubmit={handleCustomerSubmit} className="space-y-4 sm:space-y-5">
                        {/* 1. Booking Dates */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-blue-600" />
                              <span>Booking Period *</span>
                            </Label>
                            {tripHours > 0 && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                                {durationFormatted}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                              <span className="text-[11px] font-semibold text-slate-600 block">Pickup Date & Time</span>
                              <Input
                                type="datetime-local"
                                value={startDate}
                                min={minDateTime}
                                max={maxDateTime}
                                step="3600"
                                onChange={(e) => handleStartDateChange(e.target.value)}
                                required
                                className="h-10 rounded-xl bg-slate-50/80 border-slate-200 text-xs sm:text-sm font-semibold focus:bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[11px] font-semibold text-slate-600 block">Return Date & Time</span>
                              <Input
                                type="datetime-local"
                                value={endDate}
                                min={startDate || minDateTime}
                                step="3600"
                                onChange={(e) => handleEndDateChange(e.target.value)}
                                required
                                className="h-10 rounded-xl bg-slate-50/80 border-slate-200 text-xs sm:text-sm font-semibold focus:bg-white"
                              />
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>Hub operational 10:00 AM – 10:00 PM. Times round to nearest hour.</span>
                          </p>

                          {/* Availability message - Perfectly aligned flexbox banner */}
                          <AnimatePresence mode="wait">
                            {availabilityMessage && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="mt-2"
                              >
                                <div
                                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold leading-normal transition-all ${isAvailable
                                    ? "bg-emerald-50/90 border-emerald-300 text-emerald-800"
                                    : "bg-rose-50/90 border-rose-300 text-rose-800"
                                    }`}
                                >
                                  {isAvailable ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                  )}
                                  <span className="flex-1 min-w-0">{availabilityMessage}</span>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Live Estimated Rental Card (Shows on mobile and desktop right under dates!) */}
                          {tripHours > 0 && isAvailable && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-3 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-blue-50/90 border border-blue-200/90 rounded-2xl p-3 sm:p-3.5 shadow-2xs space-y-2"
                            >
                              <div className="flex items-center justify-between pb-1.5 border-b border-blue-200/60">
                                <span className="text-[10px] uppercase font-extrabold text-blue-900 tracking-wider flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                                  Estimated Fare ({durationFormatted})
                                </span>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200/70">
                                  ₹{SECURITY_DEPOSIT} Ref. Deposit
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <div>
                                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                    Rental Tariff
                                  </span>
                                  <span className="text-sm sm:text-base font-black text-slate-900">
                                    ₹{calculatePrice(false)}
                                  </span>
                                </div>
                                <div className="text-center px-1">
                                  <span className="text-[10px] uppercase font-bold text-blue-700 block">
                                    Pay Online
                                  </span>
                                  <span className="text-xs font-black text-blue-600 bg-white px-2 py-0.5 rounded-lg border border-blue-200/80 shadow-2xs">
                                    ₹200 Token
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                    Total (with Deposit)
                                  </span>
                                  <span className="text-sm sm:text-base font-black text-blue-700">
                                    ₹{calculatePrice(true)}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          {isAvailable && isEligibleForDailyRate && (
                            <div className="mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-1.5 text-[11px] text-emerald-900 font-medium">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>24-Hour Daily Cap discount applied!</span>
                            </div>
                          )}

                          {checking && (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-1.5">
                              <div className="animate-spin w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full" />
                              <span>Checking availability...</span>
                            </div>
                          )}
                        </div>

                        {/* 2. Personal Info */}
                        <div className="border-t border-slate-100 pt-3.5 space-y-3">
                          <Label className="text-xs font-bold text-slate-900 block">
                            Contact Information
                          </Label>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                              <Label htmlFor="name" className="text-[11px] font-semibold text-slate-600">Full Name *</Label>
                              <Input
                                id="name"
                                value={customerData.name}
                                onChange={(e) =>
                                  setCustomerData({ ...customerData, name: e.target.value })
                                }
                                placeholder="e.g. Rahul Sharma"
                                required
                                className="h-10 rounded-xl bg-slate-50/80 border-slate-200 text-xs sm:text-sm font-semibold focus:bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="phone" className="text-[11px] font-semibold text-slate-600">Phone Number *</Label>
                              <div className="relative">
                                <Input
                                  id="phone"
                                  type="tel"
                                  value={customerData.phone}
                                  onChange={(e) =>
                                    setCustomerData({ ...customerData, phone: e.target.value })
                                  }
                                  placeholder="9876543210"
                                  required
                                  className="h-10 rounded-xl bg-slate-50/80 border-slate-200 pl-11 text-xs sm:text-sm font-semibold focus:bg-white"
                                />
                                <span className="absolute left-2.5 top-2.5 text-xs font-bold text-slate-500">
                                  +91
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                              <Label htmlFor="email" className="text-[11px] font-semibold text-slate-600">Email (Optional)</Label>
                              <Input
                                id="email"
                                type="email"
                                value={customerData.email}
                                onChange={(e) =>
                                  setCustomerData({ ...customerData, email: e.target.value })
                                }
                                placeholder="yourname@gmail.com"
                                className="h-10 rounded-xl bg-slate-50/80 border-slate-200 text-xs sm:text-sm font-semibold focus:bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="id_number" className="text-[11px] font-semibold text-slate-600">ID / DL Number (Optional)</Label>
                              <Input
                                id="id_number"
                                value={customerData.id_proof_number}
                                onChange={(e) =>
                                  setCustomerData({ ...customerData, id_proof_number: e.target.value })
                                }
                                placeholder="Aadhaar or DL Number"
                                className="h-10 rounded-xl bg-slate-50/80 border-slate-200 text-xs sm:text-sm font-semibold focus:bg-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <Label htmlFor="address" className="text-[11px] font-semibold text-slate-600">Address (Optional)</Label>
                            <Textarea
                              id="address"
                              value={customerData.address}
                              onChange={(e) =>
                                setCustomerData({ ...customerData, address: e.target.value })
                              }
                              placeholder="Your current or pickup address"
                              rows={2}
                              className="rounded-xl bg-slate-50/80 border-slate-200 text-xs sm:text-sm font-semibold focus:bg-white py-2"
                            />
                          </div>
                        </div>

                        {/* 3. Document Upload (Compact Touch Cards) */}
                        <div className="border-t border-slate-100 pt-3.5 space-y-2">
                          <Label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-blue-600" />
                            <span>ID Proof Documents *</span>
                          </Label>
                          <p className="text-[11px] text-slate-400">
                            Upload photos of Aadhaar Card and Driving License for verification.
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            {/* Aadhaar Upload */}
                            <label
                              className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 border-dashed transition-all cursor-pointer ${customerData.aadhaar_image
                                ? "border-emerald-500 bg-emerald-50/50"
                                : "border-slate-300 bg-slate-50/80 hover:bg-slate-100/80"
                                }`}
                            >
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) =>
                                  setCustomerData({
                                    ...customerData,
                                    aadhaar_image: e.target.files[0],
                                  })
                                }
                              />
                              {customerData.aadhaar_image ? (
                                <>
                                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-emerald-800 truncate">
                                      {customerData.aadhaar_image.name}
                                    </p>
                                    <span className="text-[10px] text-emerald-600">Aadhaar uploaded</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-5 h-5 text-slate-400 shrink-0 ml-1" />
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-700">Upload Aadhaar Photo *</p>
                                    <span className="text-[10px] text-slate-400">JPG or PNG</span>
                                  </div>
                                </>
                              )}
                            </label>

                            {/* License Upload */}
                            <label
                              className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 border-dashed transition-all cursor-pointer ${customerData.license_image
                                ? "border-emerald-500 bg-emerald-50/50"
                                : "border-slate-300 bg-slate-50/80 hover:bg-slate-100/80"
                                }`}
                            >
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) =>
                                  setCustomerData({
                                    ...customerData,
                                    license_image: e.target.files[0],
                                  })
                                }
                              />
                              {customerData.license_image ? (
                                <>
                                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-emerald-800 truncate">
                                      {customerData.license_image.name}
                                    </p>
                                    <span className="text-[10px] text-emerald-600">License uploaded</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Upload className="w-5 h-5 text-slate-400 shrink-0 ml-1" />
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-700">Upload License Photo *</p>
                                    <span className="text-[10px] text-slate-400">JPG or PNG</span>
                                  </div>
                                </>
                              )}
                            </label>
                          </div>
                        </div>

                        {/* 4. Terms Checkbox */}
                        <div className="border-t border-slate-100 pt-3">
                          <div className="flex items-start gap-2.5">
                            <input
                              id="termsCheck"
                              type="checkbox"
                              className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-blue-600 cursor-pointer shrink-0"
                              checked={termsAccepted}
                              onChange={(e) => setTermsAccepted(e.target.checked)}
                              required
                            />
                            <Label
                              htmlFor="termsCheck"
                              className="text-[11px] text-slate-600 leading-normal cursor-pointer font-medium"
                            >
                              I agree to the{" "}
                              <span
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActivePolicy("terms");
                                }}
                                className="text-blue-600 font-bold hover:underline cursor-pointer"
                              >
                                Terms & Conditions
                              </span>
                              ,{" "}
                              <span
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActivePolicy("privacy");
                                }}
                                className="text-blue-600 font-bold hover:underline cursor-pointer"
                              >
                                Privacy Policy
                              </span>
                              , and{" "}
                              <span
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActivePolicy("refund");
                                }}
                                className="text-blue-600 font-bold hover:underline cursor-pointer"
                              >
                                Refund Policy
                              </span>
                              .
                            </Label>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-1">
                          <Button
                            type="submit"
                            disabled={isAvailable === false || checking || !termsAccepted}
                            className="w-full h-11 sm:h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer"
                          >
                            {isAvailable === false
                              ? "Vehicle Not Available for Selected Slot"
                              : "Continue to Review & Pay ₹200 →"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* STEP 2: Review Booking & Cashfree Token Payment */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
                    <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-3.5 sm:p-5 flex flex-row items-center justify-between">
                      <CardTitle className="text-slate-900 font-bold text-sm sm:text-base flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span>Confirm Your Booking</span>
                      </CardTitle>
                      <button
                        onClick={() => setStep(1)}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Edit Details
                      </button>
                    </CardHeader>

                    <CardContent className="p-3.5 sm:p-6 space-y-4">
                      {/* Trip Summary Details */}
                      <div className="grid grid-cols-2 gap-2.5 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                            Customer
                          </span>
                          <p className="font-extrabold text-slate-900 truncate">{customerData.name}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                            Phone
                          </span>
                          <p className="font-extrabold text-slate-900 truncate">+91 {customerData.phone}</p>
                        </div>
                        <div className="border-t border-slate-200/60 pt-2">
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                            Pickup
                          </span>
                          <p className="font-extrabold text-slate-900">
                            {format(new Date(startDate), "dd MMM, hh:mm a")}
                          </p>
                        </div>
                        <div className="border-t border-slate-200/60 pt-2">
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                            Return
                          </span>
                          <p className="font-extrabold text-slate-900">
                            {format(new Date(endDate), "dd MMM, hh:mm a")}
                          </p>
                        </div>
                      </div>

                      {/* Fare Breakdown */}
                      <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 space-y-2.5 text-xs">
                        <div className="flex justify-between items-center text-slate-600">
                          <span>Rental Amount ({durationFormatted})</span>
                          <span className="font-bold text-slate-900">₹{calculatePrice(false)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-600">
                          <span>Security Deposit (Refundable)</span>
                          <span className="font-bold text-slate-900">₹{SECURITY_DEPOSIT}</span>
                        </div>
                        <div className="border-t border-slate-100 pt-2 flex justify-between items-center font-bold text-slate-800 text-sm">
                          <span>Total Bill</span>
                          <span className="text-slate-900">₹{calculatePrice(false) + SECURITY_DEPOSIT}</span>
                        </div>

                        {/* Token Breakdown */}
                        <div className="border-t border-slate-200 border-dashed pt-2.5 space-y-2">
                          <div className="flex justify-between items-center bg-blue-50/70 p-2.5 rounded-lg border border-blue-200/70">
                            <div>
                              <span className="text-[10px] font-extrabold uppercase text-blue-800 tracking-wider block">
                                Booking Amount (Pay Online Now)
                              </span>
                              <span className="text-[11px] text-slate-500">
                                Locks vehicle immediately
                              </span>
                            </div>
                            <span className="text-lg font-black text-blue-700">₹200</span>
                          </div>

                          <div className="flex justify-between items-center px-1">
                            <span className="text-slate-500 font-medium">Remaining Due at Pickup</span>
                            <span className="font-extrabold text-slate-900">
                              ₹{calculatePrice(false) + SECURITY_DEPOSIT - 200}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Deposit Alert */}
                      <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex gap-2 text-amber-900 text-[11px]">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                          <strong>Deposit Note:</strong> The ₹{SECURITY_DEPOSIT} security deposit is 100% refundable when you return the vehicle in good condition.
                        </p>
                      </div>

                      {/* Optional Notes */}
                      <div className="space-y-1">
                        <Label htmlFor="trip_notes" className="text-xs font-semibold text-slate-700">
                          Additional Notes (Optional)
                        </Label>
                        <Textarea
                          id="trip_notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Special requests or instructions..."
                          rows={2}
                          className="rounded-xl bg-slate-50/80 border-slate-200 text-xs font-semibold focus:bg-white py-2"
                        />
                      </div>

                      {/* Turnstile */}
                      <div className="flex flex-col items-center justify-center pt-1">
                        <Turnstile
                          siteKey={
                            import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY ||
                            "1x00000000000000000000AA"
                          }
                          options={{
                            theme: "light",
                            retry: "auto",
                            retryInterval: 1000,
                            refreshExpired: "auto",
                          }}
                          onSuccess={(token) => setTurnstileToken(token)}
                          onError={() => setTurnstileToken("cf_client_fallback")}
                          onExpire={() => setTurnstileToken("")}
                        />
                      </div>

                      {/* Step 2 Actions */}
                      <div className="flex gap-2.5 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="h-11 px-4 rounded-xl font-bold border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
                          disabled={isSubmitting}
                        >
                          Back
                        </Button>
                        <Button
                          type="button"
                          onClick={handleBookingSubmit}
                          disabled={isSubmitting}
                          className="flex-1 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-1.5 justify-center">
                              <div className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                              <span>Processing...</span>
                            </div>
                          ) : (
                            "Pay ₹200 Token via Cashfree →"
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE STICKY BOTTOM CHECKOUT BAR (<lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Pay Online Now
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-blue-700">₹200</span>
              <span className="text-[10px] text-slate-500 font-medium">
                Token Lock
              </span>
            </div>
          </div>

          {step === 1 ? (
            <Button
              type="button"
              onClick={handleCustomerSubmit}
              disabled={isAvailable === false || checking || !termsAccepted}
              className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer flex-1"
            >
              Continue →
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleBookingSubmit}
              disabled={isSubmitting}
              className="h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer flex-1"
            >
              {isSubmitting ? "Processing..." : "Pay ₹200 Token"}
            </Button>
          )}
        </div>
      </div>

      <Footer />
      <MobileBottomNav />

      {/* Policy Modal Dialog */}
      <AnimatePresence>
        {activePolicy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 w-full max-w-xl max-h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-lg font-black text-slate-900">
                  {POLICY_DATA[activePolicy].title}
                </h3>
                <button
                  onClick={() => setActivePolicy(null)}
                  className="p-1.5 hover:bg-slate-200 rounded-full text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs text-slate-600 leading-relaxed">
                {POLICY_DATA[activePolicy].content.map((sec, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      {sec.title}
                    </h4>
                    <ul className="space-y-1 pl-4 list-disc text-slate-600">
                      {sec.items.map((item, j) => (
                        <li key={j} className="marker:text-blue-600">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
                <Button
                  onClick={() => setActivePolicy(null)}
                  className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
