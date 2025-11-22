import { useState, useEffect, useMemo } from "react";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  TrendingUp,
  DollarSign,
  Star,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllReports,
  getReportById,
  getReportsByStatus,
  createReport,
  updateReport,
  updateReportStatus,
  deleteReport,
  type ReportResponse,
  type ReportStatus,
  type CreateReportRequest,
  type UpdateReportRequest,
} from "@/services/staffservice/staffReportService";

const statusLabels: Record<ReportStatus, string> = {
  DRAFT: "Bản nháp",
  FINALIZED: "Đã hoàn thành",
  ARCHIVED: "Đã lưu trữ",
};

const statusColors: Record<ReportStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  FINALIZED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-blue-100 text-blue-800",
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  try {
    // Handle both "YYYY-MM-DD" and ISO datetime formats
    const date = dateString.includes("T") 
      ? new Date(dateString) 
      : new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("vi-VN");
  } catch {
    return dateString;
  }
};

const StaffReportsPage = () => {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(null);
  const [deletingReportId, setDeletingReportId] = useState<number | null>(null);
  const [statusUpdateNote, setStatusUpdateNote] = useState("");
  const [updatingStatusReportId, setUpdatingStatusReportId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<ReportStatus>("DRAFT");

  // Form states
  const [formPeriodStart, setFormPeriodStart] = useState("");
  const [formPeriodEnd, setFormPeriodEnd] = useState("");
  const [formTotalTrips, setFormTotalTrips] = useState("");
  const [formSuccessfulTrips, setFormSuccessfulTrips] = useState("");
  const [formCanceledTrips, setFormCanceledTrips] = useState("");
  const [formTotalRevenue, setFormTotalRevenue] = useState("");
  const [formAvgRating, setFormAvgRating] = useState("");
  const [formNote, setFormNote] = useState("");
  const [formStatus, setFormStatus] = useState<ReportStatus>("DRAFT");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let data: ReportResponse[];
      if (statusFilter === "all") {
        data = await getAllReports();
      } else {
        data = await getReportsByStatus(statusFilter);
      }
      setReports(data);
    } catch (error: any) {
      console.error("Error fetching reports:", error);
      toast.error(error?.message || "Không thể tải danh sách báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const filteredReports = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return reports;
    return reports.filter(
      (r) =>
        r.stationName?.toLowerCase().includes(q) ||
        r.id.toString().includes(q) ||
        r.note?.toLowerCase().includes(q)
    );
  }, [reports, searchQuery]);

  const handleCreateReport = async () => {
    if (!formPeriodStart || !formPeriodEnd) {
      toast.error("Vui lòng chọn khoảng thời gian báo cáo");
      return;
    }

    if (
      !formTotalTrips ||
      !formSuccessfulTrips ||
      !formCanceledTrips ||
      !formTotalRevenue ||
      !formAvgRating
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin thống kê");
      return;
    }

    setIsSubmitting(true);
    try {
      const data: CreateReportRequest = {
        periodStart: formPeriodStart,
        periodEnd: formPeriodEnd,
        totalTrips: Number(formTotalTrips),
        successfulTrips: Number(formSuccessfulTrips),
        canceledTrips: Number(formCanceledTrips),
        totalRevenue: Number(formTotalRevenue),
        avgRating: Number(formAvgRating),
        note: formNote.trim() || undefined,
        // status defaults to "DRAFT" and stationId is auto-detected
      };
      await createReport(data);
      toast.success("Tạo báo cáo thành công");
      setIsCreateDialogOpen(false);
      resetForm();
      fetchReports();
    } catch (error: any) {
      toast.error(error?.message || "Không thể tạo báo cáo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditReport = async () => {
    if (!selectedReport) return;

    // ARCHIVED reports are read-only
    if (selectedReport.status === "ARCHIVED") {
      toast.error("Báo cáo đã lưu trữ không thể chỉnh sửa");
      return;
    }

    // FINALIZED reports can only update note
    if (selectedReport.status === "FINALIZED") {
      if (!formNote.trim()) {
        toast.error("Vui lòng nhập ghi chú");
        return;
      }
      setIsSubmitting(true);
      try {
        const data: UpdateReportRequest = {
          note: formNote.trim(),
        };
        await updateReport(selectedReport.id, data);
        toast.success("Cập nhật ghi chú thành công");
        setIsEditDialogOpen(false);
        resetForm();
        setSelectedReport(null);
        fetchReports();
      } catch (error: any) {
        toast.error(error?.message || "Không thể cập nhật báo cáo");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // DRAFT reports can update all fields
    if (!formPeriodStart || !formPeriodEnd) {
      toast.error("Vui lòng chọn khoảng thời gian báo cáo");
      return;
    }

    setIsSubmitting(true);
    try {
      const data: UpdateReportRequest = {
        periodStart: formPeriodStart,
        periodEnd: formPeriodEnd,
        totalTrips: formTotalTrips ? Number(formTotalTrips) : undefined,
        successfulTrips: formSuccessfulTrips ? Number(formSuccessfulTrips) : undefined,
        canceledTrips: formCanceledTrips ? Number(formCanceledTrips) : undefined,
        totalRevenue: formTotalRevenue ? Number(formTotalRevenue) : undefined,
        avgRating: formAvgRating ? Number(formAvgRating) : undefined,
        note: formNote.trim() || undefined,
        status: formStatus,
      };
      await updateReport(selectedReport.id, data);
      toast.success("Cập nhật báo cáo thành công");
      setIsEditDialogOpen(false);
      resetForm();
      setSelectedReport(null);
      fetchReports();
    } catch (error: any) {
      toast.error(error?.message || "Không thể cập nhật báo cáo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openStatusUpdateDialog = (report: ReportResponse) => {
    setSelectedReport(report);
    setUpdatingStatusReportId(report.id);
    const allowedStatuses = getAllowedStatuses(report.status);
    // Set to first allowed status, or keep current if none allowed
    setNewStatus(allowedStatuses.length > 0 ? allowedStatuses[0] : report.status);
    setStatusUpdateNote("");
    setIsStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!updatingStatusReportId) return;

    try {
      await updateReportStatus(
        updatingStatusReportId,
        newStatus,
        statusUpdateNote.trim() || undefined
      );
      toast.success("Cập nhật trạng thái thành công");
      setIsStatusDialogOpen(false);
      setStatusUpdateNote("");
      setUpdatingStatusReportId(null);
      fetchReports();
    } catch (error: any) {
      toast.error(error?.message || "Không thể cập nhật trạng thái");
    }
  };

  // Get allowed next statuses based on current status
  const getAllowedStatuses = (currentStatus: ReportStatus): ReportStatus[] => {
    switch (currentStatus) {
      case "DRAFT":
        return ["FINALIZED"];
      case "FINALIZED":
        return ["ARCHIVED"];
      case "ARCHIVED":
        return []; // No transitions from ARCHIVED
      default:
        return [];
    }
  };

  const handleDeleteReport = async () => {
    if (!deletingReportId) return;

    try {
      await deleteReport(deletingReportId);
      toast.success("Xóa báo cáo thành công");
      setIsDeleteDialogOpen(false);
      setDeletingReportId(null);
      fetchReports();
    } catch (error: any) {
      toast.error(error?.message || "Không thể xóa báo cáo");
    }
  };

  const openCreateDialog = () => {
    resetForm();
    // Set default dates (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    setFormPeriodStart(firstDay.toISOString().split("T")[0]);
    setFormPeriodEnd(lastDay.toISOString().split("T")[0]);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (report: ReportResponse) => {
    setSelectedReport(report);
    // Handle both "YYYY-MM-DD" and ISO datetime formats
    const periodStart = report.periodStart.includes("T")
      ? report.periodStart.split("T")[0]
      : report.periodStart;
    const periodEnd = report.periodEnd.includes("T")
      ? report.periodEnd.split("T")[0]
      : report.periodEnd;
    setFormPeriodStart(periodStart);
    setFormPeriodEnd(periodEnd);
    setFormTotalTrips(String(report.totalTrips));
    setFormSuccessfulTrips(String(report.successfulTrips));
    setFormCanceledTrips(String(report.canceledTrips));
    setFormTotalRevenue(String(report.totalRevenue));
    setFormAvgRating(String(report.avgRating));
    setFormNote(report.note || "");
    setFormStatus(report.status);
    setIsEditDialogOpen(true);
  };

  const openViewDialog = async (reportId: number) => {
    try {
      const report = await getReportById(reportId);
      setSelectedReport(report);
      setIsViewDialogOpen(true);
    } catch (error: any) {
      toast.error(error?.message || "Không thể tải chi tiết báo cáo");
    }
  };

  const openDeleteDialog = (reportId: number) => {
    setDeletingReportId(reportId);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormPeriodStart("");
    setFormPeriodEnd("");
    setFormTotalTrips("");
    setFormSuccessfulTrips("");
    setFormCanceledTrips("");
    setFormTotalRevenue("");
    setFormAvgRating("");
    setFormNote("");
    setFormStatus("DRAFT");
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("vi-VN");
    } catch {
      return dateString;
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (reports.length === 0) {
      return {
        totalReports: 0,
        totalRevenue: 0,
        totalTrips: 0,
        avgRating: 0,
      };
    }
    const totalRevenue = reports.reduce((sum, r) => sum + (r.totalRevenue || 0), 0);
    const totalTrips = reports.reduce((sum, r) => sum + (r.totalTrips || 0), 0);
    const avgRating =
      reports.reduce((sum, r) => sum + (r.avgRating || 0), 0) / reports.length;
    return {
      totalReports: reports.length,
      totalRevenue,
      totalTrips,
      avgRating: Math.round(avgRating * 10) / 10,
    };
  }, [reports]);

  return (
    <StaffLayout>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Quản lý báo cáo trạm
            </h1>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Tạo báo cáo mới
            </Button>
          </div>
          <p className="text-muted-foreground">
            Quản lý và theo dõi các báo cáo thống kê của trạm
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tổng báo cáo</p>
                  <p className="text-2xl font-bold">{stats.totalReports}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tổng doanh thu</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tổng chuyến đi</p>
                  <p className="text-2xl font-bold">{stats.totalTrips}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Đánh giá TB</p>
                  <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2 w-full md:w-auto">
                <Label htmlFor="search">Tìm kiếm</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Tìm theo tên trạm, ID, ghi chú..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2 w-full md:w-auto md:min-w-[200px]">
                <Label htmlFor="status-filter">Lọc theo trạng thái</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as ReportStatus | "all")}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={fetchReports} disabled={loading} className="w-full md:w-auto">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Làm mới
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách báo cáo ({filteredReports.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Đang tải...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Không có báo cáo nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Trạm</TableHead>
                      <TableHead>Khoảng thời gian</TableHead>
                      <TableHead>Chuyến đi</TableHead>
                      <TableHead>Doanh thu</TableHead>
                      <TableHead>Đánh giá</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.id}</TableCell>
                        <TableCell>{report.stationName || "-"}</TableCell>
                        <TableCell>
                          {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Tổng: {report.totalTrips}</div>
                            <div className="text-green-600">Thành công: {report.successfulTrips}</div>
                            <div className="text-red-600">Hủy: {report.canceledTrips}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(report.totalRevenue)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span>{report.avgRating.toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              statusColors[report.status] || "bg-gray-100 text-gray-800"
                            }
                          >
                            {statusLabels[report.status] || report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDateTime(report.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openViewDialog(report.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(report)}
                              disabled={report.status === "ARCHIVED"}
                              title={
                                report.status === "ARCHIVED"
                                  ? "Báo cáo đã lưu trữ không thể chỉnh sửa"
                                  : "Chỉnh sửa báo cáo"
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openStatusUpdateDialog(report)}
                              disabled={getAllowedStatuses(report.status).length === 0}
                              title={
                                getAllowedStatuses(report.status).length === 0
                                  ? "Không thể chuyển đổi trạng thái"
                                  : "Cập nhật trạng thái"
                              }
                            >
                              <Filter className="h-4 w-4 mr-1" />
                              Đổi trạng thái
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(report.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo báo cáo mới</DialogTitle>
              <DialogDescription>
                Điền thông tin thống kê để tạo báo cáo mới
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-period-start">Ngày bắt đầu *</Label>
                  <Input
                    id="create-period-start"
                    type="date"
                    value={formPeriodStart}
                    onChange={(e) => setFormPeriodStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-period-end">Ngày kết thúc *</Label>
                  <Input
                    id="create-period-end"
                    type="date"
                    value={formPeriodEnd}
                    onChange={(e) => setFormPeriodEnd(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-total-trips">Tổng chuyến đi *</Label>
                  <Input
                    id="create-total-trips"
                    type="number"
                    min="0"
                    value={formTotalTrips}
                    onChange={(e) => setFormTotalTrips(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-successful-trips">Chuyến thành công *</Label>
                  <Input
                    id="create-successful-trips"
                    type="number"
                    min="0"
                    value={formSuccessfulTrips}
                    onChange={(e) => setFormSuccessfulTrips(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-canceled-trips">Chuyến hủy *</Label>
                  <Input
                    id="create-canceled-trips"
                    type="number"
                    min="0"
                    value={formCanceledTrips}
                    onChange={(e) => setFormCanceledTrips(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-total-revenue">Tổng doanh thu (VND) *</Label>
                  <Input
                    id="create-total-revenue"
                    type="number"
                    min="0"
                    value={formTotalRevenue}
                    onChange={(e) => setFormTotalRevenue(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-avg-rating">Đánh giá trung bình *</Label>
                  <Input
                    id="create-avg-rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formAvgRating}
                    onChange={(e) => setFormAvgRating(e.target.value)}
                    placeholder="0.0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-note">Ghi chú</Label>
                <Textarea
                  id="create-note"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder="Nhập ghi chú (tùy chọn)"
                  rows={3}
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Lưu ý:</strong> Báo cáo mới sẽ tự động được tạo với trạng thái <strong>"Bản nháp"</strong>. 
                  Trạm sẽ được tự động xác định từ tài khoản nhân viên của bạn.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button onClick={handleCreateReport} disabled={isSubmitting}>
                {isSubmitting ? "Đang tạo..." : "Tạo báo cáo"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa báo cáo</DialogTitle>
              <DialogDescription>
                {selectedReport && (
                  <>
                    Trạng thái hiện tại:{" "}
                    <Badge
                      className={
                        statusColors[selectedReport.status] || "bg-gray-100 text-gray-800"
                      }
                    >
                      {statusLabels[selectedReport.status]}
                    </Badge>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedReport?.status === "ARCHIVED" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    <strong>Không thể chỉnh sửa:</strong> Báo cáo đã lưu trữ là chỉ đọc và không thể chỉnh sửa.
                  </p>
                </div>
              )}
              {selectedReport?.status === "FINALIZED" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Hạn chế chỉnh sửa:</strong> Báo cáo đã hoàn thành chỉ có thể cập nhật ghi chú.
                  </p>
                </div>
              )}
              {selectedReport?.status === "DRAFT" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Chỉnh sửa đầy đủ:</strong> Báo cáo bản nháp có thể chỉnh sửa tất cả các trường.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-period-start">Ngày bắt đầu *</Label>
                  <Input
                    id="edit-period-start"
                    type="date"
                    value={formPeriodStart}
                    onChange={(e) => setFormPeriodStart(e.target.value)}
                    disabled={selectedReport?.status !== "DRAFT"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-period-end">Ngày kết thúc *</Label>
                  <Input
                    id="edit-period-end"
                    type="date"
                    value={formPeriodEnd}
                    onChange={(e) => setFormPeriodEnd(e.target.value)}
                    disabled={selectedReport?.status !== "DRAFT"}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-total-trips">Tổng chuyến đi</Label>
                  <Input
                    id="edit-total-trips"
                    type="number"
                    min="0"
                    value={formTotalTrips}
                    onChange={(e) => setFormTotalTrips(e.target.value)}
                    placeholder="0"
                    disabled={selectedReport?.status !== "DRAFT"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-successful-trips">Chuyến thành công</Label>
                  <Input
                    id="edit-successful-trips"
                    type="number"
                    min="0"
                    value={formSuccessfulTrips}
                    onChange={(e) => setFormSuccessfulTrips(e.target.value)}
                    placeholder="0"
                    disabled={selectedReport?.status !== "DRAFT"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-canceled-trips">Chuyến hủy</Label>
                  <Input
                    id="edit-canceled-trips"
                    type="number"
                    min="0"
                    value={formCanceledTrips}
                    onChange={(e) => setFormCanceledTrips(e.target.value)}
                    placeholder="0"
                    disabled={selectedReport?.status !== "DRAFT"}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-total-revenue">Tổng doanh thu (VND)</Label>
                  <Input
                    id="edit-total-revenue"
                    type="number"
                    min="0"
                    value={formTotalRevenue}
                    onChange={(e) => setFormTotalRevenue(e.target.value)}
                    placeholder="0"
                    disabled={selectedReport?.status !== "DRAFT"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-avg-rating">Đánh giá trung bình</Label>
                  <Input
                    id="edit-avg-rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formAvgRating}
                    onChange={(e) => setFormAvgRating(e.target.value)}
                    placeholder="0.0"
                    disabled={selectedReport?.status !== "DRAFT"}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-note">
                  Ghi chú {selectedReport?.status === "FINALIZED" && "*"}
                </Label>
                <Textarea
                  id="edit-note"
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  placeholder={
                    selectedReport?.status === "FINALIZED"
                      ? "Nhập ghi chú (bắt buộc)"
                      : "Nhập ghi chú (tùy chọn)"
                  }
                  rows={3}
                  disabled={selectedReport?.status === "ARCHIVED"}
                />
              </div>
              {selectedReport?.status === "DRAFT" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Trạng thái</Label>
                  <Select
                    value={formStatus}
                    onValueChange={(value) => setFormStatus(value as ReportStatus)}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button
                onClick={handleEditReport}
                disabled={isSubmitting || selectedReport?.status === "ARCHIVED"}
              >
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết báo cáo</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">ID</Label>
                    <p className="text-sm">{selectedReport.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Trạm</Label>
                    <p className="text-sm">{selectedReport.stationName || "-"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Ngày bắt đầu</Label>
                    <p className="text-sm">{formatDate(selectedReport.periodStart)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Ngày kết thúc</Label>
                    <p className="text-sm">{formatDate(selectedReport.periodEnd)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Tổng chuyến đi</Label>
                    <p className="text-sm font-medium">{selectedReport.totalTrips}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Chuyến thành công</Label>
                    <p className="text-sm text-green-600 font-medium">
                      {selectedReport.successfulTrips}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Chuyến hủy</Label>
                    <p className="text-sm text-red-600 font-medium">
                      {selectedReport.canceledTrips}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Tổng doanh thu</Label>
                    <p className="text-sm font-medium">
                      {formatCurrency(selectedReport.totalRevenue)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Đánh giá trung bình</Label>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">
                        {selectedReport.avgRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Trạng thái</Label>
                  <div className="mt-1">
                    <Badge
                      className={
                        statusColors[selectedReport.status] || "bg-gray-100 text-gray-800"
                      }
                    >
                      {statusLabels[selectedReport.status] || selectedReport.status}
                    </Badge>
                  </div>
                </div>
                {selectedReport.note && (
                  <div>
                    <Label className="text-sm font-semibold">Ghi chú</Label>
                    <p className="text-sm whitespace-pre-wrap mt-1">{selectedReport.note}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm font-semibold">Ngày tạo</Label>
                  <p className="text-sm">{formatDateTime(selectedReport.createdAt)}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Status Update Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cập nhật trạng thái báo cáo</DialogTitle>
              <DialogDescription>
                {selectedReport && (
                  <>
                    Báo cáo #{selectedReport.id} - {selectedReport.stationName}
                    <br />
                    Trạng thái hiện tại:{" "}
                    <Badge
                      className={
                        statusColors[selectedReport.status] || "bg-gray-100 text-gray-800"
                      }
                    >
                      {statusLabels[selectedReport.status]}
                    </Badge>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status-update">Trạng thái mới</Label>
                <Select
                  value={newStatus}
                  onValueChange={(value) => setNewStatus(value as ReportStatus)}
                >
                  <SelectTrigger id="status-update">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedReport &&
                      getAllowedStatuses(selectedReport.status).map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabels[status]}
                        </SelectItem>
                      ))}
                    {selectedReport && getAllowedStatuses(selectedReport.status).length === 0 && (
                      <SelectItem value={selectedReport.status} disabled>
                        {statusLabels[selectedReport.status]} (Không thể chuyển đổi)
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {selectedReport && (
                  <p className="text-xs text-muted-foreground">
                    Chỉ có thể chuyển: DRAFT → FINALIZED, FINALIZED → ARCHIVED
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status-note">Ghi chú (tùy chọn)</Label>
                <Textarea
                  id="status-note"
                  value={statusUpdateNote}
                  onChange={(e) => setStatusUpdateNote(e.target.value)}
                  placeholder="Nhập ghi chú về việc thay đổi trạng thái..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsStatusDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button onClick={handleUpdateStatus}>
                Cập nhật trạng thái
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn xóa báo cáo này? Hành động này không thể hoàn tác.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteReport}
                className="bg-destructive text-destructive-foreground"
              >
                Xóa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </StaffLayout>
  );
};

export default StaffReportsPage;
