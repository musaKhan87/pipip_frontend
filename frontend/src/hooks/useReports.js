import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { subDays } from 'date-fns';
import { API_BASE_URL } from '../config/api';

// Create an axios instance for cleaner calls
export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const selectedArea = localStorage.getItem("pipip_selected_area");
  if (selectedArea && selectedArea !== "all") {
    config.headers["x-area-id"] = selectedArea;
  }
  return config;
});

/**
 * Hook: Fetch general booking stats
 * GET /api/reports/stats?period=today
 */
// export function useBookingStats(period = 'all', startDate = null, endDate = null) {
//   return useQuery({
//     queryKey: ['booking-stats', period , startDate, endDate] ,
//     queryFn: async () => {
//       // const { data } = await api.get(`/reports/stats`, { params: { period } });
//       const params = { period };
//       if (startDate) params.startDate = startDate;
//       if (endDate) params.endDate = endDate;
//       const { data } = await api.get(`/reports/stats`, { params });
//       return data;
//     }
//   });
// }

// export function useBookingStats(period = "all", startDate = null, endDate = null) {
//   return useQuery({
//     queryKey: ["booking-stats", period, startDate, endDate],
//     queryFn: async () => {
//       const params = { period };
//       if (startDate) params.startDate = startDate;
//       if (endDate) params.endDate = endDate;
//       const { data } = await api.get(`/reports/stats`, { params });
//       return data;
//     },
//   });
// }

export function useBookingStats(period = "all", startDate = null, endDate = null, options = {}) {
  return useQuery({
    queryKey: ["booking-stats", period, startDate, endDate],
    queryFn: async () => {
      const params = { period };
      
      if (startDate && endDate) {
        // Force local day boundaries to match Excel parameters exactly
        params.startDate = new Date(`${startDate}T00:00:00`).toISOString();
        params.endDate = new Date(`${endDate}T23:59:59.999`).toISOString();
      }

      const { data } = await api.get(`/reports/stats`, { params });
      return data;
    },
    ...options,
  });
}

/**
 * Hook: Fetch revenue broken down by bike
 * GET /api/reports/bike-revenue
 */
// export function useBikeRevenueReport(fromDate, toDate) {
//   return useQuery({
//     queryKey: ['bike-revenue', fromDate, toDate],
//     queryFn: async () => {
//       const { data } = await api.get(`/reports/bike-revenue`, {
//         params: { 
//           fromDate: fromDate?.toISOString(), 
//           toDate: toDate?.toISOString() 
//         }
//       });
//       return data;
//     }
//   });
// }
export function useBikeRevenueReport(fromDate, toDate, options = {}) {
  return useQuery({
    queryKey: ["bike-revenue", fromDate, toDate],
    queryFn: async () => {
      const { data } = await api.get(`/reports/bike-revenue`, {
        params: {
          // Wrap in fresh Date constructors to safeguard conversions
          fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
          toDate: toDate ? new Date(toDate).toISOString() : undefined,
        },
      });
      return data;
    },
    ...options,
  });
}

/**
 * Hook: Find bikes with no bookings in the last 30 days
 */
export function useIdleBikesReport(options = {}) {
  return useQuery({
    queryKey: ['idle-bikes'],
    queryFn: async () => {
      const { data } = await api.get(`/reports/idle-bikes`);
      return data;
    },
    ...options,
  });
}

/**
 * Hook: Get daily revenue for charts
 */
export function useDailyRevenueReport(days = 30, options = {}) {
  return useQuery({
    queryKey: ['daily-revenue', days],
    queryFn: async () => {
      const { data } = await api.get(`/reports/daily-revenue`, { params: { days } });
      return data;
    },
    ...options,
  });
}

export function useActiveBookingsEndingSoon() {
  return useQuery({
    queryKey: ['active-bookings-ending-soon'],
    queryFn: async () => {
      const { data } = await api.get('/reports/ending-soon');
      return data;
    },
    refetchInterval: 30000 // Keep the 30s auto-refresh for the dashboard
  });
}

export function useRecentlyExpiredBookings() {
  return useQuery({
    queryKey: ['recently-expired'],
    queryFn: async () => {
      const { data } = await api.get('/reports/recently-expired');
      return data;
    }
  });
}