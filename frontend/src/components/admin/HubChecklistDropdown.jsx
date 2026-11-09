import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  MapPin,
  Check,
  ChevronDown,
  Layers,
  Search,
  X,
  RotateCcw,
} from "lucide-react";
import { useAdminArea } from "../../lib/AreaContext";
import { Badge } from "../ui/badge";

export default function HubChecklistDropdown() {
  const {
    areas,
    selectedAreaIds,
    toggleAreaId,
    selectAllAreas,
    clearAllAreas,
    isAreaSelected,
    selectedAreaObjects,
  } = useAdminArea();

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Filter areas based on search query
  const filteredAreas = useMemo(() => {
    if (!searchQuery.trim()) return areas;
    const q = searchQuery.toLowerCase().trim();
    return areas.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q)
    );
  }, [areas, searchQuery]);

  const isAllSelected = selectedAreaIds.length === 0;

  // Header display label for button
  const buttonLabel = useMemo(() => {
    if (isAllSelected) {
      return "All Hubs (Global)";
    }
    if (selectedAreaIds.length === 1) {
      const match = areas.find((a) => a._id?.toString() === selectedAreaIds[0]);
      return match ? match.name : "1 Hub Selected";
    }
    return `${selectedAreaIds.length} Hubs Combined`;
  }, [isAllSelected, selectedAreaIds, areas]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer ${
          !isAllSelected
            ? "bg-amber-500/15 border-amber-500/50 text-amber-300 hover:bg-amber-500/25"
            : "bg-muted/80 border-border/80 text-foreground hover:border-amber-500/50 hover:bg-muted"
        }`}
        title="Super Admin Hub Checklist (Multi-Select)"
      >
        <MapPin
          className={`w-4 h-4 shrink-0 transition-transform ${
            !isAllSelected ? "text-amber-400" : "text-amber-500"
          }`}
        />
        <span className="text-muted-foreground hidden sm:inline">Hubs:</span>
        <span className="truncate max-w-[150px] md:max-w-[220px]">
          {buttonLabel}
        </span>

        {!isAllSelected && (
          <span className="flex items-center justify-center bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-none">
            {selectedAreaIds.length}
          </span>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180 text-amber-400" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/90 shadow-2xl z-50 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3 border-b border-border/60 bg-muted/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-foreground">
                  Super Admin Hub Checklist
                </span>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] px-2 py-0.5 ${
                  isAllSelected
                    ? "bg-green-500/10 text-green-400 border-green-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}
              >
                {isAllSelected ? "Global View" : `${selectedAreaIds.length} Combined`}
              </Badge>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  selectAllAreas();
                }}
                className={`flex-1 text-[11px] font-medium py-1 px-2 rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                  isAllSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border-border/60"
                }`}
              >
                <Layers className="w-3 h-3" />
                All Hubs (Global)
              </button>

              {!isAllSelected && (
                <button
                  type="button"
                  onClick={() => {
                    clearAllAreas();
                  }}
                  className="text-[11px] font-medium py-1 px-2.5 rounded-lg border border-border/60 bg-muted hover:bg-destructive/20 hover:text-destructive hover:border-destructive/40 text-muted-foreground transition-all flex items-center gap-1"
                  title="Reset to All Hubs"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Hub Search Box */}
            <div className="relative mt-2">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search hub by name or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background/80 text-foreground text-xs pl-8 pr-7 py-1.5 rounded-lg border border-border/60 focus:outline-none focus:border-amber-500/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Checklist Items */}
          <div className="max-h-64 overflow-y-auto p-2 space-y-1 divide-y divide-border/20">
            {filteredAreas.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No hubs match &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredAreas.map((area) => {
                const checked = isAreaSelected(area._id);
                return (
                  <div
                    key={area._id}
                    onClick={() => toggleAreaId(area._id)}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors pt-2 ${
                      checked
                        ? "bg-amber-500/15 border border-amber-500/30 text-foreground"
                        : "hover:bg-muted/60 text-muted-foreground hover:text-foreground border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {/* Checkbox Icon */}
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                          checked
                            ? "bg-amber-500 border-amber-500 text-black shadow-sm"
                            : "border-border/80 bg-background"
                        }`}
                      >
                        {checked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>

                      <div className="truncate">
                        <p className="text-xs font-semibold truncate text-foreground">
                          {area.name}
                        </p>
                        {area.city && (
                          <p className="text-[10px] text-muted-foreground truncate">
                            📍 {area.city}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Badge */}
                    {checked && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded-full shrink-0">
                        Included
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-2.5 border-t border-border/60 bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {isAllSelected
                ? "Showing global data across all hubs."
                : `Combined view of ${selectedAreaIds.length} selected hub(s).`}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2.5 py-1 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-xs"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

