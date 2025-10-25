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
  Users, 
  Edit, 
  Trash2, 
  UserCheck,
  UserX,
  Eye,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

// Mock data cho employees
const mockEmployees = [
  {
    id: "EMP001",
    name: "Nguyễn Văn An",
    email: "an.nguyen@evstation.com",
    phone: "0901234567",
    position: "Quản lý trạm",
    station: "Trạm HCM",
    status: "active",
    joinDate: "2023-01-15",
    salary: "15,000,000 VND"
  },
  {
    id: "EMP002",
    name: "Trần Thị Bình",
    email: "binh.tran@evstation.com",
    phone: "0901234568",
    position: "Nhân viên giao xe",
    station: "Trạm HCM",
    status: "active",
    joinDate: "2023-03-20",
    salary: "8,000,000 VND"
  },
  {
    id: "EMP003",
    name: "Lê Văn Cường",
    email: "cuong.le@evstation.com",
    phone: "0901234569",
    position: "Kỹ thuật viên",
    station: "Trạm HN",
    status: "inactive",
    joinDate: "2022-11-10",
    salary: "12,000,000 VND"
  },
  {
    id: "EMP004",
    name: "Phạm Thị Dung",
    email: "dung.pham@evstation.com",
    phone: "0901234570",
    position: "Nhân viên thu ngân",
    station: "Trạm HN",
    status: "active",
    joinDate: "2023-05-12",
    salary: "7,500,000 VND"
  }
];

const AdminEmployees = () => {
  const [employees, setEmployees] = useState(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee =>
    employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Delete employee
  const deleteEmployee = (employeeId: string) => {
    setEmployees(employees.filter(employee => employee.id !== employeeId));
  };

  // Toggle employee status
  const toggleEmployeeStatus = (employeeId: string) => {
    setEmployees(employees.map(employee => 
      employee.id === employeeId 
        ? { ...employee, status: employee.status === 'active' ? 'inactive' : 'active' }
        : employee
    ));
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { variant: 'default' as const, className: 'bg-green-100 text-green-800', text: 'Hoạt động' };
      case 'inactive':
        return { variant: 'secondary' as const, className: 'bg-red-100 text-red-800', text: 'Tạm nghỉ' };
      case 'suspended':
        return { variant: 'destructive' as const, className: 'bg-yellow-100 text-yellow-800', text: 'Tạm đình chỉ' };
      default:
        return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800', text: 'Không xác định' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Add Employee */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm nhân viên..."
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
              Thêm Nhân Viên Mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Thêm Nhân Viên Mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">ID Nhân viên</label>
                <Input placeholder="Ví dụ: EMP005" />
              </div>
              <div>
                <label className="text-sm font-medium">Họ và tên</label>
                <Input placeholder="Nhập họ và tên" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input placeholder="email@evstation.com" />
              </div>
              <div>
                <label className="text-sm font-medium">Số điện thoại</label>
                <Input placeholder="0901234567" />
              </div>
              <div>
                <label className="text-sm font-medium">Vị trí</label>
                <Input placeholder="Nhập vị trí công việc" />
              </div>
              <div>
                <label className="text-sm font-medium">Trạm</label>
                <Input placeholder="Chọn trạm" />
              </div>
              <div>
                <label className="text-sm font-medium">Lương</label>
                <Input placeholder="Ví dụ: 8,000,000 VND" />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Thêm Nhân Viên
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
            <CardTitle className="text-sm font-medium">Tổng Nhân Viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 từ tháng trước
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang Hoạt Động</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter(e => e.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((employees.filter(e => e.status === 'active').length / employees.length) * 100)}% tổng nhân viên
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tạm Nghỉ</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter(e => e.status === 'inactive').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Không hoạt động
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trạm HCM</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.filter(e => e.station === 'Trạm HCM').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Nhân viên tại HCM
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Nhân Viên</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Họ và Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Số ĐT</TableHead>
                <TableHead>Vị Trí</TableHead>
                <TableHead>Trạm</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Ngày Vào</TableHead>
                <TableHead className="text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => {
                const statusBadge = getStatusBadge(employee.status);
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <span>{employee.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{employee.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {employee.position}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span>{employee.station}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadge.variant} className={statusBadge.className}>
                        {statusBadge.text}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {employee.joinDate}
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
                          <DropdownMenuItem 
                            onClick={() => toggleEmployeeStatus(employee.id)}
                          >
                            {employee.status === 'active' ? (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                Tạm nghỉ
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Kích hoạt
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteEmployee(employee.id)}
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

export default AdminEmployees;
