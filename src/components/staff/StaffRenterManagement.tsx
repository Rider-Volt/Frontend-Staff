import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, RefreshCw, Mail, Phone, ShieldCheck, ShieldAlert, User } from 'lucide-react';
import { getRenters, updateRenterStatus, type RenterAccount, type StaffAccountStatus } from '@/services/staffservice/staffAccountService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const StaffRenterManagement: React.FC = () => {
  const [renters, setRenters] = useState<RenterAccount[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const load = async () => {
    try {
      setLoading(true);
      const data = await getRenters();
      setRenters(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return renters.filter(r =>
      String(r.id).includes(q) ||
      (r.name || '').toLowerCase().includes(q) ||
      (r.email || '').toLowerCase().includes(q) ||
      (r.phone || '').toLowerCase().includes(q)
    );
  }, [search, renters]);

  const statusBadge = (status?: string) => {
    const s = String(status || '').toUpperCase();
    if (s === 'ACTIVE') return <Badge className="bg-green-100 text-green-700">Hoạt động</Badge>;
    if (s === 'INACTIVE') return <Badge className="bg-gray-100 text-gray-700">Chưa kích hoạt</Badge>;
    if (s === 'BANNED') return <Badge className="bg-red-100 text-red-700">Bị cấm</Badge>;
    if (s === 'VERIFIED') return <Badge className="bg-green-100 text-green-700">Đã xác minh</Badge>;
    return <Badge variant="secondary">{status || 'N/A'}</Badge>;
  };

  const handleChangeStatus = async (id: number, status: StaffAccountStatus) => {
    try {
      setUpdatingId(id);
      const updated = await updateRenterStatus(id, status);
      setRenters(prev => prev.map(r => (r.id === id ? { ...r, status: updated.status } : r)));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm khách hàng..." className="pl-10 w-80" />
        </div>
        <Button onClick={load} variant="outline" disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" /> {loading ? 'Đang tải...' : 'Làm mới'}
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-lg font-semibold">Danh sách khách hàng</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>ID</TableHead>
                  <TableHead>Ảnh</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số ĐT</TableHead>
                  <TableHead>Rủi ro</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Cập nhật</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-blue-600">#{r.id}</TableCell>
                    <TableCell>
                      {r.avatar && !imageErrors.has(r.id) ? (
                        <img 
                          src={r.avatar} 
                          alt={r.name} 
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          onError={() => {
                            setImageErrors(prev => new Set(prev).add(r.id));
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2"><Mail className="h-3 w-3 text-gray-400" /><span>{r.email}</span></div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-gray-400" /><span>{r.phone}</span></div>
                    </TableCell>
                    <TableCell className="font-medium">{r.riskScore ?? 0}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Select
                          value={(r.status as StaffAccountStatus) || 'ACTIVE'}
                          onValueChange={(v: StaffAccountStatus) => handleChangeStatus(r.id, v)}
                          disabled={updatingId === r.id}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                            <SelectItem value="INACTIVE">Chưa kích hoạt</SelectItem>
                            <SelectItem value="VERIFIED">Đã xác minh</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">Không có khách hàng</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffRenterManagement;


