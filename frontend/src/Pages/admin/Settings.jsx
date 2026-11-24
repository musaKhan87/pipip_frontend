import { useState, useEffect } from "react";
import {
  User,
  Users,
  UserCheck,
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Key,
  MapPin,
  Mail,
  ShieldCheck,
  RefreshCw,
  Shield,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";
import { Switch } from "../../components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import AdminLoadingState from "../../components/admin/AdminLoadingState";
import { useAuth } from "../../lib/AuthProvider";
import { useAllAreas, useActiveAreas } from "../../hooks/useAreas";
import { API_BASE_URL } from "../../config/api";

const API_AUTH = `${API_BASE_URL}/auth`;

export default function Settings() {
  const { user, isSuperAdmin, isAdmin } = useAuth();
  const hasAdminRights = isSuperAdmin || isAdmin;

  // Areas data
  const { data: allAreas = [] } = useAllAreas();
  const { data: activeAreas = [] } = useActiveAreas();
  const areas = allAreas.length > 0 ? allAreas : activeAreas;

  // Staff State
  const [staffList, setStaffList] = useState([]);
  const [isStaffLoading, setIsStaffLoading] = useState(true);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isStaffSubmitting, setIsStaffSubmitting] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [staffSearch, setStaffSearch] = useState("");
  const [staffForm, setStaffForm] = useState({
    fullName: "",
    email: "",
    password: "",
    areaId: "",
    status: "active",
  });

  // Managers State
  const [managersList, setManagersList] = useState([]);
  const [isManagersLoading, setIsManagersLoading] = useState(true);
  const [isManagerModalOpen, setIsManagerModalOpen] = useState(false);
  const [isManagerSubmitting, setIsManagerSubmitting] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [managerSearch, setManagerSearch] = useState("");
  const [managerForm, setManagerForm] = useState({
    fullName: "",
    email: "",
    password: "",
    areaId: "",
    status: "active",
  });

  // Investors State
  const [investorsList, setInvestorsList] = useState([]);
  const [isInvestorsLoading, setIsInvestorsLoading] = useState(true);
  const [isInvestorModalOpen, setIsInvestorModalOpen] = useState(false);
  const [isInvestorSubmitting, setIsInvestorSubmitting] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState(null);
  const [investorSearch, setInvestorSearch] = useState("");
  const [investorForm, setInvestorForm] = useState({
    fullName: "",
    email: "",
    password: "",
    status: "active",
  });

  // Dialog Error States (visible directly in modals)
  const [staffError, setStaffError] = useState("");
  const [managerError, setManagerError] = useState("");
  const [investorError, setInvestorError] = useState("");
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

  // Token helper
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Fetch Staff
  const fetchStaff = async () => {
    try {
      setIsStaffLoading(true);
      const { data } = await axios.get(`${API_AUTH}/staff`, getAuthHeader());
      setStaffList(data);
    } catch (err) {
      console.error("Error fetching staff:", err);
      toast.error(err.response?.data?.message || "Failed to load staff list");
    } finally {
      setIsStaffLoading(false);
    }
  };

  // Fetch Managers
  const fetchManagers = async () => {
    try {
      setIsManagersLoading(true);
      const { data } = await axios.get(`${API_AUTH}/managers`, getAuthHeader());
      setManagersList(data);
    } catch (err) {
      console.error("Error fetching managers:", err);
      toast.error(err.response?.data?.message || "Failed to load area managers");
    } finally {
      setIsManagersLoading(false);
    }
  };

  // Fetch Investors
  const fetchInvestors = async () => {
    try {
      setIsInvestorsLoading(true);
      const { data } = await axios.get(`${API_AUTH}/investors`, getAuthHeader());
      setInvestorsList(data);
    } catch (err) {
      console.error("Error fetching investors:", err);
      toast.error(err.response?.data?.message || "Failed to load investors list");
    } finally {
      setIsInvestorsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    if (hasAdminRights) {
      fetchManagers();
      fetchInvestors();
    }
  }, [hasAdminRights]);

  // Generate random password helper
  const generatePassword = (setFormCallback) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormCallback((prev) => ({ ...prev, password: pwd }));
    toast.info("Generated temp password!");
  };

  // ==========================
  // STAFF ACTIONS
  // ==========================
  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffError("");
    setStaffForm({
      fullName: "",
      email: "",
      password: "",
      areaId: areas && areas.length > 0 ? areas[0]._id : "",
      status: "active",
    });
    setIsStaffModalOpen(true);
  };

  const handleEditStaff = (staff) => {
    setEditingStaff(staff);
    setStaffError("");
    const assignedArea =
      staff.areaId?._id ||
      staff.areaId ||
      staff.assigned_areas?.[0]?._id ||
      staff.assigned_areas?.[0] ||
      "";
    setStaffForm({
      fullName: staff.fullName || "",
      email: staff.email || "",
      password: "",
      areaId: typeof assignedArea === "object" ? assignedArea._id : assignedArea,
      status: staff.status || "active",
    });
    setIsStaffModalOpen(true);
  };

  const executeSaveStaff = async () => {
    try {
      setIsStaffSubmitting(true);
      setConfirmConfig((prev) => ({ ...prev, isLoading: true }));
      const payload = {
        fullName: staffForm.fullName,
        email: staffForm.email,
        status: staffForm.status,
        areaId: staffForm.areaId || null,
        assigned_areas: staffForm.areaId ? [staffForm.areaId] : [],
        role: "staff",
      };
      if (staffForm.password && staffForm.password.trim() !== "") {
        payload.password = staffForm.password;
      }

      if (editingStaff) {
        await axios.put(`${API_AUTH}/staff/${editingStaff._id}`, payload, getAuthHeader());
        toast.success("Staff member updated successfully");
      } else {
        await axios.post(`${API_AUTH}/staff`, payload, getAuthHeader());
        toast.success("Staff member created successfully");
      }

      setConfirmConfig((prev) => ({ ...prev, open: false, isLoading: false }));
      setIsStaffModalOpen(false);
      setStaffError("");
      fetchStaff();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save staff member";
      setStaffError(msg);
      toast.error(msg);
      setConfirmConfig((prev) => ({ ...prev, isLoading: false }));
    } finally {
      setIsStaffSubmitting(false);
    }
  };

  const handleStaffSubmit = (e) => {
    e.preventDefault();
    setStaffError("");
    if (!staffForm.fullName || !staffForm.email) {
      const msg = "Full name and email are required";
      setStaffError(msg);
      toast.error(msg);
      return;
    }
    if (!editingStaff && !staffForm.password) {
      const msg = "Password is required for new staff";
      setStaffError(msg);
      toast.error(msg);
      return;
    }
    if (staffForm.password && staffForm.password.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setStaffError(msg);
      toast.error(msg);
      return;
    }

    const assignedAreaName = areas?.find((a) => a._id === staffForm.areaId)?.name || "All / None";

    setConfirmConfig({
      open: true,
      title: editingStaff ? "Confirm Staff Update" : "Confirm Staff Creation",
      description: editingStaff
        ? `Are you sure you want to save changes for ${staffForm.fullName}?`
        : `You are creating a new Staff account with access to ${assignedAreaName}. Please verify details below.`,
      type: "info",
      confirmText: editingStaff ? "Update Staff" : "Create Staff Account",
      details: [
        { label: "Role", value: "Staff Member", badge: "Hub Operator" },
        { label: "Full Name", value: staffForm.fullName },
        { label: "Email", value: staffForm.email },
        { label: "Assigned Hub", value: assignedAreaName },
        { label: "Login Access", value: staffForm.status === "active" ? "Enabled (Active)" : "Disabled (Inactive)" },
      ],
      onConfirm: executeSaveStaff,
      isLoading: false,
    });
  };

  const handleDeleteStaff = (staffId) => {
    if (staffId === user?._id) {
      toast.error("You cannot delete yourself");
      return;
    }
    const staffMember = staffList.find((s) => s._id === staffId);
    const staffName = staffMember?.fullName || "this staff member";

    setConfirmConfig({
      open: true,
      title: "Remove Staff Member",
      description: `Are you sure you want to permanently remove ${staffName}? Their login access will be revoked immediately.`,
      type: "danger",
      confirmText: "Yes, Remove Staff",
      details: [
        { label: "Full Name", value: staffName },
        { label: "Email", value: staffMember?.email || "N/A" },
        { label: "Assigned Hub", value: staffMember?.areaId?.name || "Unassigned" },
      ],
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmConfig((prev) => ({ ...prev, isLoading: true }));
          await axios.delete(`${API_AUTH}/staff/${staffId}`, getAuthHeader());
          toast.success("Staff member removed successfully");
          setConfirmConfig((prev) => ({ ...prev, open: false, isLoading: false }));
          fetchStaff();
        } catch (err) {
          toast.error(err.response?.data?.message || err.message || "Failed to remove staff member");
          setConfirmConfig((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // ==========================
  // MANAGER ACTIONS
  // ==========================
  const handleOpenAddManager = () => {
    setEditingManager(null);
    setManagerError("");
    setManagerForm({
      fullName: "",
      email: "",
      password: "",
      areaId: areas && areas.length > 0 ? areas[0]._id : "",
      status: "active",
    });
    setIsManagerModalOpen(true);
  };

  const handleEditManager = (mgr) => {
    setEditingManager(mgr);
    setManagerError("");
    const assignedArea =
      mgr.areaId?._id ||
      mgr.areaId ||
      mgr.assigned_areas?.[0]?._id ||
      mgr.assigned_areas?.[0] ||
      "";
    setManagerForm({
      fullName: mgr.fullName || "",
      email: mgr.email || "",
      password: "",
      areaId: typeof assignedArea === "object" ? assignedArea._id : assignedArea,
      status: mgr.status || "active",
    });
    setIsManagerModalOpen(true);
  };

  const executeSaveManager = async () => {
    try {
      setIsManagerSubmitting(true);
      setConfirmConfig((prev) => ({ ...prev, isLoading: true }));
      const payload = {
        fullName: managerForm.fullName,
        email: managerForm.email,
        areaId: managerForm.areaId,
        status: managerForm.status,
      };
      if (managerForm.password && managerForm.password.trim() !== "") {
        payload.password = managerForm.password;
      }

      if (editingManager) {
        await axios.put(`${API_AUTH}/managers/${editingManager._id}`, payload, getAuthHeader());
        toast.success("Area Manager updated successfully");
      } else {
        await axios.post(`${API_AUTH}/managers`, payload, getAuthHeader());
        toast.success("Area Manager created successfully");
      }

      setConfirmConfig((prev) => ({ ...prev, open: false, isLoading: false }));
      setIsManagerModalOpen(false);
      setManagerError("");
      fetchManagers();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save area manager";
      setManagerError(msg);
      toast.error(msg);
      setConfirmConfig((prev) => ({ ...prev, isLoading: false }));
    } finally {
      setIsManagerSubmitting(false);
    }
  };

  const handleManagerSubmit = (e) => {
    e.preventDefault();
    setManagerError("");
    if (!managerForm.fullName || !managerForm.email) {
      const msg = "Full name and email are required";
      setManagerError(msg);
      toast.error(msg);
      return;
    }
    if (!managerForm.areaId) {
      const msg = "Please select an area for this manager";
      setManagerError(msg);
      toast.error(msg);
      return;
    }
    if (!editingManager && !managerForm.password) {
      const msg = "Password is required for new manager";
      setManagerError(msg);
      toast.error(msg);
      return;
    }
    if (managerForm.password && managerForm.password.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setManagerError(msg);
      toast.error(msg);
      return;
    }

    const assignedAreaName = areas?.find((a) => a._id === managerForm.areaId)?.name || "Assigned Hub";

    setConfirmConfig({
      open: true,
      title: editingManager ? "Confirm Manager Update" : "Confirm Area Manager Creation",
      description: editingManager
        ? `Are you sure you want to update permissions for ${managerForm.fullName}?`
        : `You are granting Area Manager authority over ${assignedAreaName} to ${managerForm.fullName}. Please confirm below.`,
      type: "info",
      confirmText: editingManager ? "Update Manager" : "Create Area Manager",
      details: [
        { label: "Role", value: "Area Manager", badge: "Hub Lead" },
        { label: "Full Name", value: managerForm.fullName },
        { label: "Email", value: managerForm.email },
        { label: "Designated Hub", value: assignedAreaName },
        { label: "Login Access", value: managerForm.status === "active" ? "Enabled (Active)" : "Disabled (Inactive)" },
      ],
      onConfirm: executeSaveManager,
      isLoading: false,
    });
  };

  const handleDeleteManager = (mgrId) => {
    const mgrMember = managersList.find((m) => m._id === mgrId);
    const mgrName = mgrMember?.fullName || "this Area Manager";

    setConfirmConfig({
      open: true,
      title: "Remove Area Manager",
      description: `Are you sure you want to remove Area Manager ${mgrName}? Hub operations for this manager will be revoked.`,
      type: "danger",
      confirmText: "Yes, Remove Manager",
      details: [
        { label: "Area Manager", value: mgrName },
        { label: "Email", value: mgrMember?.email || "N/A" },
        { label: "Hub", value: mgrMember?.areaId?.name || "Unassigned" },
      ],
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmConfig((prev) => ({ ...prev, isLoading: true }));
          await axios.delete(`${API_AUTH}/managers/${mgrId}`, getAuthHeader());
          toast.success("Area Manager removed successfully");
          setConfirmConfig((prev) => ({ ...prev, open: false, isLoading: false }));
          fetchManagers();
        } catch (err) {
          toast.error(err.response?.data?.message || err.message || "Failed to remove area manager");
          setConfirmConfig((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // ==========================
  // INVESTOR ACTIONS
  // ==========================
  const handleOpenAddInvestor = () => {
    setEditingInvestor(null);
    setInvestorError("");
    setInvestorForm({ fullName: "", email: "", password: "", status: "active" });
    setIsInvestorModalOpen(true);
  };

  const handleEditInvestor = (inv) => {
    setEditingInvestor(inv);
    setInvestorError("");
    setInvestorForm({
      fullName: inv.fullName || "",
      email: inv.email || "",
      password: "",
      status: inv.status || "active",
    });
    setIsInvestorModalOpen(true);
  };

  const executeSaveInvestor = async () => {
    try {
      setIsInvestorSubmitting(true);
      setConfirmConfig((prev) => ({ ...prev, isLoading: true }));
      if (editingInvestor) {
        const payload = {
          fullName: investorForm.fullName,
          email: investorForm.email,
          status: investorForm.status,
        };
        if (investorForm.password && investorForm.password.trim() !== "") {
          payload.password = investorForm.password;
        }
        await axios.put(`${API_AUTH}/investors/${editingInvestor._id}`, payload, getAuthHeader());
        toast.success("Investor updated successfully");
      } else {
        await axios.post(
          `${API_AUTH}/investors`,
          {
            fullName: investorForm.fullName,
            email: investorForm.email,
            password: investorForm.password,
            role: "investor",
            status: investorForm.status,
          },
          getAuthHeader()
        );
        toast.success("Investor created successfully");
      }
      setConfirmConfig((prev) => ({ ...prev, open: false, isLoading: false }));
      setIsInvestorModalOpen(false);
      setInvestorError("");
      fetchInvestors();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save investor";
      setInvestorError(msg);
      toast.error(msg);
      setConfirmConfig((prev) => ({ ...prev, isLoading: false }));
    } finally {
      setIsInvestorSubmitting(false);
    }
  };

  const handleInvestorSubmit = (e) => {
    e.preventDefault();
    setInvestorError("");
    if (!investorForm.fullName || !investorForm.email) {
      const msg = "Full name and email are required";
      setInvestorError(msg);
      toast.error(msg);
      return;
    }
    if (!editingInvestor && !investorForm.password) {
      const msg = "Password is required for new investor";
      setInvestorError(msg);
      toast.error(msg);
      return;
    }
    if (investorForm.password && investorForm.password.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setInvestorError(msg);
      toast.error(msg);
      return;
    }

    setConfirmConfig({
      open: true,
      title: editingInvestor ? "Confirm Investor Update" : "Confirm Investor Registration",
      description: editingInvestor
        ? `Please review the updated details for ${investorForm.fullName}.`
        : `You are granting investor dashboard access to ${investorForm.fullName}. Their full name must match the Bike Owner records in the fleet.`,
      type: "info",
      confirmText: editingInvestor ? "Update Investor" : "Register Investor",
      details: [
        { label: "Role", value: "Fleet Investor", badge: "Analytics Portal" },
        { label: "Full Name", value: investorForm.fullName },
        { label: "Email", value: investorForm.email },
        { label: "Login Access", value: investorForm.status === "active" ? "Enabled (Active)" : "Disabled (Inactive)" },
      ],
      onConfirm: executeSaveInvestor,
      isLoading: false,
    });
  };

  const handleDeleteInvestor = (invId) => {
    const invMember = investorsList.find((i) => i._id === invId);
    const invName = invMember?.fullName || "this investor";

    setConfirmConfig({
      open: true,
      title: "Remove Investor",
      description: `Are you sure you want to remove ${invName}? They will no longer have access to their vehicle analytics.`,
      type: "danger",
      confirmText: "Yes, Remove Investor",
      details: [
        { label: "Investor", value: invName },
        { label: "Email", value: invMember?.email || "N/A" },
      ],
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmConfig((prev) => ({ ...prev, isLoading: true }));
          await axios.delete(`${API_AUTH}/investors/${invId}`, getAuthHeader());
          toast.success("Investor removed successfully");
          setConfirmConfig((prev) => ({ ...prev, open: false, isLoading: false }));
          fetchInvestors();
        } catch (err) {
          toast.error(err.response?.data?.message || err.message || "Failed to remove investor");
          setConfirmConfig((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // Filtered lists
  const filteredStaff = staffList.filter((s) => {
    const areaName = s.areaId?.name || s.assigned_areas?.[0]?.name || "";
    const nameMatch = s.fullName?.toLowerCase().includes(staffSearch.toLowerCase());
    const emailMatch = s.email?.toLowerCase().includes(staffSearch.toLowerCase());
    const areaMatch = areaName.toLowerCase().includes(staffSearch.toLowerCase());
    return nameMatch || emailMatch || areaMatch;
  });

  const filteredManagers = managersList.filter((m) => {
    const areaName = m.areaId?.name || m.assigned_areas?.[0]?.name || "";
    const nameMatch = m.fullName?.toLowerCase().includes(managerSearch.toLowerCase());
    const emailMatch = m.email?.toLowerCase().includes(managerSearch.toLowerCase());
    const areaMatch = areaName.toLowerCase().includes(managerSearch.toLowerCase());
    return nameMatch || emailMatch || areaMatch;
  });

  const filteredInvestors = investorsList.filter((inv) => {
    const nameMatch = inv.fullName?.toLowerCase().includes(investorSearch.toLowerCase());
    const emailMatch = inv.email?.toLowerCase().includes(investorSearch.toLowerCase());
    return nameMatch || emailMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">Organization & Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage administrator account, team roles, and hub access credentials</p>
      </div>

      {/* Your Account Card */}
      <Card className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white border border-white/10 rounded-3xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-60 h-60 bg-blue-500/15 rounded-full blur-[70px] pointer-events-none" />
        <CardContent className="p-4 sm:p-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md shadow-blue-600/30 border border-white/20">
                {(user?.fullName || user?.email || "A").substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base sm:text-lg text-white leading-tight">
                    {user?.fullName || "Administrator"}
                  </h3>
                  <Badge className="text-[10px] font-black px-2 py-0.5 rounded-full capitalize bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    {user?.role === "super_admin" || user?.role === "admin"
                      ? "Administrator"
                      : user?.role === "manager"
                      ? "Area Manager"
                      : user?.role}
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 mt-1 font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:self-center border-t border-white/10 sm:border-t-0 pt-2 sm:pt-0">
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Session
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Management Section (Admin Only) */}
      {hasAdminRights && (
        <Card className="bg-card border border-border/80 rounded-3xl shadow-sm">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-foreground text-lg sm:text-xl font-display font-black">
              <Users className="w-5 h-5 text-primary" />
              Team Management
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs sm:text-sm">
              Manage Staff and Area Managers with area assignments and login credentials
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-4">
            <Tabs defaultValue="staff" className="space-y-5">
              {/* Native App-Style Segmented Control for Mobile & Desktop */}
              <TabsList className="bg-muted/70 p-1.5 border border-border/80 w-full grid grid-cols-3 gap-1 rounded-2xl h-auto">
                <TabsTrigger
                  value="staff"
                  className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold py-2 rounded-xl transition-all data-[state=active]:bg-card data-[state=active]:shadow-xs"
                >
                  <Users className="w-4 h-4 text-primary shrink-0" />
                  <span>Staff</span>
                  <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 text-[10px] font-black hidden xs:inline-flex">
                    {staffList.length}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="managers"
                  className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold py-2 rounded-xl transition-all data-[state=active]:bg-card data-[state=active]:shadow-xs"
                >
                  <UserCheck className="w-4 h-4 text-primary shrink-0" />
                  <span>Managers</span>
                  <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 text-[10px] font-black hidden xs:inline-flex">
                    {managersList.length}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="investors"
                  className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold py-2 rounded-xl transition-all data-[state=active]:bg-card data-[state=active]:shadow-xs"
                >
                  <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                  <span>Investors</span>
                  <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 text-[10px] font-black hidden xs:inline-flex">
                    {investorsList.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* ========================================= */}
              {/* TAB 1: STAFF MEMBERS                     */}
              {/* ========================================= */}
              <TabsContent value="staff" className="space-y-4 outline-none">
                {/* Search & Add Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                  <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Search staff by name, email, or area..."
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      className="pl-10 h-10 rounded-xl bg-card border-border/80 text-xs sm:text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
                    <Badge variant="outline" className="px-3 py-1.5 border-primary/30 text-primary hidden sm:inline-flex text-xs font-bold">
                      Total Staff: {staffList.length}
                    </Badge>

                    <Button
                      className="w-full sm:w-auto h-10 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/25 active:scale-95 transition-all cursor-pointer"
                      onClick={handleOpenAddStaff}
                    >
                      <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                      Add Staff
                    </Button>
                  </div>
                </div>

                {/* Staff Cards Grid */}
                {isStaffLoading ? (
                  <AdminLoadingState title="Loading Staff..." minHeight="min-h-[220px]" />
                ) : filteredStaff.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">No Staff Members Found</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {staffSearch ? "No staff match your search query." : "Click 'Add Staff' to create your first staff account."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {filteredStaff.map((staff) => {
                      const areaName = staff.areaId?.name || staff.assigned_areas?.[0]?.name || "Unassigned";
                      const areaCity = staff.areaId?.city || staff.assigned_areas?.[0]?.city || "";

                      return (
                        <Card
                          key={staff._id}
                          className="bg-card border-border hover:border-primary/50 transition-all duration-200 shadow-sm min-w-0"
                        >
                          <CardContent className="p-3 sm:p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="min-w-0 pr-2 flex-1">
                                <h3 className="font-semibold text-foreground text-base leading-tight truncate">
                                  {staff.fullName}
                                </h3>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">{staff.email}</p>
                              </div>

                              <Badge
                                variant={staff.status === "active" ? "default" : "secondary"}
                                className={
                                  staff.status === "active"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs shrink-0"
                                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs shrink-0"
                                }
                              >
                                {staff.status === "active" ? "Active" : "Inactive"}
                              </Badge>
                            </div>

                            <div className="my-2 sm:my-3 p-2 sm:p-2.5 rounded-lg bg-muted/40 border border-border/60 flex items-center min-w-0">
                              <MapPin className="w-4 h-4 text-primary shrink-0 mr-2" />
                              <span className="text-sm font-medium text-foreground truncate min-w-0">{areaName}</span>
                              {areaCity && <span className="text-xs text-muted-foreground shrink-0 ml-2 hidden sm:inline">{areaCity}</span>}
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-border/40 min-w-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditStaff(staff)}
                                className="flex-1 min-w-0 border-border hover:bg-muted"
                              >
                                <Pencil className="w-3.5 h-3.5 mr-1 shrink-0" />
                                Edit
                              </Button>

                              {staff._id !== user?._id && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteStaff(staff._id)}
                                  className="flex-1 min-w-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-1 shrink-0" />
                                  Delete
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* ========================================= */}
              {/* TAB 2: AREA MANAGERS                     */}
              {/* ========================================= */}
              <TabsContent value="managers" className="space-y-4 outline-none">
                {/* Search & Add Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                  <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search managers by name, email, or area..."
                      value={managerSearch}
                      onChange={(e) => setManagerSearch(e.target.value)}
                      className="pl-10 bg-input border-border"
                    />
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <Badge variant="outline" className="px-3 py-1.5 border-primary/30 text-primary hidden sm:inline-flex">
                      Total Managers: {managersList.length}
                    </Badge>

                    <Button
                      className="w-full sm:w-auto h-10 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/25 active:scale-95 transition-all cursor-pointer"
                      onClick={handleOpenAddManager}
                    >
                      <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                      Add Area Manager
                    </Button>
                  </div>
                </div>

                {/* Managers Cards Grid */}
                {isManagersLoading ? (
                  <AdminLoadingState title="Loading Managers..." minHeight="min-h-[220px]" />
                ) : filteredManagers.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">No Area Managers Found</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {managerSearch ? "No managers match your search query." : "Click 'Add Area Manager' to assign your first area manager."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {filteredManagers.map((manager) => {
                      const areaName = manager.areaId?.name || manager.assigned_areas?.[0]?.name || "Unassigned";
                      const areaCity = manager.areaId?.city || manager.assigned_areas?.[0]?.city || "";

                      return (
                        <Card
                          key={manager._id}
                          className="bg-card border-border hover:border-primary/50 transition-all duration-200 shadow-sm min-w-0"
                        >
                          <CardContent className="p-3 sm:p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="min-w-0 pr-2 flex-1">
                                <h3 className="font-semibold text-foreground text-base leading-tight truncate">
                                  {manager.fullName}
                                </h3>
                                <p className="text-xs text-muted-foreground truncate mt-0.5">{manager.email}</p>
                              </div>

                              <Badge
                                variant={manager.status === "active" ? "default" : "secondary"}
                                className={
                                  manager.status === "active"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs shrink-0"
                                    : "bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs shrink-0"
                                }
                              >
                                {manager.status === "active" ? "Active" : "Inactive"}
                              </Badge>
                            </div>

                            <div className="my-2 sm:my-3 p-2 sm:p-2.5 rounded-lg bg-muted/40 border border-border/60 flex items-center min-w-0">
                              <MapPin className="w-4 h-4 text-primary shrink-0 mr-2" />
                              <span className="text-sm font-medium text-foreground truncate min-w-0">{areaName}</span>
                              {areaCity && <span className="text-xs text-muted-foreground shrink-0 ml-2 hidden sm:inline">{areaCity}</span>}
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-border/40 min-w-0">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditManager(manager)}
                                className="flex-1 min-w-0 border-border hover:bg-muted"
                              >
                                <Pencil className="w-3.5 h-3.5 mr-1 shrink-0" />
                                Edit
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteManager(manager._id)}
                                className="flex-1 min-w-0"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1 shrink-0" />
                                Delete
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* ========================================= */}
              {/* TAB 3: INVESTORS                         */}
              {/* ========================================= */}
              <TabsContent value="investors" className="space-y-4 outline-none">
                {/* Search & Add Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                  <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search investors by name or email..."
                      value={investorSearch}
                      onChange={(e) => setInvestorSearch(e.target.value)}
                      className="pl-10 bg-input border-border"
                    />
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <Badge variant="outline" className="px-3 py-1.5 border-primary/30 text-primary hidden sm:inline-flex">
                      Total Investors: {investorsList.length}
                    </Badge>

                    <Button
                      className="w-full sm:w-auto h-10 px-4 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/25 active:scale-95 transition-all cursor-pointer"
                      onClick={handleOpenAddInvestor}
                    >
                      <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
                      Add Investor
                    </Button>
                  </div>
                </div>

                {/* Investors Cards Grid */}
                {isInvestorsLoading ? (
                  <AdminLoadingState title="Loading Investors..." minHeight="min-h-[220px]" />
                ) : filteredInvestors.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">No Investors Found</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {investorSearch ? "No investors match your search query." : "Click 'Add Investor' to register your first bike investor."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {filteredInvestors.map((investor) => (
                      <Card
                        key={investor._id}
                        className="bg-card border-border hover:border-primary/50 transition-all duration-200 shadow-sm min-w-0"
                      >
                        <CardContent className="p-3 sm:p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="min-w-0 pr-2 flex-1">
                              <h3 className="font-semibold text-foreground text-base leading-tight truncate">
                                {investor.fullName}
                              </h3>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{investor.email}</p>
                            </div>

                            <Badge
                              variant={investor.status === "active" ? "default" : "secondary"}
                              className={
                                investor.status === "active"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs shrink-0"
                                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs shrink-0"
                              }
                            >
                              {investor.status === "active" ? "Active" : "Inactive"}
                            </Badge>
                          </div>

                          <div className="my-2 sm:my-3 p-2 sm:p-2.5 rounded-lg bg-muted/40 border border-border/60 flex items-center gap-2 min-w-0">
                            <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm font-medium text-foreground truncate">Bike Investor</span>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-border/40 min-w-0">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditInvestor(investor)}
                              className="flex-1 min-w-0 border-border hover:bg-muted"
                            >
                              <Pencil className="w-3.5 h-3.5 mr-1 shrink-0" />
                              Edit
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteInvestor(investor._id)}
                              className="flex-1 min-w-0"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1 shrink-0" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* ======================================================= */}
      {/* DIALOG: STAFF CREATE & EDIT (CREDENTIALS + AREA)       */}
      {/* ======================================================= */}
      <Dialog
        open={isStaffModalOpen}
        onOpenChange={(open) => {
          setIsStaffModalOpen(open);
          if (!open) setStaffError("");
        }}
      >
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {editingStaff ? "Edit Staff Member" : "Create New Staff Member"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleStaffSubmit} className="space-y-4 mt-2">
            {staffError && (
              <div className="p-3 bg-destructive/15 border border-destructive/30 text-destructive rounded-lg text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-destructive">Action Failed</p>
                  <p className="text-xs text-destructive/90 mt-0.5">{staffError}</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="e.g. Rahul Sharma"
                value={staffForm.fullName}
                onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                required
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Email / Username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="staff@pipip.in"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  required
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>{editingStaff ? "Password (Leave blank to keep unchanged)" : "Password"}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => generatePassword(setStaffForm)}
                  className="text-xs text-primary h-6 px-2 hover:bg-primary/10"
                >
                  <RefreshCw className="w-3 h-3 mr-1" /> Generate
                </Button>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={editingStaff ? "••••••••" : "Enter password"}
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  required={!editingStaff}
                  className="pl-10 bg-input border-border font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assigned Area</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <select
                  value={staffForm.areaId}
                  onChange={(e) => setStaffForm({ ...staffForm, areaId: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="" disabled>
                    Select Assigned Area
                  </option>
                  {areas?.map((area) => (
                    <option key={area._id} value={area._id}>
                      {area.name} ({area.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <div>
                <Label className="text-sm font-medium">Account Status</Label>
                <p className="text-xs text-muted-foreground">
                  {staffForm.status === "active" ? "Staff can log in and view assigned area data" : "Staff login disabled"}
                </p>
              </div>
              <Switch
                checked={staffForm.status === "active"}
                onCheckedChange={(checked) =>
                  setStaffForm({ ...staffForm, status: checked ? "active" : "inactive" })
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full gradient-sunset text-primary-foreground font-semibold shadow-golden mt-2"
              disabled={isStaffSubmitting}
            >
              {isStaffSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingStaff ? "Update Staff Member" : "Create Staff Member"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================= */}
      {/* DIALOG: MANAGER CREATE & EDIT (CREDENTIALS + AREA)     */}
      {/* ======================================================= */}
      <Dialog
        open={isManagerModalOpen}
        onOpenChange={(open) => {
          setIsManagerModalOpen(open);
          if (!open) setManagerError("");
        }}
      >
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {editingManager ? "Edit Area Manager" : "Create New Area Manager"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleManagerSubmit} className="space-y-4 mt-2">
            {managerError && (
              <div className="p-3 bg-destructive/15 border border-destructive/30 text-destructive rounded-lg text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-destructive">Action Failed</p>
                  <p className="text-xs text-destructive/90 mt-0.5">{managerError}</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="e.g. Ahmed Shaikh"
                value={managerForm.fullName}
                onChange={(e) => setManagerForm({ ...managerForm, fullName: e.target.value })}
                required
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label>Email / Username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="manager@pipip.in"
                  value={managerForm.email}
                  onChange={(e) => setManagerForm({ ...managerForm, email: e.target.value })}
                  required
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>{editingManager ? "Password (Leave blank to keep unchanged)" : "Password"}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => generatePassword(setManagerForm)}
                  className="text-xs text-primary h-6 px-2 hover:bg-primary/10"
                >
                  <RefreshCw className="w-3 h-3 mr-1" /> Generate
                </Button>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={editingManager ? "••••••••" : "Enter password"}
                  value={managerForm.password}
                  onChange={(e) => setManagerForm({ ...managerForm, password: e.target.value })}
                  required={!editingManager}
                  className="pl-10 bg-input border-border font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assigned Area</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <select
                  value={managerForm.areaId}
                  onChange={(e) => setManagerForm({ ...managerForm, areaId: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="" disabled>
                    Select Assigned Area
                  </option>
                  {areas?.map((area) => (
                    <option key={area._id} value={area._id}>
                      {area.name} ({area.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <div>
                <Label className="text-sm font-medium">Account Status</Label>
                <p className="text-xs text-muted-foreground">
                  {managerForm.status === "active" ? "Manager can log in and view area data" : "Manager login disabled"}
                </p>
              </div>
              <Switch
                checked={managerForm.status === "active"}
                onCheckedChange={(checked) =>
                  setManagerForm({ ...managerForm, status: checked ? "active" : "inactive" })
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full gradient-sunset text-primary-foreground font-semibold shadow-golden mt-2"
              disabled={isManagerSubmitting}
            >
              {isManagerSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingManager ? "Update Manager" : "Create Manager"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================= */}
      {/* DIALOG: INVESTOR CREATE & EDIT                         */}
      {/* ======================================================= */}
      <Dialog
        open={isInvestorModalOpen}
        onOpenChange={(open) => {
          setIsInvestorModalOpen(open);
          if (!open) setInvestorError("");
        }}
      >
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {editingInvestor ? "Edit Investor" : "Create New Investor"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleInvestorSubmit} className="space-y-4 mt-2">
            {investorError && (
              <div className="p-3 bg-destructive/15 border border-destructive/30 text-destructive rounded-lg text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-destructive">Action Failed</p>
                  <p className="text-xs text-destructive/90 mt-0.5">{investorError}</p>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                placeholder="e.g. Suresh Mehta"
                value={investorForm.fullName}
                onChange={(e) => setInvestorForm({ ...investorForm, fullName: e.target.value })}
                required
                className="bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">
                ⚠️ This name must exactly match the <strong>Bike Owner</strong> field in bikes assigned to this investor.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Email / Username</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="investor@pipip.in"
                  value={investorForm.email}
                  onChange={(e) => setInvestorForm({ ...investorForm, email: e.target.value })}
                  required
                  className="pl-10 bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>{editingInvestor ? "Password (Leave blank to keep unchanged)" : "Password"}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => generatePassword(setInvestorForm)}
                  className="text-xs text-primary h-6 px-2 hover:bg-primary/10"
                >
                  <RefreshCw className="w-3 h-3 mr-1" /> Generate
                </Button>
              </div>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={editingInvestor ? "••••••••" : "Enter password"}
                  value={investorForm.password}
                  onChange={(e) => setInvestorForm({ ...investorForm, password: e.target.value })}
                  required={!editingInvestor}
                  className="pl-10 bg-input border-border font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <div>
                <Label className="text-sm font-medium">Account Status</Label>
                <p className="text-xs text-muted-foreground">
                  {investorForm.status === "active" ? "Investor can log in and view their bikes & bookings" : "Investor login disabled"}
                </p>
              </div>
              <Switch
                checked={investorForm.status === "active"}
                onCheckedChange={(checked) =>
                  setInvestorForm({ ...investorForm, status: checked ? "active" : "inactive" })
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full gradient-sunset text-primary-foreground font-semibold shadow-golden mt-2"
              disabled={isInvestorSubmitting}
            >
              {isInvestorSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingInvestor ? "Update Investor" : "Create Investor"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Getting Started Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <strong>Admin & Manager Access:</strong> Area Managers oversee day-to-day operations and bookings strictly for their designated area.
          </p>
          <p>
            • <strong>Staff Members:</strong> Staff users log in to monitor rentals and view active bookings ending soon in their assigned area.
          </p>
          <p>
            • <strong>Credentials & Area Updates:</strong> Click <strong>Edit</strong> on any team card to reassign areas or update credentials at any time.
          </p>
        </CardContent>
      </Card>

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