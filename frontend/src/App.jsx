
// import { useEffect } from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import Index from "./Pages/Index";
// import NotFound from "./Pages/NotFound";
// import Catalog from "./Pages/Catalog";
// import Bikes from "./Pages/admin/Bikes";
// import BookBike from "./Pages/BookBike";
// import ScrollToTop from "./components/ScrollToTop";
// import Bookings from "./Pages/admin/Booking";
// import AdminLayout from "./components/admin/AdminLayout";
// import Areas from "./Pages/admin/Areas";
// import Customers from "./Pages/admin/Customers";
// import ActiveRentals from "./Pages/admin/ActiveRentals";
// import Scheduler from "./Pages/admin/Scheduler";
// import Reports from "./Pages/admin/Reports";
// import Dashboard from "./Pages/admin/Dashboard";
// import { AuthProvider } from "./lib/AuthProvider";
// import AdminLogin from "./Pages/AdminLogin";
// import Settings from "./Pages/admin/Settings";
// import Contact from "./components/Contact";
// import PrivacyPolicy from "./Pages/PrivacyPolicy";
// import TermsAndConditions from "./Pages/TermsAndConditions";
// import RefundPolicy from "./Pages/RefundPolicy";
// import AnalyticsTracker from "./Pages/AnalyticsTracker";
// import NotificationsCenter from "./Pages/admin/Notifications";
// import Clusters from "./Pages/admin/Clusters";
// import Expenses from "./Pages/admin/Expenses";
// import AboutPage from "./Pages/AboutPage";
// import InvestorOrders from "./Pages/admin/InvestorOrders";
// import PricingPage from "./Pages/PricingPage";




// // const queryClient = new QueryClient();
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 1000 * 60 * 2, // 2 minutes cache validity (prevents redundant API refetching)
//       gcTime: 1000 * 60 * 10,   // 10 minutes cache retention in memory
//       refetchOnWindowFocus: false, // Prevents laggy background network storms on window focus
//       retry: 1,
//     },
//   },
// });


// const App = () => {

//   // 📱 SYSTEM REGISTER: Initialize Service Worker stream interface context
//   useEffect(() => {
//     if ("serviceWorker" in navigator && "PushManager" in window) {
//       navigator.serviceWorker
//         .register("/sw.js")
//         .then(() => console.log("Pipip Background Engine Connected"))
//         .catch((err) => console.error("Service Worker registration failed:", err));
//     }
//   }, []);

//   return(
//       <QueryClientProvider client={queryClient}>
//         <AuthProvider>
//       <BrowserRouter>
//       <ScrollToTop />
//         <Routes>
//           <Route path="/" element={<Index />} />
//           <Route path="/about" element={<AboutPage />} />
//           <Route path="/pricing" element={<PricingPage />} />
//           <Route path="/admin" element={<AdminLogin />} />
//           <Route path="*" element={<NotFound />} />
//           <Route path="/catalog" element={<Catalog />} />

//           <Route path="/admin/panel" element={<AdminLayout />}>
//           <Route path="bikes" element={<Bikes />} />
//           <Route path="clusters" element={<Clusters />} />
//           <Route path="bookings" element={<Bookings />} />
//           <Route path="areas" element={<Areas />} />
//           <Route path="customers" element={<Customers />} />
//           <Route path="active-rentals" element={<ActiveRentals />} />
//           <Route path="scheduler" element={<Scheduler />} />
//           {/* 👈 NEW: Mount Notifications View cleanly within Admin Grid matching paths entry */}
//           <Route path="notifications" element={<NotificationsCenter />} />
//           <Route path="reports" element={<Reports />} />
//           <Route path="expenses" element={<Expenses />} />
//           <Route index element={<Dashboard />} />
//           <Route path="settings" element={<Settings />} />
//           <Route path="investor-orders" element={<InvestorOrders />} />
//           </Route>
           

