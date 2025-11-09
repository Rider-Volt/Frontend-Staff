import React, { useState, useEffect } from 'react';
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
  Search, 
  Mail,
  Phone,
  MapPin,
  Loader2
} from 'lucide-react';
import { getAllStaff, Staff } from '@/services/adminservice/adminEmployeeService';

const AdminEmployees = () => {
  const [employees, setEmployees] = useState<Staff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Tải danh sách nhân viên từ API
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const data = await getAllStaff();
        setEmployees(data);
        console.log('Staff loaded:', data);
      } catch (error) {
        console.error('Error loading employees:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEmployees();
  }, []);

  // Lọc danh sách nhân viên dựa trên từ khóa tìm kiếm
  const filteredEmployees = employees.filter(employee =>
    employee.id.toString().includes(searchTerm.toLowerCase()) ||
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );


  // Lấy biến thể của nhãn trạng thái
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return { variant: 'default' as const, className: 'bg-green-100 text-green-800', text: 'Hoạt động' };
      case 'INACTIVE':
        return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800', text: 'Tạm nghỉ' };
      case 'VERIFIED':
        return { variant: 'default' as const, className: 'bg-blue-100 text-blue-800', text: 'Đã xác minh' };
      case 'SUSPENDED':
        return { variant: 'destructive' as const, className: 'bg-yellow-100 text-yellow-800', text: 'Tạm đình chỉ' };
      default:
        return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800', text: 'Không xác định' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Tìm kiếm nhân viên */}
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
      </div>

      {/* Bảng Danh Sách Nhân Viên */}
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
                <TableHead>Vai Trò</TableHead>
                <TableHead>Trạm</TableHead>
                <TableHead>Trạng Thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-green-600 mr-2" />
                      <span className="text-gray-600">Đang tải danh sách nhân viên...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => {
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
                      {employee.role}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span>{employee.stationName || 'Chưa gán trạm'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusBadge.variant} className={statusBadge.className}>
                        {statusBadge.text}
                      </Badge>
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
};

export default AdminEmployees;
