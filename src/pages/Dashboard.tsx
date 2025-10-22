import { Layout } from "@/components/Layout";
import StatCard from "@/components/StatCard";
import VehicleCard from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Battery, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
// import heroImage from "@/assets/hero-station.jpg";

const mockVehicles = [
  { 
    id: "1", 
    licensePlate: "29A-123.45",
    model: "Klara S",
    brand: "VinFast",
    status: "available" as const, 
    batteryLevel: 95, 
    location: "Khu A",
    rentalPrice: 500000,
    lastMaintenance: "2024-01-10"
  },
  { 
    id: "2", 
    licensePlate: "29A-456.78",
    model: "Xmen Neo",
    brand: "Yadea",
    status: "rented" as const, 
    batteryLevel: 45, 
    location: "Khu B",
    rentalPrice: 400000,
    lastMaintenance: "2024-01-08"
  },
  { 
    id: "3", 
    licensePlate: "29A-789.01",
    model: "NewTech",
    brand: "Pega",
    status: "maintenance" as const, 
    batteryLevel: 80, 
    location: "Khu A",
    rentalPrice: 450000,
    lastMaintenance: "2024-01-12"
  },
];


const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative h-64 overflow-hidden bg-gradient-to-r from-primary to-primary/80">
          <div className="absolute inset-0 flex items-center px-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Chào mừng trở lại!</h1>
              <p className="text-white/90 text-lg">Quản lý điểm thuê xe điện hiệu quả</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Xe sẵn sàng"
              value={12}
              icon={Car}
              trend={{ value: 8, label: "so với tháng trước" }}
            />
            <StatCard
              title="Đang cho thuê"
              value={8}
              icon={Clock}
              description="Xe đang được sử dụng"
            />
            <StatCard
              title="Pin trung bình"
              value="78%"
              icon={Battery}
              description="Mức pin trung bình"
            />
            <StatCard
              title="Sự cố"
              value={2}
              icon={AlertCircle}
              description="Cần xử lý"
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button 
                  size="lg" 
                  variant="default"
                  className="w-full justify-between"
                  onClick={() => navigate("/handover")}
                >
                  Giao xe mới
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => navigate("/payment")}
                >
                  Xử lý thanh toán
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => navigate("/issues")}
                >
                  Báo cáo sự cố
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Vehicles */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Xe cần chú ý</h2>
              <Button variant="ghost" onClick={() => navigate("/vehicles")}>
                Xem tất cả
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  {...vehicle}
                  onView={(id) => navigate(`/vehicles/${id}`)}
                  onEdit={(id) => navigate(`/vehicles/${id}/edit`)}
                  onRent={(id) => navigate("/handover")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
