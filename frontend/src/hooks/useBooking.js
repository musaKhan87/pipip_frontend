import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "../config/api";

const API_URL = `${API_BASE_URL}/bookings`;

/* =========================
   GET ALL BOOKINGS
========================= */
export function useBookings(filterOrStatus = "all", options = {}) {
  let params = {};
  if (typeof filterOrStatus === "object" && filterOrStatus !== null) {
    params = { ...filterOrStatus };
    if (params.status === "all") delete params.status;
  } else if (typeof filterOrStatus === "string" && filterOrStatus !== "all") {
    params = { status: filterOrStatus };
  }

  const queryOptions = typeof options === "object" ? options : {};

  return useQuery({
    queryKey: ["bookings", filterOrStatus],
    queryFn: async () => {
      const { data } = await axios.get(API_URL, { params });
      // If backend returns paginated object { bookings: [...] }, return the array for backward compatibility
      if (data && Array.isArray(data.bookings)) {
        return data.bookings;
      }
      return Array.isArray(data) ? data : [];
    },
    ...queryOptions,
  });
}

/* =========================
   GET PAGINATED BOOKINGS (SERVER-SIDE)
========================= */
export function usePaginatedBookings(filters = {}, options = {}) {
  return useQuery({
    queryKey: ["bookings-paginated", filters],
    queryFn: async () => {
      const { data } = await axios.get(API_URL, { params: filters });
      return data;
    },
    ...options,
  });
}

/* =========================
   GET SINGLE BOOKING
========================= */
export function useBooking(id) {
  return useQuery({
    queryKey: ["bookings", id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

/* =========================
   CREATE BOOKING
========================= */
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData) => {
      const { data } = await axios.post(API_URL, bookingData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings-paginated"] });
      toast.success("Booking created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create booking");
    },
  });
}

export function useAdminCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingData) => {
      const { data } = await axios.post(`${API_URL}/admin`, bookingData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings-paginated"] });
      toast.success("Booking created successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create booking");
    },
  });
}

/* =========================
   UPDATE BOOKING STATUS (ADMIN)
========================= */
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await axios.patch(`${API_URL}/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings-paginated"] });
      toast.success("Booking status updated");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Status update failed");
    },
  });
}

/* =========================
   UPDATE BOOKING (ADMIN)
========================= */
export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const isFormData = data instanceof FormData;

      const { data: response } = await axios.put(
        `${API_URL}/${id}`,
        data,
        isFormData
          ? {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          : {}
      );

      return response;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings-paginated"] });
      toast.success("Booking updated successfully");
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });
}

/* =========================
   DELETE BOOKING (ADMIN)
========================= */
export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_URL}/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings-paginated"] });
      toast.success("Booking deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Delete failed");
    },
  });
}

/* =========================
   ASSIGN BIKE TO BOOKING
========================= */
export const useAssignBike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, bike_id }) => {
      const { data } = await axios.put(`${API_URL}/${id}/assign-bike`, { bike_id });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings-paginated"] });
      queryClient.invalidateQueries({ queryKey: ["bikes"] });
      toast.success("Bike assigned successfully 🎉");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to assign bike");
    },
  });
};
/* =========================
   RECORD BOOKING PAYMENT (SPLIT / INSTALLMENT)
========================= */
export const useRecordPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookingId, paymentData }) => {
      const { data } = await axios.post(`${API_URL}/${bookingId}/payment`, paymentData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings-paginated"] });
      toast.success("Payment recorded successfully 🎉");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to record payment");
    }
  });
};
