import { useMemo, useState, useEffect } from "react";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Car, RefreshCw, AlertCircle, Search, Battery, MapPin, Wrench, Edit, Pin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getStaffVehicles, 
  getStaffVehiclesByStatus, 
  updateVehicleStatus, 
  type StaffVehicle,
  getVehicleStatusInfo 
} from "@/services/staffservice/staffVehicleService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const formatCurrency = (v: number) => `${v.toLocaleString()}đ/ngày`;

const StaffVehiclesPage = () => {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<StaffVehicle[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<StaffVehicle | null>(null);

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

  const handleEditVehicle = (vehicle: StaffVehicle) => {
    setEditingVehicle(vehicle);
    setIsEditDialogOpen(true);
  };

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
                      <TableHead>Pin (%)</TableHead>
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
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Pin className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{vehicle.currentPin ?? 'N/A'}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{vehicle.stationName}</TableCell>
                          <TableCell className="font-semibold text-green-700">{formatCurrency(vehicle.pricePerDay)}</TableCell>
                          <TableCell>
                            <Badge className={statusInfo.className}>
                              {statusInfo.text}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditVehicle(vehicle)}
                              disabled={isUpdating}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Cập nhật trạng thái
                            </Button>
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

        {/* Dialog Cập Nhật Trạng Thái Xe */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Cập Nhật Trạng Thái Xe</DialogTitle>
            </DialogHeader>
            {editingVehicle && (
              <div className="space-y-4">
                {/* Hiển thị thông tin xe */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">Xe #{editingVehicle.vehicleId}</p>
                  <p className="font-medium">{editingVehicle.model}</p>
                  <p className="text-sm text-gray-500">{editingVehicle.licensePlate}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Trạng thái hiện tại</label>
                  <div className="mt-1">
                    <Badge className={getVehicleStatusInfo(editingVehicle.status).className}>
                      {getVehicleStatusInfo(editingVehicle.status).text}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Chọn trạng thái mới <span className="text-red-500">*</span></label>
                  <Select 
                    value={editingVehicle.status} 
                    onValueChange={(value) => setEditingVehicle({...editingVehicle, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Sẵn sàng</SelectItem>
                      <SelectItem value="RENTED">Đang thuê</SelectItem>
                      <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={() => {
                    // Cập nhật trạng thái xe
                    handleStatusUpdate(editingVehicle.vehicleId, editingVehicle.status);
                    setIsEditDialogOpen(false);
                  }}>
                    Cập nhật
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </StaffLayout>
  );
};

export default StaffVehiclesPage;
