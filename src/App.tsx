import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AppRouter } from "./router";

import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import FAQs from "./pages/FAQs";
import TermsConditions from "./pages/TermsConditions";
import AdminPayments from "./pages/admin/AdminPayments";
import AuthCallback from "./pages/portal/AuthCallback";
import GuestDashboard from "./pages/portal/GuestDashboard";
import GuestLogin from "./pages/portal/GuestLogin";
import PhilippinesItinerary from "./pages/PhilippinesItinerary";

import BookingPage from "./pages/booking/BookingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppRouter>
        <Routes>
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/guest-login" element={<GuestLogin />} />
          <Route path="/admin/login" element={<GuestLogin mode="admin" />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/portal/dashboard" element={<GuestDashboard />} />
          <Route path="/admin/payments" element={<AdminPayments />} />

          <Route path="/" element={<PhilippinesItinerary />} />
          <Route path="/philippines-itinerary" element={<PhilippinesItinerary />} />
          <Route path="/booking/:slug" element={<BookingPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
