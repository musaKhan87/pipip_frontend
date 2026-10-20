import { Outlet, Navigate , useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import NotFound from "../../Pages/NotFound";
import { Loader2, MapPin } from "lucide-react";
import { useAuth } from "../../lib/AuthProvider";
import { useAdminArea } from "../../lib/AreaContext";
import { useEffect, useRef, useState, useMemo } from "react";
import io from "socket.io-client";
import { useBikes } from "../../hooks/useBikes";
import { BACKEND_URL } from "../../config/api";

export default function AdminLayout() {

  const { user, isAdminOrStaff, hasPanelAccess, isSuperAdmin, loading } = useAuth();
  const { areas, selectedAreaId, setSelectedAreaId } = useAdminArea();
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
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
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
          <div className="text-center p-8 bg-card border border-border rounded-2xl shadow-golden max-w-md">
            <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              Staff members do not have permission to view this page.
            </p>
            <a href="/admin/panel/bikes" className="text-primary hover:underline font-semibold">
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
          <div className="text-center p-8 bg-card border border-border rounded-2xl shadow-golden max-w-md">
            <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              Area Managers do not have permission to access global settings or manager administration.
            </p>
            <a href="/admin/panel" className="text-primary hover:underline font-semibold">
              Return to Dashboard
            </a>
          </div>
        </div>
      );
    }
  }

  // Filter logs for the active view/role
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
    if (!selectedAreaId || selectedAreaId === "all") {
      return logs;
    }
    return logs.filter((log) => {
      if (!log.areaId) return true;
      return log.areaId.toString() === selectedAreaId.toString();
    });
  }, [logs, user, isSuperAdmin, userAssignedAreaIds, selectedAreaId]);

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

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <AdminSidebar unreadCount={unreadCount} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Global Admin Header */}
        <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between z-30 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-muted-foreground hidden sm:block">
              Pipip Control Panel
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {isSuperAdmin ? (
              <div className="flex items-center gap-2 bg-muted/80 border border-border/80 px-3 py-1.5 rounded-xl shadow-sm hover:border-amber-500/50 transition-colors">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs font-semibold text-muted-foreground hidden md:inline">
                  Area:
                </span>
                <select
                  value={selectedAreaId}
                  onChange={(e) => setSelectedAreaId(e.target.value)}
                  className="bg-transparent text-foreground text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                >
                  <option value="all" className="bg-card text-foreground">📍 All Areas (Global)</option>
                  {areas.map((area) => (
                    <option key={area._id} value={area._id} className="bg-card text-foreground">
                      📍 {area.name} {area.city ? `(${area.city})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs font-semibold text-amber-400">
                  📍 {user?.areaId?.name || user?.assigned_areas?.[0]?.name || "Assigned Area"}
                </span>
              </div>
            )}
          </div>
        </header>

        <main
          className="flex-1 p-4 lg:p-8 overflow-y-auto overflow-x-hidden h-full bg-background scrollbar-hide"
          ref={scrollRef}
        >
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ logs: filteredLogs, setLogs: setScopedLogs }} />
          </div>
        </main>
      </div>
    </div>
  );
}