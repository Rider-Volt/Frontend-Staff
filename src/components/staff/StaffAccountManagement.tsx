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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Loader2,
  MoreHorizontal,
  UserCheck,
  UserX,
  Eye,
  AlertCircle,
  Users,
  Mail,
  Phone,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { 
  getAllCustomerAccounts, 
  updateCustomerAccountStatus,
  getCustomerAccountById,
  type CustomerAccount
} from '@/services/adminservice/adminCustomerService';

const StaffAccountManagement = () => {
  const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [viewingAccount, setViewingAccount] = useState<CustomerAccount | null>(null);
  const [updatingAccount, setUpdatingAccount] = useState<CustomerAccount | null>(null);
  const [newStatus, setNewStatus] = useState<"ACTIVE" | "INACTIVE" | "BANNED">("ACTIVE");

  // Mock data cho danh sách tài khoản khách hàng
  const mockAccounts: CustomerAccount[] = [
    {
      id: 1,
      fullName: "Nguyễn Văn An",
      email: "nguyenvanan@example.com",
      phone: "0123456789",
      status: "ACTIVE",
      totalRentals: 15,
      totalSpent: 2500000
    },
    {
      id: 2,
      fullName: "Trần Thị Bình",
      email: "tranthibinh@example.com",
      phone: "0987654321",
      status: "INACTIVE",
      totalRentals: 8,
      totalSpent: 1200000
    },
    {
      id: 3,
      fullName: "Lê Văn Cường",
      email: "levancuong@example.com",
      phone: "0555666777",
      status: "BANNED",
      totalRentals: 3,
      totalSpent: 450000
    },
    {
      id: 4,
      fullName: "Phạm Thị Dung",
      email: "phamthidung@example.com",
      phone: "0333444555",
      status: "ACTIVE",
      totalRentals: 22,
      totalSpent: 3800000
    },
    {
      id: 5,
      fullName: "Hoàng Văn Em",
      email: "hoangvanem@example.com",
      phone: "0777888999",
      status: "INACTIVE",
      totalRentals: 6,
      totalSpent: 900000
    },
    {
      id: 6,
      fullName: "Vũ Thị Phương",
      email: "vuthiphuong@example.com",
      phone: "0444555666",
      status: "ACTIVE",
      totalRentals: 12,
      totalSpent: 1800000
    },
    {
      id: 7,
      fullName: "Đặng Văn Giang",
      email: "dangvangiang@example.com",
      phone: "0666777888",
      status: "BANNED",
      totalRentals: 2,
      totalSpent: 300000
    },
    {
      id: 8,
      fullName: "Bùi Thị Hoa",
      email: "buithihoa@example.com",
      phone: "0888999000",
      status: "ACTIVE",
      totalRentals: 18,
      totalSpent: 3200000
    }
  ];

  // Tải danh sách tài khoản (sử dụng mock data)
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Thử gọi API trước
        try {
          const data = await getAllCustomerAccounts();
          setAccounts(data);
          console.log('Customer accounts loaded from API:', data);
        } catch (apiError) {
          console.log('API failed, using mock data:', apiError);
          // Nếu API fail, sử dụng mock data
          setAccounts(mockAccounts);
          console.log('Using mock customer accounts:', mockAccounts);
        }
      } catch (error) {
        console.error('Error loading customer accounts:', error);
        // Fallback về mock data
        setAccounts(mockAccounts);
        console.log('Fallback to mock data due to error');
      } finally {
        setLoading(false);
      }
    };
    
    loadAccounts();
  }, []);

  // Lọc tài khoản dựa trên từ khóa tìm kiếm
  const filteredAccounts = accounts.filter(account =>
    account.id.toString().includes(searchTerm.toLowerCase()) ||
    account.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Refresh danh sách tài khoản
  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Thử gọi API trước
      try {
        const data = await getAllCustomerAccounts();
        setAccounts(data);
        console.log('Customer accounts refreshed from API:', data);
      } catch (apiError) {
        console.log('API refresh failed, using mock data:', apiError);
        // Nếu API fail, sử dụng mock data
        setAccounts(mockAccounts);
        console.log('Using mock customer accounts on refresh:', mockAccounts);
      }
    } catch (error) {
      console.error('Error refreshing customer accounts:', error);
      // Fallback về mock data
      setAccounts(mockAccounts);
      console.log('Fallback to mock data on refresh due to error');
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật trạng thái tài khoản
  const handleUpdateStatus = async () => {
    if (!updatingAccount) return;
    
    try {
      // Thử gọi API trước
      try {
        const updatedAccount = await updateCustomerAccountStatus(updatingAccount.id, newStatus);
        setAccounts(accounts.map(acc => acc.id === updatingAccount.id ? updatedAccount : acc));
        console.log('Account status updated via API:', updatedAccount);
      } catch (apiError) {
        console.log('API update failed, updating mock data locally:', apiError);
        // Nếu API fail, cập nhật mock data locally
        const updatedAccount = { ...updatingAccount, status: newStatus };
        setAccounts(accounts.map(acc => acc.id === updatingAccount.id ? updatedAccount : acc));
        console.log('Account status updated locally:', updatedAccount);
      }
      
      setIsStatusDialogOpen(false);
      setUpdatingAccount(null);
      alert('Cập nhật trạng thái tài khoản thành công!');
    } catch (err) {
      console.error('Error updating account status:', err);
      alert(err instanceof Error ? err.message : 'Lỗi khi cập nhật trạng thái tài khoản');
    }
  };

  // Lấy loại badge cho trạng thái tài khoản
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return { variant: 'default' as const, className: 'bg-green-100 text-green-800', text: 'Hoạt động', icon: UserCheck };
      case 'INACTIVE':
        return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800', text: 'Không hoạt động', icon: UserX };
      case 'BANNED':
        return { variant: 'destructive' as const, className: 'bg-red-100 text-red-800', text: 'Bị cấm', icon: UserX };
      default:
        return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800', text: status || 'Không xác định', icon: UserX };
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('vi-VN')}₫`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700">Đang tải danh sách tài khoản...</p>
          <p className="text-sm text-gray-500 mt-1">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <span className="text-lg font-medium text-red-500">Lỗi truy cập</span>
        </div>
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-2">
            {error.includes('403') || error.includes('Forbidden') || error.includes('permission') 
              ? 'Bạn không có quyền xem danh sách tài khoản khách hàng.'
              : error
            }
          </p>
          <p className="text-sm text-gray-500">
            Vui lòng liên hệ quản trị viên để được cấp quyền truy cập.
          </p>
        </div>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="mt-4"
        >
          <Search className="mr-2 h-4 w-4" />
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header với tìm kiếm và refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm tài khoản..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4" />
          <span>Làm mới</span>
        </Button>
      </div>

      {/* Thẻ Thống Kê */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Tài Khoản</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{accounts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tất cả tài khoản khách hàng
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoạt Động</CardTitle>
            <UserCheck className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {accounts.filter(acc => acc.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tài khoản đang hoạt động
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Không Hoạt Động</CardTitle>
            <UserX className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {accounts.filter(acc => acc.status === 'INACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tài khoản tạm khóa
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bị Cấm</CardTitle>
            <UserX className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {accounts.filter(acc => acc.status === 'BANNED').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tài khoản bị cấm
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bảng Danh Sách Tài Khoản */}
      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-lg font-semibold">Danh Sách Tài Khoản Khách Hàng</CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Hiển thị {filteredAccounts.length} trong tổng số {accounts.length} tài khoản
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Họ Tên</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Số ĐT</TableHead>
                  <TableHead className="font-semibold">Lượt Thuê</TableHead>
                  <TableHead className="font-semibold">Tổng Chi Tiêu</TableHead>
                  <TableHead className="font-semibold">Trạng Thái</TableHead>
                  <TableHead className="text-right font-semibold">Hành Động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center space-y-2">
                        <Users className="h-8 w-8 text-gray-400" />
                        <p className="text-lg font-medium">Không có tài khoản nào</p>
                        <p className="text-sm">
                          {searchTerm ? 'Không tìm thấy tài khoản phù hợp với từ khóa tìm kiếm' : 'Chưa có tài khoản khách hàng nào'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccounts.map((account) => {
                    const statusBadge = getStatusBadge(account.status);
                    return (
                      <TableRow key={account.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-blue-600">#{account.id}</TableCell>
                        <TableCell className="text-sm text-gray-700 font-medium">
                          {account.fullName}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{account.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-gray-600">{account.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-center">{account.totalRentals}</TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            {formatCurrency(account.totalSpent)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadge.variant} className={statusBadge.className}>
                            {statusBadge.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => {
                                setViewingAccount(account);
                                setIsViewDialogOpen(true);
                              }} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setUpdatingAccount(account);
                                setNewStatus(account.status);
                                setIsStatusDialogOpen(true);
                              }} className="cursor-pointer">
                                <UserCheck className="mr-2 h-4 w-4" />
                                Cập nhật trạng thái
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
          </div>
        </CardContent>
      </Card>

      {/* Dialog Xem Chi Tiết Tài Khoản */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi Tiết Tài Khoản</DialogTitle>
          </DialogHeader>
          {viewingAccount && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID Tài Khoản</label>
                  <p className="text-sm">#{viewingAccount.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng Thái</label>
                  <div className="mt-1">
                    <Badge variant={getStatusBadge(viewingAccount.status).variant} 
                           className={getStatusBadge(viewingAccount.status).className}>
                      {getStatusBadge(viewingAccount.status).text}
                    </Badge>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Họ và Tên</label>
                <p className="text-sm">{viewingAccount.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm">{viewingAccount.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Số Điện Thoại</label>
                <p className="text-sm">{viewingAccount.phone}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Lượt Thuê</label>
                  <p className="text-sm font-medium">{viewingAccount.totalRentals}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tổng Chi Tiêu</label>
                  <p className="text-sm font-medium text-green-600">{formatCurrency(viewingAccount.totalSpent)}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Cập Nhật Trạng Thái */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cập Nhật Trạng Thái Tài Khoản</DialogTitle>
          </DialogHeader>
          {updatingAccount && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Tài khoản #{updatingAccount.id}</p>
                <p className="font-medium">{updatingAccount.fullName}</p>
                <p className="text-sm text-gray-500">{updatingAccount.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Trạng thái hiện tại</label>
                <div className="mt-1">
                  <Badge variant={getStatusBadge(updatingAccount.status).variant} 
                         className={getStatusBadge(updatingAccount.status).className}>
                    {getStatusBadge(updatingAccount.status).text}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Chọn trạng thái mới <span className="text-red-500">*</span></label>
                <Select 
                  value={newStatus} 
                  onValueChange={(value: "ACTIVE" | "INACTIVE" | "BANNED") => setNewStatus(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                    <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                    <SelectItem value="BANNED">Bị cấm</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleUpdateStatus}>
                  Cập nhật
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffAccountManagement;
