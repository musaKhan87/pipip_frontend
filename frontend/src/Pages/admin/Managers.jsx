import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  UserCheck,
  Pencil,
  Trash2,
  Loader2,
  Key,
  MapPin,
  Mail,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useAllAreas } from "../../hooks/useAreas";
import { useAuth } from "../../lib/AuthProvider";
import { API_BASE_URL } from "../../config/api";

const API_BASE = `${API_BASE_URL}/auth/managers`;

export default function Managers() {
  const [managers, setManagers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formError, setFormError] = useState("");

  const { isSuperAdmin } = useAuth();
  const { data: areas, isLoading: isAreasLoading } = useAllAreas();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    areaId: "",
    status: "active",
  });

  const fetchManagers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setManagers(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load area managers");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
    let generated = "";
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: generated }));
    toast.info("Generated temp password!");
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    setFormError("");
    if (!open) {
      setEditingManager(null);
      setFormData({
        fullName: "",
        email: "",
        password: "",
        areaId: "",
        status: "active",
      });
    }
  };

  const handleEdit = (manager) => {
    setEditingManager(manager);
    setFormError("");
    const assignedArea = manager.areaId?._id || manager.areaId || manager.assigned_areas?.[0]?._id || manager.assigned_areas?.[0] || "";
    setFormData({
      fullName: manager.fullName || "",
      email: manager.email || "",
      password: "",
      areaId: typeof assignedArea === "object" ? assignedArea._id : assignedArea,
      status: manager.status || "active",
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.fullName || !formData.email) {
      const msg = "Full name and email are required";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (!formData.areaId) {
      const msg = "Please select an area for this manager";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (!editingManager && !formData.password) {
      const msg = "Password is required for new manager";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (formData.password && formData.password.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingManager) {
        await axios.put(`${API_BASE}/${editingManager._id}`, formData, config);
        toast.success("Area Manager updated successfully");
      } else {
        await axios.post(API_BASE, formData, config);
        toast.success("Area Manager created successfully");
      }

      setIsOpen(false);
      setFormError("");
      fetchManagers();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to save manager";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this Area Manager?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Area Manager deleted successfully");
      fetchManagers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete manager");
    }
  };

  const filteredManagers = managers?.filter((mgr) => {
    const areaName = mgr.areaId?.name || mgr.assigned_areas?.[0]?.name || "";
    const nameMatch = mgr.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    const emailMatch = mgr.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const areaMatch = areaName.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || emailMatch || areaMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display text-gradient-sunset flex items-center gap-2">
            <UserCheck className="w-8 h-8 text-primary" /> Area Managers
          </h1>
          <p className="text-muted-foreground">
            Manage Area Managers and area-wise access assignments
          </p>
        </div>

        {isSuperAdmin && (
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button
                className="gradient-sunset text-primary-foreground shadow-golden"
                onClick={() => {
                  setEditingManager(null);
                  setFormData({
                    fullName: "",
                    email: "",
                    password: "",
                    areaId: areas && areas.length > 0 ? areas[0]._id : "",
                    status: "active",
                  });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Area Manager
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-card border-border sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-foreground text-xl flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  {editingManager ? "Edit Area Manager" : "Create New Area Manager"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                {formError && (
                  <div className="p-3 bg-destructive/15 border border-destructive/30 text-destructive rounded-lg text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-destructive">Action Failed</p>
                      <p className="text-xs text-destructive/90 mt-0.5">{formError}</p>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    placeholder="e.g. Ahmed Shaikh"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      onClick={generateRandomPassword}
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
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                      value={formData.areaId}
                      onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
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
                      {formData.status === "active" ? "Manager can log in and view area data" : "Manager login disabled"}
                    </p>
                  </div>
                  <Switch
                    checked={formData.status === "active"}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, status: checked ? "active" : "inactive" })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-sunset text-primary-foreground font-semibold shadow-golden mt-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingManager ? "Update Manager" : "Create Manager"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search managers by name, email, or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input border-border"
          />
        </div>

        <Badge variant="outline" className="px-3 py-1 border-primary/30 text-primary self-start sm:self-auto">
          Total Managers: {managers.length}
        </Badge>
      </div>

      {/* List / Cards */}
      {isLoading || isAreasLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredManagers.length === 0 ? (
        <Card className="bg-card border-border text-center py-12">
          <CardContent>
            <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No Area Managers Found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {searchQuery ? "No managers match your search query." : "Click 'Add Area Manager' to assign your first area manager."}
            </p>
          </CardContent>
        </Card>
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
                    <div>
                      <h3 className="font-semibold text-foreground text-lg leading-tight truncate">
                        {manager.fullName}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">{manager.email}</p>
                    </div>

                    <Badge
                      variant={manager.status === "active" ? "default" : "secondary"}
                      className={
                        manager.status === "active"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }
                    >
                      {manager.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="my-3 p-2.5 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{areaName}</span>
                    </div>
                    {areaCity && <span className="text-xs text-muted-foreground">{areaCity}</span>}
                  </div>

                  {isSuperAdmin && (
                    <div className="flex gap-2 pt-2 border-t border-border/40">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(manager)}
                        className="flex-1 border-border hover:bg-muted"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(manager._id)}
                        className="flex-1"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
