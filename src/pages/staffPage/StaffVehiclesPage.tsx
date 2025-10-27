import { useMemo, useState, useEffect } from "react";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Car, RefreshCw, AlertCircle, Search, Plus, Battery, MapPin, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getStaffVehicles, 
  getStaffVehiclesByStatus, 
  updateVehicleStatus, 
  type StaffVehicle,
  getVehicleStatusInfo 
} from "@/services/staffservice/staffVehicleService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formatCurrency = (v: number) => `${v.toLocaleString()}đ/ngày`;

const StaffVehiclesPage = () => {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<StaffVehicle[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      let data: StaffVehicle[];
      if (statusFilter === "all") {
        data = await getStaffVehicles();
      } else {
        data = await getStaffVehiclesByStatus(statusFilter);
      }
      setVehicles(data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tải danh sách xe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [statusFilter]);

  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(v => 
      v.vehicleId.toString().includes(q) ||
      v.model?.toLowerCase().includes(q) ||
      v.licensePlate?.toLowerCase().includes(q) ||
      v.stationName?.toLowerCase().includes(q) ||
      v.vehicleType?.toLowerCase().includes(q)
    );
  }, [vehicles, search]);

  const handleStatusUpdate = async (vehicleId: number, newStatus: string) => {
    setUpdatingIds(prev => new Set(prev).add(vehicleId));
    try {
      await updateVehicleStatus(vehicleId, newStatus);
      toast({
        title: "Thành công",
        description: "Cập nhật trạng thái xe thành công",
      });
      await fetchVehicles();
    } catch (error) {
      console.error("Error updating vehicle status:", error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật trạng thái xe",
        variant: "destructive",
      });
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(vehicleId);
        return newSet;
      });
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const total = vehicles.length;
    const available = vehicles.filter(v => v.status === 'AVAILABLE').length;
    const rented = vehicles.filter(v => v.status === 'RENTED').length;
    const maintenance = vehicles.filter(v => v.status === 'MAINTENANCE').length;
    const availablePercent = total > 0 ? Math.round((available / total) * 100) : 0;
    
    return { total, available, rented, maintenance, availablePercent };
  }, [vehicles]);

  if (loading && vehicles.length === 0) {
    return (
      <StaffLayout>
        <div className="p-6 md:p-8 flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-600">Đang tải danh sách xe...</p>
          </div>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <div className="p-6 md:p-8 space-y-6">
        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm kiếm xe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm hover:shadow-md transition">
            <CardContent className="p-6 relative">
              <Car className="absolute top-4 right-4 h-8 w-8 text-gray-400" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Tổng Xe</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">Tổng số xe trong trạm</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition">
            <CardContent className="p-6 relative">
              <Battery className="absolute top-4 right-4 h-8 w-8 text-green-500" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Sẵn Sàng</p>
                <p className="text-3xl font-bold text-gray-900">{stats.available}</p>
                <p className="text-xs text-gray-500">{stats.availablePercent}% tổng xe</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition">
            <CardContent className="p-6 relative">
              <MapPin className="absolute top-4 right-4 h-8 w-8 text-blue-500" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Đang Thuê</p>
                <p className="text-3xl font-bold text-gray-900">{stats.rented}</p>
                <p className="text-xs text-gray-500">Đang được sử dụng</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition">
            <CardContent className="p-6 relative">
              <Wrench className="absolute top-4 right-4 h-8 w-8 text-orange-500" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Bảo Trì</p>
                <p className="text-3xl font-bold text-gray-900">{stats.maintenance}</p>
                <p className="text-xs text-gray-500">Cần chú ý</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle List */}
        <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-800">Danh Sách Xe Điện</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="AVAILABLE">Sẵn sàng</SelectItem>
                    <SelectItem value="RENTED">Đang thuê</SelectItem>
                    <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchVehicles}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Làm mới
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>

            <div className="overflow-x-auto">
              {filteredVehicles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">Không có xe nào</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ảnh</TableHead>
                      <TableHead>Mã xe</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Loại xe</TableHead>
                      <TableHead>Biển số</TableHead>
                      <TableHead>Trạm</TableHead>
                      <TableHead>Giá/ngày</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVehicles.map(vehicle => {
                      const statusInfo = getVehicleStatusInfo(vehicle.status);
                      const isUpdating = updatingIds.has(vehicle.vehicleId);
                      
                      return (
                        <TableRow key={vehicle.vehicleId} className="hover:bg-gray-50">
                          <TableCell>
                            {vehicle.imageUrl ? (
                              <img
                                src={vehicle.imageUrl}
                                alt={vehicle.model}
                                className="w-16 h-12 object-cover rounded border"
                                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                              />
                            ) : (
                              <div className="w-16 h-12 bg-gray-200 rounded border flex items-center justify-center">
                                <Car className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">#{vehicle.vehicleId}</TableCell>
                          <TableCell>{vehicle.model}</TableCell>
                          <TableCell className="text-gray-600 capitalize">{vehicle.vehicleType || 'N/A'}</TableCell>
                          <TableCell>{vehicle.licensePlate}</TableCell>
                          <TableCell className="text-sm">{vehicle.stationName}</TableCell>
                          <TableCell className="font-semibold text-green-700">{formatCurrency(vehicle.pricePerDay)}</TableCell>
                          <TableCell>
                            <Badge className={statusInfo.className}>
                              {statusInfo.text}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Select 
                                value={vehicle.status} 
                                onValueChange={(value) => handleStatusUpdate(vehicle.vehicleId, value)}
                                disabled={isUpdating}
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="AVAILABLE">Sẵn sàng</SelectItem>
                                  <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </StaffLayout>
  );
};

export default StaffVehiclesPage;
