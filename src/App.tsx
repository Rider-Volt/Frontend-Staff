import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Handover from "./pages/Handover";
import Payment from "./pages/Payment";
import Issues from "./pages/Issues";
import Vehicles from "./pages/Vehicles";
import StationStaffOrders from "./pages/StationStaffOrders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/handover" element={<Handover />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/orders" element={<StationStaffOrders />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
