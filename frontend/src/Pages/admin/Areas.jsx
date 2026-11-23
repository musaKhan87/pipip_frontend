import { useState } from "react";
import {
  Plus,
  Search,
  MapPin,
  Pencil,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
  Building2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";

import {
  useCreateArea,
  useUpdateArea,
  useDeleteArea,
  useAllAreas,
} from "../../hooks/useAreas";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useAuth } from "../../lib/AuthProvider";

export default function Areas() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    city: "Mumbai",
    is_active: true,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: "",
    description: "",
    type: "info",
    confirmText: "Confirm",
    details: [],
    onConfirm: () => {},
    isLoading: false,
  });

  const { isAdmin } = useAuth();
  const { data: areas, isLoading } = useAllAreas();
  const createArea = useCreateArea();
  const updateArea = useUpdateArea();
  const deleteArea = useDeleteArea();

  const activeCount = areas?.filter((a) => a.is_active).length || 0;
  const inactiveCount = (areas?.length || 0) - activeCount;

  const filteredAreas = areas?.filter(
    (area) =>
      area.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      area.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const executeSaveArea = () => {
    setConfirmConfig((prev) => ({ ...prev, isLoading: true }));
    if (editingArea) {
      updateArea.mutate(
        { id: editingArea._id, ...formData },
        {
          onSuccess: () => {
            setIsOpen(false);
            setConfirmConfig((prev) => ({ ...prev, open: false, isLoading: false }));
            toast.success("Hub updated successfully");
          },
          onError: () => {
            setConfirmConfig((prev) => ({ ...prev, isLoading: false }));
          },
        }
      );
    } else {
      createArea.mutate(formData, {
        onSuccess: () => {
          setIsOpen(false);
          setConfirmConfig((prev) => ({ ...prev, open: false, isLoading: false }));
          toast.success("Hub created successfully");
        },
        onError: () => {
          setConfirmConfig((prev) => ({ ...prev, isLoading: false }));
        },
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      toast.error("Hub name is required");
      return;
    }
    if (!formData.city?.trim()) {
      toast.error("City is required");
      return;
    }

    setConfirmConfig({
      open: true,
      title: editingArea ? "Confirm Hub Details Update" : "Confirm New Hub Creation",
      description: editingArea
        ? `Please verify the updated operational details for hub "${formData.name}".`
        : `Are you sure you want to register and activate the new hub "${formData.name}"?`,
      type: "info",
      confirmText: editingArea ? "Save Changes" : "Create Hub",
      details: [
        { label: "Hub Name", value: formData.name },
        { label: "City", value: formData.city },
        { label: "Status", value: formData.is_active ? "Operational (Active)" : "Inactive" },
      ],
      onConfirm: executeSaveArea,
      isLoading: false,
    });
  };

  const handleDeleteClick = (area) => {
    setConfirmConfig({
      open: true,
      title: "Delete Hub / Area",
      description: `Are you sure you want to permanently delete hub "${area.name}"? Bikes, bookings, and managers assigned to this hub may be affected.`,
      type: "danger",
      confirmText: "Yes, Delete Hub",
      details: [
        { label: "Hub Name", value: area.name },
        { label: "City", value: area.city || "Mumbai" },
      ],
      isLoading: false,
      onConfirm: () => {
        setConfirmConfig((prev) => ({ ...prev, isLoading: true }));
        deleteArea.mutate(area._id, {
          onSuccess: () => {
            setConfirmConfig((prev) => ({ ...prev, open: false, isLoading: false }));
            toast.success("Hub deleted successfully");
          },
          onError: () => {
            setConfirmConfig((prev) => ({ ...prev, isLoading: false }));
          },
        });
      },
    });
  };

  const handleEdit = (area) => {
    setEditingArea(area);
    setFormData({
      name: area.name,
      city: area.city,
      is_active: area.is_active,
    });
    setIsOpen(true);
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (!open) {
      setEditingArea(null);
      setFormData({ name: "", city: "Mumbai", is_active: true });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-8">
      {/* ── Top Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
            Areas & Operational Hubs
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage bike pickup, drop-off stations, and city operational hubs
          </p>
        </div>

        {isAdmin && (
          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button
                variant="hero"
                size="sm"
                className="w-full sm:w-auto h-9 text-xs sm:text-sm font-semibold rounded-xl"
                onClick={() => {
                  setEditingArea(null);
                  setFormData({ name: "", city: "Mumbai", is_active: true });
                }}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add New Hub
              </Button>
            </DialogTrigger>

            <DialogContent className="w-[95vw] max-w-md bg-card border-border rounded-2xl p-5">
              <DialogHeader>
                <DialogTitle className="text-foreground text-lg font-bold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  {editingArea ? "Edit Hub Location" : "Create New Hub Location"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Hub / Station Name</Label>
                  <Input
                    placeholder="e.g. Andheri West Station Hub"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="bg-input border-border/80 rounded-xl text-sm h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">City</Label>
                  <Input
                    placeholder="e.g. Mumbai"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    required
                    className="bg-input border-border/80 rounded-xl text-sm h-10"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold cursor-pointer">
                      Operational Status
                    </Label>
                    <p className="text-[11px] text-muted-foreground">
                      {formData.is_active ? "Available for pickups & returns" : "Temporarily paused"}
                    </p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-sunset text-primary-foreground h-10 rounded-xl font-bold text-sm shadow-md"
                  disabled={createArea.isPending || updateArea.isPending}
                >
                  {(createArea.isPending || updateArea.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingArea ? "Save Changes" : "Create Hub Location"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* ── KPI Stats Strip ───────────────────────────────────────── */}
      {areas && (
        <div className="flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto pb-1 scrollbar-none">
          {/* Total Hubs */}
          <div className="min-w-[150px] sm:min-w-0 flex-1 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-blue-900/70 dark:text-blue-300">
                Total Hubs
              </span>
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Building2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-950 dark:text-blue-100">
                {areas.length}
              </span>
              <span className="text-[11px] font-semibold text-blue-700/80 dark:text-blue-300">
                Registered
              </span>
            </div>
          </div>

          {/* Active Hubs */}
          <div className="min-w-[150px] sm:min-w-0 flex-1 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-emerald-900/70 dark:text-emerald-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Hubs
              </span>
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-950 dark:text-emerald-100">
                {activeCount}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700/80 dark:text-emerald-300">
                Open for Bookings
              </span>
            </div>
          </div>

          {/* Inactive */}
          <div className="min-w-[150px] sm:min-w-0 flex-1 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-amber-900/70 dark:text-amber-300">
                Inactive Hubs
              </span>
              <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-950 dark:text-amber-100">
                {inactiveCount}
              </span>
              <span className="text-[11px] font-semibold text-amber-700/80 dark:text-amber-300">
                Paused
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Search Bar ────────────────────────────────────────────── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by hub name or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-8 bg-card border-border/80 rounded-xl text-sm h-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Hub Cards Grid ────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse bg-card border-border/70 rounded-2xl p-4 space-y-3">
              <div className="h-5 bg-muted rounded w-2/3" />
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-8 bg-muted rounded w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredAreas?.map((area, index) => (
            <motion.div
              key={area._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <Card className="bg-card border border-border/80 hover:border-slate-400 dark:hover:border-slate-600 rounded-2xl shadow-2xs hover:shadow-xs transition-all p-3.5 sm:p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-foreground text-sm truncate">
                          {area.name}
                        </h3>
                        <p className="text-[11px] text-muted-foreground font-medium">
                          {area.city || "Mumbai"}
                        </p>
                      </div>
                    </div>

                    <Badge
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border capitalize ${
                        area.is_active
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                      }`}
                    >
                      {area.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2 pt-3 mt-2 border-t border-border/50">
                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleEdit(area)}
                      className="flex-1 h-7 text-xs font-semibold rounded-lg border-border hover:border-primary"
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>

                    <Button
                      size="xs"
                      variant="outline"
                      onClick={() => handleDeleteClick(area)}
                      className="flex-1 h-7 text-xs font-semibold rounded-lg border-border text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}

          {filteredAreas?.length === 0 && (
            <div className="col-span-full text-center py-12 border border-dashed border-border rounded-2xl bg-card/20">
              <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-30" />
              <p className="text-muted-foreground text-sm font-medium">
                No matching operational hubs found
              </p>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog Integration */}
      <ConfirmationDialog
        {...confirmConfig}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, open: false }))}
      />
    </div>
  );
}
