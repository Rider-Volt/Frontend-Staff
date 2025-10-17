import { Layout } from "@/components/Layout";
import { VehicleCard } from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter } from "lucide-react";
import { useState } from "react";

const mockVehicles = [
  { id: "1", name: "VinFast Klara S", licensePlate: "29A-123.45", status: "available" as const, batteryLevel: 95, location: "Khu A" },
  { id: "2", name: "Yadea Xmen Neo", licensePlate: "29B-678.90", status: "rented" as const, batteryLevel: 45, location: "Khu B" },
  { id: "3", name: "Pega NewTech", licensePlate: "29C-234.56", status: "booked" as const, batteryLevel: 80, location: "Khu A" },
  { id: "4", name: "VinFast Theon S", licensePlate: "29D-789.12", status: "available" as const, batteryLevel: 100, location: "Khu C" },
  { id: "5", name: "Yadea Xmen", licensePlate: "29E-345.67", status: "maintenance" as const, batteryLevel: 20, location: "Khu A" },
  { id: "6", name: "Pega Cap A+", licensePlate: "29F-901.23", status: "available" as const, batteryLevel: 88, location: "Khu B" },
];

const Vehicles = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filterVehicles = (status?: string) => {
    let filtered = mockVehicles;
    if (status) {
      filtered = filtered.filter(v => v.status === status);
    }
    if (searchQuery) {
      filtered = filtered.filter(v => 
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Quản lý xe</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý tất cả xe điện tại điểm</p>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên xe hoặc biển số..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Bộ lọc
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">Tất cả ({mockVehicles.length})</TabsTrigger>
            <TabsTrigger value="available">Sẵn sàng ({filterVehicles("available").length})</TabsTrigger>
            <TabsTrigger value="booked">Đã đặt ({filterVehicles("booked").length})</TabsTrigger>
            <TabsTrigger value="rented">Đang thuê ({filterVehicles("rented").length})</TabsTrigger>
            <TabsTrigger value="maintenance">Bảo trì ({filterVehicles("maintenance").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filterVehicles().map((vehicle) => (
                <VehicleCard key={vehicle.id} {...vehicle} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="available" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filterVehicles("available").map((vehicle) => (
                <VehicleCard key={vehicle.id} {...vehicle} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="booked" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filterVehicles("booked").map((vehicle) => (
                <VehicleCard key={vehicle.id} {...vehicle} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rented" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filterVehicles("rented").map((vehicle) => (
                <VehicleCard key={vehicle.id} {...vehicle} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filterVehicles("maintenance").map((vehicle) => (
                <VehicleCard key={vehicle.id} {...vehicle} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Vehicles;
