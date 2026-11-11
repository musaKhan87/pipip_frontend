import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bike as BikeIcon,
  Search,
  Filter,
  TrendingUp,
  ClipboardList,
  Calendar,
  IndianRupee,
  Activity,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { useBookings } from "../../hooks/useBooking";
import { useBikes } from "../../hooks/useBikes";
import { useAuth } from "../../lib/AuthProvider";
const statusBadges = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};
const statusIcons = {
  active: Activity,
  confirmed: CheckCircle2,
  completed: CheckCircle2,
  pending: Clock,
  cancelled: XCircle,
};
export default function InvestorOrders() {
  const { user } = useAuth();
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
  const { data: bikes = [], isLoading: bikesLoading } = useBikes();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  // Summary Metrics
  const metrics = useMemo(() => {
    const totalBikes = bikes.length;
    const totalOrders = bookings.length;
    const activeOrders = bookings.filter((b) => b.status === "active").length;
    
    // Revenue calculated from confirmed, active, completed bookings
    const totalRevenue = bookings.reduce((sum, b) => {
      if (b.status === "cancelled") return sum;
      const mainAmount = Number(b.total_amount || 0);
      return sum + mainAmount;
    }, 0);
    return { totalBikes, totalOrders, activeOrders, totalRevenue };
  }, [bookings, bikes]);
  // Filtered Bookings list
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const bikeObj = booking.bikes || booking.bike_id || {};
      const bikeModel = (bikeObj.model || booking.vehicle_make_model || "").toLowerCase();
      const numberPlate = (bikeObj.number_plate || "").toLowerCase();
      const bookingId = (booking._id || "").toLowerCase();
      const search = searchQuery.toLowerCase();
      const matchesSearch =
        bikeModel.includes(search) ||
        numberPlate.includes(search) ||
        bookingId.includes(search);
      const matchesStatus =
        statusFilter === "all" || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);
  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const isLoading = bookingsLoading || bikesLoading;
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display text-gradient-sunset">
          Orders & Revenue
        </h1>
        <p className="text-muted-foreground">
          Track rental orders and revenue metrics for your bike fleet ({user?.fullName || user?.email})
        </p>
      </div>
      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Total Revenue
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">
                ₹{metrics.totalRevenue.toLocaleString("en-IN")}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <BikeIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                My Bikes
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">
                {metrics.totalBikes}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Total Orders
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">
                {metrics.totalOrders}
              </h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">
                Active Rentals
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">
                {metrics.activeOrders}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by bike model or number plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44 bg-input border-border">
              <Filter className="w-4 h-4 mr-2 text-primary" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Orders List / Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse bg-card border-border">
              <CardContent className="p-6 h-20 bg-muted/40 rounded-lg" />
            </Card>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-semibold text-foreground">No Orders Found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filter settings."
              : "There are currently no orders recorded for your bikes."}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => {
            const bikeObj = booking.bikes || booking.bike_id || {};
            const bikeName = bikeObj.bike_name || bikeObj.model || booking.vehicle_make_model || "Bike";
            const numberPlate = bikeObj.number_plate || "—";
            const StatusIcon = statusIcons[booking.status] || Clock;
            const revenueAmount = Number(booking.total_amount || 0);
            return (
              <motion.div
                key={booking._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="bg-card border-border hover:border-primary/40 transition-all shadow-sm">
                  <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Bike & Order Info */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-3 bg-muted rounded-xl shrink-0 mt-0.5">
                        <BikeIcon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-foreground text-base">
                            {bikeName}
                          </h4>
                          <span className="text-xs px-2 py-0.5 bg-muted rounded-full font-mono text-muted-foreground">
                            {numberPlate}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            From: {formatDate(booking.start_datetime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            To: {formatDate(booking.end_datetime)}
                          </span>
                        </div>
                        {booking.rental_type && (
                          <p className="text-xs text-muted-foreground capitalize">
                            Rental Type: <span className="text-foreground font-medium">{booking.rental_type}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    {/* Status & Financial Revenue */}
                    <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                      <Badge
                        className={`capitalize border px-3 py-1 flex items-center gap-1.5 ${
                          statusBadges[booking.status] || "bg-muted text-muted-foreground"
                        }`}
                      >
                        <StatusIcon className="w-3.5 h-3.5" />
                        {booking.status}
                      </Badge>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="text-lg font-bold text-emerald-400">
                          ₹{revenueAmount.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}