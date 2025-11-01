import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { getAllVehicles, Vehicle } from '@/services/adminservice/adminVehicleService';

const formatCurrency = (v?: number | string | null) => {
  if (v === null || v === undefined || v === ('' as any)) return '—';
  const num = typeof v === 'string' ? Number(v) : v;
  if (Number.isNaN(num as number)) return '—';
  return (num as number).toLocaleString('vi-VN') + ' VNĐ';
};
const safe = (v?: string | null) => v || '—';

const AdminBillings: React.FC = () => {
  const [billings, setBillings] = useState<BillingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewOpen, setViewOpen] = useState(false);
  const [viewBilling, setViewBilling] = useState<BillingDetail | null>(null);
  const [vehicleIdToPlate, setVehicleIdToPlate] = useState<Record<number, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllBillings();
        console.log('Admin billings sample:', data?.[0]);
        setBillings(data);
        // fetch vehicles to map license plates if backend omits plate in billing
        try {
          const vehicles: Vehicle[] = await getAllVehicles();
          const map: Record<number, string> = {};
          for (const v of vehicles) {
            map[v.vehicleId] = v.licensePlate;
          }
          setVehicleIdToPlate(map);
        } catch (e) {
          console.warn('Load vehicles for plate mapping failed:', e);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách đơn thuêthuê');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return billings;
    return billings.filter(b => {
      const plate = ((b as any).vehicleLicensePlate || (b as any).vehicleCode || (b as any).vehicle?.code || '').toLowerCase();
      return (
        b.id.toString().includes(q) ||
        (b.renterName || '').toLowerCase().includes(q) ||
        (b.vehicleModel || '').toLowerCase().includes(q) ||
        plate.includes(q) ||
        (b.status || '').toLowerCase().includes(q)
      );
    });
  }, [billings, searchTerm]);

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
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm đơn thuê..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-80"
          />
        </div>
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
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">Không có đơn thuê</TableCell>
                </TableRow>
              ) : (
                filtered.map(b => (
                  <TableRow key={b.id}>
                    <TableCell>#{b.id}</TableCell>
                    <TableCell>{safe(b.renterName)}</TableCell>
                    <TableCell>{safe(b.vehicleModel)}</TableCell>
                    <TableCell>{safe((b as any).vehicleLicensePlate || (b as any).vehicleCode || (b as any).vehicle?.code || vehicleIdToPlate[(b as any).vehicleId])}</TableCell>
                    <TableCell>
                      <Badge className="bg-gray-100 text-gray-800">{b.status || '—'}</Badge>
                    </TableCell>
                    <TableCell className="text-green-600 font-semibold">{formatCurrency(b.totalCost)}</TableCell>
                    <TableCell>{b.bookingTime ? new Date(b.bookingTime).toLocaleString('vi-VN') : '—'}</TableCell>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi Tiết Đơn Thuê</DialogTitle>
          </DialogHeader>
          {viewBilling && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Mã đơn thuêthuê</div>
                  <div className="font-semibold">#{viewBilling.id}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Khách hàng</div>
                  <div className="font-semibold">{safe(viewBilling.renterName)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Model / Biển số</div>
                  <div className="font-semibold">{safe(viewBilling.vehicleModel)} / {safe(viewBilling.vehicleLicensePlate)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Trạng thái</div>
                  <div className="font-semibold">{safe(viewBilling.status)}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Tổng tiền</div>
                <div className="font-semibold text-green-600">{formatCurrency(viewBilling.totalCost)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Nhận xe thực tế</div>
                  <div className="font-semibold">{viewBilling.actualPickupAt ? new Date(viewBilling.actualPickupAt).toLocaleString('vi-VN') : '—'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Trả xe thực tế</div>
                  <div className="font-semibold">{viewBilling.actualReturnAt ? new Date(viewBilling.actualReturnAt).toLocaleString('vi-VN') : '—'}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Ảnh trước</div>
                  {viewBilling.preImage ? (
                    <img src={viewBilling.preImage} alt="pre" className="h-32 w-48 object-cover rounded border" />
                  ) : (
                    <div className="text-sm">—</div>
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Ảnh sau</div>
                  {viewBilling.finalImage ? (
                    <img src={viewBilling.finalImage} alt="final" className="h-32 w-48 object-cover rounded border" />
                  ) : (
                    <div className="text-sm">—</div>
                  )}
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


