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

// Map FE order buckets to backend billing statuses
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

  // Dialog state for uploading pre-image
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [billingId, setBillingId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  // Dialog state for return vehicle
  const [returnOpen, setReturnOpen] = useState(false);
  const [returning, setReturning] = useState(false);
  const [returnBillingId, setReturnBillingId] = useState<string>('');
  const [finalImageUrl, setFinalImageUrl] = useState<string>('');
  const [penaltyCost, setPenaltyCost] = useState<string>('');
  const [returnNote, setReturnNote] = useState<string>('');

  // Map backend Billing -> FE StaffOrder
  const mapBilling = (b: BillingResponse): StaffOrder => {
    // Get vehicle name from API response
    const vehicleName = b.vehicleModel || b.vehicle?.model?.name || 'Mẫu xe';
    const pickup = new Date(b.startTime);
    const ret = new Date(b.endTime);
    const stationName = b.vehicle?.station?.name || '';

    // Normalize various backend status spellings/aliases
    const rawStatus = String((b as any).status || 'PENDING').toUpperCase();
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

  const updateStatus = async (id: string, next: OrderStatus) => {
    // Map FE status to backend status
    const toBackend = (s: OrderStatus): BillingStatus | null => {
      if (s === 'completed') return 'COMPLETED';
      if (s === 'cancelled') return 'CANCELLED';
      if (s === 'pending') return 'PENDING';
      return null; // no-op for confirmed/ongoing because backend doesn't have those statuses
    };

    const backendStatus = toBackend(next);
    if (!backendStatus) {
      alert('Hành động này chưa được hỗ trợ bởi backend.');
      return;
    }

    try {
      const updated = await updateBillingStatus(Number(id), backendStatus);
      // Map backend returned status to FE OrderStatus
      const newStatus: OrderStatus = ((): OrderStatus => {
        switch (updated.status) {
          case 'PENDING': return 'pending';
          case 'APPROVED': return 'confirmed';
          case 'RENTING': return 'ongoing';
          case 'PAYED': return 'paid';
          case 'COMPLETED': return 'completed';
          case 'CANCELLED': return 'cancelled';
          default: return 'pending';
        }
      })();

      setOrders(prev => prev.map(o => (o.id === String(updated.id) ? { ...o, status: newStatus } : o)));
    } catch (e: any) {
      alert(e?.message || 'Cập nhật trạng thái thất bại');
    }
  };

  // Check-in bằng billing ID
  const handleCheckIn = async (id: string) => {
    try {
      const updated = await checkInByBillingId(Number(id));
      const newStatus: OrderStatus = updated.status === 'RENTING' ? 'ongoing' : 'confirmed';
      setOrders(prev => prev.map(o => (o.id === String(updated.id) ? { ...o, status: newStatus } : o)));
      alert('Check-in thành công!');
    } catch (e: any) {
      alert(e?.message || 'Check-in thất bại');
    }
  };

  // Phê duyệt thanh toán khách hàng
  const handleApprovePayment = async (id: string) => {
    try {
      const updated = await approveCustomerPayment(Number(id));
      const newStatus: OrderStatus = updated.status === 'PAYED' ? 'paid' : 'confirmed';
      setOrders(prev => prev.map(o => (o.id === String(updated.id) ? { ...o, status: newStatus } : o)));
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
      alert('Vui lòng nhập ID hóa đơn.');
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
      // Map backend status to frontend status
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
      
      // Reload all orders from server to get latest status
      const reloadData = await getStationBillings();
      const mappedData = reloadData.map(mapBilling);
      setOrders(mappedData);
      setStationOrders(mappedData);
      
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
      alert('Phê duyệt thanh toán phạt thành công!');
    } catch (e: any) {
      alert(e?.message || 'Phê duyệt thanh toán phạt thất bại');
    }
  };



	// Tìm tất cả billings theo số điện thoại → đổ thẳng vào bảng chính
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
			alert(e?.message || 'Không tải được danh sách hóa đơn theo SĐT');
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
    // Backend only supports PAYED and CANCELLED transitions. Offer only meaningful actions.
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

  // Open dialog to upload image for rent-out
  const openUploadDialog = (id: string) => {
    setSelectedOrderId(id);
    setBillingId(id);
    setImageUrl('');
    setUploadOpen(true);
  };

  // Open dialog for return vehicle
  const openReturnDialog = (id: string) => {
    setReturnBillingId(id);
    setFinalImageUrl('');
    setPenaltyCost('');
    setReturnNote('');
    setReturnOpen(true);
  };

  const confirmUploadAndCheckIn = async () => {
    if (!billingId.trim()) {
      alert('Vui lòng nhập ID hóa đơn.');
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
      const newStatus: OrderStatus = updated.status === 'RENTING' ? 'ongoing' : 'confirmed';
      setOrders(prev => prev.map(o => (o.id === String(updated.id) ? { ...o, status: newStatus } : o)));
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

          {/* Check-in by phone section */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex-1">
			<Label htmlFor="phone-checkin" className="text-sm font-medium text-blue-800 mb-2 block">
				Tìm hóa đơn theo số điện thoại
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
					Tìm hóa đơn
				</Button>
				{phoneFilterActive && (
					<Button variant="outline" onClick={clearPhoneFilter}>Xóa lọc</Button>
				)}
			</div>
          </div>

			{phoneLookupLoading && (
				<div className="mb-4 text-sm text-gray-600">Đang tìm hóa đơn theo số điện thoại...</div>
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
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-500" />{o.customerName || 'Khách lẻ'}</div>
                        {o.customerPhone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="w-4 h-4" />{o.customerPhone}</div>
                        )}
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
                    {hasLocationColumn && (
                      <TableCell>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-500" />{o.pickupLocation}</div>
                      </TableCell>
                    )}
                    <TableCell>{statusBadge(o.status)}</TableCell>
                    <TableCell>
                      {o.status === 'ongoing' ? (
                        <Button 
                          onClick={() => handleInspectReturn(o.id)}
                          className="bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          Trả xe
                        </Button>
                      ) : o.status === 'paid' ? (
                        <Button 
                          onClick={() => openUploadDialog(o.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Giao xe 
                        </Button>
                      ) : actionOptions(o.status).length === 0 ? (
                        <span className="text-sm text-gray-500">Không có thao tác</span>
                      ) : (
                        <div className="inline-block w-44">
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
                                  // Move to ongoing locally (BE may do check-in elsewhere)
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
                            <SelectTrigger>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Upload pre-image dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Giao xe - tải ảnh hiện trạng trước khi thuê</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ID Hóa đơn</Label>
              <Input 
                placeholder="Nhập ID hóa đơn"
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

      {/* Return vehicle dialog */}
      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trả xe - kiểm tra tình trạng xe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ID Hóa đơn</Label>
              <Input 
                placeholder="Nhập ID hóa đơn"
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
