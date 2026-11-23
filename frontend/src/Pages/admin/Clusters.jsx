import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  Plus,
  Search,
  Bike,
  MapPin,
  IndianRupee,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Boxes,
  Check,
  X,
  Layers,
  CheckCheck,
} from "lucide-react";
import { useBikes } from "../../hooks/useBikes";
import { useActiveAreas } from "../../hooks/useAreas";
import { useAuth } from "../../lib/AuthProvider";
import {
  useClusters,
  useCreateCluster,
  useUpdateCluster,
  useDeleteCluster,
} from "../../hooks/useClusters";
import { toast } from "sonner";
import { Badge } from "../../components/ui/badge";

const emptyFormData = {
  name: "",
  price_per_hour: "",
  price_per_day: "",
  area_id: "",
  bikes: [], // Selected bike IDs
};

export default function Clusters() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingClusterId, setEditingClusterId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [bikeSearchQuery, setBikeSearchQuery] = useState("");
  const [formData, setFormData] = useState(emptyFormData);

  const { data: clusters, isLoading: clustersLoading } = useClusters();
  const { data: bikes, isLoading: bikesLoading } = useBikes();
  const { data: areas } = useActiveAreas();
  const { user, isStaff, isManager } = useAuth();

  const displayAreas = (isStaff || isManager)
    ? (user?.assigned_areas && user.assigned_areas.length > 0
        ? user.assigned_areas
        : user?.areaId
          ? [user.areaId]
          : [])
    : (areas || []);

  const createClusterMutation = useCreateCluster();
  const updateClusterMutation = useUpdateCluster();
  const deleteClusterMutation = useDeleteCluster();

  const isEdit = !!editingClusterId;

  // Filtered clusters for list search
  const filteredClusters = useMemo(() => {
    if (!clusters) return [];
    if (!searchQuery) return clusters;
    const q = searchQuery.toLowerCase();
    return clusters.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.area_id?.name && c.area_id.name.toLowerCase().includes(q)) ||
        (c.area_id?.city && c.area_id.city.toLowerCase().includes(q))
    );
  }, [clusters, searchQuery]);

  // Filtered bikes for multi-select checklists
  const filteredBikes = useMemo(() => {
    if (!bikes) return [];
    const q = bikeSearchQuery.toLowerCase();
    return bikes.filter((b) => {
      const bikeAreaId = b.area_id && typeof b.area_id === 'object' ? b.area_id._id : b.area_id;
      const matchesArea = formData.area_id && String(bikeAreaId) === String(formData.area_id);
      const matchesStatus = b.status !== "maintenance";
      const matchesSearch =
        b.model.toLowerCase().includes(q) ||
        (b.bike_name && b.bike_name.toLowerCase().includes(q)) ||
        b.number_plate.toLowerCase().includes(q);

      return matchesStatus && matchesArea && matchesSearch;
    });
  }, [bikes, bikeSearchQuery, formData.area_id]);

  const handleBikeToggle = (bikeId) => {
    setFormData((prev) => {
      const isSelected = prev.bikes.includes(bikeId);
      const newBikes = isSelected
        ? prev.bikes.filter((id) => id !== bikeId)
        : [...prev.bikes, bikeId];
      return { ...prev, bikes: newBikes };
    });
  };

  const handleSelectAllBikes = () => {
    const allFilteredIds = filteredBikes.map((b) => b._id);
    setFormData((prev) => ({
      ...prev,
      bikes: Array.from(new Set([...prev.bikes, ...allFilteredIds])),
    }));
  };

  const handleClearAllBikes = () => {
    setFormData((prev) => ({ ...prev, bikes: [] }));
  };

  const handleCreateOrUpdate = async (e) => {
    if (e) e.preventDefault();

    if (!formData.name || !formData.price_per_hour || !formData.price_per_day || !formData.area_id) {
      toast.error("Please fill in all required fields (Name, Rates, and Area)");
      return;
    }

    const payload = {
      name: formData.name,
      price_per_hour: Number(formData.price_per_hour),
      price_per_day: Number(formData.price_per_day),
      area_id: formData.area_id,
      bikes: formData.bikes,
    };

    try {
      if (isEdit) {
        await updateClusterMutation.mutateAsync({
          id: editingClusterId,
          clusterData: payload,
        });
        toast.success("Cluster updated successfully");
      } else {
        await createClusterMutation.mutateAsync(payload);
        toast.success("New cluster created successfully");
      }
      setIsOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err?.message || "Failed to save cluster");
    }
  };

  const handleEditClick = (cluster) => {
    setEditingClusterId(cluster._id);
    setFormData({
      name: cluster.name,
      price_per_hour: String(cluster.price_per_hour),
      price_per_day: String(cluster.price_per_day),
      area_id: cluster.area_id?._id || cluster.area_id || "",
      bikes: cluster.bikes?.map((b) => b._id || b) || [],
    });
    setIsOpen(true);
  };

  const handleDeleteClick = async (id, clusterName) => {
    if (window.confirm(`Are you sure you want to delete the cluster "${clusterName}"?`)) {
      try {
        await deleteClusterMutation.mutateAsync(id);
        toast.success("Cluster removed successfully");
      } catch (err) {
        toast.error(err?.message || "Failed to delete cluster");
      }
    }
  };

  const resetForm = () => {
    setFormData(emptyFormData);
    setEditingClusterId(null);
    setBikeSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground tracking-tight">
              Vehicle Clusters
            </h1>
            <Badge variant="outline" className="text-xs font-semibold">
              {clusters?.length || 0} Categories
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Group individual vehicle models into shared pricing and booking inventory pools
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditingClusterId(null);
            const defaultAreaId = (isStaff || isManager) && displayAreas?.length > 0
              ? (displayAreas[0]._id || displayAreas[0])
              : "";
            setFormData({
              name: "",
              price_per_hour: "",
              price_per_day: "",
              area_id: defaultAreaId,
              bikes: [],
            });
            setIsOpen(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 shadow-sm font-semibold rounded-xl text-xs h-10 px-4 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-1.5" /> New Cluster
        </Button>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search clusters by category or hub area..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-10 rounded-xl bg-card border-border/80 text-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Cluster Cards Grid */}
      {clustersLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse rounded-2xl border border-border/60">
              <CardContent className="h-48 p-6 bg-muted/30" />
            </Card>
          ))}
        </div>
      ) : filteredClusters.length === 0 ? (
        <div className="text-center py-16 sm:py-20 bg-card border border-dashed border-border/80 rounded-2xl p-8">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto mb-3">
            <Boxes className="w-7 h-7 opacity-70" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">No Clusters Found</h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? "No cluster matches your search query. Try typing a different keyword."
              : "Group your vehicle inventory into clusters (e.g. Activa 6G, Access 125) to allow easy catalog booking."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredClusters.map((cluster) => {
            const bikeCount = cluster.bikes?.length || 0;
            const hasBikes = bikeCount > 0;
            const bikeList = cluster.bikes || [];

            return (
              <motion.div
                key={cluster._id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
              >
                <Card className="bg-card border border-border/80 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all overflow-hidden flex flex-col h-full">
                  <CardContent className="p-5 flex flex-col flex-1">
                    {/* Header: Name, Area & Actions */}
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-foreground truncate">
                            {cluster.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span className="truncate">
                            {cluster.area_id?.name || "Global Hub"}
                            {cluster.area_id?.city ? ` · ${cluster.area_id.city}` : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(cluster)}
                          className="h-8 w-8 p-0 text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                          title="Edit cluster"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(cluster._id, cluster.name)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                          title="Delete cluster"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Rates Box */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/40 rounded-xl mb-3 border border-border/50">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                          Hourly Rate
                        </span>
                        <p className="text-base font-bold text-foreground flex items-center gap-0.5 mt-0.5">
                          <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />
                          {cluster.price_per_hour}
                          <span className="text-[11px] font-normal text-muted-foreground">/hr</span>
                        </p>
                      </div>
                      <div className="border-l border-border/70 pl-3">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                          Daily Rate (24h)
                        </span>
                        <p className="text-base font-bold text-foreground flex items-center gap-0.5 mt-0.5">
                          <IndianRupee className="w-3.5 h-3.5 text-muted-foreground" />
                          {cluster.price_per_day}
                          <span className="text-[11px] font-normal text-muted-foreground">/day</span>
                        </p>
                      </div>
                    </div>

                    {/* Linked Vehicles Preview Chips */}
                    {hasBikes ? (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1 max-h-14 overflow-hidden">
                          {bikeList.slice(0, 4).map((b, idx) => (
                            <span
                              key={b._id || idx}
                              className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-border/60"
                            >
                              {b.number_plate || b.model || "Vehicle"}
                            </span>
                          ))}
                          {bikeList.length > 4 && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 text-muted-foreground">
                              +{bikeList.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground italic mb-4">
                        No vehicles assigned to this cluster yet.
                      </p>
                    )}

                    {/* Bottom Inventory Pill */}
                    <div className="mt-auto pt-2.5 border-t border-border/50 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        <Bike className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{bikeCount} {bikeCount === 1 ? "bike" : "bikes"} assigned</span>
                      </div>
                      {hasBikes ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" /> Unlinked
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Cluster Dialog */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-5 border-b border-border bg-muted/20">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Boxes className="w-5 h-5 text-primary" />
              {isEdit ? "Edit Bike Cluster" : "Create New Bike Cluster"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateOrUpdate} className="flex flex-col flex-1 overflow-hidden">
            <ScrollArea className="flex-1 p-5 overflow-y-auto">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Cluster Model Name *</Label>
                    <Input
                      placeholder="e.g. Honda Activa 6G, Access 125"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-9 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Location / Hub Area *</Label>
                    <Select
                      value={formData.area_id}
                      onValueChange={(v) => setFormData({ ...formData, area_id: v, bikes: [] })}
                      disabled={(isStaff || isManager) && displayAreas?.length <= 1}
                    >
                      <SelectTrigger className="h-9 rounded-xl text-sm">
                        <SelectValue placeholder="Select Hub Area" />
                      </SelectTrigger>
                      <SelectContent>
                        {displayAreas?.map((area) => (
                          <SelectItem key={area._id} value={area._id}>
                            {area.name} ({area.city || "Hub"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Hourly Rate (₹) *</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g. 50"
                      value={formData.price_per_hour}
                      onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
                      className="h-9 rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Daily Rate (24 hrs) (₹) *</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="e.g. 500"
                      value={formData.price_per_day}
                      onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                      className="h-9 rounded-xl text-sm"
                    />
                  </div>
                </div>

                {/* Bike Multi-select Section */}
                <div className="space-y-2 pt-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-semibold">
                        Assign Fleet Vehicles ({formData.bikes.length} selected)
                      </Label>
                      {filteredBikes.length > 0 && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <button
                            type="button"
                            onClick={handleSelectAllBikes}
                            className="text-primary hover:underline font-semibold cursor-pointer"
                          >
                            Select All
                          </button>
                          <span className="text-muted-foreground">·</span>
                          <button
                            type="button"
                            onClick={handleClearAllBikes}
                            className="text-muted-foreground hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="relative w-full sm:w-52">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search models or plates..."
                        className="pl-8 h-8 text-xs rounded-lg"
                        value={bikeSearchQuery}
                        onChange={(e) => setBikeSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="border border-border/80 rounded-xl p-2.5 bg-muted/20">
                    <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                      {!formData.area_id ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                          <AlertCircle className="w-6 h-6 text-primary mb-1.5 opacity-80" />
                          <p className="text-xs font-semibold text-foreground">Select an Area First</p>
                          <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5">
                            Bikes are region-bound. Choose a Location above to see the matching inventory.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {filteredBikes.map((bike) => {
                            const isChecked = formData.bikes.includes(bike._id);
                            return (
                              <div
                                key={bike._id}
                                onClick={() => handleBikeToggle(bike._id)}
                                className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer select-none transition-all ${
                                  isChecked
                                    ? "bg-primary/10 border-primary/50 text-foreground"
                                    : "bg-card hover:bg-muted/50 border-border/70"
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                    isChecked
                                      ? "bg-primary border-primary text-primary-foreground"
                                      : "border-slate-300 dark:border-slate-600 bg-background"
                                  }`}
                                >
                                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-xs text-foreground truncate">
                                    {bike.model}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground font-mono truncate">
                                    {bike.number_plate} {bike.bike_colour ? `· ${bike.bike_colour}` : ""}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          {filteredBikes.length === 0 && (
                            <div className="col-span-full py-6 text-center text-xs text-muted-foreground">
                              No eligible bikes found in this hub area.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div className="flex items-center justify-end gap-2.5 p-4 border-t border-border bg-card">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                className="rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createClusterMutation.isPending || updateClusterMutation.isPending}
                className="bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-xl text-xs font-semibold px-4 cursor-pointer"
              >
                {isEdit ? "Update Cluster" : "Create Cluster"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
