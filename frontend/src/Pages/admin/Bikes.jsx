import { useState , useEffect } from "react";
import {useSearchParams} from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
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
} from "../../components/ui/dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  useBikes,
  useCreateBike,
  useUpdateBike,
  useDeleteBike,
} from "../../hooks/useBikes";
import { useAreas, useAllAreas } from "../../hooks/useAreas";
import { useAdminArea } from "../../lib/AreaContext";
import { useBookings } from "../../hooks/useBooking";

import {
  Plus,
  Edit,
  Trash2,
  Bike as BikeIcon,
  Search,
  MapPin,
  Filter,
  Eye,
  X,
  Calendar,
  Gauge,
  Wrench,
  Battery,
  CircleDot,
  Navigation,
  Download,
  Loader2,
  Layers,
  CheckCircle2,
  Play,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";
import { toast } from "sonner";
import { useAuth } from "../../lib/AuthProvider";

// const statusColors = {
//   available: "bg-green-500/20 text-green-400 border-green-500/30",
//   booked: "bg-red-500/20 text-red-400 border-red-500/30",
//   maintenance: "bg-amber-500/20 text-amber-400 border-amber-500/30",
// };

const statusColors = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold",
  booked: "bg-blue-50 text-blue-700 border-blue-300 font-bold",
  maintenance: "bg-amber-50 text-amber-700 border-amber-300 font-bold",
};

const initialFormData = {
  model: "",
  number_plate: "",
  cc: 0,
  price_per_hour: 0,
  price_per_day: 0,
  image_url: "",
  status: "available",
  description: "",
  area_id: "",
  bike_name: "",
  bike_colour: "",
  bike_owner: "",
  fine_owner: "",
  insurance_end_date: "",
  puc_end_date: "",
  bike_end_date: "",
  last_service_date: "",
  bike_expenses: 0,
  total_km_run: 0,
  last_battery_changed: "",
  last_tyre_change: "",
  gps_installed_date: "",
  extra_images: [],
};

export default function Bikes() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingBike, setEditingBike] = useState(null);
  const [viewingBike, setViewingBike] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: bikes, isLoading } = useBikes();
  const { data: bookings } = useBookings("all");
  const { data: areas } = useAreas();
  const { data: allAreas } = useAllAreas();
  const { areas: adminAreas } = useAdminArea();
  const { user, isStaff, isInvestor, isManager } = useAuth();

  // Comprehensive deduplicated area list across all sources
  const availableAreas = (function () {
    const list = [
      ...(Array.isArray(allAreas) ? allAreas : []),
      ...(Array.isArray(areas) ? areas : []),
      ...(Array.isArray(adminAreas) ? adminAreas : []),
    ];
    const map = new Map();
    list.forEach((a) => {
      if (a && (a._id || a.id)) {
        map.set(String(a._id || a.id), a);
      }
    });
    return Array.from(map.values());
  })();

  const displayAreas = (isStaff || isManager)
    ? (user?.assigned_areas && user.assigned_areas.length > 0
        ? user.assigned_areas
        : user?.areaId
          ? [user.areaId]
          : [])
    : (availableAreas.length > 0 ? availableAreas : (areas || []));

  useEffect(() => {
    if ((isStaff || isManager) && displayAreas.length > 0) {
      const assignedAreaId = displayAreas[0]._id || displayAreas[0];
      if (areaFilter === "all" || areaFilter !== assignedAreaId) {
        setAreaFilter(assignedAreaId);
      }
    }
  }, [isStaff, isManager, displayAreas]);
  const createBike = useCreateBike();
  const updateBike = useUpdateBike();
  const deleteBike = useDeleteBike();
  const isSubmitting = createBike.isPending || updateBike.isPending;
  const [selectedFile, setSelectedFile] = useState(null);

  const [searchParams] = useSearchParams();

  // State for multiple extra files
  const [extraFiles, setExtraFiles] = useState([]);
  // State for previews (blob urls)
  const [extraPreviews, setExtraPreviews] = useState([]);
  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: "",
    description: "",
    type: "warning",
    confirmText: "Confirm",
    details: [],
    onConfirm: () => {},
    isLoading: false,
  });


  useEffect(() => {
    const searchVal = searchParams.get("search");
    if (searchVal) {
      setSearchQuery(searchVal);
      if (bikes && bikes.length > 0) {
        const matched = bikes.find(
          (b) =>
            b._id === searchVal ||
            b.number_plate?.toLowerCase() === searchVal.toLowerCase()
        );
        if (matched) {
          setViewingBike(matched);
        }
      }
    }
  }, [searchParams, bikes]);

// ===============================
// SAFE ACTIVE RENTAL LOGIC
// ===============================

// ✅ STATUS-BASED ACTIVE RENTALS

const activeRentals =
  (bookings || []).filter(
    (booking) =>
      booking.status === "active"
  );

