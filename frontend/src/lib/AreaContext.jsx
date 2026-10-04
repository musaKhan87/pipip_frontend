import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./AuthProvider";

const AreaContext = createContext(undefined);

export function AreaProvider({ children }) {
  const { user, isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [areas, setAreas] = useState([]);
  const [selectedAreaId, setSelectedAreaIdState] = useState(() => {
    return localStorage.getItem("pipip_selected_area") || "all";
  });

  // Fetch active areas for the header selector
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const { data } = await axios.get("https://pipip-backend-eid3.onrender.com/api/areas");
        setAreas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch areas for selector:", err);
      }
    };
    if (user) {
      fetchAreas();
    }
  }, [user]);

  // Keep selectedAreaId synced for Manager / Staff vs Super Admin
  useEffect(() => {
    if (!user) return;

    if (!isSuperAdmin) {
      // Manager or Staff: force assigned area
      const assignedId =
        user.areaId?._id ||
        user.areaId ||
        (user.assigned_areas && user.assigned_areas[0]?._id) ||
        (user.assigned_areas && user.assigned_areas[0]);

      const areaIdStr = assignedId ? assignedId.toString() : "all";
      if (selectedAreaId !== areaIdStr) {
        setSelectedAreaIdState(areaIdStr);
        localStorage.setItem("pipip_selected_area", areaIdStr);
      }
    }
  }, [user, isSuperAdmin]);

  // Sync axios header whenever selectedAreaId changes
  useEffect(() => {
    if (selectedAreaId && selectedAreaId !== "all") {
      axios.defaults.headers.common["x-area-id"] = selectedAreaId;
    } else {
      delete axios.defaults.headers.common["x-area-id"];
    }
  }, [selectedAreaId]);

  const setSelectedAreaId = (areaId) => {
    const val = areaId || "all";
    setSelectedAreaIdState(val);
    localStorage.setItem("pipip_selected_area", val);
    if (val !== "all") {
      axios.defaults.headers.common["x-area-id"] = val;
    } else {
      delete axios.defaults.headers.common["x-area-id"];
    }
    // Invalidate all React Query hooks so all stats, cards, lists immediately refetch
    queryClient.invalidateQueries();
  };

  const selectedAreaObj = areas.find(
    (a) => a._id?.toString() === selectedAreaId?.toString()
  );

  return (
    <AreaContext.Provider
      value={{
        areas,
        selectedAreaId,
        setSelectedAreaId,
        selectedAreaObj,
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
