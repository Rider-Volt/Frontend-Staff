import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, User, Phone, Calendar, Clock, MapPin, Search } from 'lucide-react';
import { 
  getStationBillings, 
  updateBillingStatus, 
  approveCustomerPayment,
  getBillingsByPhone,
  approvePenaltyPayment,
  BillingStatus, 
  BillingResponse 
} from '@/services/staffservice/staffBillingService';

type OrderStatus = 'pending' | 'confirmed' | 'ongoing' | 'paid' | 'completed' | 'cancelled';

interface StaffOrder {
  id: string;
  vehicleId: string;
  vehicleName: string;
  plate: string;
  customerName: string;
  customerPhone: string;
  pickupTime: Date;
  returnTime: Date;
  actualReturnTime?: Date;
  pickupLocation: string;
  status: OrderStatus;
  notes?: string;
}

const initialOrders: StaffOrder[] = [];

const statusBadge = (s: OrderStatus) => {
  switch (s) {
    case 'pending':
      return <Badge className="bg-gray-100 text-gray-800">Chờ xác nhận</Badge>;
    case 'confirmed':
      return <Badge className="bg-blue-100 text-blue-800">Đã xác nhận</Badge>;
    case 'ongoing':
      return <Badge className="bg-yellow-100 text-yellow-800">Đang thuê</Badge>;
    case 'paid':
      return <Badge className="bg-emerald-100 text-emerald-800">Đã thanh toán</Badge>;
    case 'completed':
      return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
    case 'cancelled':
      return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>;
  }
};

const formatDateTime = (d: Date) =>
  d.toLocaleString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

