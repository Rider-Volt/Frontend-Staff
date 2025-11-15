import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MapPin, Plus, Pencil, Trash2 } from 'lucide-react';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { getStationStaff } from '@/services/adminservice/adminEmployeeService';
import {
  getAllStations,
  createStation,
  updateStation,
  deleteStation,
  type Station as StationData,
} from '@/services/adminservice/adminStationService';

interface Station {
  id: string;
  name: string;
  address: string;
  staffId: number;
  staffFullName: string;
  staffCount: number;
  totalVehicles: number;
}

const AdminStations = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Station | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      const data = await getAllStations();
      const mappedData: Station[] = await Promise.all(
        data.map(async (station: StationData) => {
          let staffCount = 0;
          try {
            const staff = await getStationStaff(station.id);
            staffCount = staff.filter((member) => member.isActive).length;
          } catch (error) {
            console.error(`Failed to load staff for station ${station.id}:`, error);
          }

          return {
            id: station.id.toString(),
            name: station.name,
            address: station.address,
            staffId: station.staffId ?? 0,
            staffFullName: station.staffFullName || "",
            staffCount,
            totalVehicles: station.totalVehicles ?? 0,
          };
        })
      );
      setStations(mappedData);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tải danh sách trạm",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stations;
    return stations.filter(s => [s.id, s.name, s.address].some(f => f.toLowerCase().includes(q)));
  }, [stations, search]);

  const handleSave = async (s: Station) => {
    try {
      const isEdit = Boolean(editing);
      
      if (isEdit && s.id) {
        // Lấy ID số từ chuỗi ID của trạm
        const numericId = parseInt(s.id);
        
        if (isNaN(numericId)) {
          toast({
            title: "Lỗi",
            description: "ID trạm không hợp lệ",
            variant: "destructive",
          });
          return;
        }
        
        await updateStation(numericId, {
          name: s.name.trim(),
          address: s.address.trim(),
          staffId: s.staffId && s.staffId > 0 ? s.staffId : null,
        });
        
        toast({
          title: "Thành công",
          description: "Đã cập nhật trạm thành công",
        });
      } else {
        // Tạo trạm mới - ID sẽ được tự động tạo bởi backend
        const stationData: any = {
          name: s.name.trim(),
          address: s.address.trim(),
          staffId: (s.staffId && s.staffId > 0) ? s.staffId : null, // Only send staffId if it's a valid number > 0
        };
        
        console.log('Gửi dữ liệu trạm:', stationData);
        
        await createStation(stationData);
        
        toast({
          title: "Thành công",
          description: "Đã tạo trạm mới thành công",
        });
      }
      
      await loadStations();
      setOpen(false);
      setEditing(null);
    } catch (error) {
      console.error('Lỗi khi lưu trạm:', error);
      let errorMessage = "Không thể lưu trạm";
      
      if (error instanceof Error) {
        // Thử phân tích thông báo lỗi dạng JSON
        try {
          const errorData = JSON.parse(error.message);
          errorMessage = errorData.message || errorData.error || error.message;
        } catch {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa trạm này?')) {
      return;
    }
    
    try {
      const numericId = parseInt(id) || 0;
      await deleteStation(numericId);
      
      toast({
        title: "Thành công",
        description: "Đã xóa trạm thành công",
      });
      
      await loadStations();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa trạm",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-xl font-bold text-gray-800">
            <MapPin className="h-5 w-5 text-green-500 mr-2" />
            Danh Sách Điểm Thuê
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <Input placeholder="Tìm theo mã, tên, địa chỉ" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:max-w-md" />
            <Button 
              onClick={() => { setEditing(null); setOpen(true); }} 
              className="bg-green-500 hover:bg-green-600"
            >
              <Plus className="h-4 w-4 mr-2" /> Thêm điểm thuê
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên điểm</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Số xe</TableHead>
                  <TableHead>Nhân viên</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-3 text-gray-600">Đang tải...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Không có dữ liệu
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(s => (
                    <TableRow key={s.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{s.id}</TableCell>
                      <TableCell>{s.name}</TableCell>
                      <TableCell className="text-gray-600">{s.address}</TableCell>
                      <TableCell className="font-medium">{s.totalVehicles}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {s.staffCount > 0
                          ? `${s.staffCount} nhân viên`
                          : s.staffFullName
                          ? s.staffFullName
                          : 'Chưa gán'}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-full bg-green-50 hover:bg-green-100 border-green-100"
                            >
                              <span className="text-xl leading-none">⋯</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => {
                                setEditing(s);
                                setOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => handleDelete(s.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa trạm
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <StationFormModal editing={editing} onSave={handleSave} />
      </Dialog>
    </div>
  );
};

export default AdminStations;

interface StationFormModalProps {
  editing: Station | null;
  onSave: (s: Station) => void;
}

const StationFormModal = ({ editing, onSave }: StationFormModalProps) => {
const defaultStation: Station = { id: '', name: '', address: '', staffId: 0, staffFullName: '', staffCount: 0, totalVehicles: 0 };
  
  const [form, setForm] = useState<Station>(
    editing || defaultStation
  );
  const { toast } = useToast();

  const isEdit = Boolean(editing);

  useEffect(() => {
    setForm(editing || defaultStation);
  }, [editing]);

  // Không cần tải danh sách nhân viên ở đây vì form hiện tại nhập ID thủ công

  const handleChange = (key: keyof Station, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value } as Station));
  };

  const handleSubmit = async () => {
    // Kiểm tra dữ liệu
    if (!form.name.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên điểm thuê",
        variant: "destructive",
      });
      return;
    }
    if (!form.address.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập địa chỉ",
        variant: "destructive",
      });
      return;
    }
    
    await onSave(form);
  };

  return (
    <DialogContent className="sm:max-w-[560px]">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Cập nhật điểm thuê' : 'Thêm điểm thuê mới'}</DialogTitle>
        <DialogDescription>
          {isEdit ? 'Cập nhật thông tin điểm thuê' : 'Nhập thông tin để tạo điểm thuê mới'}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 py-2">
        {isEdit && (
          <div>
            <label className="text-sm font-medium text-gray-700">Mã</label>
            <Input 
              value={form.id} 
              disabled
              className="mt-1"
            />
          </div>
        )}
        <div>
          <label className="text-sm font-medium text-gray-700">Tên điểm thuê <span className="text-red-500">*</span></label>
          <Input 
            placeholder="VD: Rider Volt Quận 1" 
            value={form.name} 
            onChange={(e) => handleChange('name', e.target.value)}
            className="mt-1"
            required 
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Địa chỉ <span className="text-red-500">*</span></label>
          <Input 
            placeholder="VD: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM" 
            value={form.address} 
            onChange={(e) => handleChange('address', e.target.value)}
            className="mt-1"
            required 
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700"> Nhân viên </label>
          <Input
            type="number"
            placeholder="Nhập ID nhân viên (để trống nếu chưa gán)"
            value={form.staffId && form.staffId > 0 ? form.staffId : ''}
            onChange={(e) => {
              const val = e.target.value;
              const parsed = val === '' ? 0 : parseInt(val);
              handleChange('staffId', isNaN(parsed) ? 0 : parsed);
            }}
            className="mt-1"
            min={0}
          />
        </div>
      </div>
      <DialogFooter>
        <Button className="bg-green-500 hover:bg-green-600" onClick={handleSubmit}>
          {isEdit ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};


