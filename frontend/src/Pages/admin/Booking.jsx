import { useState, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "../../components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  useBookings,
  useUpdateBookingStatus,
  useCreateBooking,
  useUpdateBooking,
  useAdminCreateBooking,
  useAssignBike,
  useRecordPayment,
} from "../../hooks/useBooking";
import { useBikes } from "../../hooks/useBikes";
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
} from "../../hooks/useCustomer";
import {
  Plus,
  Search,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Edit,
  Upload,
  Fuel,
  Globe,
  Store,
  User,
  MapPin,
  CreditCard,
  IndianRupee,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Shield,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Bike,
  Sparkles,
  Check,
  X,
  FileText,
  UserPlus,
  Users,
  Filter,
  Eye,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";

import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "../../lib/AuthProvider";
import { useAdminArea } from "../../lib/AreaContext";
import { useEffect } from "react";
import { useBikeAvailability } from "../../hooks/useBikeAvailability";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import html2canvas from "html2canvas";


const statusColors = {
  pending:
    "bg-yellow-500/15 text-yellow-700 border-yellow-300 dark:text-yellow-400",
  confirmed: "bg-blue-500/15 text-blue-700 border-blue-300 dark:text-blue-400",
  active: "bg-green-500/15 text-green-700 border-green-300 dark:text-green-400",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-red-500/15 text-red-700 border-red-300 dark:text-red-400",
};

const sourceColors = {
  online: "bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400",
  admin:
    "bg-orange-500/10 text-orange-700 border-orange-200 dark:text-orange-400",
  partner:
    "bg-purple-500/10 text-purple-700 border-purple-200 dark:text-purple-400",
};

const sourceIcons = {
  online: <Globe className="w-3 h-3" />,
  admin: <Store className="w-3 h-3" />,
  partner: <User className="w-3 h-3" />,
};

const paymentStatusColors = {
  paid: "bg-green-500/10 text-green-700 border-green-200 dark:text-green-400",
  pending:
    "bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:text-yellow-400",
  failed: "bg-red-500/10 text-red-700 border-red-200 dark:text-red-400",
};

const statusActions = {
  pending: [
    {
      next: "confirmed",
      label: "Confirm",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      next: "cancelled",
      label: "Cancel",
      icon: <XCircle className="w-4 h-4" />,
    },
  ],
  confirmed: [
    {
      next: "active",
      label: "Start Rental",
      icon: <Play className="w-4 h-4" />,
    },
    {
      next: "cancelled",
      label: "Cancel",
      icon: <XCircle className="w-4 h-4" />,
    },
  ],
  active: [
    {
      next: "completed",
      label: "Complete",
      icon: <CheckCircle className="w-4 h-4" />,
    },
  ],
  completed: [],
  cancelled: [],
};

const getSourceLabel = (source) => {
  if (source === "online") return "Website";
  if (source === "admin") return "Offline";
  if (source === "partner") return "Partner";
  return source;
};

const emptyFormData = {
  bike_id: "",
  customer_id: "",
  start_datetime: "",
  end_datetime: "",
  notes: "",
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  customer_location: "",
  is_new_customer: false,
  aadhaar_file: null,
  license_file: null,
  partner_name: "",
  lead_source: "other",
  source_name: "",
  rental_type: "daily",
  total_amount: "",
  paid_amount: "",
  deposit_amount: "",
  reference_partner_share: "",
  provider_partner_share: "",
  fuel_quantity: "",
  account_manager: "",
  remarks: "",
  payment_method: "cash",
};

const emptyCompletionData = {
  fuel_in_liters: "",
  penalty_amount: "",
  challan_amount: "",
  damage_cost: "",
  payment_method: "cash",
  remarks: "",
};

// const roundToHour = (dateTimeStr) => {
//   if (!dateTimeStr) return "";
//   const date = new Date(dateTimeStr);
//   const minutes = date.getMinutes();

//   // If there are any minutes, round up to the next full hour
//   if (minutes > 0) {
//     date.setMinutes(0);
//     date.setHours(date.getHours() + 1);
//   }

//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");
//   const hours = String(date.getHours()).padStart(2, "0");

//   return `${year}-${month}-${day}T${hours}:00`;
// };

// const roundToHour = (dateTimeStr) => {
//   if (!dateTimeStr) return "";
//   const date = new Date(dateTimeStr);

//   // Convert to IST context if necessary before rounding
//   const minutes = date.getMinutes();
//   if (minutes > 0) {
//     date.setMinutes(0);
//     date.setHours(date.getHours() + 1);
//   }

//   // Format specifically for the datetime-local input which expects YYYY-MM-DDTHH:mm
//   const options = {
//     timeZone: "Asia/Kolkata",
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: false,
//   };

//   const formatter = new Intl.DateTimeFormat("en-IN", options);
//   const parts = formatter.formatToParts(date);
//   const f = (type) => parts.find((p) => p.type === type).value;

//   return `${f("year")}-${f("month")}-${f("day")}T${f("hour")}:00`;
// };

const roundToHour = (dateTimeStr) => {
  if (!dateTimeStr) return "";
  const date = new Date(dateTimeStr);

  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  // Only run rounding logic if it's NOT exactly :00 or :30
  if (minutes !== 0 && minutes !== 30) {
    if (minutes < 30) {
      // If 10:01 - 10:29 -> 10:30
      date.setMinutes(30);
    } else {
      // If 10:31 - 10:59 -> 11:00
      date.setMinutes(0);
      date.setHours(date.getHours() + 1);
    }
  }

  // Always reset seconds/ms to ensure 10:30:05 becomes 10:30:00
  date.setSeconds(0);
  date.setMilliseconds(0);

  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat("en-IN", options);
  const parts = formatter.formatToParts(date);
  const f = (type) => parts.find((p) => p.type === type).value;

  return `${f("year")}-${f("month")}-${f("day")}T${f("hour")}:${f("minute")}`;
};


// 🎯 Centralized unified financial calculations from lib
export {
  NEW_FLOW_CUTOFF,
  isBookingNewFlow,
  isNewFlowBooking,
  getBookingFinancials,
} from "../../lib/bookingFinancials";
import {
  NEW_FLOW_CUTOFF,
  isBookingNewFlow,
  getBookingFinancials,
} from "../../lib/bookingFinancials";

export default function Bookings() {
  const { areas, selectedAreaIds } = useAdminArea();

  const getBookingAreaName = (booking) => {
    if (!booking) return null;
    if (booking.bike_id?.area_id?.name) return booking.bike_id.area_id.name;
    if (booking.cluster_id?.area_id?.name) return booking.cluster_id.area_id.name;
    const bId = booking.bike_id?._id || booking.bike_id;
    if (bId && bikes && bikes.length > 0) {
      const matchBike = bikes.find((b) => b._id === bId || String(b._id) === String(bId));
      if (matchBike?.area_id?.name) return matchBike.area_id.name;
      const aId = matchBike?.area_id?._id || matchBike?.area_id;
      if (aId && areas && areas.length > 0) {
        const matchArea = areas.find((a) => a._id === aId || String(a._id) === String(aId));
        if (matchArea?.name) return matchArea.name;
      }
    }
    if (booking.customer_location && booking.customer_location.trim() !== "") {
      return booking.customer_location;
    }
    return null;
  };
  const [isOpen, setIsOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [aadhaarPreview, setAadhaarPreview] = useState(null);
  const [licensePreview, setLicensePreview] = useState(null);
  const aadhaarInputRef = useRef(null);
  const licenseInputRef = useRef(null);
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [bikeSearch, setBikeSearch] = useState("");
  const [paymentPreview, setPaymentPreview] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [extraDocFiles, setExtraDocFiles] = useState([]); // Binary files
  const [extraDocPreviews, setExtraDocPreviews] = useState([]); // UI previews

  const [searchParams] = useSearchParams();

  const [extendDialog, setExtendDialog] = useState(null);

  const [extendData, setExtendData] = useState({
    new_end_datetime: "",
    extra_amount: "",
  });

  const [extendMessage, setExtendMessage] = useState("");
  const [isExtendAvailable, setIsExtendAvailable] = useState(null);

  const queryClient = useQueryClient();
  // Completion dialog
  const [completionDialog, setCompletionDialog] = useState(null);
  const [completionData, setCompletionData] = useState(emptyCompletionData);

  // Start ride dialog
  const [startRideDialog, setStartRideDialog] = useState(null);
  const [startRideData, setStartRideData] = useState({ fuel_out_liters: "" });

  // State to hold the actively targeted booking data for the background downloader


  const { data: bookings, isLoading } = useBookings(activeTab);

  // const handleExport = () => {
  //   if (!bookings || bookings.length === 0) {
  //     toast.error("No data to export");
  //     return;
  //   }

  //   const exportData = bookings.map((b) => ({
  //     Booking_ID: b._id,
  //     Customer_Name: b.customer_name || b.customers?.name,
  //     Phone: b.contact_number || b.customers?.phone,
  //     Email: b.customer_email || b.customers?.email,
  //     Bike: b.bikes?.model,
  //     Number_Plate: b.bikes?.number_plate,
  //     Start_Date: format(new Date(b.start_datetime), "dd-MM-yyyy HH:mm"),
  //     End_Date: format(new Date(b.end_datetime), "dd-MM-yyyy HH:mm"),
  //     Status: b.status,
  //     Payment_Status: b.payment_status,
  //     Rental_Type: b.rental_type,
  //     Total_Amount: b.total_amount,
  //     Deposit: b.deposit_amount,
  //     Fuel_Quantity: b.fuel_quantity,
  //     Fuel_Out: b.fuel_out_liters,
  //     Fuel_In: b.fuel_in_liters,
  //     Penalty: b.penalty_amount,
  //     Challan: b.challan_amount,
  //     Damage: b.damage_cost,
  //     Payment_Method: b.payment_method,
  //     Source: b.booking_source,
  //     Lead_Source: b.lead_source,
  //     Source_Name: b.source_name,
  //     Account_Manager: b.account_manager,
  //     Notes: b.notes,
  //     Remarks: b.remarks,
  //   }));

  //   const worksheet = XLSX.utils.json_to_sheet(exportData);
  //   const workbook = XLSX.utils.book_new();

  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

  //   const excelBuffer = XLSX.write(workbook, {
  //     bookType: "xlsx",
  //     type: "array",
  //   });

  //   const fileData = new Blob([excelBuffer], {
  //     type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  //   });

  //   saveAs(fileData, `Bookings_${Date.now()}.xlsx`);
  // };

  const handleExport = () => {
    if (!bookings || bookings.length === 0) {
      toast.error("No data to export");
      return;
    }



    const exportData = bookings.map((b) => {
      const targetBikeId = b.bike_id?._id || b.bike_id;
      const matchingBike = bikes?.find((bike) => bike._id === targetBikeId);

      // 2️⃣ EXTRACT THE OWNER AND BACKUPS Safely
      const bikeOwner = matchingBike?.bike_owner || b.bikes?.bike_owner || "";

      return {
        Booking_ID: b._id,
        Customer_Name: b.customer_name || b.customers?.name,
        Phone: b.contact_number || b.customers?.phone,
        Email: b.customer_email || b.customers?.email,
        Bike: b.bikes?.model,
        Number_Plate: b.bikes?.number_plate,

        Owner: bikeOwner,
        // Start_Date: format(new Date(b.start_datetime), "dd-MM-yyyy HH:mm"),
        Start_Date: new Date(b.start_datetime).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        // End_Date: format(new Date(b.end_datetime), "dd-MM-yyyy HH:mm"),
        End_Date: new Date(b.end_datetime).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),

        Status: b.status,
        Payment_Status: b.payment_status,
        Rental_Type: b.rental_type,
        Total_Amount: b.total_amount,
        Deposit: b.deposit_amount,
        Fuel_Quantity: b.fuel_quantity,
        Fuel_Out: b.fuel_out_liters,
        Fuel_In: b.fuel_in_liters,
        Penalty: b.penalty_amount,
        Challan: b.challan_amount,
        Damage: b.damage_cost,
        Payment_Method: b.payment_method,
        Source: b.booking_source,
        Lead_Source: b.lead_source,
        Source_Name: b.source_name,
        Account_Manager: b.account_manager,
        Notes: b.notes,
        Remarks: b.remarks,
      };
    });


    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `Bookings_${Date.now()}.xlsx`);
  };

  const { data: bikes } = useBikes();

  const [assignDialog, setAssignDialog] = useState(null);
  const [assignBikeId, setAssignBikeId] = useState("");
  const assignBikeMutation = useAssignBike();
  const handleAssignBike = async () => {
    if (!assignDialog || !assignBikeId) return;
    try {
      await assignBikeMutation.mutateAsync({
        id: assignDialog._id,
        bike_id: assignBikeId,
      });
      setAssignDialog(null);
      setAssignBikeId("");
    } catch (err) {
      console.error(err);
    }
  };
  const assignableBikes = useMemo(() => {
    if (!assignDialog || !assignDialog.cluster_id || !bikes) return [];
    const clusterBikeIds = assignDialog.cluster_id.bikes?.map(b => String(b._id || b)) || [];
    return bikes.filter(
      (b) => clusterBikeIds.includes(String(b._id)) && b.status === "available"
    );
  }, [assignDialog, bikes]);


  const { data: customers } = useCustomers();
  const updateStatus = useUpdateBookingStatus();
  const createBooking = useCreateBooking();
  const updateBooking = useUpdateBooking();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  // Inside Booking.jsx
  const adminCreateMutation = useAdminCreateBooking();
  // Then call: adminCreateMutation.mutateAsync(dataToSend);
  const { user } = useAuth();

  // Add this line below your other useState/useMemo hooks
  const [uploading, setUploading] = useState(false);
  const isEdit = !!editingBooking;
  const [isAvailable, setIsAvailable] = useState(null);
  const [availabilityMessage, setAvailabilityMessage] = useState(null);
  const { checkAvailability, checking } = useBikeAvailability(); // Assuming you use the same hook

  const [formData, setFormData] = useState(emptyFormData);

  const createCustomerMutation = useCreateCustomer();
  const adminCreateBookingMutation = useAdminCreateBooking();
  const updateCustomerMutation = useUpdateCustomer();
  const recordPaymentMutation = useRecordPayment();

  // 🎯 Payment Filter State: all | pending_due | partial | paid
  const [paymentFilter, setPaymentFilter] = useState("all");

  // 🎯 Collect Payment Modal State
  const [collectPaymentBooking, setCollectPaymentBooking] = useState(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState("");
  const [paymentMethodInput, setPaymentMethodInput] = useState("cash");
  const [paymentNotesInput, setPaymentNotesInput] = useState("");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);


  const [downloadingBooking, setDownloadingBooking] = useState(null);
  const [isGeneratingBill, setIsGeneratingBill] = useState(false); // 👈 NEW LOADING STATE

  const [fetchingBillId, setFetchingBillId] = useState(null);

  // ====== NEW INVOICE STATES & HANDLER ======
  const [showInvoice, setShowInvoice] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState(null);

  const handleDownloadDirectInvoice = (booking) => {
    // Dynamically look up details from your state definitions
    const targetBikeId = booking.bike_id?._id || booking.bike_id;
    const matchingBike = bikes?.find((bike) => bike._id === targetBikeId);

    // Build invoice payload matching standard receipt component schema structures
    setGeneratedInvoice({
      bookingId: booking._id,
      customerName: booking.customer_name || booking.customers?.name || "Customer",
      phone: booking.contact_number || booking.customers?.phone || "-",
      bike: {
        model: (booking.vehicle_make_model || matchingBike?.model || matchingBike?.bike_name || "Bike").replace(/^undefined\s*/i, "").trim(),
        number_plate: matchingBike?.number_plate || booking.bikes?.number_plate || ""
      },
      startDate: booking.start_datetime,
      endDate: booking.end_datetime,
      amount: getBookingFinancials(booking).totalDue,
      deposit: booking.deposit_amount || 0,
      paymentMethod: booking.payment_method || "cash",
      status: booking.status
    });

    setShowInvoice(true);
    toast.success("Invoice view loaded successfully!");
  };

  // Background canvas processing effect for immediate receipt layout downloading
  // useEffect(() => {
  //   if (!downloadingBooking) return;

  //   const generateDirectImage = async () => {
  //     setIsGeneratingBill(true); // 👈 1. START LOADING SPINNER NOW
  //     const element = document.getElementById("direct-bill-hidden-node");
  //     if (!element) {
  //       setDownloadingBooking(null);
  //       return;
  //     }

  //     try {
  //       const { default: html2canvas } = await import("html2canvas");

  //       const canvas = await html2canvas(element, {
  //         scale: 3, // Premium quality print multiplier
  //         useCORS: true,
  //         logging: false,
  //         backgroundColor: "#ffffff",
  //         onclone: (clonedDoc) => {
  //           const receipt = clonedDoc.getElementById("direct-bill-hidden-node");
  //           if (!receipt) return;

  //           // Force paper print guidelines 
  //           receipt.style.backgroundColor = "white";
  //           receipt.style.color = "black";
  //           receipt.style.borderRadius = "0px";
  //           receipt.style.border = "none";
  //           receipt.style.boxShadow = "none";

  //           // Hide decorative web components
  //           const webHeader = clonedDoc.querySelector(".gradient-sunset-direct");
  //           if (webHeader) webHeader.style.display = "none";

  //           // Enforce layout parameters for the Tax Invoice header block
  //           const printHeader = clonedDoc.querySelector(".print-header-direct");
  //           if (printHeader) {
  //             printHeader.style.setProperty("display", "flex", "important");
  //             printHeader.style.flexDirection = "row";
  //             printHeader.style.justifyContent = "space-between";
  //             printHeader.style.padding = "2rem";
  //             printHeader.style.borderBottom = "4px solid black";
  //             printHeader.querySelectorAll("h1, h2, p").forEach((el) => (el.style.color = "black"));
  //           }

  //           const content = clonedDoc.querySelector(".content-area-direct");
  //           if (content) {
  //             content.style.backgroundColor = "white";
  //             content.style.padding = "2rem";
  //           }

  //           // Standardize copy presentation to pure black ink
  //           const allText = clonedDoc.querySelectorAll("p, span, h1, h2, h4, div");
  //           allText.forEach((text) => {
  //             text.style.color = "black";
  //             text.style.borderColor = "black";
  //           });

  //           // Outline wrapper styling configuration
  //           const amountBox = clonedDoc.querySelector(".amount-box-direct");
  //           if (amountBox) {
  //             amountBox.style.backgroundColor = "white";
  //             amountBox.style.border = "2px solid black";
  //             amountBox.style.borderRadius = "0px";
  //             amountBox.style.padding = "2rem";
  //           }

  //           const instructions = clonedDoc.querySelector(".instructions-direct");
  //           if (instructions) {
  //             instructions.style.backgroundColor = "white";
  //             instructions.style.border = "1px solid black";
  //             instructions.style.color = "black";
  //           }

  //           const badge = clonedDoc.querySelector(".badge-direct");
  //           if (badge) {
  //             badge.style.setProperty("background-color", "white", "important");
  //             badge.style.setProperty("background-image", "none", "important");
  //             badge.style.setProperty("color", "black", "important");
  //             badge.style.setProperty("border", "1px solid black", "important");
  //           }
  //         },
  //       });

  //       // Generate download action
  //       const image = canvas.toDataURL("image/png", 1.0);
  //       const link = document.createElement("a");
  //       link.href = image;
  //       link.download = `Receipt-${downloadingBooking._id}.png`;
  //       link.click();
  //       toast.success("Bill downloaded successfully!");
  //     } catch (err) {
  //       console.error("Direct download execution failed:", err);
  //       toast.error("Could not export receipt image file.");
  //     } finally {
  //       // Reset state tracker to safely cleanly unmount background DOM context structure
  //       setDownloadingBooking(null);
  //       setIsGeneratingBill(false); // 👈 1. STOP LOADING SPINNER NOW
  //     }
  //   };

  //   // Give React sufficient cycle overhead layout tick timing to render element nodes cleanly
  //   const latencyTimeout = setTimeout(() => {
  //     generateDirectImage();
  //   }, 150);

  //   return () => clearTimeout(latencyTimeout);
  // }, [downloadingBooking, bikes]);

  // Background canvas processing effect for immediate receipt layout downloading
  useEffect(() => {
    if (!downloadingBooking) return;

    const generateDirectImage = async () => {
      setIsGeneratingBill(true); // START LOADING SPINNER NOW
      const element = document.getElementById("direct-bill-hidden-node");
      if (!element) {
        setDownloadingBooking(null);
        return;
      }

      let iframe = null;
      try {
        // 1. Create a hidden isolated iframe to render ONLY the bill element.
        // This prevents html2canvas from traversing the main page's massive DOM.
        iframe = document.createElement("iframe");
        iframe.style.position = "absolute";
        iframe.style.top = "-9999px";
        iframe.style.left = "-9999px";
        iframe.style.width = "500px";
        iframe.style.visibility = "hidden";
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow.document;

        // 2. Copy all stylesheets and Tailwind styles from parent document to the iframe
        const styles = document.querySelectorAll("style, link[rel='stylesheet']");
        styles.forEach((style) => {
          doc.head.appendChild(style.cloneNode(true));
        });

        // 3. Clone and insert the bill element inside the iframe body
        const clonedElement = element.cloneNode(true);
        clonedElement.style.position = "static";
        clonedElement.style.margin = "0";
        doc.body.appendChild(clonedElement);

        // 4. Wait for any images (e.g. logo) inside the iframe to load
        const images = Array.from(doc.querySelectorAll("img"));
        await Promise.all(
          images.map((img) => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve;
            });
          })
        );

        // 5. Run html2canvas on the isolated element inside the iframe context
        const canvas = await html2canvas(clonedElement, {
          scale: 2, // Optimized resolution multiplier (faster than scale 3)
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          onclone: (clonedDoc) => {
            const receipt = clonedDoc.getElementById("direct-bill-hidden-node");
            if (!receipt) return;

            // Force paper print guidelines
            receipt.style.backgroundColor = "white";
            receipt.style.color = "black";
            receipt.style.borderRadius = "0px";
            receipt.style.border = "none";
            receipt.style.boxShadow = "none";

            // Hide decorative web components
            const webHeader = clonedDoc.querySelector(
              ".gradient-sunset-direct",
            );
            if (webHeader) webHeader.style.display = "none";

            // Enforce layout parameters for the Tax Invoice header block
            const printHeader = clonedDoc.querySelector(".print-header-direct");
            if (printHeader) {
              printHeader.style.setProperty("display", "flex", "important");
              printHeader.style.flexDirection = "row";
              printHeader.style.justifyContent = "space-between";
              printHeader.style.padding = "2rem";
              printHeader.style.borderBottom = "4px solid black";
              printHeader
                .querySelectorAll("h1, h2, p")
                .forEach((el) => (el.style.color = "black"));
            }

            const content = clonedDoc.querySelector(".content-area-direct");
            if (content) {
              content.style.backgroundColor = "white";
              content.style.padding = "2rem";
            }

            // Standardize copy presentation to pure black ink
            const allText = clonedDoc.querySelectorAll(
              "p, span, h1, h2, h4, div",
            );
            allText.forEach((text) => {
              text.style.color = "black";
              text.style.borderColor = "black";
            });

            // Outline wrapper styling configuration
            const amountBox = clonedDoc.querySelector(".amount-box-direct");
            if (amountBox) {
              amountBox.style.backgroundColor = "white";
              amountBox.style.border = "2px solid black";
              amountBox.style.borderRadius = "0px";
              amountBox.style.padding = "2rem";
            }

            const instructions = clonedDoc.querySelector(
              ".instructions-direct",
            );
            if (instructions) {
              instructions.style.backgroundColor = "white";
              instructions.style.border = "1px solid black";
              instructions.style.color = "black";
            }

            const badge = clonedDoc.querySelector(".badge-direct");
            if (badge) {
              badge.style.setProperty("background-color", "white", "important");
              badge.style.setProperty("background-image", "none", "important");
              badge.style.setProperty("color", "black", "important");
              badge.style.setProperty("border", "1px solid black", "important");
            }
          },
        });

        // Generate download action
        const image = canvas.toDataURL("image/png", 1.0);
        const link = document.createElement("a");
        link.href = image;
        link.download = `Receipt-${downloadingBooking._id}.png`;
        link.click();
        toast.success("Bill downloaded successfully!");
      } catch (err) {
        console.error("Direct download execution failed:", err);
        toast.error("Could not export receipt image file.");
      } finally {
        // Cleanup temporary iframe
        if (iframe && iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
        setDownloadingBooking(null);
        setIsGeneratingBill(false);
      }
    };

    // Give React sufficient cycle overhead layout tick timing to render element nodes cleanly
    const latencyTimeout = setTimeout(() => {
      generateDirectImage();
    }, 150);

    return () => clearTimeout(latencyTimeout);
  }, [downloadingBooking, bikes]);

  const handleBillClick = (booking) => {
    setFetchingBillId(booking._id);
    setIsGeneratingBill(true);
    setDownloadingBooking(booking);
  };


  // Add this inside your Bookings component
  useEffect(() => {
    if (!isOpen) {
      setBikeSearch(""); // Reset bike search when the dialog closes
    }
  }, [isOpen]);

  useEffect(() => {
    if (!editingBooking) {
      setBikeSearch("");
    }
  }, [editingBooking]);

  // useEffect(() => {
  //   const checkDates = async () => {
  //     // Determine which data to use (Edit form or Create form)
  //     const activeData = editingBooking ? editFormData : formData;

  //     if (
  //       !activeData.bike_id ||
  //       !activeData.start_datetime ||
  //       !activeData.end_datetime
  //     ) {
  //       setAvailabilityMessage(null);
  //       setIsAvailable(null);
  //       return;
  //     }

  //     const start = new Date(activeData.start_datetime);
  //     const end = new Date(activeData.end_datetime);

  //     if (end <= start) {
  //       setAvailabilityMessage("⚠️ Return date must be after pickup date");
  //       setIsAvailable(false);
  //       return;
  //     }

  //     // Call API
  //     const result = await checkAvailability(activeData.bike_id, start, end);

  //     // If we are editing, we should ignore the "overlap" if it's the current booking itself
  //     if (!result.isAvailable && result.bookingId === editingBooking) {
  //       setAvailabilityMessage("✅ This is your current slot");
  //       setIsAvailable(true);
  //       return;
  //     }

  //     if (!result.isAvailable && result.bookedFrom) {
  //       const fromDate = format(
  //         new Date(result.bookedFrom),
  //         "dd/MM/yyyy hh:mm a",
  //       );
  //       const toDate = format(new Date(result.bookedTo), "dd/MM/yyyy hh:mm a");
  //       setAvailabilityMessage(`❌ Already booked: ${fromDate} to ${toDate}`);
  //       setIsAvailable(false);
  //     } else {
  //       setAvailabilityMessage(
  //         result.isAvailable ? "✅ Bike is available" : result.message,
  //       );
  //       setIsAvailable(result.isAvailable);
  //     }
  //   };

  //   checkDates();
  // }, [
  //   formData.bike_id,
  //   formData.start_datetime,
  //   formData.end_datetime,
  //   editingBooking,
  //   checkAvailability,
  // ]);

  const handleCreateCustomer = async (e) => {
    e.preventDefault();

    // 1. Prepare Customer FormData
    const customerData = new FormData();
    customerData.append("name", newCustomer.name);
    customerData.append("phone", newCustomer.phone);
    customerData.append("email", newCustomer.email);
    // Add your files
    if (newCustomer.aadhaar_image)
      customerData.append("aadhaar_image", newCustomer.aadhaar_image);
    if (newCustomer.license_image)
      customerData.append("license_image", newCustomer.license_image);

    try {
      setUploading(true);

      // 2. CREATE CUSTOMER AND WAIT
      // mutateAsync returns the 'customer' object from your backend res.json(customer)
      const savedCustomer =
        await createCustomerMutation.mutateAsync(customerData);

      // 3. UPDATE BOOKING FORM STATE IMMEDIATELY
      // We put the new ID and details directly into the booking formData
      setFormData((prev) => ({
        ...prev,
        customer_id: savedCustomer._id,
        customer_name: savedCustomer.name,
        contact_number: savedCustomer.phone,
      }));

      toast.success(`Customer ${savedCustomer.name} created and selected!`);

      // 4. EXIT CUSTOMER FORM
      setShowCustomerForm(false);

      // Optional: If you want to finish the booking AUTOMATICALLY right now:
      // await handleCreateBooking();
    } catch (error) {
      // Error is handled by the hook's onError, but you can add extra logic here
      console.error("Sequence Error:", error);
    } finally {
      setUploading(false);
    }
  };

  // useEffect(() => {
  //   const checkDates = async () => {
  //     // 🚀 DO NOT CHECK when edit form first opens
  //     if (editingBooking && !hasEditedFields) {
  //       setAvailabilityMessage(null);
  //       setIsAvailable(null);
  //       return;
  //     }

  //     if (
  //       !formData.bike_id ||
  //       !formData.start_datetime ||
  //       !formData.end_datetime
  //     ) {
  //       setAvailabilityMessage(null);
  //       setIsAvailable(null);
  //       return;
  //     }

  //     const start = new Date(formData.start_datetime);
  //     const end = new Date(formData.end_datetime);

  //     if (end <= start) {
  //       setAvailabilityMessage("⚠️ Return date must be after pickup date");
  //       setIsAvailable(false);
  //       return;
  //     }

  //     // Note: Ensure your hook is named 'checkAvailability' or 'checkBikeAvailability'
  //     const result = await checkAvailability(formData.bike_id, start, end);
  //     setIsAvailable(result.isAvailable);
  //     setAvailabilityMessage(
  //       result.isAvailable ? "✅ Bike is available" : result.message,
  //     );
  //   };

  //   checkDates();
  // }, [formData.bike_id, formData.start_datetime, formData.end_datetime]);

  // Add this function to handle file to URL conversion for previews

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [`${type}_file`]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "aadhaar") setAadhaarPreview(reader.result);
        if (type === "license") setLicensePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Edit form state
  const [editFormData, setEditFormData] = useState(emptyFormData);
  const [hasEditedFields, setHasEditedFields] = useState(false);
  const [originalBookingData, setOriginalBookingData] = useState(null);

  // useEffect(() => {
  //   const checkDates = async () => {
  //     const activeData = editingBooking ? editFormData : formData;

  //     if (
  //       !activeData.bike_id ||
  //       !activeData.start_datetime ||
  //       !activeData.end_datetime
  //     ) {
  //       setAvailabilityMessage(null);
  //       setIsAvailable(null);
  //       return;
  //     }

  //     const start = new Date(activeData.start_datetime);

  //     const end = new Date(activeData.end_datetime);

  //     if (end <= start) {
  //       setAvailabilityMessage("⚠️ Return date must be after pickup date");
  //       setIsAvailable(false);
  //       return;
  //     }

  //     // ✅ CALL API WITH BOOKING ID
  //     const result = await checkAvailability(
  //       activeData.bike_id,
  //       start,
  //       end,
  //       editingBooking, // 🔥 important
  //     );

  //     // Ignore same booking conflict
  //     if (!result.isAvailable && result.bookingId === editingBooking) {
  //       setAvailabilityMessage("✅ This is your current slot");
  //       setIsAvailable(true);
  //       return;
  //     }

  //     if (!result.isAvailable && result.bookedFrom) {
  //       const fromDate = format(
  //         new Date(result.bookedFrom),
  //         "dd/MM/yyyy hh:mm a",
  //       );

  //       const toDate = format(new Date(result.bookedTo), "dd/MM/yyyy hh:mm a");

  //       setAvailabilityMessage(`❌ Already booked: ${fromDate} to ${toDate}`);

  //       setIsAvailable(false);
  //     } else {
  //       setAvailabilityMessage("✅ Bike is available");

  //       setIsAvailable(true);
  //     }
  //   };

  //   checkDates();
  // }, [
  //   formData.bike_id,
  //   formData.start_datetime,
  //   formData.end_datetime,

  //   editFormData.bike_id,
  //   editFormData.start_datetime,
  //   editFormData.end_datetime,

  //   editingBooking,
  // ]);

  // useEffect(() => {
  //   const checkDates = async () => {
  //     // 🚨 Prevent check when edit first opens
  //     if (editingBooking && !hasEditedFields) {
  //       setAvailabilityMessage(null);
  //       setIsAvailable(null);
  //       return;
  //     }

  //     const activeData = editingBooking ? editFormData : formData;

  //     if (
  //       !activeData.bike_id ||
  //       !activeData.start_datetime ||
  //       !activeData.end_datetime
  //     ) {
  //       setAvailabilityMessage(null);
  //       setIsAvailable(null);
  //       return;
  //     }

  //     const start = new Date(activeData.start_datetime);

  //     const end = new Date(activeData.end_datetime);

  //     if (end <= start) {
  //       setAvailabilityMessage("⚠️ Return date must be after pickup date");
  //       setIsAvailable(false);
  //       return;
  //     }

  //     // ⭐ CRITICAL FIX — Ignore unchanged values
  //     if (
  //       editingBooking &&
  //       originalBookingData &&
  //       activeData.bike_id === originalBookingData.bike_id &&
  //       new Date(activeData.start_datetime).toISOString() ===
  //         new Date(originalBookingData.start_datetime).toISOString() &&
  //       new Date(activeData.end_datetime).toISOString() ===
  //         new Date(originalBookingData.end_datetime).toISOString()
  //     ) {
  //       setAvailabilityMessage(null);
  //       setIsAvailable(null);
  //       return;
  //     }

  //     // 🚀 Call API
  //     const result = await checkAvailability(
  //       activeData.bike_id,
  //       start,
  //       end,
  //       editingBooking,
  //     );

  //     // if (!result.isAvailable && result.bookedFrom) {
  //     //   const fromDate = format(
  //     //     new Date(result.bookedFrom),
  //     //     "dd/MM/yyyy hh:mm a",
  //     //   );

  //     //   const toDate = format(new Date(result.bookedTo), "dd/MM/yyyy hh:mm a");

  //     //   setAvailabilityMessage(`❌ Already booked: ${fromDate} to ${toDate}`);

  //     //   setIsAvailable(false);
  //     // } else {
  //     //   setAvailabilityMessage("✅ Bike is available");

  //     //   setIsAvailable(true);
  //     // }

  //     // 🚨 Ignore SAME booking conflict
  //     if (!result.isAvailable && result.bookingId === editingBooking) {
  //       setAvailabilityMessage(null);
  //       setIsAvailable(true);
  //       return;
  //     }

  //     if (!result.isAvailable && result.bookedFrom) {
  //       const fromDate = format(
  //         new Date(result.bookedFrom),
  //         "dd/MM/yyyy hh:mm a",
  //       );

  //       const toDate = format(new Date(result.bookedTo), "dd/MM/yyyy hh:mm a");

  //       setAvailabilityMessage(`❌ Already booked: ${fromDate} to ${toDate}`);

  //       setIsAvailable(false);
  //     } else {
  //       setAvailabilityMessage("✅ Bike is available");

  //       setIsAvailable(true);
  //     }
  //   };

  //   checkDates();
  // }, [
  //   formData.bike_id,
  //   formData.start_datetime,
  //   formData.end_datetime,

  //   editFormData.bike_id,
  //   editFormData.start_datetime,
  //   editFormData.end_datetime,

  //   editingBooking,
  //   originalBookingData,
  // ]);

  useEffect(() => {
    const checkDates = async () => {
      // 🚨 VERY IMPORTANT
      // Do not check when edit form first opens
      if (editingBooking && !hasEditedFields) {
        setAvailabilityMessage(null);
        setIsAvailable(null);

        return;
      }

      const activeData = editingBooking ? editFormData : formData;

      if (
        !activeData.bike_id ||
        !activeData.start_datetime ||
        !activeData.end_datetime
      ) {
        setAvailabilityMessage(null);
        setIsAvailable(null);
        return;
      }

      const start = new Date(activeData.start_datetime);

      const end = new Date(activeData.end_datetime);

      if (end <= start) {
        setAvailabilityMessage("⚠️ Return date must be after pickup date");

        setIsAvailable(false);
        return;
      }

      // Ignore original unchanged values
      if (
        editingBooking &&
        originalBookingData &&
        activeData.bike_id === originalBookingData.bike_id &&
        activeData.start_datetime === originalBookingData.start_datetime &&
        activeData.end_datetime === originalBookingData.end_datetime
      ) {
        setAvailabilityMessage(null);
        setIsAvailable(null);
        return;
      }

      // Call API

      const result = await checkAvailability(
        activeData.bike_id,
        start,
        end,
        false, // not a cluster booking
        editingBooking // bookingId
      );

      // const result = await checkAvailability(
      //   activeData.bike_id,
      //   start,
      //   end,
      //   editingBooking,
      // );

      // Ignore same booking conflict
      if (!result.isAvailable && result.bookingId === editingBooking) {
        setAvailabilityMessage(null);
        setIsAvailable(true);
        return;
      }

      // Real conflict
      if (!result.isAvailable && result.bookedFrom) {
        const fromDate = format(
          new Date(result.bookedFrom),
          "dd/MM/yyyy hh:mm a",
        );

        const toDate = format(new Date(result.bookedTo), "dd/MM/yyyy hh:mm a");

        setAvailabilityMessage(`❌ Already booked: ${fromDate} to ${toDate}`);

        setIsAvailable(false);
      } else {
        setAvailabilityMessage("✅ Bike is available");

        setIsAvailable(true);
      }
    };

    checkDates();
  }, [
    formData.bike_id,
    formData.start_datetime,
    formData.end_datetime,

    editFormData.bike_id,
    editFormData.start_datetime,
    editFormData.end_datetime,

    editingBooking,
    originalBookingData,
    hasEditedFields, // ⭐ IMPORTANT
  ]);

  //   useEffect(() => {

  //   const runCheck = async () => {

  //     if (!extendDialog) return;

  //     if (!extendData.new_end_datetime) return;

  //     const bikeId =
  //       extendDialog.bike_id?._id ||
  //       extendDialog.bike_id;

  //     const oldEnd =
  //       new Date(
  //         extendDialog.end_datetime
  //       );

  //     const newEnd =
  //       new Date(
  //         extendData.new_end_datetime
  //       );

  //     if (newEnd <= oldEnd) {

  //       setExtendMessage(
  //         "⚠️ New end must be after current end"
  //       );

  //       setIsExtendAvailable(false);

  //       return;

  //     }

  //     const result =
  //       await checkAvailability(

  //         bikeId,
  //         oldEnd,
  //         newEnd,
  //         extendDialog._id

  //       );

  //     if (!result.isAvailable) {

  //       if (result.bookedFrom) {

  //         const from =
  //           format(
  //             new Date(result.bookedFrom),
  //             "dd/MM/yyyy hh:mm a"
  //           );

  //         const to =
  //           format(
  //             new Date(result.bookedTo),
  //             "dd/MM/yyyy hh:mm a"
  //           );

  //         setExtendMessage(
  //           `❌ Already booked: ${from} to ${to}`
  //         );

  //       }

  //       else {

  //         setExtendMessage(
  //           result.message
  //         );

  //       }

  //       setIsExtendAvailable(false);

  //     }

  //     else {

  //       setExtendMessage(
  //         "✅ Bike available"
  //       );

  //       setIsExtendAvailable(true);

  //     }

  //   };

  //   runCheck();

  // }, [

  //   extendData.new_end_datetime

  // ]);

  useEffect(() => {
    const runCheck = async () => {
      if (!extendDialog) return;

      if (!extendData.new_end_datetime) return;

      const bikeId = extendDialog.bike_id?._id || extendDialog.bike_id;

      const oldEnd = new Date(extendDialog.end_datetime);

      const newEnd = new Date(extendData.new_end_datetime);

      if (newEnd <= oldEnd) {
        setExtendMessage("⚠️ New end must be after current end");

        setIsExtendAvailable(false);

        return;
      }

      const result = await checkAvailability(
        bikeId,
        oldEnd,
        newEnd,
        extendDialog._id,
      );

      if (!result.isAvailable) {
        if (result.bookedFrom) {
          const from = format(
            new Date(result.bookedFrom),
            "dd/MM/yyyy hh:mm a",
          );

          const to = format(new Date(result.bookedTo), "dd/MM/yyyy hh:mm a");

          setExtendMessage(`❌ Already booked: ${from} to ${to}`);
        } else {
          setExtendMessage(result.message);
        }

        setIsExtendAvailable(false);
      } else {
        setExtendMessage("✅ Bike available");

        setIsExtendAvailable(true);
      }
    };

    runCheck();
  }, [extendData.new_end_datetime]);

  useEffect(() => {
    const searchVal = searchParams.get("search");
    if (searchVal) {
      setSearchQuery(searchVal);
      if (bookings && bookings.length > 0) {
        const matched = bookings.find(
          (b) =>
            b._id === searchVal ||
            b._id?.toLowerCase().includes(searchVal.toLowerCase())
        );
        if (matched) {
          setExpandedBookingId(matched._id);
        }
      }
    }
  }, [searchParams, bookings]);


  // const filteredBookings = bookings
  //   ?.filter((booking) => {
  //     if (activeTab === "all") return true;
  //     return booking.status === activeTab;
  //   })
  //   ?.filter((booking) => {
  //     if (!searchQuery) return true;

  //     const query = searchQuery.toLowerCase();
  //     return (
  //       booking._id?.toLowerCase().includes(query) ||
  //       booking.customers?.name?.toLowerCase().includes(query) ||
  //       booking.customers?.phone?.includes(query) ||
  //       booking.bikes?.model?.toLowerCase().includes(query) ||
  //       booking.bikes?.number_plate?.toLowerCase().includes(query)
  //     );
  //   });

  const [currentPage, setCurrentPage] = useState(1);
  const BOOKINGS_PER_PAGE = 20;

  // Debounced search query to eliminate UI stutter when typing
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, debouncedSearch]);

  const filteredBookings = useMemo(() => {
    return (
      bookings
        ?.filter((booking) => {
          if (activeTab === "all") return true;
          return booking.status === activeTab;
        })
        ?.filter((booking) => {
          if (paymentFilter === "all") return true;
          const { pendingAmount, paidAmount, isNew } = getBookingFinancials(booking);
          if (!isNew) {
            if (paymentFilter === "paid") return booking.payment_status === "paid";
            return false;
          }
          if (paymentFilter === "pending_due") return pendingAmount > 0 && booking.status !== "cancelled";
          if (paymentFilter === "partial") return booking.payment_status === "partial" || (paidAmount > 0 && pendingAmount > 0);
          if (paymentFilter === "paid") return booking.payment_status === "paid" || (pendingAmount === 0 && paidAmount > 0);
          return true;
        })
        ?.filter((booking) => {
          if (!debouncedSearch) return true;

          const query = debouncedSearch.toLowerCase().trim();
          return (
            booking._id?.toLowerCase().includes(query) ||
            booking.customers?.name?.toLowerCase().includes(query) ||
            booking.customer_name?.toLowerCase().includes(query) ||
            booking.customers?.phone?.includes(query) ||
            booking.contact_number?.includes(query) ||
            booking.bikes?.model?.toLowerCase().includes(query) ||
            booking.vehicle_make_model?.toLowerCase().includes(query) ||
            booking.bikes?.number_plate?.toLowerCase().includes(query)
          );
        }) || []
    );
  }, [bookings, activeTab, debouncedSearch, paymentFilter]);

  // 🎯 Pending dues count for badge indicator (only for new flow bookings)
  const pendingDuesCount = useMemo(() => {
    return (bookings || []).filter((b) => {
      const { pendingAmount, isNew } = getBookingFinancials(b);
      return isNew && pendingAmount > 0 && b.status !== "cancelled";
    }).length;
  }, [bookings]);

  // 📊 Live Booking Summary Counts for Metric Cards & Tab Badges
  const bookingCounts = useMemo(() => {
    const counts = { all: 0, pending: 0, confirmed: 0, active: 0, completed: 0, cancelled: 0 };
    if (!bookings) return counts;
    counts.all = bookings.length;
    bookings.forEach((b) => {
      if (counts[b.status] !== undefined) {
        counts[b.status]++;
      }
    });
    return counts;
  }, [bookings]);

  const totalOutstandingDues = useMemo(() => {
    if (!bookings) return 0;
    return bookings.reduce((sum, b) => {
      const { isNew, pendingAmount } = getBookingFinancials(b);
      if (isNew && pendingAmount > 0 && b.status !== "cancelled") {
        return sum + pendingAmount;
      }
      return sum;
    }, 0);
  }, [bookings]);

  const totalPages = Math.ceil((filteredBookings?.length || 0) / BOOKINGS_PER_PAGE) || 1;
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * BOOKINGS_PER_PAGE;
    return filteredBookings.slice(start, start + BOOKINGS_PER_PAGE);
  }, [filteredBookings, currentPage]);

  // Filtered customers for search
  const filteredCustomers = useMemo(() => {
    if (!customers) return [];
    if (!customerSearch) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)),
    );
  }, [customers, customerSearch]);

  const resetForm = () => {
    setFormData(emptyFormData);
    setAadhaarPreview(null);
    setLicensePreview(null);
    setCustomerSearch("");
    setBikeSearch("");
  };

  // Status transitions
  const handleStatusUpdate = async (bookingId, newStatus) => {
    if (newStatus === "active") {
      setStartRideDialog(bookingId);
      setStartRideData({ fuel_out_liters: "" });
      return;
    }
    if (newStatus === "completed") {
      setCompletionDialog(bookingId);
      setCompletionData(emptyCompletionData);
      return;
    }
    await updateStatus.mutateAsync({ id: bookingId, status: newStatus });
  };

  // Start ride confirm
  const handleStartRideConfirm = async () => {
    if (!startRideDialog) return;
    const fuelValue = Number(startRideData.fuel_out_liters) || null;
    await updateBooking.mutateAsync({
      id: startRideDialog,
      // fuel_out_liters: fuelValue,
      data: {
        fuel_out_liters: fuelValue,
      },
    });
    await updateStatus.mutateAsync({ id: startRideDialog, status: "active" });
    setStartRideDialog(null);
    toast.success("Rental started");
  };

  // Completion confirm
  // const handleCompletionConfirm = async () => {
  //   if (!completionDialog) return;
  //   const booking = bookings?.find((b) => b._id === completionDialog);
  //   if (!booking) return;

  //   const penalty = Number(completionData.penalty_amount) || 0;
  //   const challan = Number(completionData.challan_amount) || 0;
  //   const damage = Number(completionData.damage_cost) || 0;
  //   const totalDeductions = penalty + challan + damage;
  //   const depositAfter = Math.max(
  //     0,
  //     (booking.deposit_amount || 0) - totalDeductions,
  //   );

  //   await updateBooking.mutateAsync({
  //     id: completionDialog,
  //     fuel_in_liters: Number(completionData.fuel_in_liters) || null,
  //     penalty_amount: penalty,
  //     challan_amount: challan,
  //     damage_cost: damage,
  //     payment_method: completionData.payment_method,
  //     remarks: completionData.remarks || booking.remarks || undefined,
  //   });
  //   await updateStatus.mutateAsync({
  //     id: completionDialog,
  //     status: "completed",
  //   });
  //   setCompletionDialog(null);
  //   setCompletionData(emptyCompletionData);
  //   if (totalDeductions > 0) {
  //     toast.success(
  //       `Ride completed. ₹${totalDeductions} deducted from deposit. Refundable: ₹${depositAfter}`,
  //     );
  //   } else {
  //     toast.success("Ride completed successfully");
  //   }
  // };

  const handleCompletionConfirm = async () => {
    if (!completionDialog) return;

    const booking = bookings?.find((b) => b._id === completionDialog);
    if (!booking) return;

    const penalty = Number(completionData.penalty_amount) || 0;
    const challan = Number(completionData.challan_amount) || 0;
    const damage = Number(completionData.damage_cost) || 0;

    const totalDeductions = penalty + challan + damage;

    const depositAfter = Math.max(
      0,
      (booking.deposit_amount || 0) - totalDeductions,
    );

    try {
      // ✅ IMPORTANT: use FormData for image upload
      const formData = new FormData();

      formData.append(
        "fuel_in_liters",
        Number(completionData.fuel_in_liters) || "",
      );
      formData.append("penalty_amount", penalty);
      formData.append("challan_amount", challan);
      formData.append("damage_cost", damage);
      formData.append("payment_method", completionData.payment_method);
      formData.append(
        "remarks",
        completionData.remarks || booking.remarks || "",
      );

      // ✅ ADD THIS (IMAGE)
      if (completionData.payment_screenshot) {
        formData.append(
          "payment_screenshot",
          completionData.payment_screenshot,
        );
      }

      // ✅ SEND FORM DATA
      await updateBooking.mutateAsync({
        id: completionDialog,
        data: formData, // 👈 IMPORTANT CHANGE
      });

      // ✅ STATUS UPDATE
      await updateStatus.mutateAsync({
        id: completionDialog,
        status: "completed",
      });

      setCompletionDialog(null);
      setCompletionData(emptyCompletionData);

      if (totalDeductions > 0) {
        toast.success(
          `Ride completed. ₹${totalDeductions} deducted. Refundable: ₹${depositAfter}`,
        );
      } else {
        toast.success("Ride completed successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete ride");
    }
  };

  // Mark payment as paid
  const handleMarkPaid = async (bookingId) => {
    await updateBooking.mutateAsync({
      id: bookingId,
      data: {
        payment_status: "paid",
      },
    });

    toast.success("Payment marked as paid");
  };

  // Document handlers
  const handleAadhaarChange = (e, setter, data) => {
    const file = e.target.files?.[0];
    if (file) {
      setter({ ...data, aadhaar_file: file });
      const reader = new FileReader();
      reader.onloadend = () => setAadhaarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleLicenseChange = (e, setter, data) => {
    const file = e.target.files?.[0];
    if (file) {
      setter({ ...data, license_file: file });
      const reader = new FileReader();
      reader.onloadend = () => setLicensePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompletionData((prev) => ({
        ...prev,
        payment_screenshot: file,
      }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create booking
  // const handleCreateBooking = async (e) => {
  //   if (e) e.preventDefault();

  //   // 1. Prepare Data
  //   const dataToSend = new FormData();
  //   const selectedBike = bikes?.find((b) => b._id === formData.bike_id);
  //   const selectedCust = customers?.find((c) => c._id === formData.customer_id);

  //   // 2. Mandatory Fields (Match your Schema exactly)
  //   dataToSend.append("bike_id", formData.bike_id);
  //   dataToSend.append("customer_id", formData.customer_id);
  //   dataToSend.append("start_datetime", formData.start_datetime);
  //   dataToSend.append("end_datetime", formData.end_datetime);

  //   // Required strings that were missing
  //   dataToSend.append("customer_name", selectedCust?.name || "");
  //   dataToSend.append("contact_number", selectedCust?.phone || "");
  //   dataToSend.append(
  //     "vehicle_make_model",
  //     selectedBike ? `${selectedBike.brand} ${selectedBike.model}` : "Bike",
  //   );
  //   dataToSend.append("account_manager", "Admin"); // Required by Schema

  //   dataToSend.append("lead_source", formData.lead_source || "other");
  //   dataToSend.append("source_name", formData.source_name || "Direct");
  //   dataToSend.append("rental_type", formData.rental_type || "daily");
  //   dataToSend.append("deposit_amount", formData.deposit_amount || 0);
  //   dataToSend.append("total_amount", formData.total_amount || 0);
  //   dataToSend.append("payment_method", "cash");

  //   // 3. Files (Must match the fieldnames used in Controller)
  //   if (formData.aadhaar_file) {
  //     dataToSend.append("customer_id_proof_files", formData.aadhaar_file);
  //   }
  //   if (formData.license_file) {
  //     dataToSend.append("customer_license_files", formData.license_file);
  //   }

  //   try {
  //     setUploading(true);
  //     // Use the mutation hook you provided
  //     await adminCreateMutation.mutateAsync(dataToSend);
  //     setIsOpen(false);
  //     resetForm();
  //   } catch (err) {
  //     // Errors will be caught by the onError in your hook
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  // const handleCreateBooking = async (e) => {
  //   if (e) e.preventDefault();

  //   try {
  //     setUploading(true);

  //     let finalCustomerId = formData.customer_id;
  //     let finalCustomerName = formData.customer_name;
  //     let finalCustomerPhone = formData.customer_phone;

  //     // 1️⃣ CREATE CUSTOMER FIRST (IF NEW)
  //     if (formData.is_new_customer) {
  //       console.log("🚀 Step 1: Creating new customer...");
  //       const customerFormData = new FormData();

  //       // Backend 'Customer' model expects: name, phone, email
  //       customerFormData.append("name", formData.customer_name);
  //       customerFormData.append("phone", formData.customer_phone);
  //       customerFormData.append("email", formData.customer_email || "");

  //       // IMPORTANT: Backend expects 'aadhaar_image' and 'license_image'
  //       // Your console shows they are stored in 'aadhaar_file' and 'license_file'
  //       if (!formData.aadhaar_file || !formData.license_file) {
  //         toast.error("Aadhaar and License files are required");
  //         setUploading(false);
  //         return;
  //       }

  //       customerFormData.append("aadhaar_image", formData.aadhaar_file);
  //       customerFormData.append("license_image", formData.license_file);

  //       // Call the customer creation API
  //       const savedCustomer =
  //         await createCustomer.mutateAsync(customerFormData);

  //       // Get the ID generated by MongoDB
  //       finalCustomerId = savedCustomer._id;
  //       console.log("✅ Customer Created with ID:", finalCustomerId);
  //     } else {
  //       // EXISTING CUSTOMER LOGIC
  //       const selectedCust = customers?.find(
  //         (c) => c._id === formData.customer_id,
  //       );
  //       if (!selectedCust) {
  //         toast.error("Please select a customer");
  //         setUploading(false);
  //         return;
  //       }
  //       finalCustomerId = selectedCust._id;
  //       finalCustomerName = selectedCust.name;
  //       finalCustomerPhone = selectedCust.phone;
  //     }

  //     // 2️⃣ PREPARE BOOKING DATA
  //     console.log("🚀 Step 2: Preparing booking data...");
  //     const bookingData = new FormData();
  //     const selectedBike = bikes?.find((b) => b._id === formData.bike_id);

  //     // Mandatory Booking Fields
  //     bookingData.append("customer_id", finalCustomerId);
  //     bookingData.append("bike_id", formData.bike_id);
  //     bookingData.append("customer_name", finalCustomerName);
  //     bookingData.append("contact_number", finalCustomerPhone);

  //     bookingData.append("start_datetime", formData.start_datetime);
  //     bookingData.append("end_datetime", formData.end_datetime);
  //     bookingData.append(
  //       "vehicle_make_model",
  //       selectedBike ? `${selectedBike.brand} ${selectedBike.model}` : "Bike",
  //     );
  //     bookingData.append(
  //       "account_manager",
  //       formData.account_manager || "Admin",
  //     );
  //     bookingData.append("rental_type", formData.rental_type || "daily");
  //     bookingData.append("lead_source", formData.lead_source || "other");
  //     bookingData.append("source_name", formData.source_name || "Direct");
  //     bookingData.append("deposit_amount", formData.deposit_amount || 0);
  //     bookingData.append("total_amount", formData.total_amount || 0);
  //     bookingData.append("payment_method", "cash");

  //     // Optional Booking Fields
  //     bookingData.append("fuel_quantity", formData.fuel_quantity || 0);
  //     bookingData.append("notes", formData.notes || "");
  //     bookingData.append("remarks", formData.remarks || "");

  //     // 3️⃣ SEND TO BACKEND
  //     await adminCreateMutation.mutateAsync(bookingData);

  //     setIsOpen(false);
  //     resetForm();
  //     toast.success("Booking completed successfully!");
  //   } catch (err) {
  //     console.error("❌ Process Error:", err);
  //     toast.error(
  //       err.response?.data?.message || "Failed to create customer or booking",
  //     );
  //   } finally {
  //     setUploading(false);
  //   }
  // };

  const handleCreateBooking = async (e) => {
    if (e) e.preventDefault();

    try {
      setUploading(true);

      let finalCustomerId = formData.customer_id;
      let finalCustomerName = formData.customer_name;
      let finalCustomerPhone = formData.customer_phone;
      let finalCustomerLocation = formData.customer_location;

      // 1️⃣ CREATE CUSTOMER FIRST (IF NEW)
      // if (formData.is_new_customer) {
      //   console.log("🚀 Step 1: Creating new customer...");
      //   const customerFormData = new FormData();

      //   // Backend 'Customer' model expects: name, phone, email
      //   customerFormData.append("name", formData.customer_name);
      //   customerFormData.append("phone", formData.customer_phone);
      //   customerFormData.append("email", formData.customer_email || "");

      //   // IMPORTANT: Backend expects 'aadhaar_image' and 'license_image'
      //   // Your console shows they are stored in 'aadhaar_file' and 'license_file'
      //   if (!formData.aadhaar_file || !formData.license_file) {
      //     toast.error("Aadhaar and License files are required");
      //     setUploading(false);
      //     return;
      //   }

      //   customerFormData.append("aadhaar_image", formData.aadhaar_file);
      //   customerFormData.append("license_image", formData.license_file);

      //   // Call the customer creation API
      //   const savedCustomer =
      //     await createCustomer.mutateAsync(customerFormData);

      //   // Get the ID generated by MongoDB
      //   finalCustomerId = savedCustomer._id;
      //   console.log("✅ Customer Created with ID:", finalCustomerId);
      // }

      // ... inside handleCreateBooking
      if (formData.is_new_customer) {
        console.log("🚀 Step 1: Creating new customer...");
        const customerFormData = new FormData();

        customerFormData.append("name", formData.customer_name);
        customerFormData.append("phone", formData.customer_phone);
        customerFormData.append("email", formData.customer_email || "");

        // Legacy Aadhaar and License
        if (!formData.aadhaar_file || !formData.license_file) {
          toast.error("Aadhaar and License files are required");
          setUploading(false);
          return;
        }
        customerFormData.append("aadhaar_image", formData.aadhaar_file);
        customerFormData.append("license_image", formData.license_file);

        // --- NEW CHANGE START ---
        // Append the 5 extra documents (from your new state)
        if (extraDocFiles && extraDocFiles.length > 0) {
          extraDocFiles.forEach((file) => {
            customerFormData.append("extra_documents", file);
          });
        }
        // --- NEW CHANGE END ---

        const savedCustomer =
          await createCustomer.mutateAsync(customerFormData);
        finalCustomerId = savedCustomer._id;
        console.log("✅ Customer Created with ID:", finalCustomerId);
      }
      // ... rest of the booking logic
      else {
        // EXISTING CUSTOMER LOGIC
        const selectedCust = customers?.find(
          (c) => c._id === formData.customer_id,
        );
        if (!selectedCust) {
          toast.error("Please select a customer");
          setUploading(false);
          return;
        }
        finalCustomerId = selectedCust._id;
        finalCustomerName = selectedCust.name;
        finalCustomerPhone = selectedCust.phone;
        finalCustomerLocation = selectedCust.address;
      }

      // 2️⃣ PREPARE BOOKING DATA
      console.log("🚀 Step 2: Preparing booking data...");
      const bookingData = new FormData();
      const selectedBike = bikes?.find((b) => b._id === formData.bike_id);

      // Mandatory Booking Fields
      bookingData.append("customer_id", finalCustomerId);
      bookingData.append("bike_id", formData.bike_id);
      bookingData.append("customer_name", finalCustomerName);
      bookingData.append("contact_number", finalCustomerPhone);
      bookingData.append("customer_location", finalCustomerLocation);

      // bookingData.append("start_datetime", formData.start_datetime);
      // bookingData.append("end_datetime", formData.end_datetime);

      bookingData.append(
        "start_datetime",
        new Date(formData.start_datetime).toISOString(),
      );
      bookingData.append(
        "end_datetime",
        new Date(formData.end_datetime).toISOString(),
      );

      bookingData.append(
        "vehicle_make_model",
        selectedBike ? (selectedBike.bike_name && selectedBike.model && selectedBike.bike_name !== selectedBike.model ? `${selectedBike.bike_name} ${selectedBike.model}` : (selectedBike.bike_name || selectedBike.model || "Bike")).replace(/^undefined\s*/i, "").trim() : "Bike",
      );
      bookingData.append(
        "account_manager",
        formData.account_manager || "Admin",
      );
      bookingData.append("rental_type", formData.rental_type || "daily");
      bookingData.append("lead_source", formData.lead_source || "other");
      bookingData.append("source_name", formData.source_name || "Direct");
      bookingData.append("deposit_amount", formData.deposit_amount || 0);
      bookingData.append("total_amount", formData.total_amount || 0);
      bookingData.append(
        "paid_amount",
        formData.paid_amount !== undefined && formData.paid_amount !== ""
          ? formData.paid_amount
          : (formData.total_amount || 0)
      );
      bookingData.append("payment_method", formData.payment_method || "cash");
      bookingData.append(
        "provider_partner_share",
        formData.provider_partner_share || 0,
      );
      bookingData.append(
        "reference_partner_share",
        formData.reference_partner_share || 0,
      );

      // Optional Booking Fields
      bookingData.append("fuel_quantity", formData.fuel_quantity || 0);
      bookingData.append("notes", formData.notes || "");
      bookingData.append("remarks", formData.remarks || "");

      // 3️⃣ SEND TO BACKEND
      await adminCreateMutation.mutateAsync(bookingData);

      setIsOpen(false);
      resetForm();
      setBikeSearch("");
      toast.success("Booking completed successfully!");
    } catch (err) {
      console.error("❌ Process Error:", err);
      toast.error(
        err.response?.data?.message || "Failed to create customer or booking",
      );
    } finally {
      setUploading(false);
    }
  };

  // const formatToLocalInput = (isoDate) => {
  //   if (!isoDate) return "";

  //   const date = new Date(isoDate);

  //   const offset = date.getTimezoneOffset();

  //   const local = new Date(date.getTime() - offset * 60000);

  //   return local.toISOString().slice(0, 16);
  // };

  const toLocalISO = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);

    // Use Intl to format the date specifically for India
    // This produces a string like "2026-04-21 19:30"
    const options = {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    const formatter = new Intl.DateTimeFormat("en-IN", options);
    const parts = formatter.formatToParts(date);
    const f = (type) => parts.find((p) => p.type === type).value;

    // Return in YYYY-MM-DDTHH:mm format required by <input type="datetime-local">
    return `${f("year")}-${f("month")}-${f("day")}T${f("hour")}:${f("minute")}`;
  };

  const handleEditBooking = (booking) => {
    setHasEditedFields(false);

    // setOriginalBookingData({
    //   bike_id: booking.bike_id?._id || booking.bike_id,
    //   start_datetime: booking.start_datetime,
    //   end_datetime: booking.end_datetime,
    // });

    setOriginalBookingData({
      bike_id: booking.bike_id?._id || booking.bike_id,

      // ⭐ MUST match editFormData format
      start_datetime: toLocalISO(booking.start_datetime),

      end_datetime: toLocalISO(booking.end_datetime),
    });

    setEditingBooking(booking._id);

    setEditFormData({
      // bike_id: booking.bike_id,

      bike_id: booking.bike_id?._id || booking.bike_id,

      // customer_id: booking.customer_id,
      customer_id: booking.customers?._id || booking.customer_id,
      // start_datetime: booking.start_datetime.slice(0, 16),
      // end_datetime: booking.end_datetime.slice(0, 16),

      start_datetime: toLocalISO(booking.start_datetime),
      end_datetime: toLocalISO(booking.end_datetime),
      notes: booking.notes || "",
      customer_name: booking.customer_name || booking.customers?.name || "",
      customer_phone: booking.contact_number || booking.customers?.phone || "",
      customer_email: booking.customer_email || booking.customers?.email || "",
      customer_location: booking.customer_location || "",
      is_new_customer: false,
      aadhaar_file: null,
      license_file: null,
      partner_name: booking.source_name || "",
      lead_source: booking.lead_source || "other",
      source_name: booking.source_name || "",
      rental_type: booking.rental_type || "daily",
      total_amount: String(booking.total_amount || ""),
      deposit_amount: String(booking.deposit_amount || ""),
      reference_partner_share: String(booking.reference_partner_share || ""),
      provider_partner_share: String(booking.provider_partner_share || ""),
      fuel_quantity: String(booking.fuel_quantity || ""),
      account_manager: booking.account_manager || "",
      remarks: booking.remarks || "",
      payment_method: booking.payment_method || "cash",
    });
  };

  //   const handleEditBooking = (booking) => {
  //      console.log("DB:", booking.start_datetime);
  //   console.log(
  //     "Formatted:",
  //     formatToLocalInput(booking.start_datetime)
  //   );

  //     setEditingBooking(booking._id);

  //     setEditFormData({
  //       bike_id: booking.bike_id,
  //       customer_id: booking.customer_id,

  //       // ✅ FIXED TIMEZONE ISSUE HERE
  //       // start_datetime: formatToLocalInput(booking.start_datetime),

  //       // end_datetime: formatToLocalInput(booking.end_datetime),

  //       start_datetime: formatToLocalInput(
  //   booking.start_datetime
  // ),

  // end_datetime: formatToLocalInput(
  //   booking.end_datetime
  // ),

  //       notes: booking.notes || "",

  //       customer_name: booking.customer_name || booking.customers?.name || "",

  //       customer_phone: booking.contact_number || booking.customers?.phone || "",

  //       customer_email: booking.customer_email || booking.customers?.email || "",

  //       customer_location: booking.customer_location || "",

  //       is_new_customer: false,
  //       aadhaar_file: null,
  //       license_file: null,

  //       partner_name: booking.source_name || "",
  //       lead_source: booking.lead_source || "other",
  //       source_name: booking.source_name || "",
  //       rental_type: booking.rental_type || "daily",

  //       total_amount: String(booking.total_amount || ""),

  //       deposit_amount: String(booking.deposit_amount || ""),

  //       reference_partner_share: String(booking.reference_partner_share || ""),

  //       provider_partner_share: String(booking.provider_partner_share || ""),

  //       fuel_quantity: String(booking.fuel_quantity || ""),

  //       account_manager: booking.account_manager || "",

  //       remarks: booking.remarks || "",

  //       payment_method: booking.payment_method || "cash",
  //     });
  //   };

  // Edit booking (full form)
  // const handleEditBooking = (booking) => {
  //   setEditingBooking(booking._id);
  //   setEditFormData({
  //     bike_id: booking.bike_id,
  //     customer_id: booking.customer_id,
  //     start_datetime: booking.start_datetime.slice(0, 16),
  //     end_datetime: booking.end_datetime.slice(0, 16),
  //     notes: booking.notes || "",
  //     customer_name: booking.customer_name || booking.customers?.name || "",
  //     customer_phone: booking.contact_number || booking.customers?.phone || "",
  //     customer_email: booking.customer_email || booking.customers?.email || "",
  //     customer_location: booking.customer_location || "",
  //     is_new_customer: false,
  //     aadhaar_file: null,
  //     license_file: null,
  //     partner_name: booking.source_name || "",
  //     lead_source: booking.lead_source || "other",
  //     source_name: booking.source_name || "",
  //     rental_type: booking.rental_type || "daily",
  //     total_amount: String(booking.total_amount || ""),
  //     deposit_amount: String(booking.deposit_amount || ""),
  //     reference_partner_share: String(booking.reference_partner_share || ""),
  //     provider_partner_share: String(booking.provider_partner_share || ""),
  //     fuel_quantity: String(booking.fuel_quantity || ""),
  //     account_manager: booking.account_manager || "",
  //     remarks: booking.remarks || "",
  //     payment_method: booking.payment_method || "cash",
  //   });
  // };

  // const handleSaveEdit = async () => {
  //   if (!editingBooking) return;
  //   const start = new Date(editFormData.start_datetime);
  //   const end = new Date(editFormData.end_datetime);
  //   if (end.getTime() <= start.getTime()) {
  //     toast.error("End time must be after start time");
  //     return;
  //   }
  //   if (!editFormData.total_amount || Number(editFormData.total_amount) <= 0) {
  //     toast.error("Please enter rental amount");
  //     return;
  //   }

  //   try {
  //     await updateBooking.mutateAsync({
  //       id: editingBooking,
  //       start_datetime: start.toISOString(),
  //       end_datetime: end.toISOString(),
  //       total_amount: Number(editFormData.total_amount),
  //       customer_name: editFormData.customer_name || undefined,
  //       contact_number: editFormData.customer_phone || undefined,
  //       customer_email: editFormData.customer_email || undefined,
  //       customer_location: editFormData.customer_location || undefined,
  //       lead_source: editFormData.lead_source,
  //       source_name: editFormData.source_name || undefined,
  //       rental_type: editFormData.rental_type,
  //       deposit_amount: Number(editFormData.deposit_amount) || 0,
  //       reference_partner_share:
  //         Number(editFormData.reference_partner_share) || undefined,
  //       provider_partner_share:
  //         Number(editFormData.provider_partner_share) || undefined,
  //       fuel_quantity: Number(editFormData.fuel_quantity) || undefined,
  //       account_manager: editFormData.account_manager || undefined,
  //       remarks: editFormData.remarks || undefined,
  //       notes: editFormData.notes || undefined,
  //       payment_method: editFormData.payment_method,
  //     });
  //     setEditingBooking(null);
  //     toast.success("Booking updated successfully");
  //   } catch (err) {
  //     toast.error("Failed to update booking");
  //   }
  // };

  // const handleSaveEdit = async () => {
  //   if (!editingBooking) return;

  //   const start = new Date(editFormData.start_datetime);
  //   const end = new Date(editFormData.end_datetime);

  //   if (end.getTime() <= start.getTime()) {
  //     toast.error("End time must be after start time");
  //     return;
  //   }

  //   if (!editFormData.total_amount || Number(editFormData.total_amount) <= 0) {
  //     toast.error("Please enter rental amount");
  //     return;
  //   }

  //   try {
  //     await updateBooking.mutateAsync({
  //       id: editingBooking,
  //       data: {
  //         bike_id: editFormData.bike_id,

  //         start_datetime: start.toISOString(),
  //         end_datetime: end.toISOString(),
  //         total_amount: Number(editFormData.total_amount),

  //         customer_name: editFormData.customer_name || undefined,
  //         contact_number: editFormData.customer_phone || undefined,
  //         customer_email: editFormData.customer_email || undefined,
  //         customer_location: editFormData.customer_location || undefined,

  //         lead_source: editFormData.lead_source,
  //         source_name: editFormData.source_name || undefined,
  //         rental_type: editFormData.rental_type,

  //         deposit_amount: Number(editFormData.deposit_amount) || 0,

  //         reference_partner_share:
  //           Number(editFormData.reference_partner_share) || undefined,

  //         provider_partner_share:
  //           Number(editFormData.provider_partner_share) || undefined,

  //         fuel_quantity: Number(editFormData.fuel_quantity) || undefined,

  //         account_manager: editFormData.account_manager || undefined,

  //         remarks: editFormData.remarks || undefined,
  //         notes: editFormData.notes || undefined,

  //         payment_method: editFormData.payment_method,
  //       },
  //     });

  //     setEditingBooking(null);
  //     setBikeSearch("");
  //     toast.success("Booking updated successfully");
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Failed to update booking");
  //   }
  // };

  const handleSaveEdit = async () => {
    if (!editingBooking) return;

    const start = new Date(editFormData.start_datetime);
    const end = new Date(editFormData.end_datetime);

    if (end.getTime() <= start.getTime()) {
      toast.error("End time must be after start time");
      return;
    }

    if (!editFormData.total_amount || Number(editFormData.total_amount) <= 0) {
      toast.error("Please enter rental amount");
      return;
    }

    try {
      // 1️⃣ UPDATE BOOKING
      await updateBooking.mutateAsync({
        id: editingBooking,
        data: {

          bike_id: editFormData.bike_id,


          start_datetime: start.toISOString(),
          end_datetime: end.toISOString(),
          total_amount: Number(editFormData.total_amount),

          customer_name: editFormData.customer_name || undefined,
          contact_number: editFormData.customer_phone || undefined,
          customer_email: editFormData.customer_email || undefined,
          customer_location: editFormData.customer_location || undefined,

          lead_source: editFormData.lead_source,
          source_name: editFormData.source_name || undefined,
          rental_type: editFormData.rental_type,

          deposit_amount: Number(editFormData.deposit_amount) || 0,

          reference_partner_share:
            Number(editFormData.reference_partner_share) || undefined,

          provider_partner_share:
            Number(editFormData.provider_partner_share) || undefined,

          fuel_quantity: Number(editFormData.fuel_quantity) || undefined,

          account_manager: editFormData.account_manager || undefined,

          remarks: editFormData.remarks || undefined,
          notes: editFormData.notes || undefined,

          payment_method: editFormData.payment_method,
        },
      });

      // 2️⃣ UPDATE CUSTOMER — fix: use customer_id, build FormData
      if (editFormData.customer_id) {
        const customerFormData = new FormData();
        customerFormData.append("name", editFormData.customer_name || "");
        customerFormData.append("phone", editFormData.customer_phone || "");
        customerFormData.append("email", editFormData.customer_email || "");
        customerFormData.append(
          "address",
          editFormData.customer_location || "",
        );

        await updateCustomerMutation.mutateAsync({
          id: editFormData.customer_id, // ✅ customer's _id, NOT booking id
          formData: customerFormData, // ✅ FormData, not plain object
        });
      }

      setEditingBooking(null);
      toast.success("Booking & customer updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update booking");
    }
  };

  const extendBooking = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axios.patch(
        `${API_BASE_URL}/bookings/${id}/extend`,

        data,
      );

      return res.data;
    },

    onSuccess: () => {
      toast.success("Rental extended successfully");

      queryClient.invalidateQueries(["bookings"]);

      setExtendDialog(null);
    },

    // onError: (error) => {
    //   toast.error(error.response?.data?.message || "Failed to extend rental");
    // },
    onError: (error) => {

      console.log("Extend Error:", error.response?.data);

      toast.error(
        error.response?.data?.message ||
        JSON.stringify(error.response?.data) ||
        "Failed to extend rental"
      );

    },
  });

  // const handleExtendRental = async () => {
  //   if (!extendDialog) return;

  //   try {
  //     const newEnd = new Date(extendData.new_end_datetime);

  //     if (!extendData.extra_amount) {
  //       toast.error("Enter extra amount");

  //       return;
  //     }

  //     await extendBooking.mutateAsync({
  //       id: extendDialog._id,

  //       data: {
  //         new_end_datetime: newEnd.toISOString(),

  //         extra_amount: Number(extendData.extra_amount),
  //       },
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // const handleExtendRental = async () => {
  //   if (!extendDialog) return;

  //   try {
  //     const oldEnd = new Date(extendDialog.end_datetime);

  //     const newEnd = new Date(extendData.new_end_datetime);

  //     if (!extendData.extra_amount) {
  //       toast.error("Enter extra amount");

  //       return;
  //     }

  //     // 🚨 CHECK AVAILABILITY FIRST

  //     const result = await checkAvailability(
  //       extendDialog.bike_id,

  //       oldEnd,

  //       newEnd,

  //       extendDialog._id,
  //     );

  //     // ❌ If conflict found

  //     if (!result.isAvailable) {
  //       if (result.bookedFrom) {
  //         const from = format(
  //           new Date(result.bookedFrom),
  //           "dd/MM/yyyy hh:mm a",
  //         );

  //         const to = format(new Date(result.bookedTo), "dd/MM/yyyy hh:mm a");

  //         toast.error(`Bike already booked: ${from} to ${to}`);
  //       } else {
  //         toast.error(result.message || "Bike not available");
  //       }

  //       return;
  //     }

  //     // ✅ IF AVAILABLE → EXTEND

  //     await extendBooking.mutateAsync({
  //       id: extendDialog._id,

  //       data: {
  //         new_end_datetime: newEnd.toISOString(),

  //         extra_amount: Number(extendData.extra_amount),
  //       },
  //     });
  //   } catch (error) {
  //     console.error(error);

  //     toast.error("Extension failed");
  //   }
  // };

  const handleExtendRental = async () => {
    if (extendBooking.isPending) return;
    if (!isExtendAvailable) {
      toast.error("Cannot extend — bike not available");

      return;
    }

    if (!extendDialog) return;

    try {
      const oldEnd = new Date(extendDialog.end_datetime);

      const newEnd = new Date(extendData.new_end_datetime);

      if (!extendData.extra_amount) {
        toast.error("Enter extra amount");
        return;
      }

      if (Number(extendData.extra_amount) < 0) {
        toast.error("Extra amount cannot be negative");
        return;
      }

      // ⭐ FIXED bikeId

      const bikeId = extendDialog.bike_id?._id || extendDialog.bike_id;

      console.log("Extend Check:", {
        bikeId,
        bookingId: extendDialog._id,
        oldEnd,
        newEnd,
      });

      // 🚨 CHECK AVAILABILITY

      // const result = await checkAvailability(
      //   bikeId,
      //   oldEnd,
      //   newEnd,
      //   extendDialog._id,
      // );


      const result = await checkAvailability(
        bikeId,
        oldEnd,
        newEnd,
        false, // not a cluster booking
        extendDialog._id // bookingId
      );

      // ❌ Conflict

      if (!result.isAvailable) {
        if (result.bookedFrom) {
          const from = format(
            new Date(result.bookedFrom),
            "dd/MM/yyyy hh:mm a",
          );

          const to = format(new Date(result.bookedTo), "dd/MM/yyyy hh:mm a");

          toast.error(`Already booked: ${from} to ${to}`);
        } else {
          toast.error(result.message || "Bike not available");
        }

        return;
      }

      // ✅ EXTEND

      await extendBooking.mutateAsync({
        id: extendDialog._id,

        data: {
          new_end_datetime: newEnd.toISOString(),

          extra_amount: Number(extendData.extra_amount),
        },
      });
    } catch (error) {
      console.error(error);

      toast.error("Extension failed");
    }
  };

  // const handleOpenExtend = (booking) => {
  //   setExtendDialog(booking);

  //   setExtendData({
  //     new_end_datetime: toLocalISO(booking.end_datetime),

  //     extra_amount: "",
  //   });
  // };

  const handleOpenExtend = (booking) => {
    console.log("Booking:", booking);
    console.log("booking.bike_id:", booking.bike_id);
    console.log("booking.bikes:", booking.bikes);

    setExtendDialog(booking);

    setExtendData({
      new_end_datetime: toLocalISO(booking.end_datetime),
      extra_amount: "",
    });
  };

  const handleExtraDocsChange = (e) => {
    const files = Array.from(e.target.files);
    if (extraDocPreviews.length + files.length > 5) {
      toast.error("Maximum 5 extra documents allowed");
      return;
    }

    setExtraDocFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setExtraDocPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeExtraDoc = (index) => {
    const itemToRemove = extraDocPreviews[index];

    // Logic to sync binary files and previews
    if (
      typeof itemToRemove === "string" &&
      (itemToRemove.startsWith("data:") || itemToRemove.startsWith("blob:"))
    ) {
      const binaryIndex = extraDocPreviews
        .slice(0, index)
        .filter(
          (src) => src.startsWith("data:") || src.startsWith("blob:"),
        ).length;
      setExtraDocFiles((prev) => prev.filter((_, i) => i !== binaryIndex));
    }

    setExtraDocPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const availableBikes = bikes?.filter((b) => b.status !== "maintenance");

  const filteredBikes = useMemo(() => {
    if (!availableBikes) return [];
    if (!bikeSearch) return availableBikes;
    const q = bikeSearch.toLowerCase();
    return availableBikes.filter(
      (bike) =>
        bike.model?.toLowerCase().includes(q) ||
        bike.number_plate?.toLowerCase().includes(q) ||
        bike.bike_name?.toLowerCase().includes(q)
    );
  }, [availableBikes, bikeSearch]);

  // Render form fields (shared between create & edit)
  const renderFormFields = (data, setData, isEdit = false) => (
    <div className="space-y-5">
      {/* 🛵 1. Vehicle & Schedule */}
      <div className="rounded-2xl border border-border/80 bg-card/60 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Bike className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Vehicle & Rental Schedule</h3>
            <p className="text-xs text-muted-foreground">Select two-wheeler and booking duration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Select Bike *</Label>
              {bikeSearch && (
                <button
                  type="button"
                  onClick={() => setBikeSearch("")}
                  className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3 h-3" /> Clear filter
                </button>
              )}
            </div>

            {/* Search bike filter */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search bike by model, plate, or nickname..."
                value={bikeSearch}
                onChange={(e) => setBikeSearch(e.target.value)}
                className="pl-9 h-10 text-xs rounded-xl"
                autoComplete="off"
              />
            </div>

            <Select
              value={data.bike_id}
              onValueChange={(value) => {
                setData({
                  ...data,
                  bike_id: value,
                });
                setHasEditedFields(true);
              }}
            >
              <SelectTrigger className="h-11 rounded-xl text-xs font-medium">
                <SelectValue placeholder={bikeSearch ? `Matching (${filteredBikes.length}) bikes` : "Choose a bike from fleet"} />
              </SelectTrigger>

              <SelectContent className="max-h-[300px] rounded-xl">
                {filteredBikes.length > 0 ? (
                  filteredBikes.map((bike) => (
                    <SelectItem key={bike._id} value={bike._id}>
                      <div className="flex items-center justify-between gap-3 w-full py-0.5">
                        <span className="font-semibold text-foreground text-xs sm:text-sm">
                          {bike.model}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded bg-muted border border-border/60">
                            {bike.number_plate}
                          </span>
                          {bike.bike_name && (
                            <span className="text-[11px] text-muted-foreground">
                              ({bike.bike_name})
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No available bikes found matching "{bikeSearch}"
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold">Rental Type *</Label>
            <Select
              value={data.rental_type}
              onValueChange={(v) => setData({ ...data, rental_type: v })}
            >
              <SelectTrigger className="h-10 rounded-xl text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="hourly">Hourly Rental</SelectItem>
                <SelectItem value="daily">Daily (24h Cap)</SelectItem>
                <SelectItem value="weekly">Weekly Plan</SelectItem>
                <SelectItem value="monthly">Monthly Subscription</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" /> Start Date / Time *
            </Label>
            <Input
              type="datetime-local"
              className="h-10 text-xs rounded-xl [color-scheme:dark]"
              value={data.start_datetime}
              onChange={(e) => {
                setData({
                  ...data,
                  start_datetime: e.target.value,
                });
                setHasEditedFields(true);
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" /> End Date / Time *
            </Label>
            <Input
              type="datetime-local"
              className="h-10 text-xs rounded-xl [color-scheme:dark]"
              value={data.end_datetime}
              onChange={(e) => {
                setData({
                  ...data,
                  end_datetime: e.target.value,
                });
                setHasEditedFields(true);
              }}
            />
          </div>
        </div>

        {availabilityMessage && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold border transition-all ${
              isAvailable
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                : "bg-rose-500/10 text-rose-500 border-rose-500/30"
            }`}
          >
            {isAvailable ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            )}
            <span className="flex-1">{availabilityMessage}</span>
          </div>
        )}
      </div>

      {/* 💰 2. Tariff & Payment Breakdown */}
      <div className="rounded-2xl border border-border/80 bg-card/60 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Tariff & Payment Terms</h3>
            <p className="text-xs text-muted-foreground">Define rent, security deposit, and payment collected</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Rental Amount (₹) *</Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 700"
              value={data.total_amount}
              onChange={(e) => setData({ ...data, total_amount: e.target.value })}
              className="h-10 text-xs rounded-xl font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Deposit Amount (₹)</Label>
            <Input
              type="number"
              min="0"
              placeholder="Default: 2000 (Refundable)"
              value={data.deposit_amount}
              onChange={(e) =>
                setData({ ...data, deposit_amount: e.target.value })
              }
              className="h-10 text-xs rounded-xl font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Advance Paid Amount (₹)</Label>
              {data.total_amount && (
                <button
                  type="button"
                  className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                  onClick={() => setData({ ...data, paid_amount: data.total_amount })}
                >
                  Pay Full (₹{Number(data.total_amount).toLocaleString()})
                </button>
              )}
            </div>
            <Input
              type="number"
              min="0"
              placeholder={data.total_amount ? `Default: ₹${data.total_amount}` : "0"}
              value={data.paid_amount ?? ""}
              onChange={(e) => setData({ ...data, paid_amount: e.target.value })}
              className="h-10 text-xs rounded-xl font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Payment Mode</Label>
            <Select
              value={data.payment_method || "cash"}
              onValueChange={(v) => setData({ ...data, payment_method: v })}
            >
              <SelectTrigger className="h-10 rounded-xl text-xs">
                <SelectValue placeholder="Select Payment Mode" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="cash">Cash at Hub</SelectItem>
                <SelectItem value="upi">UPI / Online QR</SelectItem>
                <SelectItem value="online">Website Payment Gateway</SelectItem>
                <SelectItem value="card">Debit / Credit Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer / IMPS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Live Calculation Strip */}
        {data.total_amount && (
          <div className="p-3 rounded-xl bg-muted/40 border border-border/70 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Balance Due at Pickup
              </span>
              <span className={`text-sm font-black ${
                Number(data.total_amount || 0) - Number(data.paid_amount !== undefined && data.paid_amount !== "" ? data.paid_amount : data.total_amount || 0) > 0
                  ? "text-amber-500"
                  : "text-emerald-500"
              }`}>
                ₹{Math.max(0, Number(data.total_amount || 0) - Number(data.paid_amount !== undefined && data.paid_amount !== "" ? data.paid_amount : data.total_amount || 0)).toLocaleString()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Settlement Status
              </span>
              <span className={`text-xs font-bold ${
                Number(data.total_amount || 0) - Number(data.paid_amount !== undefined && data.paid_amount !== "" ? data.paid_amount : data.total_amount || 0) <= 0
                  ? "text-emerald-500"
                  : "text-amber-500"
              }`}>
                {Number(data.total_amount || 0) - Number(data.paid_amount !== undefined && data.paid_amount !== "" ? data.paid_amount : data.total_amount || 0) <= 0
                  ? "✓ Fully Settled"
                  : "⚠️ Partial / Pending"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 👤 3. Customer Details */}
      <div className="rounded-2xl border border-border/80 bg-card/60 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Customer Information</h3>
              <p className="text-xs text-muted-foreground">Select returning customer or register new rider</p>
            </div>
          </div>

          {!isEdit && (
            <div className="flex items-center p-1 bg-muted rounded-xl border border-border/60 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setData({ ...data, is_new_customer: false })}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  !data.is_new_customer ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Existing
              </button>
              <button
                type="button"
                onClick={() => setData({ ...data, is_new_customer: true, customer_id: "" })}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  data.is_new_customer ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                + New Customer
              </button>
            </div>
          )}
        </div>

        {!isEdit && !data.is_new_customer ? (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search registered customer by name, phone or email..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="pl-9 h-10 text-xs rounded-xl"
              />
            </div>
            <Select
              value={data.customer_id}
              onValueChange={(v) => setData({ ...data, customer_id: v })}
            >
              <SelectTrigger className="h-11 rounded-xl text-xs font-medium">
                <SelectValue placeholder="Select existing customer" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <ScrollArea className="h-[220px]">
                  {filteredCustomers.map((customer) => (
                    <SelectItem key={customer._id} value={customer._id}>
                      <div className="flex items-center justify-between gap-3 w-full py-0.5">
                        <span className="font-semibold text-foreground text-xs">{customer.name}</span>
                        <span className="text-xs font-mono text-muted-foreground">{customer.phone}</span>
                      </div>
                    </SelectItem>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                      No matching registered customers found
                    </div>
                  )}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Customer Full Name *</Label>
                <Input
                  placeholder="e.g. Rahul Sharma"
                  value={data.customer_name}
                  onChange={(e) =>
                    setData({ ...data, customer_name: e.target.value })
                  }
                  className="h-10 text-xs rounded-xl font-medium"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Phone Number *</Label>
                <Input
                  placeholder="e.g. 9876543210"
                  value={data.customer_phone}
                  onChange={(e) =>
                    setData({ ...data, customer_phone: e.target.value })
                  }
                  className="h-10 text-xs rounded-xl font-medium"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Email Address (Optional)</Label>
                <Input
                  type="email"
                  placeholder="e.g. rahul@example.com"
                  value={data.customer_email}
                  onChange={(e) =>
                    setData({ ...data, customer_email: e.target.value })
                  }
                  className="h-10 text-xs rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Location / Address</Label>
                <Input
                  placeholder="e.g. Andheri West, Mumbai"
                  value={data.customer_location}
                  onChange={(e) =>
                    setData({ ...data, customer_location: e.target.value })
                  }
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 📄 4. Documents & KYC (for new customer) */}
      {!isEdit && data.is_new_customer && (
        <div className="rounded-2xl border border-border/80 bg-card/60 p-4 sm:p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">KYC & Verification Documents</h3>
              <p className="text-xs text-muted-foreground">Upload Aadhaar, driving license, and secondary IDs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Aadhaar Card Photo</Label>
              <div
                onClick={() => aadhaarInputRef.current?.click()}
                className="border-2 border-dashed border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-muted/40 rounded-2xl p-4 text-center cursor-pointer transition-all min-h-[110px] flex items-center justify-center"
              >
                {aadhaarPreview ? (
                  <div>
                    <img
                      src={aadhaarPreview}
                      alt="Aadhaar"
                      className="max-h-24 mx-auto rounded-xl border border-border/60 shadow-xs"
                    />
                    <p className="text-[11px] font-semibold text-primary mt-1.5">
                      ✓ Aadhaar attached • Click to replace
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 py-1">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <p className="text-xs font-semibold text-foreground">Upload Aadhaar</p>
                    <p className="text-[10px] text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input
                  ref={aadhaarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleAadhaarChange(e, setData, data)}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Driving License Photo</Label>
              <div
                onClick={() => licenseInputRef.current?.click()}
                className="border-2 border-dashed border-border/80 hover:border-primary/60 bg-muted/20 hover:bg-muted/40 rounded-2xl p-4 text-center cursor-pointer transition-all min-h-[110px] flex items-center justify-center"
              >
                {licensePreview ? (
                  <div>
                    <img
                      src={licensePreview}
                      alt="License"
                      className="max-h-24 mx-auto rounded-xl border border-border/60 shadow-xs"
                    />
                    <p className="text-[11px] font-semibold text-primary mt-1.5">
                      ✓ License attached • Click to replace
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 py-1">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <p className="text-xs font-semibold text-foreground">Upload License</p>
                    <p className="text-[10px] text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <input
                  ref={licenseInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLicenseChange(e, setData, data)}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold">Additional Documents (Max 5)</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleExtraDocsChange}
                className="h-10 text-xs rounded-xl cursor-pointer"
              />

              {extraDocPreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
                  {extraDocPreviews.map((src, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-xl overflow-hidden border border-border/70 shadow-2xs"
                    >
                      <img
                        src={src}
                        alt="doc"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExtraDoc(index)}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow-xs hover:bg-rose-700 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ⚙️ 5. Lead Source, Operations & Remarks */}
      <div className="rounded-2xl border border-border/80 bg-card/60 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
          <div className="w-8 h-8 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center shrink-0">
            <Fuel className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Operations, Referral & Remarks</h3>
            <p className="text-xs text-muted-foreground">Lead channel, fuel out level, and internal operational notes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Lead Source *</Label>
            <Select
              value={data.lead_source}
              onValueChange={(v) => setData({ ...data, lead_source: v })}
            >
              <SelectTrigger className="h-10 rounded-xl text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="hotel">Hotel Desk</SelectItem>
                <SelectItem value="social_media">Social Media (Insta / Ads)</SelectItem>
                <SelectItem value="personal_reference">Personal Reference</SelectItem>
                <SelectItem value="other">Other / Walk-in</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Source Name</Label>
            <Input
              placeholder="e.g. Hotel Taj, Instagram"
              value={data.source_name}
              onChange={(e) =>
                setData({ ...data, source_name: e.target.value })
              }
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Partner / Referral Name</Label>
            <Input
              placeholder="Enter partner or referral name"
              value={data.partner_name}
              onChange={(e) => setData({ ...data, partner_name: e.target.value })}
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Fuel Quantity (Liters)</Label>
            <Input
              type="number"
              min="0"
              step="0.5"
              placeholder="e.g. 3.0"
              value={data.fuel_quantity}
              onChange={(e) =>
                setData({ ...data, fuel_quantity: e.target.value })
              }
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Reference Partner Share (₹)</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.reference_partner_share}
              onChange={(e) =>
                setData({ ...data, reference_partner_share: e.target.value })
              }
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Provider Partner Share (₹)</Label>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={data.provider_partner_share}
              onChange={(e) =>
                setData({ ...data, provider_partner_share: e.target.value })
              }
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Account Manager</Label>
            <Input
              placeholder="Assigned staff manager"
              value={data.account_manager}
              onChange={(e) =>
                setData({ ...data, account_manager: e.target.value })
              }
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Internal Quick Note</Label>
            <Input
              placeholder="e.g. Helmet issued #3, customer requested extension..."
              value={data.notes}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-xs font-semibold">Detailed Remarks</Label>
            <Textarea
              placeholder="Additional operational or vehicle notes..."
              value={data.remarks}
              onChange={(e) => setData({ ...data, remarks: e.target.value })}
              rows={2}
              className="rounded-xl text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">Bookings & Dispatch</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage reservations, verify deposits, and process vehicle handovers</p>
        </div>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
          }}
        >
          {/* <DialogTrigger asChild>
            <Button className="gradient-sunset text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" /> New Booking
            </Button>
          </DialogTrigger> */}

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="h-9">
              <Download className="w-4 h-4 mr-1.5" />
              Export
            </Button>

            <DialogTrigger asChild>
              <Button variant="hero" size="sm" className="h-9">
                <Plus className="w-4 h-4 mr-1.5" /> New Booking
              </Button>
            </DialogTrigger>
          </div>

          <DialogContent className="max-w-2xl w-[96vw] sm:w-full max-h-[94vh] sm:max-h-[88vh] flex flex-col overflow-hidden p-0 rounded-2xl sm:rounded-3xl border border-border/80 shadow-2xl bg-card">
            <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border/70 bg-muted/20">
              <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" /> Create Manual Booking
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateBooking} className="flex flex-col flex-1 overflow-hidden">
              <ScrollArea className="flex-1 overflow-y-auto px-3.5 sm:px-6 py-4">
                {renderFormFields(formData, setFormData, false)}
              </ScrollArea>
              <div className="flex items-center justify-end gap-2.5 px-4 sm:px-6 py-3 border-t border-border/70 bg-muted/20 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 rounded-xl text-xs font-semibold cursor-pointer"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="h-10 px-5 rounded-xl text-xs font-bold gradient-sunset text-white cursor-pointer shadow-xs"
                  disabled={uploading || isAvailable === false}
                >
                  {uploading ? (
                    <>
                      <span className="animate-spin mr-1.5 inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                      Creating...
                    </>
                  ) : (
                    "Create Booking"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog
        open={!!editingBooking}
        onOpenChange={(open) => !open && setEditingBooking(null)}
      >
        <DialogContent className="max-w-2xl w-[96vw] sm:w-full max-h-[94vh] sm:max-h-[88vh] flex flex-col overflow-hidden p-0 rounded-2xl sm:rounded-3xl border border-border/80 shadow-2xl bg-card">
          <DialogHeader className="flex-shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border/70 bg-muted/20">
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Edit className="w-4 h-4 text-primary" /> Edit Booking #{editingBooking?._id?.slice(-6).toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col flex-1 overflow-hidden">
            <ScrollArea className="flex-1 overflow-y-auto px-3.5 sm:px-6 py-4">
              {renderFormFields(editFormData, setEditFormData, true)}
            </ScrollArea>
            <div className="flex items-center justify-end gap-2.5 px-4 sm:px-6 py-3 border-t border-border/70 bg-muted/20 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-10 px-4 rounded-xl text-xs font-semibold cursor-pointer"
                onClick={() => {
                  setEditingBooking(null);
                  setBikeSearch("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                size="sm"
                className="h-10 px-5 rounded-xl text-xs font-bold gradient-sunset text-white cursor-pointer shadow-xs"
                disabled={isAvailable === false}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!startRideDialog}
        onOpenChange={(open) => !open && setStartRideDialog(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Fuel className="w-5 h-5 text-primary" /> Start Ride - Record Fuel
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Enter fuel level (liters) before handing over the bike.
            </p>
            <div className="space-y-2">
              <Label>Fuel Out (Liters)</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={startRideData.fuel_out_liters}
                onChange={(e) =>
                  setStartRideData({ fuel_out_liters: e.target.value })
                }
                placeholder="e.g., 3.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setStartRideDialog(null);
              }}
            >
              Skip
            </Button>
            <Button
              onClick={handleStartRideConfirm}
              className="gradient-sunset"
            >
              Start Rental
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!completionDialog}
        onOpenChange={(open) => !open && setCompletionDialog(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" /> Complete Ride
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-5 py-4 pr-2">
              {completionDialog &&
                (() => {
                  const b = bookings?.find((x) => x._id === completionDialog);
                  return b && (b.deposit_amount ?? 0) > 0 ? (
                    <div className="p-3 rounded-lg bg-muted/50 border border-border text-sm">
                      <span className="text-muted-foreground">
                        Deposit Collected:
                      </span>{" "}
                      <span className="font-bold">
                        ₹{b.deposit_amount?.toLocaleString()}
                      </span>
                      <p className="text-xs text-muted-foreground mt-1">
                        Deductions (penalty + challan + damage) will be
                        subtracted from deposit.
                      </p>
                    </div>
                  ) : null;
                })()}

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Fuel className="w-4 h-4" /> End Fuel (Liters)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={completionData.fuel_in_liters}
                  onChange={(e) =>
                    setCompletionData({
                      ...completionData,
                      fuel_in_liters: e.target.value,
                    })
                  }
                  placeholder="e.g., 2.0"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" /> Penalty
                  Amount (₹)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={completionData.penalty_amount}
                  onChange={(e) =>
                    setCompletionData({
                      ...completionData,
                      penalty_amount: e.target.value,
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-600" /> Challan / Traffic
                  Violation (₹)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={completionData.challan_amount}
                  onChange={(e) =>
                    setCompletionData({
                      ...completionData,
                      challan_amount: e.target.value,
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-orange-600" /> Damage Cost (₹)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={completionData.damage_cost}
                  onChange={(e) =>
                    setCompletionData({
                      ...completionData,
                      damage_cost: e.target.value,
                    })
                  }
                  placeholder="0"
                />
              </div>

              {(() => {
                const penalty = Number(completionData.penalty_amount) || 0;
                const challan = Number(completionData.challan_amount) || 0;
                const damage = Number(completionData.damage_cost) || 0;
                const total = penalty + challan + damage;
                const b = bookings?.find((x) => x._id === completionDialog);
                const deposit = b?.deposit_amount || 0;
                const refund = Math.max(0, deposit - total);
                if (total > 0) {
                  return (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-200 dark:border-red-500/30 text-sm space-y-1">
                      <p className="font-semibold text-red-700 dark:text-red-400">
                        Total Deductions: ₹{total.toLocaleString()}
                      </p>
                      <p className="text-muted-foreground">
                        Deposit: ₹{deposit.toLocaleString()} → Refundable: ₹
                        {refund.toLocaleString()}
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={completionData.payment_method}
                  onValueChange={(v) =>
                    setCompletionData({ ...completionData, payment_method: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Payment Screenshot</Label>

                <div
                  onClick={() =>
                    document.getElementById("payment-upload").click()
                  }
                  className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/50"
                >
                  {paymentPreview ? (
                    <img
                      src={paymentPreview}
                      className="max-h-24 mx-auto rounded"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Upload Payment Screenshot
                    </p>
                  )}

                  <input
                    id="payment-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePaymentImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Final Remarks</Label>
                <Textarea
                  placeholder="Any final notes about the ride..."
                  value={completionData.remarks}
                  onChange={(e) =>
                    setCompletionData({
                      ...completionData,
                      remarks: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setCompletionDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleCompletionConfirm}
              className="gradient-sunset"
            >
              Complete Ride
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* 💳 COLLECT PAYMENT DIALOG */}
      <Dialog
        open={!!collectPaymentBooking}
        onOpenChange={(open) => {
          if (!open) {
            setCollectPaymentBooking(null);
            setPaymentAmountInput("");
            setPaymentMethodInput("cash");
            setPaymentNotesInput("");
          }
        }}
      >
        <DialogContent className="max-w-md w-full bg-card border-border shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <CreditCard className="w-5 h-5 text-primary" />
              Collect Payment
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Record an installment for booking #{collectPaymentBooking?._id?.slice(-6).toUpperCase()} (
              {collectPaymentBooking?.customer_name || collectPaymentBooking?.customers?.name || "Customer"})
            </DialogDescription>
          </DialogHeader>

          {collectPaymentBooking && (() => {
            const { totalDue, paidAmount, pendingAmount } = getBookingFinancials(collectPaymentBooking);
            return (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const amt = Number(paymentAmountInput);
                  if (!amt || amt <= 0) {
                    toast.error("Please enter a valid payment amount greater than 0");
                    return;
                  }
                  if (amt > pendingAmount) {
                    toast.error(`Amount cannot exceed remaining pending balance of ₹${pendingAmount}`);
                    return;
                  }
                  try {
                    setIsSubmittingPayment(true);
                    await recordPaymentMutation.mutateAsync({
                      bookingId: collectPaymentBooking._id,
                      paymentData: {
                        amount: amt,
                        payment_method: paymentMethodInput,
                        notes: paymentNotesInput,
                      },
                    });
                    setCollectPaymentBooking(null);
                    setPaymentAmountInput("");
                    setPaymentNotesInput("");
                  } catch (err) {
                    // handled by hook
                  } finally {
                    setIsSubmittingPayment(false);
                  }
                }}
                className="space-y-4 pt-2"
              >
                {/* Financial Summary Strip */}
                <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/80">
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">Total</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">₹{totalDue.toLocaleString()}</p>
                  </div>
                  <div className="text-center border-x border-border/60">
                    <p className="text-[10px] uppercase font-semibold text-emerald-500">Paid</p>
                    <p className="text-sm font-bold text-emerald-500 mt-0.5">₹{paidAmount.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-semibold text-amber-500">Due</p>
                    <p className="text-sm font-bold text-amber-500 mt-0.5">₹{pendingAmount.toLocaleString()}</p>
                  </div>
                </div>

                {/* Amount Input & Shortcut Button */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Payment Amount (₹) *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setPaymentAmountInput(String(pendingAmount))}
                      className="h-6 px-2 text-[11px] font-semibold text-primary hover:bg-primary/10 cursor-pointer"
                    >
                      Pay Full Remaining (₹{pendingAmount.toLocaleString()})
                    </Button>
                  </div>
                  <Input
                    type="number"
                    min="1"
                    max={pendingAmount}
                    step="any"
                    placeholder={`Enter amount up to ₹${pendingAmount}`}
                    value={paymentAmountInput}
                    onChange={(e) => setPaymentAmountInput(e.target.value)}
                    required
                    className="h-10 text-sm font-medium"
                  />
                  {paymentAmountInput && Number(paymentAmountInput) > 0 && (
                    <p className="text-[11px] text-muted-foreground flex items-center justify-between">
                      <span>
                        Balance After Payment:{" "}
                        <span className="font-semibold text-foreground">
                          ₹{Math.max(0, pendingAmount - Number(paymentAmountInput)).toLocaleString()}
                        </span>
                      </span>
                      <span className={pendingAmount - Number(paymentAmountInput) <= 0 ? "text-emerald-500 font-bold" : "text-amber-500 font-medium"}>
                        {pendingAmount - Number(paymentAmountInput) <= 0 ? "✓ Full Settlement" : "Partial Installment"}
                      </span>
                    </p>
                  )}
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Payment Method</Label>
                  <Select value={paymentMethodInput} onValueChange={setPaymentMethodInput}>
                    <SelectTrigger className="h-10 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI / Online</SelectItem>
                      <SelectItem value="online">Online / Web</SelectItem>
                      <SelectItem value="card">Debit / Credit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer / IMPS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes Input */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Notes / Transaction Ref (Optional)</Label>
                  <Input
                    placeholder="e.g. GPay ref #1234, cash collected at hub..."
                    value={paymentNotesInput}
                    onChange={(e) => setPaymentNotesInput(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <DialogFooter className="pt-2 gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCollectPaymentBooking(null)}
                    disabled={isSubmittingPayment}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmittingPayment || !paymentAmountInput || Number(paymentAmountInput) <= 0}
                    className="gradient-sunset text-white font-semibold"
                  >
                    {isSubmittingPayment ? (
                      <>
                        <span className="animate-spin mr-1.5 inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                        Recording...
                      </>
                    ) : (
                      `Collect ₹${Number(paymentAmountInput || 0).toLocaleString()}`
                    )}
                  </Button>
                </DialogFooter>
              </form>
            );
          })()}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!assignDialog}
        onOpenChange={(open) => !open && setAssignDialog(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bike className="w-5 h-5 text-primary" /> Assign Bike from Fleet
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted/45 border border-border rounded-xl">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                Booked Category
              </p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {assignDialog?.cluster_id?.name || "Cluster Category"}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Select an available physical bike to allocate to this customer
              reservation.
            </p>
            <div className="space-y-2">
              <Label>Available Vehicles *</Label>
              <Select value={assignBikeId} onValueChange={setAssignBikeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a specific bike" />
                </SelectTrigger>
                <SelectContent>
                  {assignableBikes.map((bike) => (
                    <SelectItem key={bike._id} value={bike._id}>
                      {bike.model} — {bike.number_plate}{" "}
                      {bike.bike_colour ? `(${bike.bike_colour})` : ""}
                    </SelectItem>
                  ))}
                  {assignableBikes.length === 0 && (
                    <div className="py-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-yellow-500" /> No
                      available bikes in this category!
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignBike}
              className="gradient-sunset font-semibold text-primary-foreground"
              disabled={!assignBikeId || assignBikeMutation.isPending}
            >
              {assignBikeMutation.isPending ? "Assigning..." : "Assign Vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>




      {/* 🔍 Search & Filter Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Box with Clear Button */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by rider, bike, plate, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-9 h-10 text-xs sm:text-sm rounded-xl bg-card border-border shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Due Pill & Payment Filter Dropdown */}
          <div className="flex items-center gap-2">
            {pendingDuesCount > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPaymentFilter(paymentFilter === "pending_due" ? "all" : "pending_due")}
                className={`h-10 px-3 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  paymentFilter === "pending_due"
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                }`}
              >
                <span>⚠️ {pendingDuesCount} Due</span>
              </Button>
            )}

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="h-10 w-full sm:w-44 text-xs font-semibold bg-card border-border rounded-xl shadow-2xs shrink-0">
                <CreditCard className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="All Payments" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending_due">Pending Due ({pendingDuesCount})</SelectItem>
                <SelectItem value="partial">Partially Paid</SelectItem>
                <SelectItem value="paid">Fully Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clean Segmented Tab Pills with smooth scroll */}
        <div className="w-full overflow-x-auto pb-1 scrollbar-none">
          <div className="inline-flex gap-1.5 p-1 bg-muted/60 rounded-xl border border-border/60 min-w-full sm:min-w-0">
            {[
              { value: "all", label: "All", count: bookingCounts.all },
              { value: "pending", label: "Pending", count: bookingCounts.pending },
              { value: "confirmed", label: "Confirmed", count: bookingCounts.confirmed },
              { value: "active", label: "Active", count: bookingCounts.active },
              { value: "completed", label: "Completed", count: bookingCounts.completed },
              { value: "cancelled", label: "Cancelled", count: bookingCounts.cancelled },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.value
                    ? "bg-background text-foreground font-bold shadow-xs border border-border/40"
                    : "text-muted-foreground hover:text-foreground font-medium"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeTab === tab.value
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedBookings?.map((booking, index) => {
            const isOnline = booking.booking_source === "online";
            const isPartner = booking.booking_source === "partner";
            const isExpanded = expandedBookingId === booking._id;

            return (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                // transition={{ delay: index * 0.02, duration: 0.3 }}
                transition={{ delay: Math.min(index, 6) * 0.02, duration: 0.2 }}
              >
                <Card
                  className={`group overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-200 hover:shadow-lg bg-card ${
                    isOnline
                      ? "border-l-4 border-l-blue-500 border-border/80 hover:border-border"
                      : isPartner
                        ? "border-l-4 border-l-purple-500 border-border/80 hover:border-border"
                        : "border-l-4 border-l-orange-500 border-border/80 hover:border-border"
                  }`}
                >
                  <CardContent className="p-0">
                    {/* 🏷️ Top Header Bar: Clean & Minimal (NO bike here - bike is inside the card!) */}
                    <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-muted/30 border-b border-border/50 gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                        {/* Reference Badge */}
                        <span className="font-mono text-[11px] font-bold text-foreground bg-background px-2 py-0.5 rounded-md border border-border/70 shadow-2xs shrink-0">
                          #{booking._id?.slice(-6).toUpperCase()}
                        </span>

                        {/* Area / Hub Badge with Dynamic Multi-Area Highlight */}
                        {(() => {
                          const areaName = getBookingAreaName(booking);
                          if (!areaName) return null;
                          const isMultiArea = selectedAreaIds && selectedAreaIds.length > 1;
                          return (
                            <Badge
                              variant="outline"
                              className={`text-[11px] font-semibold gap-1 px-2.5 py-0.5 rounded-full shadow-2xs transition-all truncate max-w-[130px] sm:max-w-none ${
                                isMultiArea
                                  ? "bg-amber-500/20 text-amber-500 border-amber-500/60 font-bold"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                              }`}
                            >
                              <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                              <span className="truncate">{areaName}</span>
                            </Badge>
                          );
                        })()}

                        {/* Booking Source Badge */}
                        <Badge
                          className={`${sourceColors[booking.booking_source] || "bg-muted text-muted-foreground"} border text-[11px] gap-1 font-medium shadow-2xs shrink-0`}
                        >
                          {sourceIcons[booking.booking_source]}
                          {getSourceLabel(booking.booking_source)}
                        </Badge>

                        {booking.lead_source && booking.lead_source !== "other" && (
                          <span className="text-[11px] text-muted-foreground capitalize hidden md:inline truncate max-w-[150px]">
                            via {booking.lead_source.replace("_", " ")}
                            {booking.source_name ? ` · ${booking.source_name}` : ""}
                          </span>
                        )}
                      </div>

                      {/* Status Badge + Overdue & Extended Pills */}
                      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        {booking.status === "active" && booking.end_datetime && new Date() > new Date(booking.end_datetime) && (
                          <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 text-[10px] font-bold animate-pulse gap-1 px-2 py-0.5">
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                            <span>Overdue</span>
                          </Badge>
                        )}

                        <Badge
                          className={`${statusColors[booking.status]} border text-[11px] font-bold capitalize flex items-center gap-1 shadow-2xs px-2.5 py-0.5`}
                        >
                          {booking.status === "active" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          )}
                          {booking.status === "pending" && (
                            <Clock className="w-3 h-3 text-amber-500" />
                          )}
                          {booking.status === "confirmed" && (
                            <CheckCircle2 className="w-3 h-3 text-blue-500" />
                          )}
                          <span>{booking.status}</span>
                        </Badge>

                        {booking.is_extended && (
                          <Badge className="bg-blue-600 text-white text-[10px] font-bold py-0.5 px-2">
                            Extended
                          </Badge>
                        )}
                      </div>
                    </div>
                    {/* 📋 Card Body: 4 Core Columns (2x2 on mobile for compact height, 4 columns on desktop) */}
                    <div className="p-3.5 sm:p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3.5 gap-x-4 sm:gap-6">
                        {/* 1. CUSTOMER */}
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Rider
                          </p>
                          <p className="font-bold text-foreground text-xs sm:text-sm truncate">
                            {booking.customer_name || booking.customers?.name || "—"}
                          </p>
                          {booking.contact_number || booking.customers?.phone ? (
                            <a
                              href={`tel:${booking.contact_number || booking.customers?.phone}`}
                              className="text-xs text-muted-foreground hover:text-emerald-500 flex items-center gap-1 mt-0.5 font-medium truncate cursor-pointer"
                              title="Call Rider"
                            >
                              <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                              <span className="truncate">
                                {booking.contact_number || booking.customers?.phone}
                              </span>
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>

                        {/* 2. BIKE (In card!) */}
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Bike
                          </p>
                          <p className="font-bold text-foreground text-xs sm:text-sm truncate">
                            {(() => {
                              const raw =
                                booking.vehicle_make_model ||
                                booking.bikes?.model ||
                                booking.bikes?.bike_name ||
                                (booking.cluster_id ? booking.cluster_id.name : "—");
                              const cleaned = raw ? raw.replace(/^undefined\s*/i, "").trim() : "";
                              return cleaned || (booking.cluster_id ? booking.cluster_id.name : "Bike");
                            })()}
                          </p>
                          <p className="text-xs text-muted-foreground truncate font-mono font-bold">
                            {booking.bikes?.number_plate || (booking.cluster_id ? "Unassigned" : "—")}
                          </p>
                        </div>

                        {/* 3. DURATION */}
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Duration
                          </p>
                          <p className="text-xs font-bold text-foreground truncate">
                            {(() => {
                              try {
                                return format(new Date(booking.start_datetime), "dd MMM, h:mm a");
                              } catch {
                                return "—";
                              }
                            })()}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                            <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span>
                              to{" "}
                              {(() => {
                                try {
                                  return format(new Date(booking.end_datetime), "dd MMM, h:mm a");
                                } catch {
                                  return "—";
                                }
                              })()}
                            </span>
                          </p>
                        </div>

                        {/* 4. TARIFF & BALANCE */}
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Tariff & Balance
                          </p>
                          {(() => {
                            const { isNew, totalDue, pendingAmount } = getBookingFinancials(booking);
                            return (
                              <>
                                <p className="text-sm sm:text-base font-black text-foreground leading-tight">
                                  ₹{Number(totalDue || booking.total_amount || 0).toLocaleString()}
                                </p>
                                {pendingAmount > 0 ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500">
                                    ⚠️ Due: ₹{pendingAmount.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-bold text-emerald-500 block">
                                    ✓ Fully Settled
                                  </span>
                                )}
                                {(booking.deposit_amount ?? 0) > 0 && (
                                  <p className="text-[10px] text-muted-foreground">
                                    + ₹{booking.deposit_amount?.toLocaleString()} Dep.
                                  </p>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* 🎯 Row 2: Bottom Actions Bar (Mobile 2-Tier + Desktop Horizontal) */}
                      {(() => {
                        const { isNew, pendingAmount } = getBookingFinancials(booking);
                        const canCollectPayment = isNew && pendingAmount > 0 && booking.status !== "cancelled";
                        const canMarkPaidOld = !isNew && booking.payment_status !== "paid" && booking.status !== "cancelled";
                        const canAssignBike = !booking.bike_id && booking.cluster_id;
                        const statusNextActions = statusActions[booking.status]?.filter((a) => a.next !== "cancelled") || [];
                        const hasPrimaryAction = canCollectPayment || canAssignBike || statusNextActions.length > 0;

                        const utilityButtons = (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isGeneratingBill}
                              onClick={() => handleBillClick(booking)}
                              className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 rounded-lg sm:rounded-xl text-xs font-medium border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-1.5 cursor-pointer shrink-0"
                              title="Download Invoice"
                            >
                              {isGeneratingBill && fetchingBillId === booking._id ? (
                                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full" />
                              ) : (
                                <Download className="w-3.5 h-3.5" />
                              )}
                              <span className="hidden sm:inline">Bill</span>
                            </Button>

                            {(booking.status === "active" ||
                              booking.status === "confirmed" ||
                              booking.status === "pending") && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditBooking(booking)}
                                className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 rounded-lg sm:rounded-xl text-xs font-medium border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-1.5 cursor-pointer shrink-0"
                                title="Edit Booking"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Edit</span>
                              </Button>
                            )}

                            {(booking.status === "active" ||
                              booking.status === "confirmed" ||
                              booking.status === "pending") && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 rounded-lg sm:rounded-xl text-xs font-medium border-blue-500/40 text-blue-500 bg-blue-500/5 hover:bg-blue-500/15 gap-1.5 cursor-pointer shrink-0"
                                onClick={() => handleOpenExtend(booking)}
                                title="Extend Rental"
                              >
                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                <span className="hidden sm:inline">Extend</span>
                              </Button>
                            )}

                            {canMarkPaidOld && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleMarkPaid(booking._id)}
                                className="h-8 sm:h-9 px-2 sm:px-3 rounded-lg sm:rounded-xl text-xs font-medium border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 gap-1.5 cursor-pointer shrink-0"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Paid</span>
                              </Button>
                            )}

                            {statusActions[booking.status]?.filter((a) => a.next === "cancelled").map((action) => (
                              <Button
                                key={action.next}
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(booking._id, action.next)}
                                className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3 rounded-lg sm:rounded-xl text-xs font-medium border-red-500/40 text-red-500 bg-red-500/5 hover:bg-red-500/15 gap-1.5 cursor-pointer shrink-0"
                                title="Cancel Booking"
                              >
                                <XCircle className="w-3.5 h-3.5 text-red-500" />
                                <span className="hidden sm:inline">Cancel</span>
                              </Button>
                            ))}
                          </>
                        );

                        const primaryButtons = (
                          <>
                            {canCollectPayment && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setCollectPaymentBooking(booking);
                                  setPaymentAmountInput(String(pendingAmount));
                                }}
                                className="h-9 px-3.5 rounded-xl text-xs font-bold bg-[#261c0d] hover:bg-[#332512] text-[#facc15] border border-[#facc15]/40 hover:border-[#facc15]/70 flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer flex-1 sm:flex-initial"
                              >
                                <IndianRupee className="w-3.5 h-3.5 text-[#facc15]" />
                                <span>Collect ₹{pendingAmount.toLocaleString()}</span>
                              </Button>
                            )}

                            {canAssignBike && (
                              <Button
                                size="sm"
                                onClick={() => setAssignDialog(booking)}
                                className="h-9 px-3.5 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/25 transition-all cursor-pointer flex-1 sm:flex-initial"
                              >
                                <Bike className="w-3.5 h-3.5" />
                                <span>Assign Bike</span>
                              </Button>
                            )}

                            {statusNextActions.map((action) => (
                              <Button
                                key={action.next}
                                size="sm"
                                onClick={() => handleStatusUpdate(booking._id, action.next)}
                                className="h-9 px-3.5 rounded-xl text-xs font-bold gradient-sunset text-primary-foreground flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer flex-1 sm:flex-initial"
                              >
                                {action.next === "active" ? (
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                ) : action.next === "completed" ? (
                                  <CheckCircle className="w-3.5 h-3.5" />
                                ) : (
                                  action.icon
                                )}
                                <span>{action.label}</span>
                              </Button>
                            ))}
                          </>
                        );

                        return (
                          <div className="pt-2.5 sm:pt-3 mt-2.5 sm:mt-3 border-t border-border/50">
                            {/* 📱 Mobile Layout: 2 Tiers (Row 1: View toggle + Utility icons, Row 2: Full-width Primary CTA) */}
                            <div className="flex sm:hidden flex-col gap-2 w-full">
                              <div className="flex items-center justify-between gap-1 w-full">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setExpandedBookingId(isExpanded ? null : booking._id)}
                                  className="h-8 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
                                >
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  <span>{isExpanded ? "Collapse" : "View"}</span>
                                  {(booking.fuel_out_liters != null || booking.fuel_quantity) && (
                                    <span className="text-[10px] text-amber-500 font-bold ml-0.5">
                                      ⛽ {booking.fuel_out_liters != null ? `${booking.fuel_out_liters}L` : `${booking.fuel_quantity}L`}
                                    </span>
                                  )}
                                </Button>

                                {/* Compact Icon Buttons Bar */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {utilityButtons}
                                </div>
                              </div>

                              {/* Primary Action Button as prominent full-width CTA on mobile */}
                              {hasPrimaryAction && (
                                <div className="flex items-center gap-2 w-full pt-0.5">
                                  {primaryButtons}
                                </div>
                              )}
                            </div>

                            {/* 💻 Desktop Layout: Single row with View toggle on left, Utilities & Primary CTA on right */}
                            <div className="hidden sm:flex items-center justify-between w-full gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setExpandedBookingId(isExpanded ? null : booking._id)}
                                className="h-9 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                <span>{isExpanded ? "Collapse" : "View Details"}</span>
                                {(booking.fuel_out_liters != null || booking.fuel_quantity) && (
                                  <span className="text-[10px] text-amber-500 font-bold ml-1">
                                    ⛽ {booking.fuel_out_liters != null ? `${booking.fuel_out_liters}L` : `${booking.fuel_quantity}L`}
                                  </span>
                                )}
                              </Button>

                              <div className="flex items-center gap-2 flex-wrap">
                                {utilityButtons}
                                {primaryButtons}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                              <div className="col-span-2 sm:col-span-1 min-w-0">
                                <span className="text-xs text-muted-foreground uppercase">Email</span>
                                <p className="font-medium text-xs sm:text-sm break-all">
                                  {booking.customer_email || booking.customers?.email || "—"}
                                </p>
                              </div>
                              <div className="col-span-2 sm:col-span-2 lg:col-span-3 min-w-0">
                                <span className="text-xs text-muted-foreground uppercase">Location</span>
                                <p className="font-medium text-xs sm:text-sm break-words leading-relaxed">
                                  {booking.customer_location || "—"}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">Rental Type</span>
                                <p className="font-medium capitalize">{booking.rental_type || "—"}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">Payment</span>
                                <p className="font-medium capitalize">
                                  {booking.payment_method || "—"} · {booking.payment_status || "pending"}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">Lead Source</span>
                                <p className="font-medium capitalize">{booking.lead_source?.replace("_", " ") || "—"}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">Source Name</span>
                                <p className="font-medium">{booking.source_name || "—"}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">Account Manager</span>
                                <p className="font-medium">{booking.account_manager || "—"}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">Deposit</span>
                                <p className="font-medium">₹{booking.deposit_amount?.toLocaleString() || 0}</p>
                              </div>
                              <div>
                                <span className="text-xs text-muted-foreground uppercase">Fuel Qty (Booked)</span>
                                <p className="font-medium">{booking.fuel_quantity ? `${booking.fuel_quantity} L` : "0 L"}</p>
                              </div>
                              {booking.fuel_out_liters != null && (
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase">Fuel Out</span>
                                  <p className="font-medium text-amber-500 font-bold">{booking.fuel_out_liters} L</p>
                                </div>
                              )}
                              {booking.fuel_in_liters != null && (
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase">Fuel In</span>
                                  <p className="font-medium text-emerald-500 font-bold">{booking.fuel_in_liters} L</p>
                                </div>
                              )}
                              {(booking.reference_partner_share ?? 0) > 0 && (
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase">Ref Share</span>
                                  <p className="font-medium">
                                    ₹{booking.reference_partner_share} {booking.reference_partner_share_given ? "(Given)" : "(Pending)"}
                                  </p>
                                </div>
                              )}
                              {(booking.provider_partner_share ?? 0) > 0 && (
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase">Provider Share</span>
                                  <p className="font-medium">
                                    ₹{booking.provider_partner_share} {booking.provider_partner_share_given ? "(Given)" : "(Pending)"}
                                  </p>
                                </div>
                              )}
                              {(booking.penalty_amount ?? 0) > 0 && (
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase">Penalty</span>
                                  <p className="font-medium text-red-600">₹{booking.penalty_amount}</p>
                                </div>
                              )}
                              {(booking.challan_amount ?? 0) > 0 && (
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase">Challan</span>
                                  <p className="font-medium text-red-600">₹{booking.challan_amount}</p>
                                </div>
                              )}
                              {(booking.damage_cost ?? 0) > 0 && (
                                <div>
                                  <span className="text-xs text-muted-foreground uppercase">Damage</span>
                                  <p className="font-medium text-red-600">₹{booking.damage_cost}</p>
                                </div>
                              )}
                            </div>

                            {/* Payment Screenshot */}
                            {booking.payment_screenshot && (
                              <div className="mt-3">
                                <span className="text-xs text-muted-foreground uppercase">Payment Proof</span>
                                <img
                                  src={booking.payment_screenshot}
                                  className="w-20 h-20 object-cover rounded mt-1 cursor-pointer hover:scale-105 transition"
                                  onClick={() => setPreviewImage(booking.payment_screenshot)}
                                  alt="Payment proof"
                                />
                              </div>
                            )}

                            {/* Notes & Remarks */}
                            {(booking.notes || booking.remarks) && (
                              <div className="mt-3 pt-3 border-t border-border/50 flex flex-wrap gap-3">
                                {booking.notes && (
                                  <p className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                    📝 {booking.notes}
                                  </p>
                                )}
                                {booking.remarks && (
                                  <p className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                    💬 {booking.remarks}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Payment Installments History */}
                            {Array.isArray(booking.payments) && booking.payments.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-border/60 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <CreditCard className="w-3.5 h-3.5 text-primary" />
                                    Payment Installments History ({booking.payments.length})
                                  </span>
                                  {getBookingFinancials(booking).pendingAmount > 0 && booking.status !== "cancelled" && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setCollectPaymentBooking(booking);
                                        setPaymentAmountInput(String(getBookingFinancials(booking).pendingAmount));
                                      }}
                                      className="h-6 px-2 text-[11px] text-primary hover:bg-primary/10 font-semibold cursor-pointer"
                                    >
                                      + Collect Due (₹{getBookingFinancials(booking).pendingAmount.toLocaleString()})
                                    </Button>
                                  )}
                                </div>
                                <div className="rounded-xl border border-border/70 overflow-hidden bg-card/60 divide-y divide-border/60">
                                  {booking.payments.map((p, idx) => (
                                    <div key={idx} className="p-2.5 sm:px-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                      <div className="flex items-center gap-2.5">
                                        <span className="w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-[10px] font-bold">
                                          {idx + 1}
                                        </span>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-emerald-400 text-sm">₹{Number(p.amount || 0).toLocaleString()}</span>
                                            <Badge variant="outline" className="text-[10px] uppercase font-semibold py-0 px-1.5">
                                              {p.payment_method || "cash"}
                                            </Badge>
                                          </div>
                                          {p.notes && (
                                            <p className="text-[11px] text-muted-foreground italic mt-0.5">{p.notes}</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-right text-[11px] text-muted-foreground flex sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                                        <span>{p.paid_at ? format(new Date(p.paid_at), "dd MMM yyyy, hh:mm a") : "—"}</span>
                                        {p.recorded_by && (
                                          <span className="text-[10px] text-muted-foreground/80">by {p.recorded_by}</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {previewImage && (
            <div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
              onClick={() => setPreviewImage(null)}
            >
              <img
                src={previewImage}
                className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
              />
            </div>
          )}

          {filteredBookings?.length === 0 && (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No bookings found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border/60 pt-4 px-1 bg-background/50 rounded-lg p-2">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * BOOKINGS_PER_PAGE + 1}–
                {Math.min(currentPage * BOOKINGS_PER_PAGE, filteredBookings.length)} of{" "}
                {filteredBookings.length} bookings
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  Previous
                </Button>
                <span className="text-sm font-medium px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}


        </div>
      )}

      <Dialog open={!!extendDialog} onOpenChange={() => setExtendDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogTitle>Extend Rental</DialogTitle>

          <div className="space-y-4">
            {/* New End Time */}

            <div className="space-y-2">
              <Label>New End Date/Time</Label>

              <Input
                type="datetime-local"
                value={extendData.new_end_datetime}
                onChange={(e) =>
                  setExtendData({
                    ...extendData,
                    new_end_datetime: e.target.value,
                  })
                }
              />
            </div>

            {/* Extra Amount */}

            <div className="space-y-2">
              <Label>Extra Amount (₹)</Label>

              <Input
                type="number"
                min="0"
                placeholder="Enter extra amount"
                value={extendData.extra_amount}
                onChange={(e) =>
                  setExtendData({
                    ...extendData,
                    extra_amount: e.target.value,
                  })
                }
              />

              {/* Live Calculation Preview */}
              {extendDialog && (
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/60 space-y-1.5 text-xs mt-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Current Total Due:</span>
                    <span className="font-semibold text-slate-200">
                      ₹{getBookingFinancials(extendDialog).totalDue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>+ Extra Extension Amount:</span>
                    <span className="font-semibold text-amber-400">
                      ₹{Math.max(0, Number(extendData.extra_amount || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t border-slate-700/60 pt-1.5 flex justify-between text-sm font-bold">
                    <span className="text-white">New Total Due:</span>
                    <span className="text-emerald-400">
                      ₹{(getBookingFinancials(extendDialog).totalDue + Math.max(0, Number(extendData.extra_amount || 0))).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {extendMessage && (
                <div
                  className={`text-sm px-3 py-2 rounded-md border
      ${isExtendAvailable
                      ? "bg-green-500/10 border-green-500 text-green-400"
                      : "bg-red-500/10 border-red-500 text-red-400"
                    }
    `}
                >
                  {extendMessage}
                </div>
              )}
            </div>

            {/* Buttons */}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setExtendDialog(null)}>
                Cancel
              </Button>

              {/* <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleExtendRental}
              >
                Extend Rental
              </Button> */}
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleExtendRental}
                disabled={extendBooking.isPending}
              >
                {extendBooking.isPending ? "Extending..." : "Extend Rental"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ================= ✅ OFF-SCREEN INVOICE ENGINE RENDER LAYER ================= */}
      {downloadingBooking && (
        <div
          style={{
            position: "absolute",
            top: "-9999px",
            left: "-9999px",
            width: "500px",
            overflow: "hidden",
          }}
        >
          {(() => {
            const targetBikeId =
              downloadingBooking.bike_id?._id || downloadingBooking.bike_id;
            const matchingBike = bikes?.find((b) => b._id === targetBikeId);
            //  const rentalBikeModel =

            //    matchingBike?.model ||
            //    downloadingBooking.bike_id?.model ||
            //    "Scooter";
            const rentalBikeModel =
              matchingBike?.model ||
              downloadingBooking.bike_id?.model ||
              downloadingBooking.cluster_id?.name ||
              "Scooter";
            // const issuedTimestamp = downloadingBooking.createdAt
            //   ? new Date(downloadingBooking.createdAt)
            //   : new Date();
            //  Updated Correct Line (Checks alternative date paths, falls back to today)
            const issuedTimestamp = downloadingBooking.createdAt
              ? new Date(downloadingBooking.createdAt)
              : downloadingBooking.start_datetime
                ? new Date(downloadingBooking.start_datetime)
                : new Date();
            return (
              <div
                id="direct-bill-hidden-node"
                style={{
                  width: "500px",
                  backgroundColor: "#ffffff",
                  padding: "10px",
                }}
              >
                {/* Formal Document Top Line */}
                <div className="print-header-direct flex justify-between items-start p-8 border-b-4 border-black mb-6">
                  <div className="flex items-center gap-3">
                    <img
                      src="/logo.jpeg"
                      alt="Pipip Logo"
                      className="w-12 h-12 object-contain"
                    />
                    <div>
                      <h1 className="text-3xl font-black tracking-tighter text-black">
                        PIPIP RENTALS
                      </h1>
                      <p className="text-xs text-black italic">
                        Premium Bike Rental Service
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold text-black uppercase">
                      Tax Invoice
                    </h2>
                    <p className="text-xs text-black font-mono">
                      #{downloadingBooking._id}
                    </p>
                  </div>
                </div>

                <div className="content-area-direct p-8 space-y-8">
                  <div className="flex flex-row justify-between gap-4 border-b border-dashed border-black pb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-black uppercase tracking-widest">
                        Order ID
                      </span>
                      <p className="text-sm font-mono font-bold text-black">
                        #{downloadingBooking._id}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-black uppercase tracking-widest">
                        Issue Date
                      </span>
                      <p className="text-sm font-bold text-black">
                        {issuedTimestamp.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-4">
                      Summary Details
                    </h4>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-black">Customer Name</span>
                      <span className="font-bold text-black">
                        {downloadingBooking.customer_name ||
                          downloadingBooking.customer_id?.name ||
                          "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-black">Contact Number</span>
                      <span className="font-bold text-black">
                        +91{" "}
                        {downloadingBooking.contact_number ||
                          downloadingBooking.customer_id?.phone ||
                          "-"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-black">Bike Model</span>
                      <span className="font-bold text-black">
                        {rentalBikeModel}
                      </span>
                    </div>

                    {/* <div className="flex justify-between items-center text-sm">
                      <span className="text-black">Bike Model</span>
                      <span className="font-bold text-black">
                        {matchingBike?.bike_name || rentalBikeModel}
                      </span>
                    </div> */}
                    <div className="flex justify-between items-start text-sm">
                      <span className="text-black">Rental Period</span>
                      <div className="text-right text-black">
                        <p className="font-bold">
                          {downloadingBooking.start_datetime
                            ? new Date(
                              downloadingBooking.start_datetime,
                            ).toLocaleString("en-IN", {
                              month: "short",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            : "-"}
                        </p>
                        <p className="text-[10px]">
                          to{" "}
                          {downloadingBooking.end_datetime
                            ? new Date(
                              downloadingBooking.end_datetime,
                            ).toLocaleString("en-IN", {
                              month: "short",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="amount-box-direct bg-white p-8 border-2 border-black">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[10px] font-black uppercase text-black tracking-widest">
                          Total Amount Paid
                        </span>
                        <p className="text-5xl font-black text-black">
                          ₹{(getBookingFinancials(downloadingBooking).totalDue).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="badge-direct text-[10px] font-black px-3 py-1 uppercase border border-black bg-white text-black">
                          {downloadingBooking.payment_method === "online"
                            ? "Verified PAID"
                            : "Pay on Pickup"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="instructions-direct p-4 text-[10px] text-black leading-relaxed border border-black bg-white">
                    <p className="font-bold mb-1 uppercase tracking-tighter">
                      Instructions:
                    </p>
                    <p>
                      • Carry original identification and driver documents. No
                      digital snapshots copies accepted.
                    </p>
                    <p>
                      • Helmets provided based on active stock availability
                      metrics.
                    </p>
                    <p>
                      • Vehicle should be returned at designated area collection
                      locations.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