const StaffStationOrders = () => {
  const [orders, setOrders] = useState<StaffOrder[]>(initialOrders);
  const [stationOrders, setStationOrders] = useState<StaffOrder[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<OrderStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phoneCheckIn, setPhoneCheckIn] = useState('');
  const [phoneLookupLoading, setPhoneLookupLoading] = useState(false);
  const [phoneFilterActive, setPhoneFilterActive] = useState(false);

  const mapBilling = (b: BillingResponse): StaffOrder => {
    let vehicleName = '';
    if (b.vehicleModel && typeof b.vehicleModel === 'string' && b.vehicleModel.trim()) {
      vehicleName = b.vehicleModel.trim();
    } else if (b.vehicle?.model?.name && typeof b.vehicle.model.name === 'string' && b.vehicle.model.name.trim()) {
      vehicleName = b.vehicle.model.name.trim();
    }
    
    const plate = (b.vehicleLicensePlate && b.vehicleLicensePlate.trim()) 
      || b.vehicle?.code 
      || '';
    
    if (!vehicleName && plate) {
      vehicleName = plate;
    } else if (!vehicleName) {
      vehicleName = 'Chưa có thông tin';
    }
    
    const stationName = (b.stationName && b.stationName.trim())
      || b.vehicle?.station?.name 
      || '';
    
    const rawStatus = String(b.status || 'PENDING').toUpperCase();
    const canUseActualPickup = ['RENTING', 'COMPLETED', 'DONE', 'FINISHED'].includes(rawStatus);
    
    let pickup: Date;
    try {
      const source = canUseActualPickup && b.actualPickupAt
        ? b.actualPickupAt
        : (b.plannedStartDate || b.startTime || '');
      
      pickup = source ? new Date(source) : new Date();
      if (isNaN(pickup.getTime())) {
        pickup = new Date();
      }
    } catch (e) {
      pickup = new Date();
    }

    let ret: Date;
    try {
      const returnSource = b.plannedEndDate || b.endTime || '';
      ret = returnSource ? new Date(returnSource) : new Date();
      if (isNaN(ret.getTime())) {
        ret = new Date();
      }
    } catch (e) {
      ret = new Date();
    }
    
    let actualReturn: Date | undefined;
    if (b.actualReturnAt && b.actualReturnAt !== 'null' && b.actualReturnAt !== '') {
      try {
        actualReturn = new Date(b.actualReturnAt);
        if (isNaN(actualReturn.getTime())) {
          actualReturn = undefined;
        }
      } catch (e) {
        actualReturn = undefined;
      }
    }
    
    const status: OrderStatus = (() => {
      switch (rawStatus) {
        case 'PENDING':
        case 'WAITING':
          return 'pending';
        case 'APPROVED':
        case 'CONFIRMED':
          return 'confirmed';
        case 'RENTING':
          return 'ongoing';
        case 'PAYED':
        case 'PAID':
          return 'paid';
        case 'COMPLETED':
        case 'DONE':
        case 'FINISHED':
          return 'completed';
        case 'CANCELLED':
        case 'CANCELED':
          return 'cancelled';
        default:
          return 'pending';
      }
    })();

    return {
      id: String(b.id),
      vehicleId: String(b.vehicleId ?? b.vehicle?.id ?? ''),
      vehicleName,
      plate,
      customerName: b.renterName || b.renter?.name || 'Khách lẻ',
      customerPhone: b.renterPhone || b.renter?.phone || '',
      pickupTime: pickup,
      returnTime: ret,
      actualReturnTime: actualReturn,
      pickupLocation: stationName,
      status,
    };
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStationBillings();
        if (!cancelled) {
          const mapped = data.map(mapBilling);
          setOrders(mapped);
          setStationOrders(mapped);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Không tải được danh sách đơn');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (tab !== 'all') list = list.filter(o => o.status === tab);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(o => [o.id, o.vehicleId, o.vehicleName, o.plate, o.customerName, o.customerPhone, o.pickupLocation]
      .some(f => f.toLowerCase().includes(q)));
  }, [orders, search, tab]);

  const reloadDataBasedOnFilter = async () => {
    if (phoneFilterActive && phoneCheckIn.trim()) {
      // Nếu đang lọc theo SĐT, reload theo SĐT
      const list = await getBillingsByPhone(phoneCheckIn.trim());
      const mapped = list.map(mapBilling);
      setOrders(mapped);
    } else {
      // Nếu không lọc, reload toàn bộ
      const reloadData = await getStationBillings();
      const mappedData = reloadData.map(mapBilling);
      setOrders(mappedData);
      setStationOrders(mappedData);
    }
  };

  const updateStatus = async (id: string, next: OrderStatus) => {
    const toBackend = (s: OrderStatus): BillingStatus | null => {
      if (s === 'completed') return 'COMPLETED';
      if (s === 'cancelled') return 'CANCELLED';
      if (s === 'pending') return 'PENDING';
      return null; 
    };

    const backendStatus = toBackend(next);
    if (!backendStatus) {
      alert('Hành động này chưa được hỗ trợ bởi backend.');
      return;
    }

    try {
      await updateBillingStatus(Number(id), backendStatus);
      await reloadDataBasedOnFilter();
      alert('Cập nhật trạng thái thành công!');
    } catch (e: any) {
      alert(e?.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const handleApprovePayment = async (id: string) => {
    try {
      await approveCustomerPayment(Number(id));
      await reloadDataBasedOnFilter();
      alert('Phê duyệt thanh toán thành công!');
    } catch (e: any) {
      alert(e?.message || 'Phê duyệt thanh toán thất bại');
    }
  };

  const handleApprovePenalty = async (id: string) => {
    try {
      await approvePenaltyPayment(Number(id));
      await reloadDataBasedOnFilter();
      alert('Phê duyệt thanh toán phạt thành công!');
    } catch (e: any) {
      alert(e?.message || 'Phê duyệt thanh toán phạt thất bại');
    }
  };

  const handleFindBillingsByPhone = async () => {
    if (!phoneCheckIn.trim()) {
      alert('Vui lòng nhập số điện thoại');
      return;
    }
    setPhoneLookupLoading(true);
    try {
      const list = await getBillingsByPhone(phoneCheckIn.trim());
      const mapped = list.map(mapBilling);
      setOrders(mapped);
      setPhoneFilterActive(true);
    } catch (e: any) {
      alert(e?.message || 'Không tải được danh sách đơn thuê theo SĐT');
    } finally {
      setPhoneLookupLoading(false);
    }
  };

  const clearPhoneFilter = () => {
    setOrders(stationOrders);
    setPhoneFilterActive(false);
    setPhoneCheckIn('');
  };

  const actionOptions = (status: OrderStatus): { label: string; value: OrderStatus; action?: string }[] => {
    switch (status) {
      case 'pending':
        return [
          { label: 'Phê duyệt thanh toán', value: 'paid', action: 'approve-payment' },
          { label: 'Hủy', value: 'cancelled' },
        ];
      case 'confirmed':
        return [
          { label: 'Phê duyệt thanh toán', value: 'paid', action: 'approve-payment' },
          { label: 'Hủy', value: 'cancelled' },
        ];
      case 'ongoing':
        return [];
      case 'paid':
        return [];
      case 'cancelled':
        return [];
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
              <Select value={tab} onValueChange={(v) => setTab(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ</SelectItem>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="ongoing">Đang thuê</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex-1">
              <Label htmlFor="phone-checkin" className="text-sm font-medium text-blue-800 mb-2 block">
                Tìm đơn thuê theo số điện thoại
              </Label>
              <Input
                id="phone-checkin"
                placeholder="Nhập số điện thoại khách hàng..."
                value={phoneCheckIn}
                onChange={(e) => setPhoneCheckIn(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button 
                onClick={handleFindBillingsByPhone}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!phoneCheckIn.trim() || phoneLookupLoading}
              >
                <Search className="w-4 h-4 mr-2" />
                Tìm đơn thuê
              </Button>
              {phoneFilterActive && (
                <Button variant="outline" onClick={clearPhoneFilter}>Xóa lọc</Button>
              )}
            </div>
          </div>

          {phoneLookupLoading && (
            <div className="mb-4 text-sm text-gray-600">Đang tìm đơn thuê theo số điện thoại...</div>
          )}

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-4">Đang tải...</div>
            ) : error ? (
              <div className="p-4 text-red-600">{error}</div>
            ) : null}
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
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(o => (
                  <TableRow key={o.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{o.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{o.vehicleName || 'Chưa có thông tin'}</span>
                        </div>
                        {o.plate && o.vehicleName !== o.plate && (
                          <div className="text-sm text-gray-600 ml-6">
                            Biển số: {o.plate}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-500" />{o.customerName || 'Khách lẻ'}</div>
                        {o.customerPhone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-4 h-4" />{o.customerPhone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          {o.pickupTime && !isNaN(o.pickupTime.getTime()) && (o.status === 'ongoing' || o.status === 'completed') ? (
                            <span className="text-green-600 font-medium">{formatDateTime(o.pickupTime)}</span>
                          ) : o.status === 'completed' || o.status === 'ongoing' ? (
                            <span className="text-gray-500 italic">Chưa có thời gian nhận</span>
                          ) : (
                            <span className="text-gray-500 italic">Chưa trả xe</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          {o.actualReturnTime ? (
                            <span className="text-green-600 font-medium">{formatDateTime(o.actualReturnTime)}</span>
                          ) : o.status === 'completed' ? (
                            <span className="text-gray-500 italic">Chưa có thời gian trả</span>
                          ) : (
                            <span className="text-gray-500 italic">Chưa trả xe</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{o.pickupLocation || 'Chưa có địa điểm'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{statusBadge(o.status)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {actionOptions(o.status).length === 0 ? (
                          <span className="text-sm text-gray-500 min-w-[100px] text-center">Không có thao tác</span>
                        ) : (
                          <div className="min-w-[100px]">
                            <Select onValueChange={(v) => {
                              const option = actionOptions(o.status).find(opt => opt.value === v);
                              if (option?.action) {
                                switch (option.action) {
                                  case 'approve-payment':
                                    handleApprovePayment(o.id);
                                    return;
                                  case 'approve-penalty':
                                    handleApprovePenalty(o.id);
                                    return;
                                  default:
                                    updateStatus(o.id, v as OrderStatus);
                                    return;
                                }
                              } else {
                                updateStatus(o.id, v as OrderStatus);
                              }
                            }}>
                              <SelectTrigger className="min-w-[100px]">
                                <SelectValue placeholder="Chọn thao tác" />
                              </SelectTrigger>
                              <SelectContent>
                                {actionOptions(o.status).map(opt => (
                                  <SelectItem key={`${opt.value}-${opt.action || 'default'}`} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
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

export default StaffStationOrders;
