import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { VehicleCard } from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car, Battery, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-station.jpg";
import accountService from "@/services/accountService";

const mockVehicles = [
  { id: "1", name: "VinFast Klara S", status: "available" as const, batteryLevel: 95, location: "Khu A" },
  { id: "2", name: "Yadea Xmen Neo", status: "rented" as const, batteryLevel: 45, location: "Khu B" },
  { id: "3", name: "Pega NewTech", status: "booked" as const, batteryLevel: 80, location: "Khu A" },
];


const Dashboard = () => {
  const navigate = useNavigate();
  
  // Lấy tên user hiện tại từ database
  const user = accountService.getCurrentUser();
  const userName = user?.name || user?.userName || 'Guest';

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Hero Section */}
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
          {/* Stats Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Xe sẵn sàng"
              value={12}
              icon={Car}
              variant="success"
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Đang cho thuê"
              value={8}
              icon={Clock}
              variant="primary"
            />
            <StatCard
              title="Pin trung bình"
              value="78%"
              icon={Battery}
              variant="warning"
            />
            <StatCard
              title="Sự cố"
              value={2}
              icon={AlertCircle}
              variant="default"
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
                  onHandover={() => navigate("/handover")}
                  onUpdateStatus={() => {}}
                  onReport={() => navigate("/issues")}
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
