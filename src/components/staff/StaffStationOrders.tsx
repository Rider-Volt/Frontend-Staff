import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, User, Phone, Calendar, Clock, MapPin, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// các nhóm trạng thái đơn trên 
type OrderStatus = 'pending' | 'confirmed' | 'ongoing' | 'paid' | 'completed' | 'cancelled';
import { 
  getStationBillings, 
  updateBillingStatus, 
  approveCustomerPayment,
  checkInByBillingId,
  updatePreImage,
  getBillingsByPhone,
  approvePenaltyPayment,
  inspectReturnedVehicle,
  BillingStatus, 
  BillingResponse 
} from '@/services/staffservice/staffBillingService';

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

  // Trạng thái dialog khi tải ảnh hiện trạng trước khi thuê (pre-image)
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [billingId, setBillingId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  // (kiểm tra tình trạng xe)
  const [returnOpen, setReturnOpen] = useState(false);
  const [returning, setReturning] = useState(false);
  const [returnBillingId, setReturnBillingId] = useState<string>('');
  const [finalImageUrl, setFinalImageUrl] = useState<string>('');
  const [penaltyCost, setPenaltyCost] = useState<string>('');
  const [returnNote, setReturnNote] = useState<string>('');

 
  const mapBilling = (b: BillingResponse): StaffOrder => {
    // Lấy tên xe từ phản hồi API
    const vehicleName = b.vehicleModel || b.vehicle?.model?.name || 'Mẫu xe';
    
    // Debug log để kiểm tra dữ liệu từ backend
    console.log('Billing data for ID', b.id, ':', {
      startTime: b.startTime,
      endTime: b.endTime,
      actualPickupAt: (b as any).actualPickupAt,
      actualReturnAt: (b as any).actualReturnAt,
      status: b.status
    });
    
    // Xử lý thời gian nhận
    let pickup: Date;
    try {
      pickup = new Date((b as any).actualPickupAt || b.startTime);
      if (isNaN(pickup.getTime())) {
        console.warn('Invalid pickup date for billing', b.id, ':', (b as any).actualPickupAt || b.startTime);
        pickup = new Date(); // Fallback to current time
      }
    } catch (e) {
      console.warn('Error parsing pickup date for billing', b.id, ':', e);
      pickup = new Date();
    }
    
    // Xử lý thời gian trả dự kiến (không fallback về thời gian hiện tại)
    // Nếu BE không trả endTime hợp lệ thì ret sẽ là Invalid Date
    const ret: Date = new Date(b.endTime);
    
    const stationName = b.vehicle?.station?.name || '';

    const rawStatus = String((b as any).status || 'PENDING').toUpperCase();
    
    // Xử lý thời gian trả thực tế
    let actualReturn: Date | undefined;
    const actualReturnAtValue = (b as any).actualReturnAt;
    if (actualReturnAtValue && actualReturnAtValue !== 'null' && actualReturnAtValue !== '') {
      try {
        actualReturn = new Date(actualReturnAtValue);
        if (isNaN(actualReturn.getTime())) {
          console.warn('Invalid actual return date for billing', b.id, ':', actualReturnAtValue);
          actualReturn = undefined;
        } else {
          console.log('Found actual return time for billing', b.id, ':', actualReturnAtValue, '->', actualReturn);
        }
      } catch (e) {
        console.warn('Error parsing actual return date for billing', b.id, ':', e);
        actualReturn = undefined;
      }
    } else {
      console.log('No actual return time for billing', b.id, 'actualReturnAt:', actualReturnAtValue);
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
      plate: b.vehicle?.code || '',
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

	const hasLocationColumn = useMemo(() => {
		return orders.some(o => (o.pickupLocation || '').trim().length > 0);
	}, [orders]);

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
    // Ánh xạ trạng thái FE sang trạng thái BE
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
      const updated = await updateBillingStatus(Number(id), backendStatus);
      await reloadDataBasedOnFilter();
      alert('Cập nhật trạng thái thành công!');
    } catch (e: any) {
      alert(e?.message || 'Cập nhật trạng thái thất bại');
    }
  };

  // Check-in bằng billing ID
  const handleCheckIn = async (id: string) => {
    try {
      const updated = await checkInByBillingId(Number(id));
      await reloadDataBasedOnFilter();
      alert('Check-in thành công!');
    } catch (e: any) {
      alert(e?.message || 'Check-in thất bại');
    }
  };

  // Phê duyệt thanh toán khách hàng
  const handleApprovePayment = async (id: string) => {
    try {
      const updated = await approveCustomerPayment(Number(id));
      await reloadDataBasedOnFilter();
      alert('Phê duyệt thanh toán thành công!');
    } catch (e: any) {
      alert(e?.message || 'Phê duyệt thanh toán thất bại');
    }
  };

  // Kiểm tra xe trả về
  const handleInspectReturn = async (id: string) => {
    openReturnDialog(id);
  };

  const confirmReturnVehicle = async () => {
    if (!returnBillingId.trim()) {
      alert('Vui lòng nhập ID đơn thuê.');
      return;
    }
    if (!finalImageUrl.trim()) {
      alert('Vui lòng nhập URL ảnh cuối.');
      return;
    }
    if (!penaltyCost.trim()) {
      alert('Vui lòng nhập chi phí phạt (0 nếu không có).');
      return;
    }
    try {
      setReturning(true);
      const penalty = parseFloat(penaltyCost) || 0;
      const updated = await inspectReturnedVehicle(
        Number(returnBillingId), 
        finalImageUrl.trim(), 
        penalty, 
        returnNote.trim()
      );
      // trạng thái 
      const newStatus: OrderStatus = (() => {
        switch (updated.status) {
          case 'PENDING': return 'pending';
          case 'APPROVED': return 'confirmed';
          case 'RENTING': return 'ongoing';
          case 'PAYED': return 'paid';
          case 'COMPLETED': return 'completed';
          case 'CANCELLED': return 'cancelled';
          default: return 'ongoing';
        }
      })();
      
      await reloadDataBasedOnFilter();
      
      setReturnOpen(false);
      setReturnBillingId('');
      setFinalImageUrl('');
      setPenaltyCost('');
      setReturnNote('');
      alert('Trả xe thành công!');
    } catch (e: any) {
      alert(e?.message || 'Trả xe thất bại');
    } finally {
      setReturning(false);
    }
  };

  // Phê duyệt thanh toán phạt
  const handleApprovePenalty = async (id: string) => {
    try {
      const updated = await approvePenaltyPayment(Number(id));
      await reloadDataBasedOnFilter();
      alert('Phê duyệt thanh toán phạt thành công!');
    } catch (e: any) {
      alert(e?.message || 'Phê duyệt thanh toán phạt thất bại');
    }
  };



	// Tìm tất cả billings theo số điện thoại 
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

	// Xóa lọc theo số điện thoại, trả về danh sách trạm
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
          { label: 'Giao xe ', value: 'ongoing', action: 'rent-out-with-image' },
          { label: 'Phê duyệt thanh toán', value: 'paid', action: 'approve-payment' },
          { label: 'Hủy', value: 'cancelled' },
        ];
      case 'ongoing':
        return [
          { label: 'Trả xe', value: 'completed', action: 'inspect-return' },
        ];
      case 'paid':
        return [
          { label: 'Giao xe ', value: 'ongoing', action: 'rent-out-with-image' },
        ];
      case 'cancelled':
        return [
          { label: 'Khôi phục đơn', value: 'pending' },
        ];
      default:
        return [];
    }
  };

  // Mở dialog để tải ảnh hiện trạng trước khi giao xe
  const openUploadDialog = (id: string) => {
    setSelectedOrderId(id);
    setBillingId(id);
    setImageUrl('');
    setUploadOpen(true);
  };

  // Mở dialog để xử lý trả xe
  const openReturnDialog = (id: string) => {
    setReturnBillingId(id);
    setFinalImageUrl('');
    setPenaltyCost('');
    setReturnNote('');
    setReturnOpen(true);
  };

  const confirmUploadAndCheckIn = async () => {
    if (!billingId.trim()) {
      alert('Vui lòng nhập ID đơn thuê.');
      return;
    }
    if (!imageUrl.trim()) {
      alert('Vui lòng nhập URL ảnh.');
      return;
    }
    try {
      setUploading(true);
      
      await updatePreImage(Number(billingId), imageUrl.trim());
      const updated = await checkInByBillingId(Number(billingId));
      
      await reloadDataBasedOnFilter();
      
      setUploadOpen(false);
      setSelectedOrderId(null);
      setBillingId('');
      setImageUrl('');
      alert('Giao xe thành công!');
    } catch (e: any) {
      alert(e?.message || 'Giao xe thất bại');
    } finally {
      setUploading(false);
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
                <SelectItem value="confirmed">Xác nhận</SelectItem>
                <SelectItem value="ongoing">Đang thuê</SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* check-in theo số điện thoại */}
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
                  {hasLocationColumn && <TableHead>Địa điểm</TableHead>}
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
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
                           {o.pickupTime && !isNaN(o.pickupTime.getTime()) && o.status !== 'pending' && o.status !== 'cancelled' ? (
                             <span className="text-green-600 font-medium">{formatDateTime(o.pickupTime)}</span>
                           ) : o.status === 'completed' || o.status === 'ongoing' ? (
                             <span className="text-gray-500 italic">Chưa có thời gian nhận</span>
                           ) : (
                             <span className="text-gray-500 italic">Chưa nhận xe</span>
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
                    {hasLocationColumn && (
                      <TableCell>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" />{o.pickupLocation}</div>
                      </TableCell>
                    )}
                    <TableCell>{statusBadge(o.status)}</TableCell>
                     <TableCell className="text-center">
                       <div className="flex justify-center">
                         {o.status === 'ongoing' ? (
                           <Button 
                             onClick={() => handleInspectReturn(o.id)}
                             className="bg-orange-600 hover:bg-orange-700 text-white min-w-[100px]"
                           >
                             Trả xe
                           </Button>
                         ) : o.status === 'paid' ? (
                           <Button 
                             onClick={() => openUploadDialog(o.id)}
                             className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[100px]"
                           >
                             Giao xe 
                           </Button>
                         ) : actionOptions(o.status).length === 0 ? (
                           <span className="text-sm text-gray-500 min-w-[100px] text-center">Không có thao tác</span>
                         ) : (
                           <div className="min-w-[100px]">
                             <Select onValueChange={(v) => {
                               const option = actionOptions(o.status).find(opt => opt.value === v);
                               if (option?.action) {
                                 switch (option.action) {
                                   case 'checkin':
                                     handleCheckIn(o.id);
                                     return;
                                   case 'approve-payment':
                                     handleApprovePayment(o.id);
                                     return;
                                   case 'rent-out-with-image':
                                     openUploadDialog(o.id);
                                     return;
                                   case 'rent-out':                                    
                                     updateStatus(o.id, 'ongoing');
                                     return;
                                   case 'inspect-return':
                                     handleInspectReturn(o.id);
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

      {/* Dialog tải ảnh hiện trạng trước khi thuê */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Giao xe - tải ảnh hiện trạng trước khi thuê</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ID Đơn thuê</Label>
              <Input 
                placeholder="Nhập ID đơn thuê"
                value={billingId}
                onChange={(e) => setBillingId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>URL Ảnh</Label>
              <Input 
                placeholder="Nhập URL ảnh xe"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)} disabled={uploading}>Hủy</Button>
            <Button onClick={confirmUploadAndCheckIn} disabled={uploading}>
              {uploading ? 'Đang xử lý...' : 'Xác nhận giao xe'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog trả xe */}
      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trả xe - kiểm tra tình trạng xe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ID Đơn thuê</Label>
              <Input 
                placeholder="Nhập ID đơn thuê"
                value={returnBillingId}
                onChange={(e) => setReturnBillingId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>URL Ảnh cuối</Label>
              <Input 
                placeholder="Nhập URL ảnh xe khi trả"
                value={finalImageUrl}
                onChange={(e) => setFinalImageUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Chi phí phạt (VNĐ)</Label>
              <Input 
                placeholder="Nhập chi phí phạt (0 nếu không có)"
                value={penaltyCost}
                onChange={(e) => setPenaltyCost(e.target.value)}
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea 
                placeholder="Nhập ghi chú về tình trạng xe..."
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnOpen(false)} disabled={returning}>Hủy</Button>
            <Button onClick={confirmReturnVehicle} disabled={returning}>
              {returning ? 'Đang xử lý...' : 'Xác nhận trả xe'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffStationOrders;
