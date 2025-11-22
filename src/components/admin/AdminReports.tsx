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
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Archive,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { 
  getStationReports,
  getStationReportsByStatus,
  archiveReport,
  ReportResponse,
  ReportStatus
} from '../../services/adminservice/adminReportService';
import { getAllStations, Station } from '../../services/adminservice/adminStationService';

const AdminReports = () => {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'FINALIZED' | 'ARCHIVED'>('all');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<ReportResponse | null>(null);

  // Tải danh sách stations từ API
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await getAllStations();
        setStations(data);
        // Set the first station as default if available
        if (data.length > 0) {
          setSelectedStationId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching stations:', err);
      }
    };

    fetchStations();
  }, []);

  // Tải danh sách reports từ API
  useEffect(() => {
    const fetchReports = async () => {
      if (!selectedStationId) {
        setReports([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        let data: ReportResponse[];
        if (statusFilter === 'all') {
          data = await getStationReports(selectedStationId);
        } else {
          data = await getStationReportsByStatus(selectedStationId, statusFilter);
        }
        
        setReports(data);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách báo cáo');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [selectedStationId, statusFilter]);

  // Lọc reports dựa trên từ khóa tìm kiếm
  const filteredReports = reports.filter(report => {
    if (!searchTerm.trim()) {
      return true;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const stationMatch = report.stationName?.toLowerCase().includes(searchLower) || false;
    const noteMatch = report.note?.toLowerCase().includes(searchLower) || false;
    const statusMatch = report.status?.toLowerCase().includes(searchLower) || false;
    
    return stationMatch || noteMatch || statusMatch;
  });

  // Archive report
  const handleArchiveReport = async (reportId: number) => {
    if (!confirm('Bạn có chắc chắn muốn lưu trữ báo cáo này? Báo cáo đã lưu trữ sẽ không thể chỉnh sửa.')) return;
    
    try {
      const archivedReport = await archiveReport(reportId);
      setReports(reports.map(report => 
        report.id === reportId ? archivedReport : report
      ));
      alert('Lưu trữ báo cáo thành công!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi lưu trữ báo cáo');
    }
  };

  // Lấy badge cho trạng thái report
  const getStatusBadge = (status: ReportStatus) => {
    switch (status?.toUpperCase()) {
      case 'FINALIZED':
        return { variant: 'default' as const, className: 'bg-blue-100 text-blue-800', text: 'Đã hoàn thành' };
      case 'ARCHIVED':
        return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800', text: 'Đã lưu trữ' };
      case 'DRAFT':
        return { variant: 'outline' as const, className: 'bg-yellow-100 text-yellow-800', text: 'Bản nháp' };
      default:
        return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800', text: status || 'Không xác định' };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải danh sách báo cáo...</span>
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
      {/* Tìm kiếm và Lọc */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm báo cáo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select 
            value={selectedStationId?.toString() || ''}
            onValueChange={(value) => setSelectedStationId(parseInt(value))}
            disabled={stations.length === 0}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={stations.length === 0 ? 'Đang tải...' : 'Chọn trạm'} />
            </SelectTrigger>
            <SelectContent>
              {stations.map((station) => (
                <SelectItem key={station.id} value={station.id.toString()}>
                  {station.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={statusFilter} 
            onValueChange={(value) => setStatusFilter(value as 'all' | 'FINALIZED' | 'ARCHIVED')}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="FINALIZED">Đã hoàn thành</SelectItem>
              <SelectItem value="ARCHIVED">Đã lưu trữ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dialog Xem Chi Tiết Báo Cáo */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi Tiết Báo Cáo</DialogTitle>
          </DialogHeader>
          {viewingReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID Báo Cáo</label>
                  <p className="text-sm">{viewingReport.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạm</label>
                  <p className="text-sm">{viewingReport.stationName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày bắt đầu</label>
                  <p className="text-sm">{formatDate(viewingReport.periodStart)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày kết thúc</label>
                  <p className="text-sm">{formatDate(viewingReport.periodEnd)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Tổng số chuyến</label>
                  <p className="text-sm font-semibold">{viewingReport.totalTrips}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Chuyến thành công</label>
                  <p className="text-sm font-semibold text-green-600">{viewingReport.successfulTrips}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Chuyến đã hủy</label>
                  <p className="text-sm font-semibold text-red-600">{viewingReport.canceledTrips}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tổng doanh thu</label>
                  <p className="text-sm font-semibold text-green-600">{formatCurrency(viewingReport.totalRevenue)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Đánh giá trung bình</label>
                  <p className="text-sm font-semibold">{viewingReport.avgRating.toFixed(1)} ⭐</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <div className="mt-1">
                    <Badge 
                      variant={getStatusBadge(viewingReport.status).variant} 
                      className={getStatusBadge(viewingReport.status).className}
                    >
                      {getStatusBadge(viewingReport.status).text}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {viewingReport.note && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Ghi chú</label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{viewingReport.note}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                  <p className="text-sm">{new Date(viewingReport.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                {viewingReport.updatedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ngày cập nhật</label>
                    <p className="text-sm">{new Date(viewingReport.updatedAt).toLocaleString('vi-VN')}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bảng Danh Sách Báo Cáo */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Báo Cáo</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedStationId ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Không có trạm nào để hiển thị báo cáo</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Trạm</TableHead>
                  <TableHead>Kỳ báo cáo</TableHead>
                  <TableHead>Tổng chuyến</TableHead>
                  <TableHead>Thành công</TableHead>
                  <TableHead>Đã hủy</TableHead>
                  <TableHead>Doanh thu</TableHead>
                  <TableHead>Đánh giá</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                      Không có báo cáo nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => {
                    const statusBadge = getStatusBadge(report.status);
                    return (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.id}</TableCell>
                        <TableCell className="text-sm">{report.stationName}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                        </TableCell>
                        <TableCell>{report.totalTrips}</TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          {report.successfulTrips}
                        </TableCell>
                        <TableCell className="text-red-600 font-semibold">
                          {report.canceledTrips}
                        </TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          {formatCurrency(report.totalRevenue)}
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold">{report.avgRating.toFixed(1)} ⭐</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadge.variant} className={statusBadge.className}>
                            {statusBadge.text}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => {
                                setViewingReport(report);
                                setIsViewDialogOpen(true);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              {report.status === 'FINALIZED' && (
                                <DropdownMenuItem 
                                  onSelect={() => handleArchiveReport(report.id)}
                                  className="text-blue-600"
                                >
                                  <Archive className="mr-2 h-4 w-4" />
                                  Lưu trữ
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;








