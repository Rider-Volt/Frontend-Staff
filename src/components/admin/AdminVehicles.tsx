import React, { useState } from 'react';
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
  Wrench
} from 'lucide-react';

// Mock data cho vehicles
const mockVehicles = [
  {
    id: "EV001",
    name: "VinFast Klara S",
    model: "Klara S 2024",
    batteryLevel: 95,
    status: "available",
    location: "Trạm HCM",
    lastMaintenance: "2024-01-15",
    totalRides: 156
  },
  {
    id: "EV002", 
    name: "Yadea Xmen Neo",
    model: "Xmen Neo Pro",
    batteryLevel: 45,
    status: "rented",
    location: "Đang cho thuê",
    lastMaintenance: "2024-01-10",
    totalRides: 89
  },
  {
    id: "EV003",
    name: "Pega NewTech",
    model: "NewTech Max",
    batteryLevel: 80,
    status: "maintenance",
    location: "Trạm HCM",
    lastMaintenance: "2024-01-20",
    totalRides: 203
  },
  {
    id: "EV004",
    name: "VinFast Klara S",
    model: "Klara S 2024",
    batteryLevel: 100,
    status: "available",
    location: "Trạm HN",
    lastMaintenance: "2024-01-18",
    totalRides: 67
  }
];

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Delete vehicle
  const deleteVehicle = (vehicleId: string) => {
    setVehicles(vehicles.filter(vehicle => vehicle.id !== vehicleId));
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return { variant: 'default' as const, className: 'bg-green-100 text-green-800', text: 'Sẵn sàng' };
      case 'rented':
        return { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800', text: 'Đang thuê' };
      case 'maintenance':
        return { variant: 'destructive' as const, className: 'bg-yellow-100 text-yellow-800', text: 'Bảo trì' };
      case 'broken':
        return { variant: 'destructive' as const, className: 'bg-red-100 text-red-800', text: 'Hỏng' };
      default:
        return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800', text: 'Không xác định' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Add Vehicle */}
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
                <label className="text-sm font-medium">ID Xe</label>
                <Input placeholder="Ví dụ: EV005" />
              </div>
              <div>
                <label className="text-sm font-medium">Tên xe</label>
                <Input placeholder="Nhập tên xe" />
              </div>
              <div>
                <label className="text-sm font-medium">Model</label>
                <Input placeholder="Nhập model" />
              </div>
              <div>
                <label className="text-sm font-medium">Trạm</label>
                <Input placeholder="Chọn trạm" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Thêm Xe
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
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
              {vehicles.filter(v => v.status === 'available').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((vehicles.filter(v => v.status === 'available').length / vehicles.length) * 100)}% tổng xe
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
              {vehicles.filter(v => v.status === 'rented').length}
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
              {vehicles.filter(v => v.status === 'maintenance').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Cần chú ý
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Xe</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên Xe</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Pin</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Vị Trí</TableHead>
                <TableHead>Lần Thuê</TableHead>
                <TableHead className="text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => {
                const statusBadge = getStatusBadge(vehicle.status);
                return (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.id}</TableCell>
                    <TableCell>{vehicle.name}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {vehicle.model}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Battery className="h-4 w-4" />
                        <span className={`text-sm font-medium ${
                          vehicle.batteryLevel > 50 ? 'text-green-600' : 
                          vehicle.batteryLevel > 20 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {vehicle.batteryLevel}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadge.variant} className={statusBadge.className}>
                        {statusBadge.text}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {vehicle.location}
                    </TableCell>
                    <TableCell className="text-sm">
                      {vehicle.totalRides} lần
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Wrench className="mr-2 h-4 w-4" />
                            Bảo trì
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteVehicle(vehicle.id)}
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
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVehicles;
