import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, User, Phone, Calendar, Clock, MapPin } from 'lucide-react';

type OrderStatus = 'pending' | 'confirmed' | 'ongoing' | 'completed' | 'cancelled';

interface StaffOrder {
  id: string;
  vehicleId: string;
  vehicleName: string;
  customerName: string;
  customerPhone: string;
  pickupTime: Date;
  returnTime: Date;
  pickupLocation: string;
  status: OrderStatus;
  notes?: string;
}

const initialOrders: StaffOrder[] = [
  {
    id: 'ORD-001',
    vehicleId: 'VF8-001',
    vehicleName: 'VinFast VF8',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    pickupTime: new Date('2025-01-15T09:00:00'),
    returnTime: new Date('2025-01-16T09:00:00'),
    pickupLocation: 'EV Station A',
    status: 'pending',
  },
  {
    id: 'ORD-002',
    vehicleId: 'VF7-011',
    vehicleName: 'VinFast VF7',
    customerName: 'Trần Thị B',
    customerPhone: '0912345678',
    pickupTime: new Date('2025-01-16T10:00:00'),
    returnTime: new Date('2025-01-17T10:00:00'),
    pickupLocation: 'EV Station B',
    status: 'confirmed',
  },
  {
    id: 'ORD-003',
    vehicleId: 'VF6-005',
    vehicleName: 'VinFast VF6',
    customerName: 'Phạm Quốc C',
    customerPhone: '0988888888',
    pickupTime: new Date('2025-01-14T08:30:00'),
    returnTime: new Date('2025-01-15T08:30:00'),
    pickupLocation: 'EV Station C',
    status: 'ongoing',
  },
  {
    id: 'ORD-004',
    vehicleId: 'KLA-101',
    vehicleName: 'VinFast Klara',
    customerName: 'Đỗ Ngọc D',
    customerPhone: '0977777777',
    pickupTime: new Date('2025-01-12T13:00:00'),
    returnTime: new Date('2025-01-12T17:00:00'),
    pickupLocation: 'EV Station A',
    status: 'completed',
  },
];

const statusBadge = (s: OrderStatus) => {
  switch (s) {
    case 'pending':
      return <Badge className="bg-gray-100 text-gray-800">Chờ xác nhận</Badge>;
    case 'confirmed':
      return <Badge className="bg-blue-100 text-blue-800">Đã xác nhận</Badge>;
    case 'ongoing':
      return <Badge className="bg-yellow-100 text-yellow-800">Đang thuê</Badge>;
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>;
  }
};

const formatDateTime = (d: Date) =>
  d.toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

const StationStaffOrders = () => {
  const [orders, setOrders] = useState<StaffOrder[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<OrderStatus | 'all'>('all');

  const filtered = useMemo(() => {
    let list = orders;
    if (tab !== 'all') list = list.filter(o => o.status === tab);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(o => [o.id, o.vehicleId, o.vehicleName, o.customerName, o.customerPhone, o.pickupLocation]
      .some(f => f.toLowerCase().includes(q)));
  }, [orders, search, tab]);

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
  };

  const actionOptions = (status: OrderStatus): { label: string; value: OrderStatus }[] => {
    switch (status) {
      case 'pending':
        return [
          { label: 'Xác nhận', value: 'confirmed' },
          { label: 'Hủy', value: 'cancelled' },
        ];
      case 'confirmed':
        return [
          { label: 'Bắt đầu thuê', value: 'ongoing' },
          { label: 'Hủy', value: 'cancelled' },
        ];
      case 'ongoing':
        return [
          { label: 'Hoàn thành', value: 'completed' },
          { label: 'Hủy', value: 'cancelled' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">Đơn thuê tại trạm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <Input
              placeholder="Tìm theo mã đơn, xe, khách hàng, SĐT, địa điểm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:max-w-lg"
            />
            <div className="w-full sm:w-64">
              <Select value={tab} onValueChange={(v) => setTab(v as OrderStatus | 'all')}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ</SelectItem>
                  <SelectItem value="confirmed">Xác nhận</SelectItem>
                  <SelectItem value="ongoing">Đang thuê</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Xe</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Nhận</TableHead>
                  <TableHead>Trả</TableHead>
                  <TableHead>Địa điểm</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(o => (
                  <TableRow key={o.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{o.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-gray-500" />
                        {o.vehicleName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-500" />{o.customerName}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-4 h-4" />{o.customerPhone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" />{formatDateTime(o.pickupTime)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-500" />{formatDateTime(o.returnTime)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" />{o.pickupLocation}</div>
                    </TableCell>
                    <TableCell>{statusBadge(o.status)}</TableCell>
                    <TableCell className="text-right">
                      {['completed','cancelled'].includes(o.status) ? (
                        <span className="text-sm text-gray-500">Không có thao tác</span>
                      ) : (
                        <div className="inline-block w-44">
                          <Select onValueChange={(v) => updateStatus(o.id, v as OrderStatus)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn thao tác" />
                            </SelectTrigger>
                            <SelectContent>
                              {actionOptions(o.status).map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StationStaffOrders;


