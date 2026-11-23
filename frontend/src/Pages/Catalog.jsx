import { useState, useEffect , useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bike,
  IndianRupee,
  MapPin,
  Gauge,
  Star,
  Zap,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Grid,
  List,
  Filter,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  AlertCircle,
  Flame,
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";

import Header from "../components/Header";
import Footer from "../components/Footer";
import { useBikes } from "../hooks/useBikes";
import { useActiveAreas } from "../hooks/useAreas";
import useSEO from "../hooks/useSEO";
import {useClusters} from "../hooks/useClusters"
import { useBikeAvailability } from "../hooks/useBikeAvailability";
import MobileBottomNav from "../components/MobileBottomNav";


// const Catalog = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
  

//   const urlAreaId = searchParams.get("area");
//   const urlStart = searchParams.get("start");
//   const urlEnd = searchParams.get("end");

//   useSEO({
//     title: "Bikes & Scooters Catalog | Rent a Bike in Mumbai & Surat - Pipip Services",
//     description: "Choose from our complete catalog of well-maintained self-drive scooters and motorcycles in Mumbai and Surat. Activa, KTM, Jupiter, and Royal Enfield available at cheap hourly and daily rates."
//   });

//   const [selectedArea, setSelectedArea] = useState("all");
//   const [ccFilter, setCcFilter] = useState("all");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [viewMode, setViewMode] = useState("grid");
//   const [initialized, setInitialized] = useState(false);
//   const [hoveredBike, setHoveredBike] = useState(null);

//   const { data: bikes, isLoading: bikesLoading } = useBikes();
//   const { data: areas } = useActiveAreas();



//   useEffect(() => {
//     if (!initialized && areas && areas.length > 0) {
//       if (urlAreaId && areas.some((a) => a._id === urlAreaId)) {
//         setSelectedArea(urlAreaId);
//       }
//       setInitialized(true);
//     }
//   }, [urlAreaId, areas, initialized]);

//   const getAreaName = (areaId) => {
//     if (!areaId || !areas) return null;
//     const area = areas.find((a) => a._id === areaId);
//     return area ? area.name : null;
//   };

//  const filteredBikes =
//   bikes?.filter((bike) => {
    
//   const areaMatch =
//   selectedArea === "all" ||
//   String(bike.area_id) === String(selectedArea);

//     const ccMatch =
//       ccFilter === "all" ||
//       (ccFilter === "under125" && bike.cc <= 125) ||
//       (ccFilter === "125to150" && bike.cc > 125 && bike.cc <= 150) ||
//       (ccFilter === "above150" && bike.cc > 150);

//     const statusMatch =
//       statusFilter === "all" || bike.status === statusFilter;

//     return areaMatch && ccMatch && statusMatch;
//   }) || [];

//   const handleBookNow = (bikeId) => {
//     const params = new URLSearchParams();
//     if (urlStart) params.set("start", urlStart);
//     if (urlEnd) params.set("end", urlEnd);
//     if (selectedArea !== "all") params.set("area", selectedArea);

//     navigate(`/book/${bikeId}?${params.toString()}`);
//   };

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: { staggerChildren: 0.08, delayChildren: 0.1 },
//     },
//   };

//   const cardVariants = {
//     hidden: { opacity: 0, y: 40, scale: 0.95 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       scale: 1,
//       transition: { type: "spring", stiffness: 100, damping: 15 },
//     },
//   };
//  return (
//     <div className="min-h-screen bg-background pt-[60px]">
//       <Header />
      
//       <main className="pt-24 pb-16">
//         <div className="container mx-auto px-4">
//           {/* Page Header */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center mb-12"
//           >
//             <motion.div
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//               transition={{ type: "spring", delay: 0.2 }}
//               className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4"
//             >
//               <Zap className="w-4 h-4 text-primary" />
//               <span className="text-sm font-medium text-primary">Full Catalog</span>
//             </motion.div>
//             <h1 className="font-display text-4xl md:text-5xl text-gradient-sunset mb-4">
//               Bike Catalog
//             </h1>
//             <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
//               Browse our complete collection of scooters and bikes available for rent
//             </p>
//             <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
//               For Visual Representation Only.
//             </p>
//             <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
//               The Images of Bike may or may not match the actual Product.
//             </p>
//           </motion.div>

//           {/* Filters Bar */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="bg-card/80 backdrop-blur-md border border-border rounded-2xl p-6 mb-10 shadow-golden"
//           >
//             <div className="flex flex-col lg:flex-row gap-4">
//               <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 {/* Area Filter */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-foreground flex items-center gap-2">
//                     <MapPin className="w-4 h-4 text-primary" />
//                     Location
//                   </label>
//                   <Select
//   key={selectedArea}
//   value={selectedArea}
//   onValueChange={setSelectedArea}
// >
//                     <SelectTrigger className="bg-input border-border h-12">
//                       <SelectValue placeholder="All Areas" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Areas</SelectItem>
//                       {areas?.map((area) => (
//                         <SelectItem key={area._id} value={area._id}>
//                           {area.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* CC Filter */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-foreground flex items-center gap-2">
//                     <Gauge className="w-4 h-4 text-secondary" />
//                     Engine Size
//                   </label>
//                   <Select value={ccFilter} onValueChange={setCcFilter}>
//                     <SelectTrigger className="bg-input border-border h-12">
//                       <SelectValue placeholder="All CC" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All CC</SelectItem>
//                       <SelectItem value="under125">Up to 125cc</SelectItem>
//                       <SelectItem value="125to150">125cc - 150cc</SelectItem>
//                       <SelectItem value="above150">Above 150cc</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Status Filter */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-foreground flex items-center gap-2">
//                     <Filter className="w-4 h-4 text-accent" />
//                     Status
//                   </label>
//                   <Select value={statusFilter} onValueChange={setStatusFilter}>
//                     <SelectTrigger className="bg-input border-border h-12">
//                       <SelectValue placeholder="All Status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Status</SelectItem>
//                       <SelectItem value="available">Available</SelectItem>
//                       <SelectItem value="booked">On Rent</SelectItem>
//                       <SelectItem value="maintenance">Maintenance</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </div>

//               {/* View Toggle & Count */}
//               <div className="flex items-end gap-4">
//                 <div className="flex bg-muted rounded-lg p-1">
//                   <Button
//                     variant={viewMode === "grid" ? "default" : "ghost"}
//                     size="sm"
//                     onClick={() => setViewMode("grid")}
//                     className={viewMode === "grid" ? "gradient-sunset" : ""}
//                   >
//                     <Grid className="w-4 h-4" />
//                   </Button>
//                   <Button
//                     variant={viewMode === "list" ? "default" : "ghost"}
//                     size="sm"
//                     onClick={() => setViewMode("list")}
//                     className={viewMode === "list" ? "gradient-sunset" : ""}
//                   >
//                     <List className="w-4 h-4" />
//                   </Button>
//                 </div>
//                 <div className="h-12 px-4 bg-muted/50 rounded-lg flex items-center border border-border">
//                   <span className="text-muted-foreground whitespace-nowrap">
//                     {bikesLoading ? "Loading..." : `${filteredBikes.length} bikes`}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </motion.div>

//           {/* Bikes Display */}
//           {bikesLoading ? (
//             <div className={`grid ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-6`}>
//               {[...Array(8)].map((_, i) => (
//                 <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
//                   <Skeleton className="h-48 w-full" />
//                   <div className="p-5">
//                     <Skeleton className="h-6 w-3/4 mb-2" />
//                     <Skeleton className="h-4 w-1/2 mb-4" />
//                     <Skeleton className="h-10 w-full" />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : filteredBikes.length === 0 ? (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               className="text-center py-16"
//             >
//               <motion.div
//                 animate={{ y: [0, -10, 0] }}
//                 transition={{ duration: 2, repeat: Infinity }}
//               >
//                 <Bike className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
//               </motion.div>
//               <h3 className="text-xl font-semibold text-foreground mb-2">No Bikes Found</h3>
//               <p className="text-muted-foreground mb-6">Try adjusting your filters</p>
//               <Button 
//                 variant="outline" 
//                 onClick={() => {
//                   setSelectedArea("all");
//                   setCcFilter("all");
//                   setStatusFilter("all");
//                 }}
//                 className="border-primary text-primary hover:bg-primary/10"
//               >
//                 Clear Filters
//               </Button>
//             </motion.div>
//           ) : (
//             <motion.div 
//               className={`grid ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-6`}
//               variants={containerVariants}
//               initial="hidden"
//               animate="visible"
//             >
//               <AnimatePresence mode="popLayout">
//                 {filteredBikes.map((bike) => (
//                   <motion.div
//                     key={bike._id}
//                     variants={cardVariants}
//                     layout
//                     onMouseEnter={() => setHoveredBike(bike._id)}
//                     onMouseLeave={() => setHoveredBike(null)}
//                     className={`group relative bg-card border border-border rounded-2xl overflow-hidden cursor-pointer ${
//                       viewMode === "list" ? "flex" : ""
//                     }`}
//                     whileHover={{ 
//                       y: -8,
//                       boxShadow: "0 20px 40px -15px hsl(var(--primary) / 0.3)",
//                       borderColor: "hsl(var(--primary) / 0.5)"
//                     }}
//                     onClick={() => bike.status === 'available' && handleBookNow(bike._id)}
//                   >
//                     {/* Image */}
//                     <div className={`relative ${viewMode === "list" ? "w-48 h-36" : "h-48"} bg-muted overflow-hidden`}>
//                       {bike.image_url ? (
//                         <motion.img
//                           src={bike.image_url}
//                           alt={bike.model}
//                           className="w-full h-full object-cover"
//                           whileHover={{ scale: 1.1 }}
//                           transition={{ duration: 0.4 }}
//                         />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
//                           <Bike className="w-16 h-16 text-muted-foreground" />
//                         </div>
//                       )}
                      
//                       {/* Status Badge */}
//                       <div className="absolute top-3 right-3">
//                         <Badge
//                           className={`${
//                             bike.status === "available"
//                               ? "bg-green-500/90 text-white"
//                               : bike.status === "booked"
//                               ? "bg-red-500/90 text-white"
//                               : "bg-amber-500/90 text-white"
//                           }`}
//                         >
//                           {bike.status === "available" ? "Available" : 
//                            bike.status === "booked" ? "On Rent" : "Maintenance"}
//                         </Badge>
//                       </div>

//                       {/* Area Badge */}
//                       {getAreaName(bike.area_id) && (
//                         <div className="absolute bottom-3 left-3">
//                           <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm text-foreground">
//                             <MapPin className="w-3 h-3 mr-1" />
//                             {getAreaName(bike.area_id)}
//                           </Badge>
//                         </div>
//                       )}

//                       {/* Rating */}
                      
                       
//                     </div>

//                     {/* Info */}
//                     <div className={`p-5 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}>
//                       <div>
//                         <div className="flex items-start justify-between mb-2">
//                           <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
//                             {bike.model}
//                           </h3>
//                           <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
//                             {bike.cc}cc
//                           </span>
//                         </div>

//                         <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
//                           <Shield className="w-3 h-3 text-green-500" />
//                           {bike.number_plate}
//                         </p>
//                       </div>

//                       {/* Pricing */}
//                       <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-lg">
//                         <div className="flex items-center gap-1 text-primary">
//                           <IndianRupee className="w-4 h-4" />
//                           <span className="font-bold text-lg">{bike.price_per_hour}</span>
//                           <span className="text-xs text-muted-foreground">/hr</span>
//                         </div>
//                         <div className="w-px h-6 bg-border" />
//                         <div className="flex items-center gap-1 text-secondary">
//                           <IndianRupee className="w-4 h-4" />
//                           <span className="font-bold text-lg">{bike.price_per_day}</span>
//                           <span className="text-xs text-muted-foreground">/day</span>
//                         </div>
//                       </div>

//                       <Button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleBookNow(bike._id);
//                         }}
//                         className="w-full gradient-sunset text-primary-foreground font-medium"
//                         disabled={bike.status !== "available"}
//                       >
//                         {bike.status === "available" ? (
//                           <>
//                             Book Now
//                             <ArrowRight className="w-4 h-4 ml-2" />
//                           </>
//                         ) : bike.status === "booked" ? (
//                           "Currently On Rent"
//                         ) : (
//                           "Under Maintenance"
//                         )}
//                       </Button>
//                     </div>
//                   </motion.div>
//                 ))}
//               </AnimatePresence>
//             </motion.div>
//           )}
//         </div>
//       </main>

//       <Footer />
//     </div>
//   );
// };


// Variants for smooth staggered card entrance
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// =========================================================================
// 🎨 DYNAMIC TIER/PERSONALITY SYSTEM FOR VEHICLES
// =========================================================================
function getVehicleProfile(bike) {
  const modelLower = (bike?.model || bike?.name || "").toLowerCase();
  const cc = Number(bike?.cc) || 110;

  // 1. Heavy Cruiser / Royal Enfield
  if (
    cc > 200 ||
    modelLower.includes("enfield") ||
    modelLower.includes("bullet") ||
    modelLower.includes("hunter") ||
    modelLower.includes("classic") ||
    modelLower.includes("cruiser")
  ) {
    return {
      type: "cruiser",
      badge: "👑 Royal Cruiser",
      badgeColor: "bg-amber-500/15 text-amber-950 border-amber-300/80",
      stageGradient: "from-amber-100/70 via-orange-50/30 to-white",
      borderColor: "rgba(245, 158, 11, 0.55)",
      spotlight: "rgba(245, 158, 11, 0.22)",
      buttonGradient: "from-amber-600 via-yellow-500 to-amber-700 hover:from-amber-700 hover:to-yellow-600",
      buttonShadow: "shadow-amber-500/25",
      tag: "Pure Power & Comfort",
      perk: "Highway Touring",
      hoverAnimation: { x: 8, y: -4, scale: 1.12, rotate: 0 },
    };
  }

  // 2. Sport / High-Performance
  if (
    cc > 125 ||
    modelLower.includes("sport") ||
    modelLower.includes("r15") ||
    modelLower.includes("pulsar") ||
    modelLower.includes("apache") ||
    modelLower.includes("fargo")
  ) {
    return {
      type: "sport",
      badge: "⚡ Dynamic Sport",
      badgeColor: "bg-violet-500/15 text-violet-950 border-violet-300/80",
      stageGradient: "from-violet-100/70 via-purple-50/30 to-white",
      borderColor: "rgba(139, 92, 246, 0.55)",
      spotlight: "rgba(139, 92, 246, 0.22)",
      buttonGradient: "from-violet-600 via-indigo-600 to-purple-700 hover:from-violet-700 hover:to-indigo-700",
      buttonShadow: "shadow-violet-500/25",
      tag: "Punchy Acceleration",
      perk: "Street Agility",
      hoverAnimation: { x: 10, y: -6, scale: 1.14, rotate: -2 },
    };
  }

  // 3. Maxi-Scooter / Executive Touring
  if (
    modelLower.includes("burgman") ||
    modelLower.includes("aerox") ||
    modelLower.includes("access") ||
    modelLower.includes("ntorq")
  ) {
    return {
      type: "touring",
      badge: "🛋️ Executive Comfort",
      badgeColor: "bg-cyan-500/15 text-cyan-950 border-cyan-300/80",
      stageGradient: "from-cyan-100/70 via-blue-50/30 to-white",
      borderColor: "rgba(6, 182, 212, 0.55)",
      spotlight: "rgba(6, 182, 212, 0.20)",
      buttonGradient: "from-cyan-600 via-blue-600 to-indigo-700 hover:from-cyan-700 hover:to-blue-700",
      buttonShadow: "shadow-cyan-500/25",
      tag: "Plush Seat & Extra Storage",
      perk: "Smooth City Touring",
      hoverAnimation: { x: 0, y: -9, scale: 1.11, rotate: 0 },
    };
  }

  // 4. Default: Top City Commuter
  return {
    type: "commuter",
    badge: "🔥 Top City Pick",
    badgeColor: "bg-emerald-500/15 text-emerald-950 border-emerald-300/80",
    stageGradient: "from-emerald-100/70 via-teal-50/30 to-white",
    borderColor: "rgba(16, 185, 129, 0.55)",
    spotlight: "rgba(16, 185, 129, 0.20)",
    buttonGradient: "from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800",
    buttonShadow: "shadow-blue-500/25",
    tag: "High Mileage & Reliability",
    perk: "Easy Traffic Zip",
    hoverAnimation: { x: 4, y: -7, scale: 1.12, rotate: 1 },
  };
}

// =========================================================================
// 🚀 FEATURED-STYLE ELEVATED BIKE CARD
// =========================================================================
const BikeCard = ({
  bike,
  viewMode,
  urlStart,
  urlEnd,
  handleBookNow,
  getAreaName,
  setHoveredBike,
}) => {
  const { checkAvailability, checking } = useBikeAvailability();
  const [availabilityData, setAvailabilityData] = useState({
    isAvailable: true,
  });
  const [isHovered, setIsHovered] = useState(false);
  const profile = getVehicleProfile(bike);

  // Checks the backend for current rent status/conflicts whenever dates change
  useEffect(() => {
    const verifyStatus = async () => {
      if (urlStart && urlEnd && bike.status === "available") {
        const res = await checkAvailability(
          bike._id,
          new Date(urlStart),
          new Date(urlEnd),
        );
        setAvailabilityData(res);
      } else {
        setAvailabilityData({ isAvailable: true });
      }
    };

    verifyStatus();
  }, [bike._id, urlStart, urlEnd, checkAvailability, bike.status]);

  const isBookedInSlot =
    !availabilityData.isAvailable && availabilityData.bookedTo;

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    });
  };

  const isAvailableNow = bike.status === "available" && !isBookedInSlot;

  return (
    <motion.div
      key={bike._id}
      layout
      variants={cardVariants}
      onMouseEnter={() => {
        setIsHovered(true);
        setHoveredBike?.(bike._id);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredBike?.(null);
      }}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      onClick={() => isAvailableNow && handleBookNow(bike._id)}
      className={`group relative bg-white border border-slate-200/90 rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_22px_50px_-12px_rgba(15,23,42,0.18)] ${
        viewMode === "list" ? "flex flex-col sm:flex-row" : "flex flex-col h-full justify-between"
      }`}
    >
      {/* Dynamic Colored Glowing Border Hue on Hover */}
      <div
        className="absolute inset-0 rounded-[2rem] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30"
        style={{
          boxShadow: `inset 0 0 0 2px ${profile.borderColor}`,
        }}
      />

      {/* ========================================================= */}
      {/* 🎨 VEHICLE STAGE WITH TIER GRADIENT & DYNAMIC SHIMMER     */}
      {/* ========================================================= */}
      <div
        className={`relative ${
          viewMode === "list" ? "w-full sm:w-72 h-52 sm:h-auto shrink-0" : "h-52 sm:h-56"
        } bg-gradient-to-b ${profile.stageGradient} overflow-hidden border-b sm:border-b-0 ${
          viewMode === "list" ? "sm:border-r border-slate-100" : ""
        } flex items-center justify-center p-4`}
      >
        {/* Ambient Subtle Radial Glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background: `radial-gradient(circle at center, ${profile.spotlight} 0%, transparent 70%)`,
          }}
        />

        {/* Shimmer Light Reflection Sweep on Hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none z-10" />

        {/* Vehicle Image with Tier-Specific 3D Motion */}
        {bike.image_url ? (
          <motion.img
            src={bike.image_url}
            alt={bike.model}
            loading="lazy"
            decoding="async"
            animate={
              isHovered
                ? {
                    x: profile.hoverAnimation.x,
                    y: profile.hoverAnimation.y,
                    scale: profile.hoverAnimation.scale,
                    rotate: profile.hoverAnimation.rotate,
                  }
                : { x: 0, y: 0, scale: 1, rotate: 0 }
            }
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="relative z-10 w-full h-full object-contain drop-shadow-[0_12px_14px_rgba(0,0,0,0.12)] group-hover:drop-shadow-[0_18px_22px_rgba(15,23,42,0.22)]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative z-10">
            <Bike className="w-16 h-16 text-slate-300" />
          </div>
        )}

        {/* Engine CC Badge (top-left) */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-slate-200/90 px-2.5 py-1 rounded-xl text-slate-800 text-[11px] font-black shadow-xs">
          <Gauge className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>{bike.cc} CC</span>
        </div>

        {/* Dynamic Personality & Status Badges (top-right) */}
        <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10.5px] font-black border shadow-2xs backdrop-blur-md ${profile.badgeColor}`}>
            {profile.badge}
          </span>
          {isBookedInSlot ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9.5px] font-bold bg-amber-50/95 text-amber-900 border border-amber-300 shadow-2xs backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1 shrink-0" />
              Slot Taken
            </span>
          ) : bike.status === "available" ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9.5px] font-bold bg-emerald-50/95 text-emerald-900 border border-emerald-300 shadow-2xs backdrop-blur-xs">
              <span className="relative flex h-1.5 w-1.5 mr-1 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Available
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9.5px] font-bold bg-slate-100 text-slate-700 border border-slate-300 shadow-2xs">
              {bike.status === "booked" ? "On Rent" : "Maintenance"}
            </span>
          )}
          {isBookedInSlot && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white/95 text-amber-800 border border-amber-200/90 shadow-2xs">
              Until {formatTime(availabilityData.bookedTo)}
            </span>
          )}
        </div>

        {/* Floating Live Stock & Token Badge Strip (bottom) */}
        <div className="absolute bottom-2.5 left-3 right-3 z-20 flex items-center justify-between">
          {getAreaName(bike.area_id) ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 font-bold text-[10px] shadow-2xs truncate max-w-[60%]">
              <MapPin className="w-2.5 h-2.5 text-blue-600 shrink-0" />
              <span className="truncate">{getAreaName(bike.area_id)}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 font-bold text-[10px] shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Hub Ready
            </span>
          )}

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] shadow-xs">
            <Sparkles className="w-2.5 h-2.5 text-slate-950" />
            ₹200 Token Lock
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📄 CARD CONTENT BODY                                      */}
      {/* ========================================================= */}
      <div className={`p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4 ${viewMode === "list" ? "w-full" : ""}`}>
        <div>
          {/* Vehicle Model & Registration Plate */}
          <div className="flex items-start justify-between gap-1 mb-1.5">
            <h3 className="text-base sm:text-lg font-black font-display text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight truncate">
              {bike.model}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            {bike.number_plate && (
              <>
                <span className="font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                  {bike.number_plate}
                </span>
                <span className="text-slate-300">•</span>
              </>
            )}
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              100% Sanitized
            </span>
          </div>

          {/* Quick Vehicle Highlight Tag */}
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
            <span className="inline-block w-1 h-1 rounded-full bg-blue-500 shrink-0" />
            <span className="font-semibold text-slate-700">{profile.tag}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 truncate">{profile.perk}</span>
          </div>
        </div>

        {/* Clean, High-Converting Daily Pricing Engine Box (Exactly like Featured Rides) */}
        <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/90 hover:bg-white transition-colors">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">
                Daily Rental Tariff
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
                  ₹{bike.price_per_day}
                </span>
                <span className="text-xs text-slate-500 font-bold">/day</span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-950 font-black text-xs border border-amber-300 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-500" />
                ₹200 Token
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                Lock vehicle online
              </span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>₹2,000 Security Deposit</span>
            <span className="text-emerald-700 font-black">100% Refundable at Hub</span>
          </div>
        </div>

        {/* Magnetic High-Converting CTA Button with Shimmer Sweep */}
        <div className="pt-0.5 mt-auto">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleBookNow(bike._id);
            }}
            className={`relative overflow-hidden w-full h-11 sm:h-12 rounded-2xl font-black text-xs sm:text-sm text-white shadow-md ${profile.buttonShadow} bg-gradient-to-r ${profile.buttonGradient} active:scale-[0.98] transition-all cursor-pointer group/btn`}
            disabled={!isAvailableNow || checking}
          >
            {/* Shimmer Light Reflection Sweep */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
            />
            {checking ? (
              <span className="relative z-10 flex items-center justify-center gap-2 font-black">
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                <span>Checking Slot...</span>
              </span>
            ) : isBookedInSlot ? (
              "Currently Rented in Slot"
            ) : bike.status !== "available" ? (
              "Currently In Ride"
            ) : (
              <span className="relative z-10 flex items-center justify-center gap-2 font-black">
                <span>Reserve with ₹200 Token</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// =========================================================================
// 🚀 FEATURED-STYLE ELEVATED CLUSTER CARD
// =========================================================================
const ClusterCard = ({
  cluster,
  viewMode,
  urlStart,
  urlEnd,
  handleBookNow,
  getAreaName,
}) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const clusterImages = useMemo(() => {
    const imgs = [];
    cluster.bikes?.forEach((b) => {
      if (b.image_url && !imgs.includes(b.image_url)) imgs.push(b.image_url);
    });
    return imgs.length > 0 ? imgs : [""];
  }, [cluster.bikes]);

  const representativeBike = cluster.bikes?.[0] || { model: cluster.name, cc: 125 };
  const profile = getVehicleProfile(representativeBike);
  const ccSize = cluster.bikes?.[0]?.cc || 125;

  // Auto-slide images every 3.5 seconds if there are multiple
  useEffect(() => {
    if (clusterImages.length <= 1) return;
    const intervalId = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % clusterImages.length);
    }, 3500);
    return () => clearInterval(intervalId);
  }, [clusterImages.length]);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + clusterImages.length) % clusterImages.length);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % clusterImages.length);
  };

  return (
    <motion.div
      layout
      variants={cardVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      onClick={() => handleBookNow(cluster._id, true)}
      className={`group relative bg-white border border-slate-200/90 rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-300 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_22px_50px_-12px_rgba(15,23,42,0.18)] ${
        viewMode === "list" ? "flex flex-col sm:flex-row" : "flex flex-col h-full justify-between"
      }`}
    >
      {/* Dynamic Colored Glowing Border Hue on Hover */}
      <div
        className="absolute inset-0 rounded-[2rem] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30"
        style={{
          boxShadow: `inset 0 0 0 2px ${profile.borderColor}`,
        }}
      />

      {/* ========================================================= */}
      {/* 🎨 IMAGE GALLERY SHOWCASE STAGE                           */}
      {/* ========================================================= */}
      <div
        className={`relative ${
          viewMode === "list" ? "w-full sm:w-72 h-52 sm:h-auto shrink-0" : "h-52 sm:h-56"
        } bg-gradient-to-b ${profile.stageGradient} overflow-hidden border-b sm:border-b-0 ${
          viewMode === "list" ? "sm:border-r border-slate-100" : ""
        } flex items-center justify-center p-4`}
      >
        {/* Shimmer Light Reflection Sweep */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none z-10" />

        <AnimatePresence mode="wait">
          {clusterImages[currentImgIndex] ? (
            <motion.img
              key={currentImgIndex}
              src={clusterImages[currentImgIndex]}
              alt={cluster.name}
              className="w-full h-full object-contain absolute inset-0 p-4 drop-shadow-[0_12px_14px_rgba(0,0,0,0.12)] group-hover:drop-shadow-[0_18px_22px_rgba(15,23,42,0.22)] z-10"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={
                isHovered
                  ? {
                      opacity: 1,
                      x: profile.hoverAnimation.x,
                      y: profile.hoverAnimation.y,
                      scale: profile.hoverAnimation.scale,
                      rotate: profile.hoverAnimation.rotate,
                    }
                  : { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }
              }
              exit={{ opacity: 0, scale: 1.03 }}
              transition={{ duration: 0.35 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50 relative z-10">
              <Bike className="w-16 h-16 text-slate-300" />
            </div>
          )}
        </AnimatePresence>

        {/* Gallery Navigation Controls */}
        {clusterImages.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              aria-label="Previous photo"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-slate-800 border border-slate-200/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 shadow-xs cursor-pointer active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              aria-label="Next photo"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-slate-800 border border-slate-200/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 shadow-xs cursor-pointer active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Gallery Dot Indicators */}
        {clusterImages.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 flex gap-1 z-20 bg-slate-900/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
            {clusterImages.map((_, idx) => (
              <span
                key={idx}
                className={`h-1 rounded-full transition-all duration-200 ${
                  idx === currentImgIndex ? "w-2.5 bg-white" : "w-1 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Dynamic Badges (top-left) */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5">
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[10.5px] font-black bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xs">
            <Sparkles className="w-3 h-3 mr-1 text-amber-300" />
            CATEGORY POOL
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-xl text-[10.5px] font-bold bg-white/95 text-slate-800 border border-slate-200/90 shadow-2xs">
            {cluster.bikes?.length || 0} Models
          </span>
        </div>

        {/* Ready Status (top-right) */}
        <div className="absolute top-3 right-3 z-20">
          <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-[10.5px] font-bold bg-emerald-50/95 text-emerald-900 border border-emerald-300 shadow-2xs backdrop-blur-xs">
            <span className="relative flex h-1.5 w-1.5 mr-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Ready Pool
          </span>
        </div>

        {/* Location Overlay (bottom-left) */}
        {getAreaName(cluster.area_id?._id || cluster.area_id) && (
          <div className="absolute bottom-2.5 left-3 z-20 max-w-[55%]">
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium bg-white/95 text-slate-700 border border-slate-200/90 shadow-2xs backdrop-blur-xs truncate max-w-full">
              <MapPin className="w-2.5 h-2.5 mr-1 text-blue-600 shrink-0" />
              <span className="truncate">{getAreaName(cluster.area_id?._id || cluster.area_id)}</span>
            </span>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 📄 CARD CONTENT BODY                                      */}
      {/* ========================================================= */}
      <div className={`p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4 ${viewMode === "list" ? "w-full" : ""}`}>
        <div>
          {/* Title & Engine CC */}
          <div className="flex items-start justify-between gap-1 mb-1.5">
            <h3 className="text-base sm:text-lg font-black font-display text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
              {cluster.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200/70 px-1.5 py-0.5 rounded text-[11px]">
              {ccSize} CC
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              Guaranteed Allocation
            </span>
          </div>

          {/* Quick Vehicle Highlight Tag */}
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
            <span className="inline-block w-1 h-1 rounded-full bg-blue-500 shrink-0" />
            <span className="font-semibold text-slate-700">{profile.tag}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 truncate">{profile.perk}</span>
          </div>
        </div>

        {/* Clean, High-Converting Daily Pricing Engine Box */}
        <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/90 hover:bg-white transition-colors">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">
                Daily Rental Tariff
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
                  ₹{cluster.price_per_day}
                </span>
                <span className="text-xs text-slate-500 font-bold">/day</span>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-950 font-black text-xs border border-amber-300 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-500" />
                ₹200 Token
              </span>
              <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                Lock category online
              </span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>₹2,000 Security Deposit</span>
            <span className="text-emerald-700 font-black">100% Refundable at Hub</span>
          </div>
        </div>

        {/* Magnetic High-Converting CTA Button */}
        <div className="pt-0.5 mt-auto">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleBookNow(cluster._id, true);
            }}
            className={`relative overflow-hidden w-full h-11 sm:h-12 rounded-2xl font-black text-xs sm:text-sm text-white shadow-md ${profile.buttonShadow} bg-gradient-to-r ${profile.buttonGradient} active:scale-[0.98] transition-all cursor-pointer group/btn`}
          >
            {/* Shimmer Light Reflection Sweep */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
            />
            <span className="relative z-10 flex items-center justify-center gap-2 font-black">
              <span>Reserve Pool with ₹200 Token</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1.5 transition-transform" />
            </span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const Catalog = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlAreaId = searchParams.get("area");
  const urlStart = searchParams.get("start");
  const urlEnd = searchParams.get("end");

  useSEO({
    title: "Bikes & Scooters Catalog | Rent a Bike Online - Pipip",
    description: "Choose from our complete catalog of well-maintained self-drive scooters and motorcycles. Activa, KTM, Jupiter, and Royal Enfield available at affordable hourly and daily rates."
  });

  const [selectedArea, setSelectedArea] = useState("all");
  const [ccFilter, setCcFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [hoveredBike, setHoveredBike] = useState(null);

  const { data: bikes, isLoading: bikesLoading } = useBikes();
  const { data: clusters, isLoading: clustersLoading } = useClusters();
  const { data: areas } = useActiveAreas();

  // Reactively synchronize filters with URL query parameters
  useEffect(() => {
    const urlArea = searchParams.get("area");
    const urlCc = searchParams.get("cc");

    setSelectedArea(urlArea || "all");
    if (urlCc && ["under125", "125to150", "above150", "all"].includes(urlCc)) {
      setCcFilter(urlCc);
    } else {
      setCcFilter("all");
    }
  }, [searchParams]);

  const handleAreaChange = (val) => {
    setSelectedArea(val);
    const params = new URLSearchParams(searchParams);
    if (val === "all") {
      params.delete("area");
    } else {
      params.set("area", val);
    }
    const q = params.toString();
    navigate(q ? `/catalog?${q}` : "/catalog", { replace: true });
  };

  const handleCcChange = (val) => {
    setCcFilter(val);
    const params = new URLSearchParams(searchParams);
    if (val === "all") {
      params.delete("cc");
    } else {
      params.set("cc", val);
    }
    const q = params.toString();
    navigate(q ? `/catalog?${q}` : "/catalog", { replace: true });
  };

  const clearAllFilters = () => {
    setSelectedArea("all");
    setCcFilter("all");
    setStatusFilter("all");
    navigate("/catalog", { replace: true });
  };

  const getAreaName = (area) => {
    if (!area) return null;
    if (typeof area === "object" && area.name) return area.name;
    const targetId = typeof area === "object" ? (area._id || area.id) : area;
    if (!targetId) return null;
    const matched = (areas || []).find(
      (a) =>
        String(a._id || a.id) === String(targetId) ||
        (a.name && a.name.toLowerCase() === String(targetId).toLowerCase())
    );
    if (matched?.name) return matched.name;
    if (typeof targetId === "string" && targetId.trim() !== "" && !/^[0-9a-fA-F]{24}$/.test(targetId)) {
      return targetId;
    }
    return null;
  };

  const clusteredBikeIds = useMemo(() => {
    const ids = new Set();
    clusters?.forEach((cluster) => {
      cluster.bikes?.forEach((bike) => {
        const id = bike._id || bike;
        if (id) ids.add(String(id));
      });
    });
    return ids;
  }, [clusters]);

  const filteredItems = useMemo(() => {
    const clusterItems = clusters?.map(c => ({ ...c, isCluster: true })) || [];
    const bikeItems = bikes?.filter(b => !clusteredBikeIds.has(String(b._id))).map(b => ({ ...b, isCluster: false })) || [];

    const combined = [...clusterItems, ...bikeItems];

    return combined.filter(item => {
      if (item.isCluster) {
        const hasAvailableBike = item.bikes && item.bikes.some(bike => bike.status === "available");
        if (!hasAvailableBike) return false;
      }

      // Robust area matching: checks item.area_id whether it's an object or an ID string
      const rawArea = item.area_id;
      const itemAreaId =
        rawArea && typeof rawArea === "object"
          ? String(rawArea._id || rawArea.id || "")
          : String(rawArea || "");
      const itemAreaName =
        rawArea && typeof rawArea === "object"
          ? String(rawArea.name || "").toLowerCase()
          : "";

      const areaMatch =
        selectedArea === "all" ||
        itemAreaId === String(selectedArea) ||
        (itemAreaName !== "" && itemAreaName === String(selectedArea).toLowerCase());

      const rawCc = item.isCluster ? item.bikes?.[0]?.cc || 110 : item.cc || 110;
      const ccVal = Number(rawCc);
      const ccMatch =
        ccFilter === "all" ||
        (ccFilter === "under125" && ccVal <= 125) ||
        (ccFilter === "125to150" && ccVal > 125 && ccVal <= 150) ||
        (ccFilter === "above150" && ccVal > 150);

      const statusMatch =
        statusFilter === "all" || (item.isCluster ? "available" === statusFilter : item.status === statusFilter);

      return areaMatch && ccMatch && statusMatch;
    });
  }, [clusters, bikes, clusteredBikeIds, selectedArea, ccFilter, statusFilter]);

  const clusterItems = useMemo(() => {
    return filteredItems.filter((item) => item.isCluster);
  }, [filteredItems]);

  const bikeItems = useMemo(() => {
    return filteredItems.filter((item) => !item.isCluster);
  }, [filteredItems]);

  const clearTimeFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("start");
    params.delete("end");
    const q = params.toString();
    navigate(q ? `/catalog?${q}` : "/catalog", { replace: true });
  };

  const hasActiveFilters =
    selectedArea !== "all" ||
    ccFilter !== "all" ||
    statusFilter !== "all" ||
    Boolean(urlStart) ||
    Boolean(urlEnd);
  const handleBookNow = (bikeId, isCluster = false) => {
    const params = new URLSearchParams();
    if (urlStart) params.set("start", urlStart);
    if (urlEnd) params.set("end", urlEnd);
    if (selectedArea !== "all") params.set("area", selectedArea);
    if (isCluster) params.set("type", "cluster");

    navigate(`/book/${bikeId}?${params.toString()}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-0">
      <Header />

      <main className="pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10 sm:mb-14"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-800 border border-blue-300/40 text-xs font-black shadow-2xs mb-3.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>LIVE MUMBAI FLEET • VERIFIED & SANITIZED</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.15] mb-3">
              Browse Bike & Scooter{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500">
                Fleet
              </span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-xl mx-auto font-normal leading-relaxed">
              100% sanitized scooters and cruisers. Lock any vehicle category online with just a{" "}
              <span className="font-bold text-slate-900 underline decoration-amber-400 decoration-2 underline-offset-2">
                ₹200 token
              </span>{" "}
              — pay the remainder upon physical handover!
            </p>
          </motion.div>

          {/* Filters Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 mb-8 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)]"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Area Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-foreground" />
                    Pickup Location
                  </label>
                  <Select
                    key={selectedArea}
                    value={selectedArea}
                    onValueChange={handleAreaChange}
                  >
                    <SelectTrigger className="bg-background border-border/80 h-9 text-xs">
                      <SelectValue placeholder="All Areas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {areas?.map((area) => (
                        <SelectItem key={area._id} value={area._id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* CC Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-foreground" />
                    Engine Capacity
                  </label>
                  <Select value={ccFilter} onValueChange={handleCcChange}>
                    <SelectTrigger className="bg-background border-border/80 h-9 text-xs">
                      <SelectValue placeholder="All CC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Engine Sizes</SelectItem>
                      <SelectItem value="under125">Up to 125cc (Scooters)</SelectItem>
                      <SelectItem value="125to150">125cc - 150cc</SelectItem>
                      <SelectItem value="above150">Above 150cc (Cruiser / Sport)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-foreground" />
                    Fleet Status
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-background border-border/80 h-9 text-xs">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vehicles</SelectItem>
                      <SelectItem value="available">Available Now</SelectItem>
                      <SelectItem value="booked">Currently on Rent</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* View Toggle & Count */}
              <div className="flex items-end gap-3">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-border/60">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`h-8 px-2.5 rounded-md text-xs font-medium ${
                      viewMode === "grid" ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-white shadow-xs" : "text-muted-foreground"
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`h-8 px-2.5 rounded-md text-xs font-medium ${
                      viewMode === "list" ? "bg-white text-slate-900 dark:bg-slate-900 dark:text-white shadow-xs" : "text-muted-foreground"
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="h-9 px-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg flex items-center border border-border/60 text-xs">
                  <span className="text-muted-foreground whitespace-nowrap font-medium">
                    {bikesLoading || clustersLoading
                      ? "Updating..."
                      : `${filteredItems.length} available`}
                  </span>
                </div>
              </div>

              <div className="flex items-end gap-3 flex-wrap">
                {hasActiveFilters && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAllFilters}
                      className="border-dashed border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700 gap-1.5 h-9 px-3 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Clear All Filters</span>
                    </Button>
                  </motion.div>
                )}
                {(urlStart || urlEnd) && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearTimeFilter}
                      className="border-dashed border-primary text-primary hover:bg-primary/5 gap-1.5 h-9 px-3 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Clear Dates</span>
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Bikes Display */}
          {bikesLoading || clustersLoading ? (
            <div
              className={`grid ${
                viewMode === "grid"
                  ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              } gap-6`}
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-2xl overflow-hidden"
                >
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <motion.div className="text-center py-16">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Bike className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Vehicles Found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters
              </p>
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="border-primary text-primary hover:bg-primary/10 cursor-pointer"
              >
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-16">
              {/* Premium Category Pools Section */}
              {clusterItems.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-200/80 pb-3.5">
                    <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-300/30">
                      <Sparkles className="w-5 h-5 text-blue-600 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight">
                        Premium Category{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                          Pools
                        </span>
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                        Guaranteed vehicle model assigned at pickup hub (Honda Activa, Suzuki Access, etc.)
                      </p>
                    </div>
                  </div>

                  <motion.div
                    className={`grid ${
                      viewMode === "grid"
                        ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "grid-cols-1"
                    } gap-6`}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <AnimatePresence initial={false}>
                      {clusterItems.map((item) => (
                        <ClusterCard
                          key={item._id}
                          cluster={item}
                          viewMode={viewMode}
                          urlStart={urlStart}
                          urlEnd={urlEnd}
                          handleBookNow={handleBookNow}
                          getAreaName={getAreaName}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}

              {/* Individual Fleet Vehicles Section */}
              {bikeItems.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-200/80 pb-3.5">
                    <div className="p-2.5 bg-amber-500/10 rounded-2xl border border-amber-300/30">
                      <Bike className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900 tracking-tight">
                        Individual Fleet{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">
                          Vehicles
                        </span>
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                        Select and reserve a specific vehicle model and number plate from our available active fleet
                      </p>
                    </div>
                  </div>

                  <motion.div
                    className={`grid ${
                      viewMode === "grid"
                        ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "grid-cols-1"
                    } gap-6`}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <AnimatePresence initial={false}>
                      {bikeItems.map((item) => (
                        <BikeCard
                          key={item._id}
                          bike={item}
                          viewMode={viewMode}
                          urlStart={urlStart}
                          urlEnd={urlEnd}
                          handleBookNow={handleBookNow}
                          getAreaName={getAreaName}
                          setHoveredBike={setHoveredBike}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};


export default Catalog;
