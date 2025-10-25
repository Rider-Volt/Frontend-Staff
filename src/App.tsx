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
import StationStaffOrdersPage from "./pages/StationStaffOrdersPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminCustomersPage from "./pages/adminPage/AdminCustomersPage";
import AdminStationsPage from "./pages/adminPage/AdminStationsPage";
import AdminVehiclesPage from "./pages/adminPage/AdminVehiclesPage";
import AdminEmployeesPage from "./pages/adminPage/AdminEmployeesPage";
import AdminRevenuePage from "./pages/adminPage/AdminRevenuePage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Staff routes - accessible by both staff and admin */}
          <Route path="/" element={
            <ProtectedRoute requiredRole="staff">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/handover" element={
            <ProtectedRoute requiredRole="staff">
              <Handover />
            </ProtectedRoute>
          } />
          <Route path="/payment" element={
            <ProtectedRoute requiredRole="staff">
              <Payment />
            </ProtectedRoute>
          } />
          <Route path="/issues" element={
            <ProtectedRoute requiredRole="staff">
              <Issues />
            </ProtectedRoute>
          } />
          <Route path="/vehicles" element={
            <ProtectedRoute requiredRole="staff">
              <Vehicles />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute requiredRole="staff">
              <StationStaffOrdersPage />
            </ProtectedRoute>
          } />
          
          {/* Admin routes - only accessible by admin */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedRoute requiredRole="admin">
              <AdminCustomersPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/adminCustomers" element={
            <ProtectedRoute requiredRole="admin">
              <AdminCustomersPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/stations" element={
            <ProtectedRoute requiredRole="admin">
              <AdminStationsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/adminStations" element={
            <ProtectedRoute requiredRole="admin">
              <AdminStationsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/vehicles" element={
            <ProtectedRoute requiredRole="admin">
              <AdminVehiclesPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/adminVehicles" element={
            <ProtectedRoute requiredRole="admin">
              <AdminVehiclesPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/employees" element={
            <ProtectedRoute requiredRole="admin">
              <AdminEmployeesPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/adminEmployees" element={
            <ProtectedRoute requiredRole="admin">
              <AdminEmployeesPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute requiredRole="admin">
              <AdminRevenuePage />
            </ProtectedRoute>
          } />
          <Route path="/admin/adminReports" element={
            <ProtectedRoute requiredRole="admin">
              <AdminRevenuePage />
            </ProtectedRoute>
          } />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
