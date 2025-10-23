import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Plus, Pencil, DoorOpen, DoorClosed } from 'lucide-react';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from '@/components/ui/table';

type StationStatus = 'open' | 'closed';

interface Station {
  id: string;
  name: string;
  address: string;
  province: string;
  slots: number;
  availableSlots: number;
  status: StationStatus;
}

const initialStations: Station[] = [
  { id: 'ST-A', name: 'EV Station A', address: '12 Nguyễn Trái', province: 'Quận 1', slots: 20, availableSlots: 12, status: 'open' },
  { id: 'ST-B', name: 'EV Station B', address: '45 Lê Lợi', province: 'Quận 3', slots: 16, availableSlots: 2, status: 'open' },
  { id: 'ST-C', name: 'EV Station C', address: '8 Trần Phú', province: 'Quận 5', slots: 10, availableSlots: 0, status: 'closed' },
];

const AdminStations = () => {
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Station | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stations;
    return stations.filter(s => [s.id, s.name, s.address, s.province].some(f => f.toLowerCase().includes(q)));
  }, [stations, search]);

  const handleSave = (s: Station) => {
    setStations(prev => {
      const exists = prev.some(x => x.id === s.id);
      return exists ? prev.map(x => (x.id === s.id ? s : x)) : [s, ...prev];
    });
    setOpen(false);
    setEditing(null);
  };

  const toggleStatus = (id: string) => {
    setStations(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'open' ? 'closed' : 'open' } : s));
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
            <Input placeholder="Tìm theo mã, tên, địa chỉ, quận" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:max-w-md" />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditing(null)} className="bg-green-500 hover:bg-green-600">
                  <Plus className="h-4 w-4 mr-2" /> Thêm điểm thuê
                </Button>
              </DialogTrigger>
              <StationFormModal editing={editing} onSave={handleSave} />
            </Dialog>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Tên điểm</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Quận</TableHead>
                  <TableHead>Sức chứa</TableHead>
                  <TableHead>Đang trống</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{s.id}</TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell className="text-gray-600">{s.address}</TableCell>
                    <TableCell>{s.province}</TableCell>
                    <TableCell>{s.slots}</TableCell>
                    <TableCell className={s.availableSlots > 0 ? 'text-green-700 font-medium' : 'text-red-600 font-medium'}>{s.availableSlots}</TableCell>
                    <TableCell>
                      {s.status === 'open' ? (
                        <Badge className="bg-green-100 text-green-800">Đang mở</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Đã đóng</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog open={open && editing?.id === s.id} onOpenChange={setOpen}>
                        <Button variant="outline" size="sm" onClick={() => { setEditing(s); setOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <StationFormModal editing={editing?.id === s.id ? s : null} onSave={handleSave} />
                      </Dialog>
                      <Button variant="outline" size="sm" onClick={() => toggleStatus(s.id)}>
                        {s.status === 'open' ? <DoorClosed className="h-4 w-4" /> : <DoorOpen className="h-4 w-4" />}
                      </Button>
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

export default AdminStations;

interface StationFormModalProps {
  editing: Station | null;
  onSave: (s: Station) => void;
}

const StationFormModal = ({ editing, onSave }: StationFormModalProps) => {
  const [form, setForm] = useState<Station>(
    editing || { id: '', name: '', address: '', province: '', slots: 10, availableSlots: 0, status: 'open' }
  );

  const isEdit = Boolean(editing);

  const handleChange = (key: keyof Station, value: string | number | StationStatus) => {
    setForm(prev => ({ ...prev, [key]: value } as Station));
  };

  return (
    <DialogContent className="sm:max-w-[560px]">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Cập nhật điểm thuê' : 'Thêm điểm thuê'}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
        <Input placeholder="Mã" value={form.id} onChange={(e) => handleChange('id', e.target.value)} />
        <Input placeholder="Tên điểm" value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
        <Input placeholder="Địa chỉ" value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
        <Input placeholder="Quận" value={form.province} onChange={(e) => handleChange('province', e.target.value)} />
        <Input type="number" placeholder="Sức chứa" value={form.slots} onChange={(e) => handleChange('slots', Number(e.target.value))} />
        <Input type="number" placeholder="Đang trống" value={form.availableSlots} onChange={(e) => handleChange('availableSlots', Number(e.target.value))} />
        <select className="border rounded-md px-3 py-2 text-sm" value={form.status} onChange={(e) => handleChange('status', e.target.value as StationStatus)}>
          <option value="open">Đang mở</option>
          <option value="closed">Đã đóng</option>
        </select>
      </div>
      <DialogFooter>
        <Button className="bg-green-500 hover:bg-green-600" onClick={() => onSave(form)}>
          Lưu
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};


