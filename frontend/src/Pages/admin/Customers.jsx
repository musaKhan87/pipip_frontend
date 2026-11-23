import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  useCustomers,
  useCreateCustomer,
  useCustomerBookings,
} from "../../hooks/useCustomer";
import {
  Plus,
  Search,
  Phone,
  Mail,
  User,
  History,
  MapPin,
  CreditCard,
  FileImage,
  Eye,
  X,
  Users,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { ScrollArea } from "../../components/ui/scroll-area";
import { useAuth } from "../../lib/AuthProvider";
import { useAdminArea } from "../../lib/AreaContext";

const initialFormData = {
  name: "",
  phone: "",
  email: "",
  id_proof_type: "",
  id_proof_number: "",
  address: "",
};

function CustomerBookingsPanel({ customerId }) {
  const { data: bookings, isLoading } = useCustomerBookings(customerId);

  if (isLoading) return <p className="text-muted-foreground text-center py-4 text-xs">Loading rental history...</p>;

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
      {bookings?.map((booking) => (
        <div
          key={booking._id}
          className="p-3 bg-card border border-border/70 rounded-xl flex items-center justify-between shadow-2xs"
        >
          <div>
            <p className="font-bold text-sm text-foreground">
              {booking.bike_id?.model || booking.bikes?.model || booking.cluster_id?.name || "Rental Vehicle"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {format(new Date(booking.start_datetime), "dd MMM yyyy, HH:mm")} -{" "}
              {format(new Date(booking.end_datetime), "dd MMM yyyy, HH:mm")}
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] font-bold capitalize">
            {booking.status}
          </Badge>
        </div>
      ))}
      {bookings?.length === 0 && (
        <p className="text-muted-foreground text-center py-6 text-xs">No bookings recorded yet</p>
      )}
    </div>
  );
}

