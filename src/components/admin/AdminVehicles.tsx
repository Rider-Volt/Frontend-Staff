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
import { getAllStations, Station } from '../../services/adminservice/adminStationService';

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    code: '',
    modelId: 0,
    stationId: 0,
    currentPin: 0
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
        
        // Debug: kiểm tra licensePlate
        console.log('License plates:', data.map(v => ({ 
          id: v.vehicleId, 
          licensePlate: v.licensePlate,
          status: v.status, 
          model: v.model 
        })));
        
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

  // Tải danh sách stations từ API
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await getAllStations();
        setStations(data);
      } catch (err) {
        console.error('Error fetching stations:', err);
      }
    };

    fetchStations();
  }, []);

  // Lọc xe dựa trên từ khóa tìm kiếm và loại xe
  const filteredVehicles = vehicles.filter(vehicle => {
    // Lọc theo loại xe
    if (vehicleTypeFilter !== 'all') {
      const vehicleTypeLower = vehicle.vehicleType?.toLowerCase() || '';
      if (vehicleTypeFilter === 'car') {
        // Kiểm tra các từ khóa liên quan đến ô tô
        if (!vehicleTypeLower.includes('car') && 
            !vehicleTypeLower.includes('ô tô') && 
            !vehicleTypeLower.includes('oto') &&
            !vehicleTypeLower.includes('xe 4 bánh')) {
          return false;
        }
      } else if (vehicleTypeFilter === 'motorbike') {
        // Kiểm tra các từ khóa liên quan đến xe máy
        if (!vehicleTypeLower.includes('motor') && 
            !vehicleTypeLower.includes('xe máy') && 
            !vehicleTypeLower.includes('xemay') &&
            !vehicleTypeLower.includes('xe 2 bánh') &&
            !vehicleTypeLower.includes('bike')) {
          return false;
        }
      }
    }
    
    // Lọc theo từ khóa tìm kiếm
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
      alert('Vui lòng nhập biển sốsố xe!');
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
    if (newVehicle.currentPin < 0 || newVehicle.currentPin > 100) {
      alert('Pin level phải từ 0 đến 100!');
      return;
    }
    
    try {
      const requestData = {
        code: newVehicle.code,
        modelId: newVehicle.modelId,
        stationId: newVehicle.stationId,
        currentPin: newVehicle.currentPin
      };
      
      console.log('Creating vehicle with data:', JSON.stringify(requestData, null, 2));
      
      const createdVehicle = await createVehicle(requestData);
      let createdVehicleWithPin: Vehicle = {
        ...createdVehicle,
        currentPin: createdVehicle.currentPin ?? newVehicle.currentPin,
      } as Vehicle;

      // Nếu BE không set pin khi tạo, gọi cập nhật để đảm bảo lưu pin
      if ((createdVehicle.currentPin ?? 0) !== (newVehicle.currentPin ?? 0)) {
        try {
          const patched = await updateVehicle(createdVehicle.vehicleId, {
            currentPin: newVehicle.currentPin,
          });
          createdVehicleWithPin = { ...patched } as Vehicle;
        } catch (e) {
          console.warn('Auto-set currentPin after create failed:', e);
        }
      }

      setVehicles([...vehicles, createdVehicleWithPin]);
      setNewVehicle({ code: '', modelId: 0, stationId: 0, currentPin: 0 });
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
      alert('Vui lòng nhập biển số xe!');
      return;
    }
    if (!editingVehicle.stationId || editingVehicle.stationId <= 0) {
      alert('Vui lòng nhập ID trạm hợp lệ!');
      return;
    }
    if (editingVehicle.currentPin !== undefined && (editingVehicle.currentPin < 0 || editingVehicle.currentPin > 100)) {
      alert('Pin level phải từ 0 đến 100!');
      return;
    }
    
    try {
      const updateData: UpdateVehicleRequest = {
        code: editingVehicle.licensePlate,
        stationId: editingVehicle.stationId,
        currentPin: editingVehicle.currentPin
      };
      
      console.log('Updating vehicle ID:', editingVehicle.vehicleId);
      console.log('Update data:', JSON.stringify(updateData, null, 2));
      
      const updatedVehicle = await updateVehicle(editingVehicle.vehicleId, updateData);
      
      console.log('Updated vehicle response:', updatedVehicle);
      
      // Cập nhật pin ở local vì API có thể không trả về pin
      const updatedVehicleWithPin = { 
        ...updatedVehicle, 
        currentPin: editingVehicle.currentPin 
      };
      setVehicles(vehicles.map(v => v.vehicleId === editingVehicle.vehicleId ? updatedVehicleWithPin : v));
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
        
        <div className="flex items-center space-x-4">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Thêm Xe Mới
              </Button>
            </DialogTrigger>
          <Select value={vehicleTypeFilter} onValueChange={setVehicleTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo loại xe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại xe</SelectItem>
              <SelectItem value="car">Ô tô</SelectItem>
              <SelectItem value="motorbike">Xe máy</SelectItem>
            </SelectContent>
          </Select>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Thêm Xe Mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">biển số xe <span className="text-red-500">*</span></label>
                  <Input 
                    placeholder="VD: VEH001" 
                    value={newVehicle.code || ''}
                    onChange={(e) => setNewVehicle({...newVehicle, code: e.target.value})}
                    required
                  />
                </div>
              <div>
                <label className="text-sm font-medium">Model <span className="text-red-500">*</span></label>
                <Select 
                  value={newVehicle.modelId > 0 ? newVehicle.modelId.toString() : ''}
                  onValueChange={(value) => setNewVehicle({...newVehicle, modelId: parseInt(value) || 0})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn model xe" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.length === 0 ? (
                      <SelectItem value="" disabled>Đang tải models...</SelectItem>
                    ) : (
                      models.map((model) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.name} ({model.type})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Chọn model xe từ danh sách</p>
              </div>
              <div>
                <label className="text-sm font-medium">Pin Level (%)</label>
                <Input 
                  type="number"
                  placeholder="Nhập pin level (0-100)" 
                  value={newVehicle.currentPin || 0}
                  onChange={(e) => setNewVehicle({...newVehicle, currentPin: Math.max(0, Math.min(100, parseInt(e.target.value) || 0))})}
                  min="0"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">Pin level từ 0 đến 100%</p>
              </div>
              <div>
                <label className="text-sm font-medium">Trạm <span className="text-red-500">*</span></label>
                <Select 
                  value={newVehicle.stationId > 0 ? newVehicle.stationId.toString() : ''}
                  onValueChange={(value) => setNewVehicle({...newVehicle, stationId: parseInt(value) || 0})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạm" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.length === 0 ? (
                      <SelectItem value="" disabled>Đang tải trạm...</SelectItem>
                    ) : (
                      stations.map((station) => (
                        <SelectItem key={station.id} value={station.id.toString()}>
                          {station.name} - {station.address}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Chọn trạm từ danh sách</p>
              </div>
              {/* Bỏ các trường Giá/ngày và URL Ảnh theo yêu cầu */}
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
        </div>
      </div>

         {/* Dialog Xem Chi Tiết Xe */}
         <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
           <DialogContent className="max-w-xl">
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
           <DialogContent className="max-w-lg">
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
                     placeholder="Nhập biển số xe" 
                     value={editingVehicle.licensePlate || ''}
                     onChange={(e) => setEditingVehicle({...editingVehicle, licensePlate: e.target.value})}
                     required
                   />
                   <p className="text-xs text-gray-500 mt-1">Mã xe (biển số)</p>
                 </div>
                {/* Model đã bỏ khỏi form chỉnh sửa theo yêu cầu BE */}
                <div>
                  <label className="text-sm font-medium">Trạm <span className="text-red-500">*</span></label>
                  <Select 
                    value={editingVehicle.stationId && editingVehicle.stationId > 0 ? editingVehicle.stationId.toString() : ''}
                    onValueChange={(value) => setEditingVehicle({...editingVehicle, stationId: parseInt(value) || 0})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạm" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.length === 0 ? (
                        <SelectItem value="" disabled>Đang tải trạm...</SelectItem>
                      ) : (
                        stations.map((station) => (
                          <SelectItem key={station.id} value={station.id.toString()}>
                            {station.name} - {station.address}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Chọn trạm từ danh sách</p>
                </div>
                {/* Giá/ngày và URL ảnh đã bỏ khỏi form chỉnh sửa theo yêu cầu BE */}
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
                <TableHead className="text-right">Hành động</TableHead>
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
                          <DropdownMenuItem onSelect={() => {
                              setViewingVehicle(vehicle);
                              setIsViewDialogOpen(true);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => {
                              setEditingVehicle(vehicle);
                              setIsEditDialogOpen(true);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                          <DropdownMenuItem 
                              onSelect={() => handleDeleteVehicle(vehicle.vehicleId)}
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