const rentedBikeIds = new Set(
  activeRentals
    .map(
      (booking) =>
        booking.bike_id?._id ||
        booking.bike_id
    )
    .filter(Boolean)
    .flatMap((id) => [String(id), id])
);

  // File selection handler (One by One)
  const handleExtraFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (extraFiles.length >= 5) {
      toast.error("Maximum 5 extra photos allowed");
      return;
    }

    // Add to binary files state
    setExtraFiles((prev) => [...prev, file]);

    // Add to previews state
    const reader = new FileReader();
    reader.onloadend = () => {
      setExtraPreviews((prev) => [...prev, reader.result]);
    };
    reader.readAsDataURL(file);

    // Clear input value to allow selecting same file again if needed
    e.target.value = "";
  };

  // Remove file handler
  // Remove file handler
  const removeExtraFile = (index) => {
    const itemToRemove = extraPreviews[index];

    // Case 1: If it's a new file (a local blob/base64 preview)
    if (
      typeof itemToRemove === "string" &&
      (itemToRemove.startsWith("data:") || itemToRemove.startsWith("blob:"))
    ) {
      // Find the relative index in the extraFiles (binary) array
      // We count how many "new" files appear before this one in the previews
      const binaryIndex = extraPreviews
        .slice(0, index)
        .filter(
          (src) => src.startsWith("data:") || src.startsWith("blob:"),
        ).length;

      setExtraFiles((prev) => prev.filter((_, i) => i !== binaryIndex));
    }

    // Case 2: Always remove from previews (works for both existing URLs and new previews)
    setExtraPreviews((prev) => prev.filter((_, i) => i !== index));
  };
  // Add this to your state declarations

  const downloadImage = async (imageUrl, fileName) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "bike-document.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error("Download failed");
    }
  };

  // const filteredBikes = bikes?.filter((bike) => {
  //   const searchMatch =
  //     bike.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     bike.number_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     (bike.bike_name || "").toLowerCase().includes(searchQuery.toLowerCase());
  //   const areaMatch = areaFilter === "all" || bike.area_id === areaFilter;
  //   const statusMatch = statusFilter === "all" || bike.status === statusFilter;
  //   return searchMatch && areaMatch && statusMatch;
  // });


  //  const currentTime = new Date();

  // Active rentals
  // const activeRentals =
  //   bookings?.filter((booking) => {
  //     if (booking.status !== "active") return false;

  //     const start = new Date(booking.start_datetime);

  //     const end = new Date(booking.end_datetime);

  //     return start <= currentTime && end >= currentTime;
  //   }) || [];

  // Active rentals (status-based)



  // Get rented bike IDs
  
  // Fleet calculation matching Dashboard logic
  const maintenanceBikeList = (bikes || []).filter(
    (bike) => bike.status === "maintenance"
  );

  const availableBikeList = (bikes || []).filter(
    (bike) =>
      !rentedBikeIds.has(String(bike._id)) &&
      !rentedBikeIds.has(bike._id) &&
      bike.status !== "maintenance"
  );

  const bookedBikeList = (bikes || []).filter(
    (bike) =>
      (rentedBikeIds.has(String(bike._id)) || rentedBikeIds.has(bike._id)) &&
      bike.status !== "maintenance"
  );

  const availableCount = availableBikeList.length;
  const bookedCount = bookedBikeList.length;
  const maintenanceCount = maintenanceBikeList.length;

  const getAreaName = (area) => {
    if (!area) return "Not Assigned";

    // 1. If bike.area_id is already a populated object with a name
    if (typeof area === "object") {
      if (area.name) return area.name;
      if (area.area_name) return area.area_name;
    }

    // 2. Extract target ID or name
    const targetId = typeof area === "object" ? (area._id || area.id) : area;
    if (!targetId) return "Not Assigned";

    // 3. Search in availableAreas, displayAreas, and user assigned areas
    const pool = [
      ...availableAreas,
      ...(Array.isArray(displayAreas) ? displayAreas : []),
      ...(Array.isArray(user?.assigned_areas) ? user.assigned_areas : []),
      ...(user?.areaId ? [user.areaId] : []),
    ];

    const matched = pool.find((a) => {
      if (!a) return false;
      const aId = a._id || a.id;
      return (
        (aId && String(aId) === String(targetId)) ||
        (a.name && a.name.toLowerCase() === String(targetId).toLowerCase())
      );
    });

    if (matched?.name) return matched.name;

    // 4. If targetId is not a 24-character hexadecimal ObjectId, it is likely already an Area Name string (e.g. "Andheri", "Mumbai")
    if (typeof targetId === "string" && targetId.trim() !== "" && !/^[0-9a-fA-F]{24}$/.test(targetId)) {
      return targetId;
    }

    return "Not Assigned";
  };





