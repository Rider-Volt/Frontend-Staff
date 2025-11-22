import { StaffLayout } from "@/components/staff/StaffLayout";
import { StaffVehicle } from "@/components/staff/StaffVehicle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, LucideIcon, ArrowDownCircle, ArrowUpCircle, DollarSign, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import heroImage from "@/assets/hero-station.jpg";
import accountService from "@/services/accountService";
import {
  getReturnsToday,
  getReturnsTodayCount,
  getPickupsToday,
  getPickupsTodayCount,
  getOverdueBillings,
  getOverdueBillingsCount,
  getMaintenanceVehicles,
  getMaintenanceVehiclesCount,
  type ReturnToday,
  type PickupToday,
  type OverdueBilling,
  type MaintenanceVehicle,
} from "@/services/staffservice/staffDashboardService";

// Component StatCard được chuyển vào đây
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

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  // Dashboard data states
  const [returnsToday, setReturnsToday] = useState<ReturnToday[]>([]);
  const [returnsTodayCount, setReturnsTodayCount] = useState<number>(0);
  const [pickupsToday, setPickupsToday] = useState<PickupToday[]>([]);
  const [pickupsTodayCount, setPickupsTodayCount] = useState<number>(0);
  const [overdueBillings, setOverdueBillings] = useState<OverdueBilling[]>([]);
  const [overdueBillingsCount, setOverdueBillingsCount] = useState<number>(0);
  const [maintenanceVehicles, setMaintenanceVehicles] = useState<MaintenanceVehicle[]>([]);
  const [maintenanceVehiclesCount, setMaintenanceVehiclesCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError("");

    // Load all dashboard data in parallel
    Promise.all([
      getReturnsToday().catch((e) => {
        console.error("Error loading returns today:", e);
        return [];
      }),
      getReturnsTodayCount().catch((e) => {
        console.error("Error loading returns count:", e);
        return 0;
      }),
      getPickupsToday().catch((e) => {
        console.error("Error loading pickups today:", e);
        return [];
      }),
      getPickupsTodayCount().catch((e) => {
        console.error("Error loading pickups count:", e);
        return 0;
      }),
      getOverdueBillings().catch((e) => {
        console.error("Error loading overdue billings:", e);
        return [];
      }),
      getOverdueBillingsCount().catch((e) => {
        console.error("Error loading overdue count:", e);
        return 0;
      }),
      getMaintenanceVehicles().catch((e) => {
        console.error("Error loading maintenance vehicles:", e);
        return [];
      }),
      getMaintenanceVehiclesCount().catch((e) => {
        console.error("Error loading maintenance count:", e);
        return 0;
      }),
    ]).then(([
      returnsData,
      returnsCount,
      pickupsData,
      pickupsCount,
      overdueData,
      overdueCount,
      maintenanceData,
      maintenanceCount,
    ]) => {
      if (!isMounted) return;
      
      setReturnsToday(Array.isArray(returnsData) ? returnsData : []);
      setReturnsTodayCount(typeof returnsCount === 'number' ? returnsCount : 0);
      setPickupsToday(Array.isArray(pickupsData) ? pickupsData : []);
      setPickupsTodayCount(typeof pickupsCount === 'number' ? pickupsCount : 0);
      setOverdueBillings(Array.isArray(overdueData) ? overdueData : []);
      setOverdueBillingsCount(typeof overdueCount === 'number' ? overdueCount : 0);
      setMaintenanceVehicles(Array.isArray(maintenanceData) ? maintenanceData : []);
      setMaintenanceVehiclesCount(typeof maintenanceCount === 'number' ? maintenanceCount : 0);
    }).catch((e: unknown) => {
      if (isMounted) {
        setError((e as Error)?.message || "Không thể tải dữ liệu dashboard");
      }
    }).finally(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

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
          {/* Dashboard Statistics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Trả xe hôm nay" 
              value={returnsTodayCount} 
              icon={ArrowDownCircle} 
              variant="primary" 
            />
            <StatCard 
              title="Nhận xe hôm nay" 
              value={pickupsTodayCount} 
              icon={ArrowUpCircle} 
              variant="success" 
            />
            <StatCard 
              title="Đơn quá hạn" 
              value={overdueBillingsCount} 
              icon={DollarSign} 
              variant="warning" 
            />
            <StatCard 
              title="Xe bảo trì" 
              value={maintenanceVehiclesCount} 
              icon={Wrench} 
              variant="default" 
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button size="lg" variant="default" className="w-full justify-between" onClick={() => navigate("/handover")}>
                  Giao/Trả Xe
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

          {/* Returns Today Section */}
          {returnsToday.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Trả xe hôm nay ({returnsTodayCount})</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/handover")}>
                    Xem tất cả
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Xe</TableHead>
                        <TableHead>Biển số</TableHead>
                        <TableHead>Thời gian trả</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {returnsToday.slice(0, 5).map((returnItem) => (
                        <TableRow key={returnItem.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{returnItem.customerName || "N/A"}</div>
                              <div className="text-sm text-muted-foreground">{returnItem.customerPhone || ""}</div>
                            </div>
                          </TableCell>
                          <TableCell>{returnItem.vehicleName || "N/A"}</TableCell>
                          <TableCell>{returnItem.licensePlate || "N/A"}</TableCell>
                          <TableCell>
                            {returnItem.returnTime 
                              ? new Date(returnItem.returnTime).toLocaleString("vi-VN")
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{returnItem.status || "Đang chờ"}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pickups Today Section */}
          {pickupsToday.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Nhận xe hôm nay ({pickupsTodayCount})</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/handover")}>
                    Xem tất cả
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Xe</TableHead>
                        <TableHead>Biển số</TableHead>
                        <TableHead>Thời gian nhận</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pickupsToday.slice(0, 5).map((pickup) => (
                        <TableRow key={pickup.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{pickup.customerName || "N/A"}</div>
                              <div className="text-sm text-muted-foreground">{pickup.customerPhone || ""}</div>
                            </div>
                          </TableCell>
                          <TableCell>{pickup.vehicleName || "N/A"}</TableCell>
                          <TableCell>{pickup.licensePlate || "N/A"}</TableCell>
                          <TableCell>
                            {pickup.pickupTime 
                              ? new Date(pickup.pickupTime).toLocaleString("vi-VN")
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{pickup.status || "Đang chờ"}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overdue Billings Section */}
          {overdueBillings.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Đơn thuê quá hạn ({overdueBillingsCount})</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/orders")}>
                    Xem tất cả
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Xe</TableHead>
                        <TableHead>Biển số</TableHead>
                        <TableHead>Ngày đáo hạn</TableHead>
                        <TableHead>Số ngày quá hạn</TableHead>
                        <TableHead>Số tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overdueBillings.slice(0, 5).map((billing) => (
                        <TableRow key={billing.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{billing.customerName || "N/A"}</div>
                              <div className="text-sm text-muted-foreground">{billing.customerPhone || ""}</div>
                            </div>
                          </TableCell>
                          <TableCell>{billing.vehicleName || "N/A"}</TableCell>
                          <TableCell>{billing.licensePlate || "N/A"}</TableCell>
                          <TableCell>
                            {billing.dueDate 
                              ? new Date(billing.dueDate).toLocaleDateString("vi-VN")
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              {billing.overdueDays || 0} ngày
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {billing.amount 
                              ? new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(billing.amount)
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Maintenance Vehicles Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Xe đang bảo trì ({maintenanceVehiclesCount})</h2>
              <Button variant="ghost" onClick={() => navigate("/vehicles")}>
                Xem tất cả
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            {maintenanceVehicles.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {maintenanceVehicles.slice(0, 6).map((vehicle) => (
                  <StaffVehicle
                    key={vehicle.vehicleId}
                    id={String(vehicle.vehicleId)}
                    name={vehicle.model || vehicle.vehicleType || "N/A"}
                    status="maintenance"
                    batteryLevel={vehicle.currentPin}
                    location={vehicle.stationName || vehicle.stationAddress || ""}
                    onHandover={() => navigate("/handover")}
                    onUpdateStatus={() => {}}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  Không có xe nào đang bảo trì
                </CardContent>
              </Card>
            )}
          </div>

        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffDashboard;
