import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  DialogTitle
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Eye, Loader2, MoreHorizontal, Search, Trash2 } from 'lucide-react';
import { BillingDetail, BillingSummary, deleteBilling, getAllBillings, getBillingById } from '@/services/adminservice/adminBillingService';

const formatCurrency = (v: number) => {
  return v.toLocaleString('vi-VN') + ' VNĐ';
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('vi-VN');
};

const formatDateOnly = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const safe = (v: string | null | undefined): string => v || '—';

const translateStatus = (status: string | null | undefined): string => {
  if (!status) return '—';
  const statusUpper = status.toUpperCase();
  const statusMap: Record<string, string> = {
    'COMPLETED': 'hoàn thành',
    'DONE': 'hoàn thành',
    'FINISHED': 'hoàn thành',
    'PAYED': 'Đã thanh toán',
    'PAID': 'Đã thanh toán',
    'APPROVED': 'Đã thanh toán',
    'CANCELLED': 'Đã hủy',
    'CANCELED': 'Đã hủy',
    'PENDING': 'Chờ xử lý',
    'WAITING': 'Chờ xử lý',
    'RENTING': 'Đang thuê',
    'ONGOING': 'Đang thuê',
    'CONFIRMED': 'Đã xác nhận',
  };
  return statusMap[statusUpper] || status;
};

const STATUS_FILTER_MAP: Record<string, string[]> = {
  ALL: [],
  PENDING: ['PENDING', 'WAITING', 'CONFIRMED', 'APPROVED'],
  PAID: ['PAID', 'PAYED'],
  RENTING: ['RENTING', 'ONGOING'],
  COMPLETED: ['COMPLETED', 'DONE', 'FINISHED'],
  CANCELLED: ['CANCELLED', 'CANCELED'],
};

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ' },
  { value: 'PAID', label: 'Đã thanh toán' },
  { value: 'RENTING', label: 'Đang thuê' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const AdminBillings: React.FC = () => {
  const [billings, setBillings] = useState<BillingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [viewOpen, setViewOpen] = useState(false);
  const [viewBilling, setViewBilling] = useState<BillingDetail | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllBillings();
        setBillings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách đơn thuê');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const next = billings.filter(b => {
      const statusMatch = statusFilter === 'ALL'
        ? true
        : STATUS_FILTER_MAP[statusFilter]?.includes((b.status || '').toUpperCase());

      if (!statusMatch) {
        return false;
      }

      if (!q) {
        return true;
      }

      return (
        b.id.toString().includes(q) ||
        b.renterName.toLowerCase().includes(q) ||
        b.renterEmail.toLowerCase().includes(q) ||
        b.renterPhone.toLowerCase().includes(q) ||
        b.vehicleModel.toLowerCase().includes(q) ||
        b.vehicleLicensePlate.toLowerCase().includes(q) ||
        b.status.toLowerCase().includes(q)
      );
    });

    return next;
  }, [billings, searchTerm, statusFilter]);

  const handleOpenView = async (id: number) => {
    try {
      const detail = await getBillingById(id);
      setViewBilling(detail);
      setViewOpen(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi xem đơn thuê');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn thuê này?')) return;
    try {
      await deleteBilling(id);
      setBillings(prev => prev.filter(b => b.id !== id));
      alert('Xóa đơn thuê thành công!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi xóa đơn thuê');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải danh sách đơn thuê...</span>
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
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm đơn thuê..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full md:w-80"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Tất cả" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Đơn Thuê</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Biển số</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Đặt lúc</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">Không có đơn thuê</TableCell>
                </TableRow>
              ) : (
                filtered.map(b => (
                  <TableRow key={b.id}>
                    <TableCell>#{b.id}</TableCell>
                    <TableCell>{b.renterName}</TableCell>
                    <TableCell>{b.vehicleModel}</TableCell>
                    <TableCell>{b.vehicleLicensePlate}</TableCell>
                    <TableCell>
                      <Badge className="bg-gray-100 text-gray-800">{translateStatus(b.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-green-600 font-semibold">{formatCurrency(b.totalCost)}</TableCell>
                    <TableCell>{formatDate(b.bookingTime)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenView(b.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết đơn
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(b.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa đơn
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi Tiết Đơn Thuê</DialogTitle>
          </DialogHeader>
          {viewBilling && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Mã đơn thuê</div>
                  <div className="font-semibold">#{viewBilling.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Trạng thái</div>
                  <div className="font-semibold">{translateStatus(viewBilling.status)}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-sm font-semibold mb-2">Thông tin khách hàng</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Tên khách hàng</div>
                    <div className="font-semibold">{viewBilling.renterName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-semibold">{viewBilling.renterEmail}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Số điện thoại</div>
                    <div className="font-semibold">{viewBilling.renterPhone}</div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-sm font-semibold mb-2">Thông tin xe</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Model</div>
                    <div className="font-semibold">{viewBilling.vehicleModel}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Biển số</div>
                    <div className="font-semibold">{viewBilling.vehicleLicensePlate}</div>
                  </div>
                  {viewBilling.vehiclePhotoUrl && (
                    <div className="col-span-2">
                      <div className="text-sm text-gray-500 mb-2">Ảnh xe</div>
                      <img src={viewBilling.vehiclePhotoUrl} alt="vehicle" className="h-32 w-48 object-cover rounded border" />
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="text-sm font-semibold mb-2">Thông tin thuê</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Giá mỗi ngày</div>
                    <div className="font-semibold">{formatCurrency(viewBilling.pricePerDay)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Số ngày thuê</div>
                    <div className="font-semibold">{viewBilling.rentedDay} ngày</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Tổng tiền</div>
                    <div className="font-semibold text-green-600">{formatCurrency(viewBilling.totalCost)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Đặt lúc</div>
                    <div className="font-semibold">{formatDate(viewBilling.bookingTime)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Ngày bắt đầu dự kiến</div>
                    <div className="font-semibold">{formatDateOnly(viewBilling.plannedStartDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Ngày kết thúc dự kiến</div>
                    <div className="font-semibold">{formatDateOnly(viewBilling.plannedEndDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Nhận xe thực tế</div>
                    <div className="font-semibold">{formatDate(viewBilling.actualPickupAt)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Trả xe thực tế</div>
                    <div className="font-semibold">{formatDate(viewBilling.actualReturnAt)}</div>
                  </div>
                </div>
              </div>

              {viewBilling.note && (
                <div className="border-t pt-4">
                  <div className="text-sm text-gray-500">Ghi chú</div>
                  <div className="font-semibold">{viewBilling.note}</div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="text-sm font-semibold mb-2">Ảnh</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Ảnh trước khi thuê</div>
                    {viewBilling.preImage ? (
                      <img src={viewBilling.preImage} alt="pre" className="h-32 w-full object-cover rounded border" />
                    ) : (
                      <div className="text-sm text-gray-400">—</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Ảnh sau khi trả</div>
                    {viewBilling.finalImage ? (
                      <img src={viewBilling.finalImage} alt="final" className="h-32 w-full object-cover rounded border" />
                    ) : (
                      <div className="text-sm text-gray-400">—</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBillings;