const filteredBikes = (bikes || []).filter((bike) => {
  const query = debouncedSearch.toLowerCase().trim();
  const searchMatch =
    !query ||
    (bike.model && bike.model.toLowerCase().includes(query)) ||
    (bike.number_plate && bike.number_plate.toLowerCase().includes(query)) ||
    (bike.bike_name && bike.bike_name.toLowerCase().includes(query));

  const bikeAreaId = bike.area_id?._id || bike.area_id;
  const areaMatch =
    areaFilter === "all" ||
    String(bikeAreaId) === String(areaFilter);

  // 🔥 CORRECT STATUS LOGIC
  const isBooked =
    rentedBikeIds.has(String(bike._id)) || rentedBikeIds.has(bike._id);

  const displayStatus =
    bike.status === "maintenance"
      ? "maintenance"
      : isBooked
      ? "booked"
      : "available";

  const statusMatch =
    statusFilter === "all" ||
    displayStatus === statusFilter;

  return searchMatch && areaMatch && statusMatch;
});



  // ===============================
  // PROFESSIONAL BIKE STATUS LOGIC
  // ADD BELOW filteredBikes
  // ===============================

  // const currentTime = new Date();

  // // Active rentals
  // const activeRentals =
  //   bookings?.filter((booking) => {
  //     if (booking.status !== "active") return false;

  //     const start = new Date(booking.start_datetime);

  //     const end = new Date(booking.end_datetime);

  //     return start <= currentTime && end >= currentTime;
  //   }) || [];

  // // Get rented bike IDs
  // const rentedBikeIds = new Set(
  //   activeRentals.map((booking) => booking.bike_id?._id || booking.bike_id),
  // );

  // // Maintenance bikes
  // const maintenanceCount =
  //   bikes?.filter((bike) => bike.status === "maintenance").length || 0;

  // // Booked bikes
  // const bookedCount = rentedBikeIds.size;

  // // Available bikes
  // const availableCount = (bikes?.length || 0) - bookedCount - maintenanceCount;

  // // Change this:
  // const getAreaName = (areaId) => {
  //   if (!areaId || !areas) return "Not Assigned";
  //   return (
  //     areas.find((a) => a._id === areaId || a.id === areaId)?.name || "Unknown"
  //   );
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   const data = new FormData();

  //   // Basic fields
  //   Object.keys(formData).forEach((key) => {
  //     if (key !== "image_url" && key !== "extra_images") {
  //       data.append(key, formData[key]);
  //     }
  //   });

  //   // Main Image
  //   if (selectedFile) {
  //     data.append("image_url", selectedFile);
  //   }

  //   // Extra Images - 'extra_images' key wahi honi chahiye jo backend route mein hai
  //   extraFiles.forEach((file) => {
  //     data.append("extra_images", file);
  //   });

  //   try {
  //     if (editingBike) {
  //       // Corrected to use .id and pass formData
  //       await updateBike.mutateAsync({
  //         id: editingBike._id || editingBike.id,
  //         formData: data,
  //       });
  //     } else {
  //       await createBike.mutateAsync(data);
  //     }
  //     toast.success(editingBike ? "Bike updated" : "Bike added");
  //     handleOpenChange(false);
  //   } catch (error) {
  //     toast.error("Failed to save");
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    // 1. Text fields append (Excluding images & empty strings for optional references/dates)
    Object.keys(formData).forEach((key) => {
      if (
        key !== "image_url" &&
        key !== "extra_images" &&
        formData[key] !== undefined &&
        formData[key] !== null
      ) {
        let val = formData[key];
        // If an object accidentally slipped in (like populated area_id), extract _id
        if (typeof val === "object" && val !== null) {
          val = val._id || val.id || "";
        }
        // Do not send empty string or [object Object] for area_id or date fields to prevent Mongoose CastErrors
        if (typeof val === "string") {
          const trimmed = val.trim();
          if (trimmed === "" || trimmed === "[object Object]") {
            if (key === "area_id" || key.endsWith("_date") || key.startsWith("last_")) {
              return;
            }
          }
        }
        data.append(key, val);
      }
    });

    // 2. Main Profile Image
    if (selectedFile) {
      data.append("image_url", selectedFile);
    } else if (editingBike && !formData.image_url) {
      // User explicitly deleted the main image in edit modal
      data.append("remove_main_image", "true");
      data.append("image_url", "");
    }

    // --- NEW CHANGE START ---
    // 3. Send the list of EXISTING images that were NOT deleted
    // We filter 'extraPreviews' to find strings that are already URLs (hosted on your server/cloudinary)
    const remainingImages = extraPreviews.filter(
      (src) => typeof src === "string" && src.startsWith("http"),
    );

    // Send this as a stringified array so the backend can parse it
    data.append("remaining_extra_images", JSON.stringify(remainingImages));
    // --- NEW CHANGE END ---

    // 4. Append NEWLY selected files
    extraFiles.forEach((file) => {
      data.append("extra_images", file);
    });

    try {
      if (editingBike) {
        await updateBike.mutateAsync({
          id: editingBike._id || editingBike.id,
          formData: data,
        });
      } else {
        await createBike.mutateAsync(data);
      }

      toast.success(editingBike ? "Bike updated" : "Bike added");

      setExtraFiles([]);
      setExtraPreviews([]);
      setSelectedFile(null);
      handleOpenChange(false);
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error(error.response?.data?.message || "Failed to save");
    }
  };
  const handleEdit = (bike) => {
    setEditingBike(bike);
    setSelectedFile(null); // <--- ADD THIS LINE

    const toInputDate = (dateStr) => {
      if (!dateStr) return "";
      return new Date(dateStr).toISOString().split("T")[0];
    };

    const cleanAreaId =
      typeof bike.area_id === "object" && bike.area_id !== null
        ? bike.area_id._id || ""
        : bike.area_id || "";

    setFormData({
      model: bike.model,
      number_plate: bike.number_plate,
      cc: bike.cc,
      price_per_hour: bike.price_per_hour,
      price_per_day: bike.price_per_day,
      image_url: bike.image_url || "",
      status: bike.status,
      description: bike.description || "",
      area_id: cleanAreaId,
      bike_name: bike.bike_name || "",
      bike_colour: bike.bike_colour || "",
      bike_owner: bike.bike_owner || "",
      fine_owner: bike.fine_owner || "",

      bike_expenses: bike.bike_expenses || 0,
      total_km_run: bike.total_km_run || 0,

      insurance_end_date: toInputDate(bike.insurance_end_date),
      puc_end_date: toInputDate(bike.puc_end_date),
      bike_end_date: toInputDate(bike.bike_end_date),
      last_service_date: toInputDate(bike.last_service_date),
      last_battery_changed: toInputDate(bike.last_battery_changed),
      last_tyre_change: toInputDate(bike.last_tyre_change),
      gps_installed_date: toInputDate(bike.gps_installed_date),
    });
    if (bike.extra_images) {
      setExtraPreviews(bike.extra_images);
    } else {
      setExtraPreviews([]);
    }

    setIsOpen(true);
  };

  const handleDelete = (id) => {
    const bike = (bikes || []).find((b) => b._id === id);
    const bikeTitle = bike ? `${bike.bike_name || bike.model} (${bike.number_plate})` : "this bike";

    setConfirmConfig({
      open: true,
      title: "Delete Vehicle from Fleet",
      description: `Are you sure you want to permanently delete ${bikeTitle}? This action removes the vehicle from the rental catalog and admin fleet records.`,
      type: "danger",
      confirmText: "Yes, Delete Bike",
      details: [
        { label: "Vehicle", value: bike?.bike_name || bike?.model || "Bike" },
        { label: "Number Plate", value: bike?.number_plate || "N/A" },
        { label: "Hub", value: getAreaName(bike?.area_id) },
        { label: "Owner", value: bike?.bike_owner || "Pipip Fleet" },
      ],
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmConfig((prev) => ({ ...prev, isLoading: true }));
          await deleteBike.mutateAsync(id);
          toast.success("Vehicle deleted from fleet successfully");
          setConfirmConfig((prev) => ({ ...prev, open: false, isLoading: false }));
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to delete bike");
          setConfirmConfig((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      setEditingBike(null);
      setSelectedFile(null);
      setExtraFiles([]); // Added
      setExtraPreviews([]);
      setFormData(initialFormData);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  

  return (
    <div className="space-y-6 pb-8">
      {/* 🚀 LIGHT AURORA COMMAND HEADER (Bright & Attractive, Never Dark) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/30 text-slate-900 p-5 sm:p-7 shadow-sm border border-slate-200/90"
      >
        {/* Ambient Pastel Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-400/10 rounded-full blur-[70px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                LIVE FLEET ASSETS
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                {filteredBikes.length} Total Vehicles
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-display tracking-tight text-slate-900">
              Fleet Inventory & Assets
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
              Real-time vehicle telemetry, maintenance logs, hub allocation, and live rental status across Mumbai.
            </p>
          </div>

          {!isInvestor && (
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md shadow-blue-500/25 active:scale-95 transition-all self-start md:self-auto cursor-pointer"
              onClick={() => {
                setEditingBike(null);
                setSelectedFile(null);
                setExtraFiles([]);
                setExtraPreviews([]);
                const defaultAreaId =
                  (isStaff || isManager) && displayAreas?.length > 0
                    ? displayAreas[0]._id || displayAreas[0]
                    : "";
                setFormData({
                  ...initialFormData,
                  area_id: defaultAreaId,
                });
                setIsOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              <span>Add Vehicle</span>
            </Button>
          )}
        </div>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl bg-white border border-slate-200 max-h-[90vh] overflow-hidden flex flex-col rounded-3xl shadow-2xl">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-slate-900 font-display font-black text-lg">
              {editingBike ? "Edit Fleet Vehicle" : "Add New Fleet Vehicle"}
            </DialogTitle>
          </DialogHeader>
            <ScrollArea className="flex-1 overflow-auto pr-4">
              <form onSubmit={handleSubmit} className="space-y-5 pb-4">
                {/* Image Upload */}
                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label htmlFor="image_upload">Bike Image</Label>
                  <div className="flex flex-col gap-2">
                    {/* Show Preview (Uses existing URL or the Base64 preview) */}
                    {formData.image_url && (
                      <div className="relative w-20 h-20 rounded-md overflow-hidden border">
                        <img
                          src={formData.image_url}
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, image_url: "" }));
                            setSelectedFile(null); // Clear the binary file too
                            const fileInput = document.getElementById("image_upload");
                            if (fileInput) fileInput.value = "";
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-md hover:bg-red-600 transition-colors"
                          title="Delete image"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <Input
                      id="image_upload"
                      type="file"
                      accept="image/*"
                      className="cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setSelectedFile(file); // CRITICAL: Store actual binary file for handleSubmit

                          // Set local preview so the user sees the image immediately
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({
                              ...formData,
                              image_url: reader.result,
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>
                {/* Section: Basic Details */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-1">
                    Basic Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bike_name">Bike Name</Label>
                      <Input
                        id="bike_name"
                        value={formData.bike_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bike_name: e.target.value,
                          })
                        }
                        placeholder="e.g. Activa 6G"
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        value={formData.model}
                        onChange={(e) =>
                          setFormData({ ...formData, model: e.target.value })
                        }
                        placeholder="Honda Activa"
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="number_plate">Number Plate *</Label>
                      <Input
                        id="number_plate"
                        value={formData.number_plate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            number_plate: e.target.value,
                          })
                        }
                        placeholder="MH12AB1234"
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cc">CC *</Label>
                      <Input
                        id="cc"
                        type="number"
                        value={formData.cc || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            cc: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="125"
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bike_colour">Colour</Label>
                      <Input
                        id="bike_colour"
                        value={formData.bike_colour}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bike_colour: e.target.value,
                          })
                        }
                        placeholder="Black"
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bike_owner">Owner</Label>
                      <Input
                        id="bike_owner"
                        value={formData.bike_owner}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bike_owner: e.target.value,
                          })
                        }
                        placeholder="Owner name"
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fine_owner">Fine Owner</Label>
                      <Input
                        id="fine_owner"
                        value={formData.fine_owner}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            fine_owner: e.target.value,
                          })
                        }
                        placeholder="Fine owner name"
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="area_id">Area</Label>
                      <Select
                        value={formData.area_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, area_id: value })
                        }

                        disabled={(isStaff || isManager) && displayAreas?.length <= 1}

                      >
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue placeholder="Select area" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* {areas?.map((area) => ( */}
                          {displayAreas?.map((area) => (
                            <SelectItem key={area._id} value={area._id}>
                              {area.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          setFormData({ ...formData, status: value })
                        }
                      >
                        <SelectTrigger className="bg-input border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="booked">Booked</SelectItem>
                          <SelectItem value="maintenance">
                            Maintenance
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Section: Pricing */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-1">
                    Pricing
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price_per_hour">Price/Hour (₹) *</Label>
                      <Input
                        id="price_per_hour"
                        type="number"
                        value={formData.price_per_hour || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price_per_hour: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="50"
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price_per_day">Price/Day (₹) *</Label>
                      <Input
                        id="price_per_day"
                        type="number"
                        value={formData.price_per_day || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price_per_day: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="500"
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Documents & Dates */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-1">
                    Documents & Dates
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="insurance_end_date">
                        Insurance End Date
                      </Label>
                      <Input
                        id="insurance_end_date"
                        type="date"
                        value={formData.insurance_end_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            insurance_end_date: e.target.value,
                          })
                        }
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="puc_end_date">PUC End Date</Label>
                      <Input
                        id="puc_end_date"
                        type="date"
                        value={formData.puc_end_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            puc_end_date: e.target.value,
                          })
                        }
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bike_end_date">
                      Bike End Date (Lifecycle)
                    </Label>
                    <Input
                      id="bike_end_date"
                      type="date"
                      value={formData.bike_end_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bike_end_date: e.target.value,
                        })
                      }
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                {/* Section: Maintenance & Usage */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-1">
                    Maintenance & Usage
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="last_service_date">
                        Last Service Date
                      </Label>
                      <Input
                        id="last_service_date"
                        type="date"
                        value={formData.last_service_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            last_service_date: e.target.value,
                          })
                        }
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bike_expenses">Total Expenses (₹)</Label>
                      <Input
                        id="bike_expenses"
                        type="number"
                        value={formData.bike_expenses || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            bike_expenses: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="total_km_run">Total KM Run</Label>
                      <Input
                        id="total_km_run"
                        type="number"
                        value={formData.total_km_run || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            total_km_run: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gps_installed_date">
                        GPS Installed Date
                      </Label>
                      <Input
                        id="gps_installed_date"
                        type="date"
                        value={formData.gps_installed_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gps_installed_date: e.target.value,
                          })
                        }
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Parts Replacement */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-1">
                    Parts Replacement
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="last_battery_changed">
                        Last Battery Changed
                      </Label>
                      <Input
                        id="last_battery_changed"
                        type="date"
                        value={formData.last_battery_changed}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            last_battery_changed: e.target.value,
                          })
                        }
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_tyre_change">Last Tyre Change</Label>
                      <Input
                        id="last_tyre_change"
                        type="date"
                        value={formData.last_tyre_change}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            last_tyre_change: e.target.value,
                          })
                        }
                        className="bg-input border-border"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Upload Extra Photos (Max 5)</Label>

                  <div className="flex flex-wrap gap-2">
                    {/* Pehle se selected files dikhayein */}
                    {extraPreviews.map((src, index) => (
                      <div key={index} className="relative w-20 h-20">
                        <img
                          src={src}
                          className="w-full h-full object-cover rounded-md border"
                        />
                        <button
                          type="button"
                          onClick={() => removeExtraFile(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}

                    {/* Naya add karne ka button */}
                    {extraFiles.length < 5 && (
                      <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed rounded-md cursor-pointer hover:bg-accent">
                        <Plus className="w-6 h-6" />
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleExtraFileChange}
                          accept="image/*"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Additional details about the bike..."
                    rows={3}
                    className="bg-input border-border"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="gradient-sunset text-primary-foreground min-w-[120px]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {editingBike ? "Updating..." : "Adding..."}
                      </span>
                    ) : (
                      editingBike ? "Update Bike" : "Add Bike"
                    )}
                  </Button>
                </div>
              </form>
            </ScrollArea>
          </DialogContent>
        </Dialog>

      {/* 📊 KPI FLEET METRICS STRIP (Bright, Clean Light Mode) */}
      {bikes && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Fleet */}
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Fleet
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <BikeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black font-display text-slate-900 tabular-nums">
                {bikes.length}
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                Registered
              </span>
            </div>
          </motion.div>

          {/* Available */}
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white border border-emerald-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Available
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black font-display text-emerald-600 tabular-nums">
                {availableCount}
              </span>
              <span className="text-[11px] font-bold text-emerald-700">
                Hub Ready
              </span>
            </div>
          </motion.div>

          {/* Booked / Active Rides */}
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white border border-blue-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Active Rides
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black font-display text-blue-600 tabular-nums">
                {bookedCount}
              </span>
              <span className="text-[11px] font-bold text-blue-700">
                On Road
              </span>
            </div>
          </motion.div>

          {/* Maintenance */}
          <motion.div
            whileHover={{ y: -3 }}
            className="bg-white border border-amber-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-800">
                Maintenance
              </span>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black font-display text-amber-600 tabular-nums">
                {maintenanceCount}
              </span>
              <span className="text-[11px] font-bold text-amber-700">
                Service Bay
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* 🔍 SEARCH & FILTERS CONTROLS */}
      <div className="space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1 max-w-2xl">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by model, plate, or vehicle name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9.5 pr-8 h-10 bg-white border-slate-200 rounded-2xl text-xs sm:text-sm font-medium shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Hub Area Filter Selector */}
            {displayAreas?.length > 1 && (
              <div className="w-full sm:w-52 shrink-0">
                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger className="h-10 bg-white border-slate-200 rounded-2xl text-xs font-bold text-slate-800 shadow-xs">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 mr-1.5 shrink-0" />
                    <SelectValue placeholder="All Hub Locations" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 rounded-2xl shadow-xl">
                    <SelectItem value="all" className="text-xs font-bold">
                      All Hub Locations ({bikes?.length || 0})
                    </SelectItem>
                    {displayAreas.map((area) => (
                      <SelectItem
                        key={area._id || area.id}
                        value={String(area._id || area.id)}
                        className="text-xs font-semibold"
                      >
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Segmented Status Pill Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none py-0.5">
            {[
              { id: "all", label: "All Fleet", count: bikes?.length || 0 },
              { id: "available", label: "Available", count: availableCount },
              { id: "booked", label: "On Road", count: bookedCount },
              { id: "maintenance", label: "Service", count: maintenanceCount },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 active:scale-95 cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/10"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bike Detail View Dialog */}
      <Dialog
        open={!!viewingBike}
        onOpenChange={(open) => {
          if (!open) setViewingBike(null);
        }}
      >
        <DialogContent className="max-w-2xl bg-white border border-slate-200 rounded-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-slate-900 font-display font-black text-lg flex items-center gap-2">
              <BikeIcon className="w-5 h-5 text-blue-600" />
              {viewingBike?.bike_name || viewingBike?.model}
            </DialogTitle>
          </DialogHeader>
          {viewingBike && (
            <ScrollArea className="flex-1 overflow-auto pr-4">
              <div className="space-y-5 pb-4">
                {/* Image */}
                {viewingBike.image_url && (
                  <div className="h-48 rounded-lg overflow-hidden">
                    <img
                      src={viewingBike.image_url}
                      alt={viewingBike.model}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Basic Details */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Basic Details
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <DetailItem
                      label="Bike Name"
                      value={viewingBike.bike_name}
                    />
                    <DetailItem label="Model" value={viewingBike.model} />
                    <DetailItem
                      label="Number Plate"
                      value={viewingBike.number_plate}
                    />
                    <DetailItem label="CC" value={`${viewingBike.cc}cc`} />
                    <DetailItem
                      label="Colour"
                      value={viewingBike.bike_colour}
                    />
                    <DetailItem label="Owner" value={viewingBike.bike_owner} />

                    <DetailItem label="Fine Owner" value={viewingBike.fine_owner} />
                    <DetailItem
                      label="Area"
                      value={getAreaName(viewingBike.area_id)}
                    />
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Status</p>
                      {(() => {
                        const viewingIsBooked =
                          rentedBikeIds.has(String(viewingBike._id)) ||
                          rentedBikeIds.has(viewingBike._id);
                        const viewingDisplayStatus =
                          viewingBike.status === "maintenance"
                            ? "maintenance"
                            : viewingIsBooked
                              ? "booked"
                              : "available";
                        return (
                          <Badge
                            className={`${statusColors[viewingDisplayStatus] || statusColors[viewingBike.status]}`}
                          >
                            {viewingDisplayStatus}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Pricing
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <DetailItem
                      label="Price/Hour"
                      value={`₹${viewingBike.price_per_hour}`}
                    />
                    <DetailItem
                      label="Price/Day"
                      value={`₹${viewingBike.price_per_day}`}
                    />
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Documents & Dates
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <DetailItem
                      label="Insurance End"
                      value={formatDate(viewingBike.insurance_end_date)}
                    />
                    <DetailItem
                      label="PUC End"
                      value={formatDate(viewingBike.puc_end_date)}
                    />
                    <DetailItem
                      label="Bike End Date"
                      value={formatDate(viewingBike.bike_end_date)}
                    />
                  </div>
                </div>

                {/* Maintenance */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Maintenance & Usage
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <DetailItem
                      label="Last Service"
                      value={formatDate(viewingBike.last_service_date)}
                    />
                    <DetailItem
                      label="Total Expenses"
                      value={`₹${viewingBike.bike_expenses || 0}`}
                    />
                    <DetailItem
                      label="Total KM Run"
                      value={`${viewingBike.total_km_run || 0} km`}
                    />
                    <DetailItem
                      label="GPS Installed"
                      value={formatDate(viewingBike.gps_installed_date)}
                    />
                  </div>
                </div>

                {/* Parts */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Parts Replacement
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <DetailItem
                      label="Last Battery Changed"
                      value={formatDate(viewingBike.last_battery_changed)}
                    />
                    <DetailItem
                      label="Last Tyre Change"
                      value={formatDate(viewingBike.last_tyre_change)}
                    />
                  </div>
                </div>

                {/* Inside viewingBike Dialog ScrollArea */}
                {/* View Dialog ke andar */}
                {viewingBike?.extra_images?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                      Documents & Extra Photos
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {viewingBike.extra_images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-lg overflow-hidden border border-border"
                        >
                          <img
                            src={img}
                            className="w-full h-32 object-cover"
                            alt={`Doc ${idx + 1}`}
                          />
                          {/* Hover Overlay with Download Button */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => window.open(img, "_blank")}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-primary text-white"
                              onClick={() =>
                                downloadImage(img, `bike-doc-${idx + 1}.jpg`)
                              }
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {viewingBike.description && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Description
                    </h3>
                    <p className="text-sm text-foreground">
                      {viewingBike.description}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Bikes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse bg-card border-border">
              <div className="h-40 bg-muted rounded-t-lg" />
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          {filteredBikes?.map((bike, index) => {
            const isBooked = rentedBikeIds.has(String(bike._id)) || rentedBikeIds.has(bike._id);
            const displayStatus =
              bike.status === "maintenance"
                ? "maintenance"
                : isBooked
                  ? "booked"
                  : "available";

            return (
              <motion.div
                key={bike._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.25 }}
              >
                {/* 📱 MOBILE VIEW: Native Mobile App Card */}
                <div className="sm:hidden bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs hover:shadow-md transition-all space-y-3">
                  <div className="flex gap-3 items-center">
                    {/* Left image thumbnail */}
                    <div
                      className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 relative shrink-0 cursor-pointer border border-slate-200/80 shadow-2xs"
                      onClick={() => setViewingBike(bike)}
                    >
                      {bike.image_url ? (
                        <img
                          src={bike.image_url}
                          alt={bike.model}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-600 bg-blue-50/50">
                          <BikeIcon className="w-7 h-7" />
                        </div>
                      )}
                    </div>

                    {/* Right details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <h3
                          className="font-display font-black text-sm text-slate-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => setViewingBike(bike)}
                        >
                          {bike.bike_name || bike.model}
                        </h3>
                        <Badge className={`text-[10px] px-2 py-0.5 shrink-0 border capitalize font-bold rounded-full ${statusColors[displayStatus]}`}>
                          {displayStatus}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {/* High-security plate badge */}
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          {bike.number_plate}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                          {bike.cc}cc
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1.5 text-xs">
                        <span className="font-display font-black text-blue-600">
                          ₹{bike.price_per_day}<span className="text-[10px] font-semibold text-slate-500">/day</span>
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium truncate max-w-[130px]">
                          <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                          {getAreaName(bike.area_id)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mobile 1-Tap Action Bar */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingBike(bike)}
                      className="flex-1 h-8 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border-slate-200/90 rounded-xl"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1 text-blue-600" /> Inspect
                    </Button>
                    {!isInvestor && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(bike)}
                          className="h-8 px-3 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200/90 rounded-xl"
                          title="Edit vehicle details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(bike._id)}
                          className="h-8 px-3 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200 rounded-xl"
                          title="Delete vehicle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* 💻 DESKTOP VIEW: Pristine Light Grid Card */}
                <Card className="hidden sm:flex flex-col justify-between overflow-hidden bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 shadow-xs group">
                  <div>
                    {/* Vehicle Hero Image */}
                    <div
                      className="h-44 bg-slate-50 relative overflow-hidden cursor-pointer border-b border-slate-100"
                      onClick={() => setViewingBike(bike)}
                    >
                      {bike.image_url ? (
                        <img
                          src={bike.image_url}
                          alt={bike.model}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
                          <BikeIcon className="w-16 h-16 text-blue-300" />
                        </div>
                      )}

                      {/* Status Badge */}
                      <Badge
                        className={`
                          absolute
                          top-3
                          right-3
                          border
                          font-bold
                          text-xs
                          px-2.5
                          py-0.5
                          rounded-full
                          shadow-xs
                          ${statusColors[displayStatus]}
                        `}
                      >
                        {displayStatus}
                      </Badge>
                    </div>

                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-display font-black text-lg text-slate-900 leading-tight">
                            {bike.bike_name || bike.model}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            {/* License plate */}
                            <span className="inline-flex items-center gap-1 font-mono text-xs font-black uppercase px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-900 border border-slate-300 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              {bike.number_plate}
                            </span>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {bike.cc}cc
                            </span>
                          </div>
                        </div>

                        {bike.bike_colour && (
                          <span className="text-xs font-semibold text-slate-500 capitalize bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/60">
                            {bike.bike_colour}
                          </span>
                        )}
                      </div>

                      {/* Hub Location */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-semibold">{getAreaName(bike.area_id)}</span>
                      </div>

                      {/* Pricing Box */}
                      <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Daily Tariff
                          </span>
                          <span className="text-base font-black text-slate-900 font-display">
                            ₹{bike.price_per_day}
                            <span className="text-xs font-normal text-slate-500">/day</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Hourly Rate
                          </span>
                          <span className="text-sm font-bold text-blue-600">
                            ₹{bike.price_per_hour}/hr
                          </span>
                        </div>
                      </div>

                      {bike.total_km_run > 0 && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" /> {bike.total_km_run.toLocaleString()} km odometer
                        </div>
                      )}
                    </CardContent>
                  </div>

                  {/* Actions Strip */}
                  <div className="p-5 pt-0 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingBike(bike)}
                      className="border-slate-200 hover:border-blue-600 text-slate-800 font-bold flex-1 rounded-xl h-9"
                    >
                      <Eye className="w-4 h-4 mr-1 text-blue-600" /> View Details
                    </Button>
                    {!isInvestor && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(bike)}
                          className="border-slate-200 hover:border-slate-400 text-slate-700 font-bold px-3 rounded-xl h-9"
                          title="Edit vehicle"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(bike._id)}
                          className="text-rose-600 hover:bg-rose-50 border-rose-200 font-bold px-3 rounded-xl h-9"
                          title="Delete vehicle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
          {filteredBikes?.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="col-span-full text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl p-8"
            >
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <BikeIcon className="w-8 h-8 opacity-70" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No Matching Vehicles</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No fleet vehicles matched your current search or status filter. Try resetting filters.
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* Reusable Confirmation Dialog Alert */}
      <ConfirmationDialog
        open={confirmConfig.open}
        onOpenChange={(open) => setConfirmConfig((prev) => ({ ...prev, open }))}
        title={confirmConfig.title}
        description={confirmConfig.description}
        type={confirmConfig.type}
        confirmText={confirmConfig.confirmText}
        details={confirmConfig.details}
        onConfirm={confirmConfig.onConfirm}
        isLoading={confirmConfig.isLoading}
      />
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-900 mt-0.5">{value || "—"}</p>
    </div>
  );
}
