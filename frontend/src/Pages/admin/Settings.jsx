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
import { useAuth } from "../../lib/AuthProvider";
import { useAllAreas, useActiveAreas } from "../../hooks/useAreas";

const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL;
  }
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://pipip-backend-eid3.onrender.com";
};

const API_AUTH = `${getBackendUrl()}/api/auth`;

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
    const assignedArea =
      staff.areaId?._id ||
      staff.areaId ||
      staff.assigned_areas?.[0]?._id ||
      staff.assigned_areas?.[0] ||
      (areas.length > 0 ? areas[0]._id : "");

    setStaffForm({
      fullName: staff.fullName || "",
      email: staff.email || "",
      password: "",
      areaId: typeof assignedArea === "object" ? assignedArea._id : assignedArea,
      status: staff.status || "active",
    });
    setIsStaffModalOpen(true);
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    if (!staffForm.fullName || !staffForm.email) {
      toast.error("Full name and email are required");
      return;
    }
    if (!editingStaff && !staffForm.password) {
      toast.error("Password is required for new staff");
      return;
    }

    try {
      setIsStaffSubmitting(true);
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
        await axios.post(`${API_AUTH}/register`, payload, getAuthHeader());
        toast.success("Staff member created successfully");
      }

      setIsStaffModalOpen(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to save staff member");
    } finally {
      setIsStaffSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (staffId === user?._id) {
      toast.error("You cannot delete yourself");
      return;
    }
    if (!window.confirm("Are you sure you want to remove this staff member?")) return;

    try {
      await axios.delete(`${API_AUTH}/staff/${staffId}`, getAuthHeader());
      toast.success("Staff member removed successfully");
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to remove staff member");
    }
  };

  // ==========================
  // MANAGER ACTIONS
  // ==========================
  const handleOpenAddManager = () => {
    setEditingManager(null);
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
    const assignedArea =
      mgr.areaId?._id ||
      mgr.areaId ||
      mgr.assigned_areas?.[0]?._id ||
      mgr.assigned_areas?.[0] ||
      (areas.length > 0 ? areas[0]._id : "");

    setManagerForm({
      fullName: mgr.fullName || "",
      email: mgr.email || "",
      password: "",
      areaId: typeof assignedArea === "object" ? assignedArea._id : assignedArea,
      status: mgr.status || "active",
    });
    setIsManagerModalOpen(true);
  };

  const handleManagerSubmit = async (e) => {
    e.preventDefault();
    if (!managerForm.areaId) {
      toast.error("Please select an area for this manager");
      return;
    }
    if (!editingManager && !managerForm.password) {
      toast.error("Password is required for new manager");
      return;
    }

    try {
      setIsManagerSubmitting(true);
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

      setIsManagerModalOpen(false);
      fetchManagers();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to save area manager");
    } finally {
      setIsManagerSubmitting(false);
    }
  };

  const handleDeleteManager = async (mgrId) => {
    if (!window.confirm("Are you sure you want to remove this Area Manager?")) return;

    try {
      await axios.delete(`${API_AUTH}/managers/${mgrId}`, getAuthHeader());
      toast.success("Area Manager removed successfully");
      fetchManagers();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to remove area manager");
    }
  };

  // ==========================
  // INVESTOR ACTIONS
  // ==========================
  const handleOpenAddInvestor = () => {
    setEditingInvestor(null);
    setInvestorForm({ fullName: "", email: "", password: "", status: "active" });
    setIsInvestorModalOpen(true);
  };

  const handleEditInvestor = (inv) => {
    setEditingInvestor(inv);
    setInvestorForm({
      fullName: inv.fullName || "",
      email: inv.email || "",
      password: "",
      status: inv.status || "active",
    });
    setIsInvestorModalOpen(true);
  };

  const handleInvestorSubmit = async (e) => {
    e.preventDefault();
    if (!investorForm.fullName || !investorForm.email) {
      toast.error("Full name and email are required");
      return;
    }
    if (!editingInvestor && !investorForm.password) {
      toast.error("Password is required for new investor");
      return;
    }

    try {
      setIsInvestorSubmitting(true);
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
        await axios.post(`${API_AUTH}/investors`, {
          fullName: investorForm.fullName,
          email: investorForm.email,
          password: investorForm.password,
          role: "investor",
          status: investorForm.status,
        }, getAuthHeader());
        toast.success("Investor created successfully");
      }
      setIsInvestorModalOpen(false);
      fetchInvestors();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to save investor");
    } finally {
      setIsInvestorSubmitting(false);
    }
  };

  const handleDeleteInvestor = async (invId) => {
    if (!window.confirm("Are you sure you want to remove this investor?")) return;
    try {
      await axios.delete(`${API_AUTH}/investors/${invId}`, getAuthHeader());
      toast.success("Investor removed successfully");
      fetchInvestors();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to remove investor");
    }
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
        <h1 className="text-3xl font-display text-gradient-sunset">Settings</h1>
        <p className="text-muted-foreground">Manage your account and team access</p>
      </div>

      {/* Your Account Card */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <User className="w-5 h-5 text-primary" />
            Your Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground text-xs font-semibold uppercase">Email</Label>
              <p className="font-medium text-foreground mt-0.5">{user?.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs font-semibold uppercase">Role</Label>
              <p className="font-medium text-foreground capitalize mt-0.5">
                {user?.role === "super_admin" || user?.role === "admin"
                  ? "Administrator"
                  : user?.role === "manager"
                  ? "Area Manager"
                  : user?.role}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Management Section (Admin Only) */}
      {hasAdminRights && (
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground text-xl">
              <Users className="w-5 h-5 text-primary" />
              Team Management
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Manage Staff and Area Managers with area assignments and login credentials
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Tabs defaultValue="staff" className="space-y-5">
              <TabsList className="bg-muted/60 p-1 border border-border/80 w-full overflow-x-auto flex flex-nowrap gap-1">
                <TabsTrigger value="staff" className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 whitespace-nowrap flex-shrink-0">
                  <Users className="w-4 h-4 text-primary" />
                  <span>Staff</span>
                  <span className="hidden md:inline">Members</span>
                  <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 text-xs font-bold">
                    {staffList.length}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger value="managers" className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 whitespace-nowrap flex-shrink-0">
                  <UserCheck className="w-4 h-4 text-primary" />
                  <span>Managers</span>
                  <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 text-xs font-bold">
                    {managersList.length}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger value="investors" className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 whitespace-nowrap flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span>Investors</span>
                  <Badge variant="secondary" className="ml-0.5 px-1.5 py-0 text-xs font-bold">
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search staff by name, email, or area..."
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      className="pl-10 bg-input border-border"
                    />
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <Badge variant="outline" className="px-3 py-1.5 border-primary/30 text-primary hidden sm:inline-flex">
                      Total Staff: {staffList.length}
                    </Badge>

                    <Button
                      className="gradient-sunset text-primary-foreground shadow-golden"
                      onClick={handleOpenAddStaff}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Staff
                    </Button>
                  </div>
                </div>

                {/* Staff Cards Grid */}
                {isStaffLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filteredStaff.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">No Staff Members Found</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {staffSearch ? "No staff match your search query." : "Click 'Add Staff' to create your first staff account."}
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredStaff.map((staff) => {
                      const areaName = staff.areaId?.name || staff.assigned_areas?.[0]?.name || "Unassigned";
                      const areaCity = staff.areaId?.city || staff.assigned_areas?.[0]?.city || "";

                      return (
                        <Card
                          key={staff._id}
                          className="bg-card border-border hover:border-primary/50 transition-all duration-200 shadow-sm"
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="min-w-0 pr-2">
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

                            <div className="my-3 p-2.5 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between">
                              <div className="flex items-center gap-2 truncate pr-1">
                                <MapPin className="w-4 h-4 text-primary shrink-0" />
                                <span className="text-sm font-medium text-foreground truncate">{areaName}</span>
                              </div>
                              {areaCity && <span className="text-xs text-muted-foreground shrink-0">{areaCity}</span>}
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-border/40">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditStaff(staff)}
                                className="flex-1 border-border hover:bg-muted"
                              >
                                <Pencil className="w-3.5 h-3.5 mr-1" />
                                Edit
                              </Button>

                              {staff._id !== user?._id && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteStaff(staff._id)}
                                  className="flex-1"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-1" />
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
                      className="gradient-sunset text-primary-foreground shadow-golden"
                      onClick={handleOpenAddManager}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Area Manager
                    </Button>
                  </div>
                </div>

                {/* Managers Cards Grid */}
                {isManagersLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filteredManagers.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">No Area Managers Found</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {managerSearch ? "No managers match your search query." : "Click 'Add Area Manager' to assign your first area manager."}
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredManagers.map((manager) => {
                      const areaName = manager.areaId?.name || manager.assigned_areas?.[0]?.name || "Unassigned";
                      const areaCity = manager.areaId?.city || manager.assigned_areas?.[0]?.city || "";

                      return (
                        <Card
                          key={manager._id}
                          className="bg-card border-border hover:border-primary/50 transition-all duration-200 shadow-sm"
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div className="min-w-0 pr-2">
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

                            <div className="my-3 p-2.5 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between">
                              <div className="flex items-center gap-2 truncate pr-1">
                                <MapPin className="w-4 h-4 text-primary shrink-0" />
                                <span className="text-sm font-medium text-foreground truncate">{areaName}</span>
                              </div>
                              {areaCity && <span className="text-xs text-muted-foreground shrink-0">{areaCity}</span>}
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-border/40">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditManager(manager)}
                                className="flex-1 border-border hover:bg-muted"
                              >
                                <Pencil className="w-3.5 h-3.5 mr-1" />
                                Edit
                              </Button>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteManager(manager._id)}
                                className="flex-1"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
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
                      className="gradient-sunset text-primary-foreground shadow-golden"
                      onClick={handleOpenAddInvestor}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Investor
                    </Button>
                  </div>
                </div>

                {/* Investors Cards Grid */}
                {isInvestorsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filteredInvestors.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border rounded-xl">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <h3 className="text-lg font-semibold text-foreground mb-1">No Investors Found</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {investorSearch ? "No investors match your search query." : "Click 'Add Investor' to register your first bike investor."}
                    </p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredInvestors.map((investor) => (
                      <Card
                        key={investor._id}
                        className="bg-card border-border hover:border-primary/50 transition-all duration-200 shadow-sm"
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="min-w-0 pr-2">
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

                          <div className="my-3 p-2.5 rounded-lg bg-muted/40 border border-border/60 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                            <span className="text-sm font-medium text-foreground truncate">Bike Investor</span>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-border/40">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditInvestor(investor)}
                              className="flex-1 border-border hover:bg-muted"
                            >
                              <Pencil className="w-3.5 h-3.5 mr-1" />
                              Edit
                            </Button>

                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteInvestor(investor._id)}
                              className="flex-1"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
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
      <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {editingStaff ? "Edit Staff Member" : "Create New Staff Member"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleStaffSubmit} className="space-y-4 mt-2">
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
      <Dialog open={isManagerModalOpen} onOpenChange={setIsManagerModalOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              {editingManager ? "Edit Area Manager" : "Create New Area Manager"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleManagerSubmit} className="space-y-4 mt-2">
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
      <Dialog open={isInvestorModalOpen} onOpenChange={setIsInvestorModalOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground text-xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {editingInvestor ? "Edit Investor" : "Create New Investor"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleInvestorSubmit} className="space-y-4 mt-2">
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
    </div>
  );
}