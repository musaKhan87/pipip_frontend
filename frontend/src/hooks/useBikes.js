import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/bikes`;

/* ================= GET ALL BIKES (DUAL-MODE) ================= */
export function useBikes(filters = {}, options = {}) {
  return useQuery({
    queryKey: ["bikes", filters],
    queryFn: async () => {
      const { data } = await axios.get(API_URL, { params: filters });
      // If server returned paginated object { bikes: [...], totalCount }, extract array for backward compatibility
      if (data && Array.isArray(data.bikes)) {
        return data.bikes;
      }
      return Array.isArray(data) ? data : [];
    },
    ...options,
  });
}

/* ================= GET PAGINATED BIKES (SERVER-SIDE) ================= */
export function usePaginatedBikes(filters = {}, options = {}) {
  return useQuery({
    queryKey: ["bikes-paginated", filters],
    queryFn: async () => {
      const { data } = await axios.get(API_URL, { params: filters });
      return data;
    },
    ...options,
  });
}

/* ================= GET SINGLE BIKE ================= */
export function useBike(bikeId) {
  return useQuery({
    queryKey: ["bike", bikeId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/${bikeId}`);
      return data;
    },
    enabled: !!bikeId,
  });
}

/* ================= CREATE BIKE ================= */
export function useCreateBike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await axios.post(API_URL, formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
      queryClient.invalidateQueries({ queryKey: ["bikes-paginated"] });
      toast.success("Bike added successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add bike");
    },
  });
}

/* ================= UPDATE BIKE ================= */
export function useUpdateBike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }) => {
      const { data } = await axios.put(`${API_URL}/${id}`, formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
      queryClient.invalidateQueries({ queryKey: ["bikes-paginated"] });
      toast.success("Bike updated successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update bike");
    },
  });
}

/* ================= DELETE BIKE ================= */
export function useDeleteBike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
      queryClient.invalidateQueries({ queryKey: ["bikes-paginated"] });
      toast.success("Bike deleted successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete bike");
    },
  });
}