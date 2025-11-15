import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  RefreshCw,
  MapPin,
  User,
  FileText,
  Clock,
  History
} from 'lucide-react';
import { 
  getIdentitySetById,
  getPendingIdentitySets,
  getVerificationHistory,
  verifyIdentitySet,
  type IdentitySet,
} from '@/services/staffservice/staffIdentityService';

const StaffIdentityVerification: React.FC = () => {
  const [pendingSets, setPendingSets] = useState<IdentitySet[]>([]);
  const [history, setHistory] = useState<IdentitySet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [viewingSet, setViewingSet] = useState<IdentitySet | null>(null);
  const [verifyingSet, setVerifyingSet] = useState<IdentitySet | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Load pending identity sets
  const loadPendingSets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPendingIdentitySets();
      setPendingSets(data);
    } catch (err) {
      console.error('Error loading pending sets:', err);
      setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách chờ xác minh');
    } finally {
      setLoading(false);
    }
  };

  // Load verification history
  const loadHistory = async () => {
    try {
      const data = await getVerificationHistory();
      setHistory(data);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  useEffect(() => {
    loadPendingSets();
    loadHistory();
  }, []);

  // View identity set details
  const handleViewDetails = async (id: number) => {
    try {
      const data = await getIdentitySetById(id);
      setViewingSet(data);
      setIsViewDialogOpen(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi tải chi tiết');
    }
  };

  // Open verify dialog
  const handleOpenVerify = (set: IdentitySet) => {
    setVerifyingSet(set);
    setRejectionReason('');
    setIsVerifyDialogOpen(true);
  };

  // Verify identity set
  const handleVerify = async (approved: boolean) => {
    if (!verifyingSet) return;

    try {
      setIsVerifying(true);
      const request = {
        // Backend expects APPROVED for successful verification in production
        status: approved ? "APPROVED" as const : "REJECTED" as const,
        rejectionReason: approved ? undefined : rejectionReason
      };
      
      await verifyIdentitySet(verifyingSet.id, request);
      
      // Reload data
      await loadPendingSets();
      await loadHistory();
      
      setIsVerifyDialogOpen(false);
      setVerifyingSet(null);
      setRejectionReason('');
      alert(approved ? 'Xác minh thành công!' : 'Từ chối xác minh thành công!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi xác minh');
    } finally {
      setIsVerifying(false);
    }
  };

  // Helper function to get asset by type
  const getAssetByType = (assets: IdentitySet['assets'], type: string) => {
    return assets?.find(asset => asset.type === type);
  };

  // Combine pending sets and history
  const allIdentitySets = [...pendingSets, ...history];

  // Filter all identity sets
  const filteredSets = allIdentitySets.filter(set => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      set.id.toString().includes(searchLower) ||
      set.cccdNumber?.toLowerCase().includes(searchLower) ||
      set.gplxNumber?.toLowerCase().includes(searchLower) ||
      (set.note?.toLowerCase().includes(searchLower)) ||
      (set.reviewNote?.toLowerCase().includes(searchLower))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Đang chờ</Badge>;
      case 'VERIFIED':
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Đã xác minh</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Đã từ chối</Badge>;
      default:
        return <Badge variant="secondary">{status || 'N/A'}</Badge>;
    }
  };

  if (loading && pendingSets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Refresh */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-80"
          />
        </div>
        <Button onClick={() => { loadPendingSets(); loadHistory(); }} variant="outline" disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Unified Identity Sets List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách xác minh danh tính</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Số CCCD</TableHead>
                <TableHead>Số GPLX</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead>Ngày xác minh</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Không có yêu cầu xác minh nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredSets.map((set) => (
                  <TableRow key={set.id}>
                    <TableCell className="font-medium">#{set.id}</TableCell>
                    <TableCell>{set.cccdNumber || 'N/A'}</TableCell>
                    <TableCell>{set.gplxNumber || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(set.status)}</TableCell>
                    <TableCell className="max-w-xs truncate">{set.note || set.reviewNote || 'N/A'}</TableCell>
                    <TableCell>
                      {set.reviewedAt ? new Date(set.reviewedAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Chưa xác minh'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(set.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                        {set.status === 'PENDING' && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenVerify(set)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Xác minh
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Chi tiết Identity Set</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về bộ giấy tờ xác minh danh tính
            </DialogDescription>
          </DialogHeader>
          {viewingSet && (
            <div className="overflow-y-auto flex-1 pr-4">
              <div className="space-y-6">
                {/* Info Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID</label>
                    <p className="text-sm font-semibold">{viewingSet.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Số CCCD</label>
                    <p className="text-sm font-semibold">{viewingSet.cccdNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Số GPLX</label>
                    <p className="text-sm font-semibold">{viewingSet.gplxNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                    <div className="mt-1">{getStatusBadge(viewingSet.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                    <p className="text-sm">{viewingSet.note || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ngày xem xét</label>
                    <p className="text-sm">
                      {viewingSet.reviewedAt ? new Date(viewingSet.reviewedAt).toLocaleString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {viewingSet.reviewNote && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Ghi chú xem xét</label>
                    <p className="text-sm text-gray-700 mt-1">{viewingSet.reviewNote}</p>
                  </div>
                )}
                
                {/* Documents Gallery */}
                <div className="space-y-4">
                  {/* CCCD Front */}
                  {getAssetByType(viewingSet.assets, 'CCCD_FRONT') && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">CCCD - Mặt trước</label>
                      <div className="border rounded-lg overflow-hidden bg-gray-100 flex justify-center">
                        <img 
                          src={getAssetByType(viewingSet.assets, 'CCCD_FRONT')!.url} 
                          alt="CCCD Front" 
                          className="max-w-full max-h-80 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.png';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* CCCD Back */}
                  {getAssetByType(viewingSet.assets, 'CCCD_BACK') && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">CCCD - Mặt sau</label>
                      <div className="border rounded-lg overflow-hidden bg-gray-100 flex justify-center">
                        <img 
                          src={getAssetByType(viewingSet.assets, 'CCCD_BACK')!.url} 
                          alt="CCCD Back" 
                          className="max-w-full max-h-80 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.png';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* GPLX Front */}
                  {getAssetByType(viewingSet.assets, 'GPLX_FRONT') && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">GPLX - Mặt trước</label>
                      <div className="border rounded-lg overflow-hidden bg-gray-100 flex justify-center">
                        <img 
                          src={getAssetByType(viewingSet.assets, 'GPLX_FRONT')!.url} 
                          alt="GPLX Front" 
                          className="max-w-full max-h-80 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.png';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* GPLX Back */}
                  {getAssetByType(viewingSet.assets, 'GPLX_BACK') && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">GPLX - Mặt sau</label>
                      <div className="border rounded-lg overflow-hidden bg-gray-100 flex justify-center">
                        <img 
                          src={getAssetByType(viewingSet.assets, 'GPLX_BACK')!.url} 
                          alt="GPLX Back" 
                          className="max-w-full max-h-80 object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.png';
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Verify Dialog */}
      <Dialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác minh Identity Set</DialogTitle>
            <DialogDescription>
              {verifyingSet && `Xác minh bộ giấy tờ #${verifyingSet.id}${verifyingSet.cccdNumber ? ` - CCCD: ${verifyingSet.cccdNumber}` : ''}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Button
                onClick={() => handleVerify(true)}
                disabled={isVerifying}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Chấp nhận
              </Button>
              <Button
                onClick={() => handleVerify(false)}
                disabled={isVerifying || !rejectionReason.trim()}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Từ chối
              </Button>
            </div>
            <div>
              <label className="text-sm font-medium">Lý do từ chối (bắt buộc nếu từ chối)</label>
              <Textarea
                placeholder="Nhập lý do từ chối..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVerifyDialogOpen(false)} disabled={isVerifying}>
              Hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffIdentityVerification;


