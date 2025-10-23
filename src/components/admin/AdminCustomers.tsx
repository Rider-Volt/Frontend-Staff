import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from '@/components/ui/table';
import { Users, Plus, Pencil, Ban, Check } from 'lucide-react';

type CustomerStatus = 'active' | 'banned';

interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  totalRentals: number;
  totalSpent: number;
  status: CustomerStatus;
}

const initialCustomers: Customer[] = [
  { id: 'CUS001', fullName: 'Nguyen Van A', email: 'a@example.com', phone: '0901234567', totalRentals: 12, totalSpent: 8600000, status: 'active' },
  { id: 'CUS002', fullName: 'Tran Thi B', email: 'b@example.com', phone: '0912345678', totalRentals: 5, totalSpent: 2100000, status: 'active' },
  { id: 'CUS003', fullName: 'Le Van C', email: 'c@example.com', phone: '0923456789', totalRentals: 1, totalSpent: 180000, status: 'banned' },
];

const money = (v: number) => `${v.toLocaleString()}₫`;

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Customer | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(c => [c.id, c.fullName, c.email, c.phone].some(f => f.toLowerCase().includes(q)));
  }, [customers, search]);

  const handleSave = (c: Customer) => {
    setCustomers(prev => {
      const exists = prev.some(x => x.id === c.id);
      return exists ? prev.map(x => (x.id === c.id ? c : x)) : [c, ...prev];
    });
    setOpen(false);
    setEditing(null);
  };

  const toggleBan = (id: string) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'banned' ? 'active' : 'banned' } : c));
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-xl font-bold text-gray-800">
            <Users className="h-5 w-5 text-green-500 mr-2" />
            Danh Sách Khách Hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <Input placeholder="Tìm theo mã, tên, email, SĐT" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:max-w-md" />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditing(null)} className="bg-green-500 hover:bg-green-600">
                  <Plus className="h-4 w-4 mr-2" /> Thêm khách hàng
                </Button>
              </DialogTrigger>
              <CustomerFormModal editing={editing} onSave={handleSave} />
            </Dialog>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Lượt thuê</TableHead>
                  <TableHead>Chi tiêu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(c => (
                  <TableRow key={c.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{c.id}</TableCell>
                    <TableCell>{c.fullName}</TableCell>
                    <TableCell className="text-gray-600">{c.email}</TableCell>
                    <TableCell>{c.phone}</TableCell>
                    <TableCell>{c.totalRentals}</TableCell>
                    <TableCell className="font-semibold text-green-700">{money(c.totalSpent)}</TableCell>
                    <TableCell>
                      {c.status === 'active' ? (
                        <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Bị khóa</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Dialog open={open && editing?.id === c.id} onOpenChange={setOpen}>
                        <Button variant="outline" size="sm" onClick={() => { setEditing(c); setOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <CustomerFormModal editing={editing?.id === c.id ? c : null} onSave={handleSave} />
                      </Dialog>
                      <Button variant="outline" size="sm" onClick={() => toggleBan(c.id)}>
                        {c.status === 'banned' ? <Check className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
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

export default AdminCustomers;

interface CustomerFormModalProps {
  editing: Customer | null;
  onSave: (c: Customer) => void;
}

const CustomerFormModal = ({ editing, onSave }: CustomerFormModalProps) => {
  const [form, setForm] = useState<Customer>(
    editing || { id: '', fullName: '', email: '', phone: '', totalRentals: 0, totalSpent: 0, status: 'active' }
  );

  const isEdit = Boolean(editing);

  const handleChange = (key: keyof Customer, value: string | number | CustomerStatus) => {
    setForm(prev => ({ ...prev, [key]: value } as Customer));
  };

  return (
    <DialogContent className="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Cập nhật khách hàng' : 'Thêm khách hàng'}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
        <Input placeholder="Mã" value={form.id} onChange={(e) => handleChange('id', e.target.value)} />
        <Input placeholder="Họ tên" value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} />
        <Input placeholder="Email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
        <Input placeholder="Số điện thoại" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
        <Input type="number" placeholder="Lượt thuê" value={form.totalRentals} onChange={(e) => handleChange('totalRentals', Number(e.target.value))} />
        <Input type="number" placeholder="Chi tiêu (₫)" value={form.totalSpent} onChange={(e) => handleChange('totalSpent', Number(e.target.value))} />
        <select className="border rounded-md px-3 py-2 text-sm" value={form.status} onChange={(e) => handleChange('status', e.target.value as CustomerStatus)}>
          <option value="active">Hoạt động</option>
          <option value="banned">Bị khóa</option>
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


