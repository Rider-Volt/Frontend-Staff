import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import StaffDashboard from "./components/staff/StaffDashboard";
import Login from "./pages/Login";
import StaffHandoverPage from "./pages/staffPage/StaffHandoverPage";
import StaffPayment from "./pages/staffPage/StaffPayment";
import StaffIssues from "./pages/staffPage/staffIssues";
import StaffVehiclesPage from "./pages/staffPage/StaffVehiclesPage";
import StaffStationOrdersPage from "./pages/staffPage/StaffStationOrdersPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminCustomersPage from "./pages/adminPage/AdminCustomersPage";
import AdminStationsPage from "./pages/adminPage/AdminStationsPage";
import AdminVehiclesPage from "./pages/adminPage/AdminVehiclesPage";
import AdminEmployeesPage from "./pages/adminPage/AdminEmployeesPage";
import AdminModelsPage from "./pages/adminPage/AdminModelsPage";
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
              <StaffDashboard />
            </ProtectedRoute>
          } />
          <Route path="/handover" element={
            <ProtectedRoute requiredRole="staff">
              <StaffHandoverPage />
            </ProtectedRoute>
          } />
          <Route path="/payment" element={
            <ProtectedRoute requiredRole="staff">
              <StaffPayment />
            </ProtectedRoute>
          } />
          <Route path="/issues" element={
            <ProtectedRoute requiredRole="staff">
              <StaffIssues />
            </ProtectedRoute>
          } />
          <Route path="/vehicles" element={
            <ProtectedRoute requiredRole="staff">
              <StaffVehiclesPage />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute requiredRole="staff">
              <StaffStationOrdersPage />
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
          <Route path="/admin/models" element={
            <ProtectedRoute requiredRole="admin">
              <AdminModelsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/adminModels" element={
            <ProtectedRoute requiredRole="admin">
              <AdminModelsPage />
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
