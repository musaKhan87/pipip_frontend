import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

import {
  Bike,
  Calendar,
  Users,
  ClipboardList,
  BarChart3,
  Settings,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  MapPin,
  Activity,
  Bell,
  Boxes,
  Banknote,
  UserCheck,
} from "lucide-react";

import { Button } from "../ui/button";
import { cn } from "../../lib/util";
import { useAuth } from "../../lib/AuthProvider";
import { useAdminArea } from "../../lib/AreaContext";

const allMenuItems = [
  {
    path: "/admin/panel",
    icon: LayoutDashboard,
    label: "Dashboard",
    end: true,
    roles: ["super_admin", "admin", "manager", "staff"],
  },
  {
    path: "/admin/panel/bikes",
    icon: Bike,
    label: "Bikes",
    roles: ["super_admin", "admin", "manager", "staff"],
  },
  {
    path: "/admin/panel/clusters",
    icon: Boxes,
    label: "Clusters",
    roles: ["super_admin", "admin", "manager", "staff"],
  },
  {
    path: "/admin/panel/bookings",
    icon: ClipboardList,
    label: "Bookings",
    roles: ["super_admin", "admin", "manager", "staff"],
  },
  {
    path: "/admin/panel/active-rentals",
    icon: Activity,
    label: "Active Rentals",
    roles: ["super_admin", "admin", "manager", "staff"],
  },
  {
    path: "/admin/panel/scheduler",
    icon: Calendar,
    label: "Scheduler",
    roles: ["super_admin", "admin", "manager", "staff"],
  },
  {
    path: "/admin/panel/customers",
    icon: Users,
    label: "Customers",
    roles: ["super_admin", "admin", "manager", "staff"],
  },
  {
    path: "/admin/panel/areas",
    icon: MapPin,
    label: "Areas",
    roles: ["super_admin", "admin"],
  },
  {
    path: "/admin/panel/expenses",
    icon: Banknote,
    label: "Expenses",
    roles: ["super_admin", "admin", "manager", "staff"],
  },
  {
    path: "/admin/panel/notifications",
    icon: Bell,
    label: "Notifications",
    roles: ["super_admin", "admin", "manager", "staff"],
  },
  {
    path: "/admin/panel/reports",
    icon: BarChart3,
    label: "Reports",
    roles: ["super_admin", "admin", "manager"],
  },
  {
    path: "/admin/panel/settings",
    icon: Settings,
    label: "Settings",
    roles: ["super_admin", "admin"],
  },
];

const investorMenuItems = [
  {
    path: "/admin/panel/investor-orders",
    icon: ClipboardList,
    label: "Orders & Revenue",
  },
  { path: "/admin/panel/bikes", icon: Bike, label: "My Bikes" },
];

export default function AdminSidebar({ unreadCount }) {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut, user, role } = useAuth();
  const { selectedAreaObj, selectedAreaId } = useAdminArea();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    // Use hard redirect to fully clear in-memory state and avoid stuck SPA render
    window.location.href = "/pipip-ops-mumbai";
  };

  const handleNavigation = () => {
    navigate("/#home");
  };

  let currentMenuItems = [];
  if (role === "investor") {
    currentMenuItems = investorMenuItems;
  } else {
    const userRole = (role === "admin" || role === "super_admin") ? "super_admin" : role;
    currentMenuItems = allMenuItems.filter(
      (item) => item.roles.includes(userRole) || (userRole === "super_admin" && item.roles.includes("admin"))
    );
  }

  const roleTitle = role === "super_admin" ? "Super Admin" : role === "manager" ? "Area Manager" : role;

  const currentAreaLabel =
    (role === "super_admin" || role === "admin")
      ? selectedAreaId === "all"
        ? "All Areas"
        : selectedAreaObj?.name || "Selected Area"
      : user?.areaId?.name || user?.assigned_areas?.[0]?.name || "Assigned Area";

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden md:hidden fixed top-4 right-4 z-50 p-2 gradient-sunset rounded-lg text-primary-foreground shadow-golden"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {collapsed && (
        <div
          className="lg:hidden md:hidden fixed inset-0 bg-background/80 backdrop-blur-md z-40"
          onClick={() => setCollapsed(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static md:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:transform-none md:transform-none",
          collapsed ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2">
                <button onClick={handleNavigation}>
                  <img
                    src="/logo.jpeg"
                    alt="Pipip"
                    className="w-12 h-12 rounded-full shadow-golden"
                  />
                </button>
              </div>
              <div>
                <h1 className="font-display text-xl text-gradient-sunset">
                  Pipip
                </h1>
                <p className="text-xs text-muted-foreground capitalize">
                  {roleTitle} Panel
                </p>
                <p className="text-[11px] font-semibold text-amber-500 truncate max-w-[120px]">
                  📍 {currentAreaLabel}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
            {currentMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setCollapsed(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200",
                    isActive
                      ? "gradient-sunset text-primary-foreground shadow-golden font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )
                }
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.label === "Notifications" && unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold min-w-[20px] h-[20px] flex items-center justify-center rounded-full px-1">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Profile Footer */}
          <div className="p-4 border-t border-border">
            <div className="mb-3 px-4">
              <p className="text-sm font-medium truncate">{user?.fullName || user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{roleTitle}</p>
            </div>

            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}