//            <Route path="/book/:bikeId" element={<BookBike />} />
//             <Route path="/contact" element={<Contact/>} />
//             <Route path="/privacy-policy" element={<PrivacyPolicy />} />
//             <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
//             <Route path="/refund-policy" element={<RefundPolicy />} />
           
           
//         </Routes>
//         <AnalyticsTracker/>
//       </BrowserRouter>
//       </AuthProvider>
//       </QueryClientProvider>
//   ) 
// };

// export default App;


import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./lib/AuthProvider";
import AnalyticsTracker from "./Pages/AnalyticsTracker";

// ⚡ Lazy-loaded Public Routes (Loaded on-demand when user visits the page)
const Index = lazy(() => import("./Pages/Index"));
const AboutPage = lazy(() => import("./Pages/AboutPage"));
const Catalog = lazy(() => import("./Pages/Catalog"));
const BookBike = lazy(() => import("./Pages/BookBike"));
const Contact = lazy(() => import("./components/Contact"));
const NotFound = lazy(() => import("./Pages/NotFound"));
const AdminLogin = lazy(() => import("./Pages/AdminLogin"));
const PrivacyPolicy = lazy(() => import("./Pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./Pages/TermsAndConditions"));
const RefundPolicy = lazy(() => import("./Pages/RefundPolicy"));

// ⚡ Lazy-loaded Admin Routes (Never downloaded by public visitors)
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const Dashboard = lazy(() => import("./Pages/admin/Dashboard"));
const Bikes = lazy(() => import("./Pages/admin/Bikes"));
const Clusters = lazy(() => import("./Pages/admin/Clusters"));
const Bookings = lazy(() => import("./Pages/admin/Booking"));
const Areas = lazy(() => import("./Pages/admin/Areas"));
const Customers = lazy(() => import("./Pages/admin/Customers"));
const ActiveRentals = lazy(() => import("./Pages/admin/ActiveRentals"));
const Scheduler = lazy(() => import("./Pages/admin/Scheduler"));
const NotificationsCenter = lazy(() => import("./Pages/admin/Notifications"));
const Reports = lazy(() => import("./Pages/admin/Reports"));
const Expenses = lazy(() => import("./Pages/admin/Expenses"));
const Settings = lazy(() => import("./Pages/admin/Settings"));
const Managers = lazy(() => import("./Pages/admin/Managers"));
const InvestorOrders = lazy(() => import("./Pages/admin/InvestorOrders"));
const PricingPage = lazy(() => import("./Pages/PricingPage"));

import { AreaProvider } from "./lib/AreaContext";

// Lightweight Suspense Loader
const PageLoader = () => (
  <div className="min-h-[60vh] w-full flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-xs text-muted-foreground font-medium animate-pulse">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes cache validity (prevents redundant API refetching)
      gcTime: 1000 * 60 * 10,   // 10 minutes cache retention in memory
      refetchOnWindowFocus: false, // Prevents laggy background network storms on window focus
      retry: 1,
    },
  },
});

const App = () => {
  // 📱 SYSTEM REGISTER: Initialize Service Worker stream interface context
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Pipip Background Engine Connected"))
        .catch((err) => console.error("Service Worker registration failed:", err));
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AreaProvider>
          <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<AboutPage />} />
              {/* Stealth Mode: /admin shows 404, secret URL accesses portal login */}
              <Route path="/admin" element={<NotFound />} />
              <Route path="/pipip-ops-mumbai" element={<AdminLogin />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/book/:bikeId" element={<BookBike />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />

              {/* Admin Panel Nested Routes */}
              <Route path="/admin/panel" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="bikes" element={<Bikes />} />
                <Route path="clusters" element={<Clusters />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="areas" element={<Areas />} />
                <Route path="customers" element={<Customers />} />
                <Route path="active-rentals" element={<ActiveRentals />} />
                <Route path="scheduler" element={<Scheduler />} />
                <Route path="notifications" element={<NotificationsCenter />} />
                <Route path="reports" element={<Reports />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="settings" element={<Settings />} />
                <Route path="managers" element={<Navigate to="/admin/panel/settings" replace />} />
                <Route path="investor-orders" element={<InvestorOrders />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <AnalyticsTracker />
        </BrowserRouter>
      </AreaProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;