import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Car, 
  Edit, 
  Trash2, 
  Battery,
  MapPin,
  Eye,
  Wrench,
  Loader2,
  AlertCircle,
  Pin
} from 'lucide-react';
import { 
  getAllVehicles, 
  deleteVehicle, 
  createVehicle, 
  updateVehicle,
  Vehicle,
  CreateVehicleRequest,
  UpdateVehicleRequest
} from '../../services/adminservice/adminVehicleService';
import { getAllModels, Model } from '../../services/adminservice/adminModelService';

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    code: '',
    modelId: 0,
    stationId: 0,
    pricePerDay: 0,
    photoUrl: ''
  });

  console.log('AdminVehicles component rendering...');

  // Tải danh sách xe từ API
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching vehicles...');
        const data = await getAllVehicles();
        console.log('Vehicles fetched:', data);
        console.log('First vehicle structure:', data[0]);
        console.log('All vehicle fields:', data[0] ? Object.keys(data[0]) : 'No data');
        
        // Debug: kiểm tra status
        console.log('Vehicle statuses:', data.map(v => ({ id: v.vehicleId, status: v.status, model: v.model })));
        
        // Đếm theo status
        const statusCounts = data.reduce((acc, v) => {
          const status = v.status?.toUpperCase();
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log('Status counts:', statusCounts);
        
        setVehicles(data);
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách xe');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Tải danh sách models từ API
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await getAllModels();
        setModels(data);
      } catch (err) {
        console.error('Error fetching models:', err);
      }
    };

    fetchModels();
  }, []);

  // Lọc xe dựa trên từ khóa tìm kiếm
  const filteredVehicles = vehicles.filter(vehicle => {
    // Nếu search term rỗng, hiển thị tất cả xe
    if (!searchTerm.trim()) {
      return true;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const plateMatch = vehicle.licensePlate?.toLowerCase().includes(searchLower) || false;
    const modelMatch = vehicle.model?.toLowerCase().includes(searchLower) || false;
    const typeMatch = vehicle.vehicleType?.toLowerCase().includes(searchLower) || false;
    const stationMatch = vehicle.stationName?.toLowerCase().includes(searchLower) || false;
    
    return plateMatch || modelMatch || typeMatch || stationMatch;
  });
  
  console.log('Total vehicles:', vehicles.length);
  console.log('Filtered vehicles:', filteredVehicles.length);
  console.log('Search term:', searchTerm);

  // Xóa xe
  const handleDeleteVehicle = async (vehicleId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa xe này?')) return;
    
    try {
      await deleteVehicle(vehicleId);
      setVehicles(vehicles.filter(vehicle => vehicle.vehicleId !== vehicleId));
      alert('Xóa xe thành công!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi xóa xe');
    }
  };

  // Thêm xe mới
  const handleAddVehicle = async () => {
    // Validation - Kiểm tra dữ liệu đầu vào
    if (!newVehicle.code.trim()) {
      alert('Vui lòng nhập code xe!');
      return;
    }
    if (newVehicle.modelId <= 0) {
      alert('Vui lòng chọn model xe!');
      return;
    }
    if (newVehicle.stationId <= 0) {
      alert('Vui lòng chọn trạm xe!');
      return;
    }
    if (newVehicle.pricePerDay < 0) {
      alert('Giá thuê/ngày không được âm!');
      return;
    }
    
    try {
      const requestData = {
        code: newVehicle.code,
        modelId: newVehicle.modelId,
        stationId: newVehicle.stationId,
        pricePerDay: newVehicle.pricePerDay,
        photoUrl: newVehicle.photoUrl
      };
      
      console.log('Creating vehicle with data:', JSON.stringify(requestData, null, 2));
      
      const createdVehicle = await createVehicle(requestData);
      setVehicles([...vehicles, createdVehicle]);
      setNewVehicle({ code: '', modelId: 0, stationId: 0, pricePerDay: 0, photoUrl: '' });
      setIsAddDialogOpen(false);
      alert('Thêm xe thành công!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi thêm xe');
    }
  };

  // Cập nhật thông tin xe
  const handleUpdateVehicle = async () => {
    if (!editingVehicle) return;
    
    // Validation - Kiểm tra dữ liệu đầu vào
    if (!editingVehicle.licensePlate?.trim()) {
      alert('Vui lòng nhập code xe!');
      return;
    }
    if (!editingVehicle.modelId || editingVehicle.modelId <= 0) {
      alert('Vui lòng nhập ID model hợp lệ!');
      return;
    }
    if (!editingVehicle.stationId || editingVehicle.stationId <= 0) {
      alert('Vui lòng nhập ID trạm hợp lệ!');
      return;
    }
    if (editingVehicle.pricePerDay < 0) {
      alert('Giá thuê/ngày không được âm!');
      return;
    }
    if (editingVehicle.currentPin !== undefined && (editingVehicle.currentPin < 0 || editingVehicle.currentPin > 100)) {
      alert('Pin level phải từ 0 đến 100!');
      return;
    }
    
    try {
      const updateData: UpdateVehicleRequest = {
        code: editingVehicle.licensePlate,
        modelId: editingVehicle.modelId,
        stationId: editingVehicle.stationId,
        pricePerDay: editingVehicle.pricePerDay,
        photoUrl: editingVehicle.imageUrl || '',
        status: editingVehicle.status,
        currentPin: editingVehicle.currentPin
      };
      
      console.log('Updating vehicle ID:', editingVehicle.vehicleId);
      console.log('Update data:', JSON.stringify(updateData, null, 2));
      
      const updatedVehicle = await updateVehicle(editingVehicle.vehicleId, updateData);
      
      console.log('Updated vehicle response:', updatedVehicle);
      
      // Cập nhật trạng thái và pin ở local vì API có thể không trả về status/pin
      const updatedVehicleWithStatus = { 
        ...updatedVehicle, 
        status: editingVehicle.status,
        currentPin: editingVehicle.currentPin 
      };
      setVehicles(vehicles.map(v => v.vehicleId === editingVehicle.vehicleId ? updatedVehicleWithStatus : v));
      setIsEditDialogOpen(false);
      setEditingVehicle(null);
      alert('Cập nhật xe thành công!');
    } catch (err) {
      console.error('Error updating vehicle:', err);
      alert(err instanceof Error ? err.message : 'Lỗi khi cập nhật xe');
    }
  };


  // Lấy loại badge cho trạng thái xe
  const getStatusBadge = (status: string) => {
    console.log('Status from API:', status, 'Type:', typeof status, 'Length:', status?.length);
    
    switch (status?.toUpperCase()) {
      case 'AVAILABLE':
        return { variant: 'default' as const, className: 'bg-green-100 text-green-800', text: 'Sẵn sàng' };
      case 'RENTED':
        return { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800', text: 'Đang thuê' };
      case 'MAINTENANCE':
        return { variant: 'destructive' as const, className: 'bg-yellow-100 text-yellow-800', text: 'Bảo trì' };
      case 'BROKEN':
        return { variant: 'destructive' as const, className: 'bg-red-100 text-red-800', text: 'Hỏng' };
      default:
        console.log('Unknown status:', status, 'Raw value:', JSON.stringify(status));
        return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800', text: status || 'Không xác định' };
    }
  };

  try {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Đang tải danh sách xe...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <span className="ml-2 text-red-500">{error}</span>
        </div>
      );
    }

    return (
    <div className="space-y-6">
      {/* Tìm kiếm và Thêm Xe */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm xe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Thêm Xe Mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Thêm Xe Mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Code xe <span className="text-red-500">*</span></label>
                  <Input 
                    placeholder="VD: VEH001" 
                    value={newVehicle.code || ''}
                    onChange={(e) => setNewVehicle({...newVehicle, code: e.target.value})}
                    required
                  />
                </div>
              <div>
                <label className="text-sm font-medium">ID Model <span className="text-red-500">*</span></label>
                <Input 
                  type="number"
                  placeholder="Nhập ID model" 
                  value={newVehicle.modelId || ''}
                  onChange={(e) => setNewVehicle({...newVehicle, modelId: parseInt(e.target.value) || 0})}
                  min="1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Nhập ID của model xe</p>
              </div>
              <div>
                <label className="text-sm font-medium">ID Trạm <span className="text-red-500">*</span></label>
                <Input 
                  type="number"
                  placeholder="Nhập ID trạm (VD: 1, 2, 3)" 
                  value={newVehicle.stationId || ''}
                  onChange={(e) => setNewVehicle({...newVehicle, stationId: parseInt(e.target.value) || 0})}
                  min="1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Nhập ID trạm để gán xe</p>
              </div>
              <div>
                <label className="text-sm font-medium">Giá/ngày (VNĐ) <span className="text-red-500">*</span></label>
                <Input 
                  type="number"
                  placeholder="Nhập giá thuê/ngày (VD: 100000)" 
                  value={newVehicle.pricePerDay || ''}
                  onChange={(e) => setNewVehicle({...newVehicle, pricePerDay: parseInt(e.target.value) || 0})}
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Giá thuê/ngày không được âm</p>
              </div>
              <div>
                <label className="text-sm font-medium">URL Ảnh</label>
                <Input 
                  placeholder="Nhập URL ảnh xe (tùy chọn)" 
                  value={newVehicle.photoUrl || ''}
                  onChange={(e) => setNewVehicle({...newVehicle, photoUrl: e.target.value})}
                />
                <p className="text-xs text-gray-500 mt-1">Có thể để trống</p>
                
                {/* Preview ảnh */}
                {newVehicle.photoUrl && (
                  <div className="mt-2 flex justify-center">
                    <img 
                      src={newVehicle.photoUrl} 
                      alt="Preview"
                      className="h-32 w-48 object-cover rounded-lg border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleAddVehicle}>
                  Thêm Xe
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

         {/* Dialog Xem Chi Tiết Xe */}
         <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
           <DialogContent className="max-w-lg">
             <DialogHeader>
               <DialogTitle>Chi Tiết Xe</DialogTitle>
             </DialogHeader>
             {viewingVehicle && (
               <div className="space-y-4">
                 {/* Hiển thị ảnh xe */}
                 {viewingVehicle.imageUrl && (
                   <div className="flex justify-center">
                     <img 
                       src={viewingVehicle.imageUrl} 
                       alt={viewingVehicle.model || 'Vehicle'}
                       className="h-48 w-64 object-cover rounded-lg border"
                       onError={(e) => {
                         e.currentTarget.style.display = 'none';
                       }}
                     />
                   </div>
                 )}
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-sm font-medium text-gray-500">ID Xe</label>
                     <p className="text-sm">{viewingVehicle.vehicleId}</p>
                   </div>
                   <div>
                     <label className="text-sm font-medium text-gray-500">Biển số</label>
                     <p className="text-sm">{viewingVehicle.licensePlate || 'Chưa có'}</p>
                   </div>
                 </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Model</label>
                    <p className="text-sm">{viewingVehicle.model || 'Chưa có'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Loại xe</label>
                    <p className="text-sm">{viewingVehicle.vehicleType || 'Chưa có'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                    <div className="mt-1">
                      <Badge variant={getStatusBadge(viewingVehicle.status || 'AVAILABLE').variant} 
                             className={getStatusBadge(viewingVehicle.status || 'AVAILABLE').className}>
                        {getStatusBadge(viewingVehicle.status || 'AVAILABLE').text}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Giá/ngày</label>
                    <p className="text-sm">{viewingVehicle.pricePerDay ? `${viewingVehicle.pricePerDay.toLocaleString()} VNĐ` : 'Chưa có'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạm</label>
                  <p className="text-sm">{viewingVehicle.stationName || 'Chưa gán trạm'}</p>
                </div>
                {viewingVehicle.stationAddress && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Địa chỉ trạm</label>
                    <p className="text-sm">{viewingVehicle.stationAddress}</p>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    Đóng
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

         {/* Dialog Chỉnh Sửa Xe */}
         <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
           <DialogContent className="max-w-md">
             <DialogHeader>
               <DialogTitle>Chỉnh Sửa Xe</DialogTitle>
             </DialogHeader>
             {editingVehicle && (
               <div className="space-y-4">
                 {/* Hiển thị ảnh xe hiện tại */}
                 {editingVehicle.imageUrl && (
                   <div className="flex justify-center">
                     <img 
                       src={editingVehicle.imageUrl} 
                       alt={editingVehicle.model || 'Vehicle'}
                       className="h-32 w-48 object-cover rounded-lg border"
                       onError={(e) => {
                         e.currentTarget.style.display = 'none';
                       }}
                     />
                   </div>
                 )}
                 
                 <div>
                   <label className="text-sm font-medium">Code <span className="text-red-500">*</span></label>
                   <Input 
                     placeholder="Nhập code xe" 
                     value={editingVehicle.licensePlate || ''}
                     onChange={(e) => setEditingVehicle({...editingVehicle, licensePlate: e.target.value})}
                     required
                   />
                   <p className="text-xs text-gray-500 mt-1">Mã xe (biển số)</p>
                 </div>
                <div>
                  <label className="text-sm font-medium">ID Model <span className="text-red-500">*</span></label>
                  <Input 
                    type="number"
                    placeholder="Nhập ID model" 
                    value={editingVehicle.modelId || ''}
                    onChange={(e) => setEditingVehicle({...editingVehicle, modelId: parseInt(e.target.value) || 0})}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">ID Trạm <span className="text-red-500">*</span></label>
                  <Input 
                    type="number"
                    placeholder="Nhập ID trạm" 
                    value={editingVehicle.stationId || ''}
                    onChange={(e) => setEditingVehicle({...editingVehicle, stationId: parseInt(e.target.value) || 0})}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Giá/ngày (VNĐ)</label>
                  <Input 
                    type="number"
                    placeholder="Nhập giá thuê/ngày" 
                    value={editingVehicle.pricePerDay || ''}
                    onChange={(e) => setEditingVehicle({...editingVehicle, pricePerDay: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">URL Ảnh</label>
                  <Input 
                    placeholder="Nhập URL ảnh xe" 
                    value={editingVehicle.imageUrl || ''}
                    onChange={(e) => setEditingVehicle({...editingVehicle, imageUrl: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Pin Level (%)</label>
                  <Input 
                    type="number"
                    placeholder="Nhập pin level (0-100)" 
                    value={editingVehicle.currentPin ?? ''}
                    onChange={(e) => setEditingVehicle({...editingVehicle, currentPin: parseInt(e.target.value) || 0})}
                    min="0"
                    max="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Pin level từ 0 đến 100%</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Trạng thái</label>
                  <Select 
                    value={editingVehicle.status || 'AVAILABLE'} 
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
                  <Button onClick={handleUpdateVehicle}>
                    Cập nhật
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Thẻ Thống Kê */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Xe</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              +3 từ tháng trước
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sẵn Sàng</CardTitle>
            <Battery className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const availableCount = vehicles.filter(v => v.status?.toUpperCase() === 'AVAILABLE').length;
                console.log('Available vehicles count:', availableCount);
                console.log('Available vehicles:', vehicles.filter(v => v.status?.toUpperCase() === 'AVAILABLE'));
                return availableCount;
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              {vehicles.length > 0 ? Math.round((vehicles.filter(v => v.status?.toUpperCase() === 'AVAILABLE').length / vehicles.length) * 100) : 0}% tổng xe
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang Thuê</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const rentedCount = vehicles.filter(v => v.status?.toUpperCase() === 'RENTED').length;
                console.log('Rented vehicles count:', rentedCount);
                console.log('Rented vehicles:', vehicles.filter(v => v.status?.toUpperCase() === 'RENTED'));
                return rentedCount;
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              Đang được sử dụng
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bảo Trì</CardTitle>
            <Wrench className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const maintenanceCount = vehicles.filter(v => v.status?.toUpperCase() === 'MAINTENANCE').length;
                console.log('Maintenance vehicles count:', maintenanceCount);
                console.log('Maintenance vehicles:', vehicles.filter(v => v.status?.toUpperCase() === 'MAINTENANCE'));
                return maintenanceCount;
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              Cần chú ý
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bảng Danh Sách Xe */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Xe</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ảnh</TableHead>
                <TableHead>Mã xe</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Loại Xe</TableHead>
                <TableHead>Biển Số</TableHead>
                <TableHead>Pin (%)</TableHead>
                <TableHead>Trạm</TableHead>
                <TableHead>Giá/ngày</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    Không có xe nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle) => {
                  const statusBadge = getStatusBadge(vehicle.status || 'available');
                  return (
                    <TableRow key={vehicle.vehicleId}>
                      <TableCell>
                        {vehicle.imageUrl && (
                          <img 
                            src={vehicle.imageUrl} 
                            alt={vehicle.model || 'Vehicle'}
                            className="h-12 w-16 object-cover rounded"
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">#{vehicle.vehicleId}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {vehicle.model || 'Chưa có model'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {vehicle.vehicleType || 'Chưa có loại'}
                      </TableCell>
                      <TableCell>{vehicle.licensePlate || 'Chưa có'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Pin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{vehicle.currentPin ?? 'N/A'}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {vehicle.stationName || 'Chưa gán trạm'}
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {vehicle.pricePerDay ? `${vehicle.pricePerDay.toLocaleString('vi-VN')}đ/ngày` : 'Chưa có'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant} className={statusBadge.className}>
                          {statusBadge.text}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setViewingVehicle(vehicle);
                              setIsViewDialogOpen(true);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setEditingVehicle(vehicle);
                              setIsEditDialogOpen(true);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteVehicle(vehicle.vehicleId)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
    );
  } catch (err) {
    console.error('Error in AdminVehicles component:', err);
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-500">
          Lỗi render component: {err instanceof Error ? err.message : 'Unknown error'}
        </span>
      </div>
    );
  }
};

export default AdminVehicles;