function DocumentImageViewer({ url, label }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!url) {
    return (
      <div className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-xl text-muted-foreground text-xs">
        <FileImage className="w-4 h-4 opacity-50 shrink-0" />
        <span>{label} not uploaded</span>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center gap-2.5 p-2.5 bg-primary/10 hover:bg-primary/15 rounded-xl cursor-pointer transition-colors border border-primary/20">
          <FileImage className="w-4 h-4 text-primary shrink-0" />
          <span className="text-primary font-semibold text-xs">{label}</span>
          <Eye className="w-3.5 h-3.5 ml-auto text-primary shrink-0" />
        </div>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-2xl bg-card border-border rounded-2xl p-4">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-bold">{label}</DialogTitle>
        </DialogHeader>
        <div className="mt-2 flex items-center justify-center bg-muted/30 rounded-xl p-2 max-h-[70vh] overflow-hidden">
          <img
            src={url}
            alt={label}
            loading="lazy"
            decoding="async"
            className="w-full h-auto max-h-[65vh] object-contain rounded-lg"
            onError={(e) => {
              e.target.src = "/placeholder.svg";
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Customers() {
  const { user } = useAuth();
  const { areas, selectedAreaIds } = useAdminArea();

  const getCustomerAreaName = (cust) => {
    if (!cust) return null;
    if (cust.area_id?.name) return cust.area_id.name;
    const aId = typeof cust.area_id === "object" ? cust.area_id?._id : cust.area_id;
    if (aId && areas && areas.length > 0) {
      const match = areas.find((a) => a._id === aId || String(a._id) === String(aId));
      if (match?.name) return match.name;
    }
    if (cust.area_name && areas && areas.length > 0) {
      const match = areas.find((a) => a.name?.trim().toLowerCase() === cust.area_name?.trim().toLowerCase());
      if (match?.name) return match.name;
    }
    return null;
  };

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 24;

  const { data: customers, isLoading } = useCustomers(searchQuery);
  const createCustomer = useCreateCustomer();

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil((customers?.length || 0) / ITEMS_PER_PAGE) || 1;
  const paginatedCustomers = customers?.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const verifiedKycCount = customers?.filter(
    (c) => c.aadhaar_image_url || c.license_image_url
  ).length || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error("Please fill in name and phone");
      return;
    }

    const assignedAreaId =
      user?.areaId?._id ||
      user?.areaId ||
      user?.assigned_areas?.[0]?._id ||
      user?.assigned_areas?.[0] ||
      null;

    const dataToSend = {
      ...formData,
      ...(assignedAreaId ? { area_id: assignedAreaId } : {}),
    };

    await createCustomer.mutateAsync(dataToSend);
    setIsAddOpen(false);
    setFormData(initialFormData);
  };

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Rider profiles, KYC verification documents, and rental transaction history
          </p>
        </div>
      </div>

      {/* ── KPI Stats Strip ───────────────────────────────────────── */}
      {customers && (
        <div className="flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto pb-1 scrollbar-none">
          {/* Total Customers */}
          <div className="min-w-[155px] sm:min-w-0 flex-1 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-blue-900/70 dark:text-blue-300">
                Total Riders
              </span>
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-950 dark:text-blue-100">
                {customers.length}
              </span>
              <span className="text-[11px] font-semibold text-blue-700/80 dark:text-blue-300">
                Registered
              </span>
            </div>
          </div>

          {/* KYC Verified */}
          <div className="min-w-[155px] sm:min-w-0 flex-1 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-emerald-900/70 dark:text-emerald-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Verified KYC
              </span>
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100">
                {verifiedKycCount}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700/80 dark:text-emerald-300">
                Documents On File
              </span>
            </div>
          </div>

          {/* Operating Hubs */}
          <div className="min-w-[155px] sm:min-w-0 flex-1 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-amber-900/70 dark:text-amber-300">
                Active Hubs
              </span>
              <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <MapPin className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-950 dark:text-amber-100">
                {areas?.length || 0}
              </span>
              <span className="text-[11px] font-semibold text-amber-700/80 dark:text-amber-300">
                Stations
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Search Bar ────────────────────────────────────────────── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone, or email..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-9 pr-8 bg-card border-border/80 rounded-xl text-sm h-10"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery("");
              setCurrentPage(1);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Customer Cards ────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse bg-card border-border/70 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
              <div className="h-8 bg-muted rounded w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {paginatedCustomers?.map((customer, index) => {
              const areaName = getCustomerAreaName(customer);
              const hasAadhaar = !!customer.aadhaar_image_url;
              const hasDl = !!customer.license_image_url;

              return (
                <motion.div
                  key={customer._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index, 8) * 0.02 }}
                >
                  <Card
                    className="bg-card border border-border/80 hover:border-slate-400 dark:hover:border-slate-600 rounded-2xl shadow-2xs hover:shadow-xs transition-all p-3.5 sm:p-4 cursor-pointer flex flex-col justify-between"
                    onClick={() => setViewingCustomer(customer)}
                  >
                    <div>
                      {/* Top Header: Avatar + Name + Phone + One-tap Call */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {getInitials(customer.name)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-foreground text-sm truncate leading-tight">
                              {customer.name}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                              <span className="font-mono font-medium">{customer.phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* One-tap Call Button */}
                        {customer.phone && (
                          <a
                            href={`tel:${customer.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 transition-transform active:scale-95"
                            title="Call customer directly"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Info lines: Email & Area */}
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {customer.email && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                        )}
                        {areaName && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                            <span className="font-semibold text-foreground/80 truncate">
                              {areaName}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* KYC Badges */}
                      <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                        {hasAadhaar ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            <ShieldCheck className="w-2.5 h-2.5" /> Aadhaar ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/50">
                            Aadhaar —
                          </span>
                        )}

                        {hasDl ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                            <ShieldCheck className="w-2.5 h-2.5" /> DL ✓
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/50">
                            DL —
                          </span>
                        )}

                        {customer.id_proof_type && (
                          <span className="text-[10px] text-muted-foreground ml-auto font-mono">
                            {customer.id_proof_type}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingCustomer(customer);
                        }}
                        className="w-full h-7 text-xs font-semibold rounded-lg border-border hover:border-primary"
                      >
                        <History className="w-3 h-3 mr-1.5" /> View Profile & Bookings
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {customers?.length === 0 && (
              <div className="col-span-full text-center py-12 border border-dashed border-border rounded-2xl bg-card/20">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-30" />
                <p className="text-muted-foreground text-sm font-medium">No matching customers found</p>
              </div>
            )}
          </div>

          {/* ── Pagination Controls ─────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60 pt-4 px-1">
              <p className="text-xs text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, customers?.length || 0)} of{" "}
                {customers?.length || 0} registered riders
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs rounded-xl"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  Previous
                </Button>
                <span className="text-xs font-bold px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs rounded-xl"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Customer Details Modal ────────────────────────────────── */}
      <Dialog
        open={!!viewingCustomer}
        onOpenChange={(open) => {
          if (!open) setViewingCustomer(null);
        }}
      >
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] bg-card border-border rounded-2xl p-4 sm:p-5 flex flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-foreground text-lg font-bold">Rider Profile</DialogTitle>
          </DialogHeader>
          {viewingCustomer && (
            <ScrollArea className="flex-1 overflow-auto pr-2 mt-2">
              <div className="space-y-4">
                {/* Rider Header Card */}
                <div className="flex items-center gap-3 p-3.5 bg-muted/40 rounded-2xl border border-border/60">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {getInitials(viewingCustomer.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-base text-foreground leading-tight truncate">
                      {viewingCustomer.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {viewingCustomer.phone}
                    </p>
                  </div>
                  {viewingCustomer.phone && (
                    <a
                      href={`tel:${viewingCustomer.phone}`}
                      className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 active:scale-95"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <Tabs defaultValue="details">
                  <TabsList className="w-full grid grid-cols-3 bg-muted/60 p-1 rounded-xl">
                    <TabsTrigger value="details" className="text-xs rounded-lg font-bold">
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="text-xs rounded-lg font-bold">
                      Documents
                    </TabsTrigger>
                    <TabsTrigger value="bookings" className="text-xs rounded-lg font-bold">
                      Rentals
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-3 space-y-2.5">
                    {viewingCustomer.email && (
                      <div className="flex items-center gap-2.5 p-2.5 bg-muted/30 rounded-xl border border-border/50">
                        <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Email</p>
                          <p className="font-semibold text-xs text-foreground truncate">{viewingCustomer.email}</p>
                        </div>
                      </div>
                    )}

                    {(() => {
                      const areaName = getCustomerAreaName(viewingCustomer);
                      if (!areaName) return null;
                      return (
                        <div className="flex items-center gap-2.5 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                          <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] text-amber-500 font-bold uppercase">Operating Station</p>
                            <p className="font-semibold text-xs text-foreground truncate">
                              {areaName}
                              {viewingCustomer.area_id?.city ? ` (${viewingCustomer.area_id.city})` : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {viewingCustomer.address && (
                      <div className="flex items-center gap-2.5 p-2.5 bg-muted/30 rounded-xl border border-border/50">
                        <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Address</p>
                          <p className="font-semibold text-xs text-foreground">{viewingCustomer.address}</p>
                        </div>
                      </div>
                    )}

                    {viewingCustomer.id_proof_type && (
                      <div className="flex items-center gap-2.5 p-2.5 bg-muted/30 rounded-xl border border-border/50">
                        <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">
                            {viewingCustomer.id_proof_type}
                          </p>
                          <p className="font-semibold text-xs text-foreground font-mono">
                            {viewingCustomer.id_proof_number}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-muted-foreground pt-1">
                      Registered on{" "}
                      {viewingCustomer.createdAt || viewingCustomer.created_at
                        ? format(
                            new Date(
                              viewingCustomer.createdAt || viewingCustomer.created_at
                            ),
                            "dd MMM yyyy"
                          )
                        : "N/A"}
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="mt-3 space-y-3">
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Primary Verification IDs
                      </p>
                      <DocumentImageViewer
                        url={viewingCustomer.aadhaar_image_url}
                        label="Aadhaar Card"
                      />
                      <DocumentImageViewer
                        url={viewingCustomer.license_image_url}
                        label="Driving License"
                      />
                    </div>

                    {viewingCustomer.extra_documents?.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-border">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          Additional Documents
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {viewingCustomer.extra_documents.map((url, index) => (
                            <DocumentImageViewer
                              key={index}
                              url={url}
                              label={`Document ${index + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {!viewingCustomer.aadhaar_image_url &&
                      !viewingCustomer.license_image_url &&
                      (!viewingCustomer.extra_documents ||
                        viewingCustomer.extra_documents.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-6 text-center bg-muted/20 rounded-xl border border-dashed border-border">
                          <FileImage className="w-8 h-8 text-muted-foreground mb-1.5 opacity-30" />
                          <p className="text-xs text-muted-foreground">
                            No documents uploaded for this rider
                          </p>
                        </div>
                      )}
                  </TabsContent>

                  <TabsContent value="bookings" className="mt-3">
                    <CustomerBookingsPanel customerId={viewingCustomer._id} />
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
