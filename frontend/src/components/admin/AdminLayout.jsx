import { Outlet, Navigate, useLocation, Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import NotFound from "../../Pages/NotFound";
import { MapPin, Bell, Radio } from "lucide-react";
import AdminLoadingState from "./AdminLoadingState";
import { useAuth } from "../../lib/AuthProvider";
import { useAdminArea } from "../../lib/AreaContext";
import HubChecklistDropdown from "./HubChecklistDropdown";
import { useEffect, useRef, useState, useMemo } from "react";
import io from "socket.io-client";
import { useBikes } from "../../hooks/useBikes";
import { BACKEND_URL } from "../../config/api";

export default function AdminLayout() {

  const { user, isAdminOrStaff, hasPanelAccess, isSuperAdmin, loading } = useAuth();
  const { areas, selectedAreaId, selectedAreaIds, setSelectedAreaId } = useAdminArea();
  const location = useLocation();
  const scrollRef = useRef(null); // Create a reference to the scrollable area

  // Compute user's assigned area IDs array
  const userAssignedAreaIds = useMemo(() => {
    if (!user) return [];
    const ids = [];
    if (user.areaId) {
      const id = user.areaId._id ? user.areaId._id.toString() : user.areaId.toString();
      ids.push(id);
    }
    if (user.assigned_areas && user.assigned_areas.length > 0) {
      user.assigned_areas.forEach((a) => {
        const id = a._id ? a._id.toString() : a.toString();
        if (!ids.includes(id)) ids.push(id);
      });
    }
    return ids;
  }, [user]);

  // Notification logs state persisted in localStorage
  const [logs, setLogs] = useState(() => {
    try {
      const savedLogs = localStorage.getItem("pipip_notifications");
      return savedLogs ? JSON.parse(savedLogs) : [
        {
          id: 1,
          title: "Pipip Cloud Live",
          message: "Real-time communication channels active and operational.",
          type: "system",
          read: true,
          time: "Active",
        },
      ];
    } catch (e) {
      console.error("Failed to load notifications from localStorage", e);
      return [
        {
          id: 1,
          title: "Pipip Cloud Live",
          message: "Real-time communication channels active and operational.",
          type: "system",
          read: true,
          time: "Active",
        },
      ];
    }
  });

  const { data: bikes } = useBikes();

  // Persist logs to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("pipip_notifications", JSON.stringify(logs));
    } catch (e) {
      console.error("Failed to persist notifications to localStorage", e);
    }
  }, [logs]);

  // Scan bikes for document expiry dates periodically
  useEffect(() => {
    if (!bikes || bikes.length === 0) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day
    const expiryAlerts = [];

    bikes.forEach((bike) => {
      const bikeAreaId = bike.area_id?._id
        ? bike.area_id._id.toString()
        : bike.area_id
        ? bike.area_id.toString()
        : null;
      const bikeAreaName = bike.area_id?.name || null;

      // If manager or staff, only scan bikes from their assigned areas
      if (!isSuperAdmin && bikeAreaId && !userAssignedAreaIds.includes(bikeAreaId)) {
        return;
      }

      // Helper function to check date and push alert
      const checkExpiry = (expiryDateStr, dateType, label) => {
        if (!expiryDateStr) return;
        const expiryDate = new Date(expiryDateStr);
        expiryDate.setHours(0, 0, 0, 0);
        
        // Calculate days remaining
        const diffTime = expiryDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysLeft <= 7) {
          const uniqueId = `expiry-${bike._id}-${dateType}`;
          const isExpired = daysLeft <= 0;
          const statusText = isExpired 
            ? "HAS EXPIRED!" 
            : `expires in ${daysLeft} ${daysLeft === 1 ? "day" : "days"}`;

          expiryAlerts.push({
            id: uniqueId,
            title: `⚠️ Bike ${label} Expiry`,
            message: `Bike: ${bike.bike_name || bike.model} (${bike.number_plate}) ${label} ${statusText} on ${new Date(expiryDateStr).toLocaleDateString("en-IN")}.${bikeAreaName ? ` [Area: ${bikeAreaName}]` : ""}`,
            type: "expiry",
            read: false,
            time: "Expiry Reminder",
            bikeId: bike._id,
            bikeNumberPlate: bike.number_plate,
            areaId: bikeAreaId,
            areaName: bikeAreaName,
          });
        }
      };

      checkExpiry(bike.insurance_end_date, "insurance", "Insurance");
      checkExpiry(bike.puc_end_date, "puc", "PUC");
      checkExpiry(bike.bike_end_date, "lifecycle", "Lifecycle");
    });

    if (expiryAlerts.length > 0) {
      setLogs((prev) => {
        let dismissed = [];
        try {
          const savedDismissed = localStorage.getItem("pipip_dismissed_notifications");
          dismissed = savedDismissed ? JSON.parse(savedDismissed) : [];
        } catch (e) {}

        // Filter out alerts that already exist in logs or have been dismissed
        const newAlerts = expiryAlerts.filter(
          (alert) =>
            !prev.some((log) => log.id === alert.id) &&
            !dismissed.includes(alert.id)
        );

        if (newAlerts.length > 0) {
          return [...newAlerts, ...prev];
        }
        return prev;
      });
    }
  }, [bikes, isSuperAdmin, userAssignedAreaIds]);

  // Global socket listener for new order alerts
  useEffect(() => {
    if (!user || !isAdminOrStaff) return;

    const socket = io(BACKEND_URL, {
      transports: [ "polling","websocket"],
      secure: BACKEND_URL.startsWith("https"),
      withCredentials: true,
    });

    socket.on("newOnlineOrderStream", (incomingAlert) => {
      // If manager or staff, only chime and capture alerts for their assigned area
      if (!isSuperAdmin && incomingAlert.areaId && !userAssignedAreaIds.includes(incomingAlert.areaId.toString())) {
        return;
      }

      const dynamicChimeSound = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav",
      );
      dynamicChimeSound
        .play()
        .catch(() =>
          console.log(
            "Audio play blocked by browser sandbox until click gesture.",
          ),
        );

      setLogs((prev) => [
        { ...incomingAlert, id: Date.now(), read: false, time: "Just Now" },
        ...prev,
      ]);
    });

    socket.on("carRentalRequestStream", (incomingAlert) => {
      const dynamicChimeSound = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav",
      );
      dynamicChimeSound
        .play()
        .catch(() =>
          console.log(
            "Audio play blocked by browser sandbox until click gesture.",
          ),
        );

      setLogs((prev) => [
        {
          ...incomingAlert,
          id: incomingAlert.id || Date.now(),
          type: incomingAlert.type || "car_rental",
          read: false,
          time: incomingAlert.time || "Just Now",
        },
        ...prev,
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, isAdminOrStaff, isSuperAdmin, userAssignedAreaIds]);

  // Scroll to top whenever the path changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // Filter logs for the active view/role (defined at top to satisfy Rules of Hooks)
  const filteredLogs = useMemo(() => {
    if (!user) return logs;
    if (!isSuperAdmin) {
      // Manager or Staff: Only show logs that match user's assigned area or have no area (system)
      return logs.filter((log) => {
        if (!log.areaId) return true;
        return userAssignedAreaIds.includes(log.areaId.toString());
      });
    }
    // Super Admin:
    if (!selectedAreaIds || selectedAreaIds.length === 0 || selectedAreaIds.includes("all")) {
      return logs;
    }
    return logs.filter((log) => {
      if (!log.areaId) return true;
      return selectedAreaIds.includes(log.areaId.toString());
    });
  }, [logs, user, isSuperAdmin, userAssignedAreaIds, selectedAreaIds]);

  const unreadCount = filteredLogs.filter((log) => !log.read).length;

  // Custom setLogs that updates or clears only the scoped logs
  const setScopedLogs = (updater) => {
    setLogs((allLogs) => {
      const currentScoped = filteredLogs;
      const updatedScoped = typeof updater === "function" ? updater(currentScoped) : updater;
      
      const otherLogs = allLogs.filter((log) => !currentScoped.some((s) => s.id === log.id));
      return [...updatedScoped, ...otherLogs];
    });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <AdminLoadingState
          title="Loading Operations Console..."
          subtitle="Verifying administrative session & synchronizing fleet telemetry"
          minHeight="min-h-[400px]"
        />
      </div>
    );
  }

  if (!user || !hasPanelAccess) {
    return <NotFound />;
  }

  // Role-based route protection
  const userRole = user?.role;
  const currentPath = location.pathname.toLowerCase().replace(/\/$/, "");

  // Staff route restrictions
  if (userRole === "staff") {
    const staffRestrictedPaths = [
      "/admin/panel/reports",
      "/admin/panel/settings",
      "/admin/panel/managers",
      "/admin/panel/areas",
      "/admin/panel/investor-orders"
    ];
    if (staffRestrictedPaths.some((p) => currentPath.startsWith(p))) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8 bg-card border border-border rounded-xl shadow-sm max-w-md">
            <h2 className="text-xl font-bold text-destructive mb-2">Access Denied</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Staff members do not have permission to view this page.
            </p>
            <a href="/admin/panel/bikes" className="text-sm text-primary hover:underline font-medium">
              Go to Bikes View
            </a>
          </div>
        </div>
      );
    }
  }

  // Manager route restrictions
  if (userRole === "manager") {
    const managerRestrictedPaths = [
      "/admin/panel/settings",
      "/admin/panel/managers",
      "/admin/panel/areas",
      "/admin/panel/investor-orders"
    ];
    if (managerRestrictedPaths.some((p) => currentPath.startsWith(p))) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8 bg-card border border-border rounded-xl shadow-sm max-w-md">
            <h2 className="text-xl font-bold text-destructive mb-2">Access Denied</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Area Managers do not have permission to access global settings or manager administration.
            </p>
            <a href="/admin/panel" className="text-sm text-primary hover:underline font-medium">
              Return to Dashboard
            </a>
          </div>
        </div>
      );
    }
  }

  const pageTitles = {
    "/admin/panel": "Operations Dashboard",
    "/admin/panel/bikes": "Fleet Inventory",
    "/admin/panel/clusters": "Vehicle Clusters",
    "/admin/panel/bookings": "Customer Bookings",
    "/admin/panel/active-rentals": "Active Rentals Tracker",
    "/admin/panel/scheduler": "Dispatch Scheduler",
    "/admin/panel/customers": "Customer Directory",
    "/admin/panel/areas": "Hub Territories",
    "/admin/panel/expenses": "Expense Ledger",
    "/admin/panel/notifications": "Notifications & Alerts",
    "/admin/panel/reports": "Analytics & Reports",
    "/admin/panel/settings": "System Settings",
  };
  const activeTitle = pageTitles[currentPath] || "Operations Control";

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <AdminSidebar unreadCount={unreadCount} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Global Admin Header */}
        <header className="h-14 border-b border-border/80 bg-card/85 dark:bg-slate-900/85 backdrop-blur-xl px-3 sm:px-6 lg:px-8 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Mobile Brand / Menu Trigger */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-admin-menu"))}
              className="w-8 h-8 rounded-lg overflow-hidden border border-border/70 shrink-0 lg:hidden md:hidden shadow-xs cursor-pointer active:scale-90 transition-transform"
              title="Open full menu"
            >
              <img src="/logo.jpeg" alt="Pipip" className="w-full h-full object-cover" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                {activeTitle}
              </span>

              {/* Real-time telemetry pulse */}
              <div className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Fleet Sync</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {isSuperAdmin ? (
              <HubChecklistDropdown />
            ) : (
              <div className="flex items-center gap-1.5 bg-muted/60 border border-border/70 px-2.5 py-1.5 rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs font-semibold text-foreground truncate max-w-[130px] sm:max-w-none">
                  {user?.areaId?.name || user?.assigned_areas?.[0]?.name || "Assigned Hub"}
                </span>
              </div>
            )}

            {/* Notifications Shortcut Icon */}
            <Link
              to="/admin/panel/notifications"
              className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-background" />
              )}
            </Link>
          </div>
        </header>

        <main
          className="flex-1 p-3 sm:p-5 lg:p-8 pb-24 md:pb-8 overflow-y-auto overflow-x-hidden h-full bg-background scrollbar-hide"
          ref={scrollRef}
        >
          <div className="max-w-[1600px] w-full mx-auto">
            <Outlet context={{ logs: filteredLogs, setLogs: setScopedLogs }} />
          </div>
        </main>
      </div>
    </div>
  );
}