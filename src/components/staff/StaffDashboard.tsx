import { StaffLayout } from "@/components/staff/StaffLayout";
import { StaffVehicle } from "@/components/staff/StaffVehicle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Battery, Clock, AlertCircle, ArrowRight, LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import heroImage from "@/assets/hero-station.jpg";
import accountService from "@/services/accountService";
import { getStaffVehicles, type StaffVehicle as StaffVehicleApi } from "@/services/staffservice/staffVehicleService";

// StatCard component moved here
interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning";
}

const StatCard = ({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) => {
  const variantStyles = {
    default: "bg-card",
    primary: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20",
    success: "bg-gradient-to-br from-success/10 to-success/5 border-success/20",
    warning: "bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20",
  };

  return (
    <Card className={`${variantStyles[variant]} transition-all hover:shadow-lg`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {trend && (
              <p className={`text-sm mt-1 ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}% so với hôm qua
              </p>
            )}
          </div>
          <div className={`rounded-full p-3 ${variant === "default" ? "bg-muted" : ""}`}>
            <Icon className={`h-6 w-6 ${variant === "primary" ? "text-primary" : variant === "success" ? "text-success" : variant === "warning" ? "text-warning" : "text-foreground"}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper to map API status to UI status used in `StaffVehicle`
function mapStatusToCardStatus(apiStatus?: string): "available" | "booked" | "rented" | "maintenance" {
  const normalized = (apiStatus || "").toUpperCase();
  if (normalized === "AVAILABLE") return "available";
  if (normalized === "RENTED") return "rented";
  if (normalized === "BOOKED" || normalized === "RESERVED") return "booked";
  return "maintenance";
}

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<StaffVehicleApi[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError("");
    getStaffVehicles()
      .then((data) => {
        if (isMounted) setVehicles(Array.isArray(data) ? data : []);
      })
      .catch((e: unknown) => {
        if (isMounted) setError((e as Error)?.message || "Không thể tải danh sách xe");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const { availableCount, rentedCount, maintenanceCount, averagePin } = useMemo(() => {
    if (!vehicles.length) return { availableCount: 0, rentedCount: 0, maintenanceCount: 0, averagePin: 0 };
    const counts = vehicles.reduce(
      (acc, v) => {
        const s = (v.status || "").toUpperCase();
        if (s === "AVAILABLE") acc.available += 1;
        else if (s === "RENTED") acc.rented += 1;
        else acc.maintenance += 1; // treat other states as issues/maintenance
        acc.pinSum += Number.isFinite(v.currentPin) ? v.currentPin : 0;
        return acc;
      },
      { available: 0, rented: 0, maintenance: 0, pinSum: 0 }
    );
    const avg = Math.round(counts.pinSum / Math.max(vehicles.length, 1));
    return { availableCount: counts.available, rentedCount: counts.rented, maintenanceCount: counts.maintenance, averagePin: avg };
  }, [vehicles]);

  const attentionVehicles = useMemo(() => {
    const onlyMaintenance = vehicles.filter(v => (v.status || "").toUpperCase() === "MAINTENANCE");
    const byPriority = onlyMaintenance.sort((a, b) => (a.currentPin ?? 0) - (b.currentPin ?? 0));
    return byPriority.slice(0, 3).map((v) => ({
      id: String(v.vehicleId),
      name: v.model || v.vehicleType,
      status: mapStatusToCardStatus(v.status),
      batteryLevel: v.currentPin,
      location: v.stationName || v.stationAddress || "",
    }));
  }, [vehicles]);

  const user = accountService.getCurrentUser();
  const userName = user?.name || user?.userName || 'Guest';

  return (
    <StaffLayout>
      <div className="min-h-screen">
        <div className="relative h-64 overflow-hidden">
          <img 
            src={heroImage} 
            alt="EV Station" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40" />
          <div className="absolute inset-0 flex items-center px-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Chào mừng trở lại, {userName}!
              </h1>
              <p className="text-white/90 text-lg">Quản lý điểm thuê xe điện hiệu quả</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Xe sẵn sàng" value={availableCount} icon={Car} variant="success" trend={{ value: 0, isPositive: true }} />
            <StatCard title="Xe đang thuê" value={rentedCount} icon={Clock} variant="primary" />
            <StatCard title="Pin trung bình" value={`${averagePin}%`} icon={Battery} variant="warning" />
            <StatCard title="XE sự cố" value={maintenanceCount} icon={AlertCircle} variant="default" />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button size="lg" variant="default" className="w-full justify-between" onClick={() => navigate("/vehicles")}>
                  Quản lý xe
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="w-full justify-between" onClick={() => navigate("/orders")}>
                  Quản lý đơn thuê
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="w-full justify-between" onClick={() => navigate("/accounts")}>
                  Quản lý tài khoản
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Xe cần chú ý</h2>
              <Button variant="ghost" onClick={() => navigate("/vehicles")}>
                Xem tất cả
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {attentionVehicles.map((vehicle) => (
                <StaffVehicle
                  key={vehicle.id}
                  {...vehicle}
                  onHandover={() => navigate("/handover")}
                  onUpdateStatus={() => {}}
                  onReport={() => navigate("/issues")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffDashboard;
