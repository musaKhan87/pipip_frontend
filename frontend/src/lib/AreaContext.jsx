import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./AuthProvider";

const AreaContext = createContext(undefined);

export function AreaProvider({ children }) {
  const { user, isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [areas, setAreas] = useState([]);

  // Store selected area IDs as an array of strings. Empty array means "All Areas (Global)"
  const [selectedAreaIds, setSelectedAreaIdsState] = useState(() => {
    try {
      const storedMulti = localStorage.getItem("pipip_selected_areas");
      if (storedMulti) {
        const parsed = JSON.parse(storedMulti);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(String);
        }
      }
      const legacy = localStorage.getItem("pipip_selected_area");
      if (legacy && legacy !== "all") {
        return legacy.split(",").map((s) => s.trim()).filter(Boolean);
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Fetch active areas for the header selector
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/areas`);
        setAreas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch areas for selector:", err);
      }
    };
    if (user) {
      fetchAreas();
    }
  }, [user]);

  // Keep selectedAreaIds synced for Manager / Staff vs Super Admin
  useEffect(() => {
    if (!user) return;

    if (!isSuperAdmin) {
      // Manager or Staff: force assigned area(s)
      const assignedIds = [];
      if (user.areaId) {
        const aId = user.areaId._id ? user.areaId._id.toString() : user.areaId.toString();
        if (aId) assignedIds.push(aId);
      }
      if (user.assigned_areas && user.assigned_areas.length > 0) {
        user.assigned_areas.forEach((a) => {
          const aId = a._id ? a._id.toString() : a.toString();
          if (aId && !assignedIds.includes(aId)) {
            assignedIds.push(aId);
          }
        });
      }

      setSelectedAreaIdsState(assignedIds);
    }
  }, [user, isSuperAdmin]);

  // Sync axios header whenever selectedAreaIds changes
  useEffect(() => {
    if (selectedAreaIds && selectedAreaIds.length > 0) {
      axios.defaults.headers.common["x-area-id"] = selectedAreaIds.join(",");
    } else {
      delete axios.defaults.headers.common["x-area-id"];
    }
  }, [selectedAreaIds]);

  // Master setter for multi-area selection
  const setSelectedAreaIds = (ids) => {
    let cleanIds = [];
    if (Array.isArray(ids)) {
      cleanIds = ids
        .map(String)
        .map((s) => s.trim())
        .filter((s) => s && s !== "all");
    } else if (typeof ids === "string") {
      if (ids !== "all" && ids.trim() !== "") {
        cleanIds = ids
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s && s !== "all");
      }
    }

    setSelectedAreaIdsState(cleanIds);
    localStorage.setItem("pipip_selected_areas", JSON.stringify(cleanIds));
    localStorage.setItem("pipip_selected_area", cleanIds.length > 0 ? cleanIds.join(",") : "all");

    if (cleanIds.length > 0) {
      axios.defaults.headers.common["x-area-id"] = cleanIds.join(",");
    } else {
      delete axios.defaults.headers.common["x-area-id"];
    }

    // Invalidate all React Query hooks so all stats, cards, lists immediately refetch with new area scope
    queryClient.invalidateQueries();
  };

  // Toggle single area in/out of checklist
  const toggleAreaId = (areaId) => {
    if (!areaId || areaId === "all") {
      // "all" clears the specific checklist and selects everything
      setSelectedAreaIds([]);
      return;
    }

    const strId = String(areaId);
    let next;
    if (selectedAreaIds.includes(strId)) {
      next = selectedAreaIds.filter((id) => id !== strId);
    } else {
      next = [...selectedAreaIds, strId];
    }
    setSelectedAreaIds(next);
  };

  // Select all specific areas
  const selectAllAreas = () => {
    setSelectedAreaIds([]);
  };

  // Clear all selections (resets to global All)
  const clearAllAreas = () => {
    setSelectedAreaIds([]);
  };

  // Backward compatibility: selectedAreaId string
  const selectedAreaId = useMemo(() => {
    if (selectedAreaIds.length === 0) return "all";
    if (selectedAreaIds.length === 1) return selectedAreaIds[0];
    return selectedAreaIds.join(",");
  }, [selectedAreaIds]);

  const setSelectedAreaId = (val) => {
    setSelectedAreaIds(val);
  };

  const isAreaSelected = (areaId) => {
    if (areaId === "all") return selectedAreaIds.length === 0;
    return selectedAreaIds.includes(String(areaId));
  };

  const selectedAreaObj = useMemo(() => {
    if (selectedAreaIds.length === 1) {
      return areas.find((a) => a._id?.toString() === selectedAreaIds[0]) || null;
    }
    return null;
  }, [areas, selectedAreaIds]);

  const selectedAreaObjects = useMemo(() => {
    if (selectedAreaIds.length === 0) return areas;
    return areas.filter((a) => selectedAreaIds.includes(a._id?.toString()));
  }, [areas, selectedAreaIds]);

  return (
    <AreaContext.Provider
      value={{
        areas,
        selectedAreaIds,
        selectedAreaId,
        setSelectedAreaIds,
        setSelectedAreaId,
        toggleAreaId,
        selectAllAreas,
        clearAllAreas,
        isAreaSelected,
        selectedAreaObj,
        selectedAreaObjects,
        isSuperAdmin,
      }}
    >
      {children}
    </AreaContext.Provider>
  );
}

export function useAdminArea() {
  const context = useContext(AreaContext);
  if (context === undefined) {
    throw new Error("useAdminArea must be used within an AreaProvider");
  }
  return context;
}

export const useArea = useAdminArea;
