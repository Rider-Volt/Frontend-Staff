import { useState, useEffect, useMemo } from "react";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Filter,
  Clock,
  MapPin,
  Car,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllIncidentReports,
  updateIncidentReport,
  type IncidentReportResponse,
  type IncidentStatus,
  type IncidentSeverity,
} from "@/services/staffservice/staffIncidentService";
import { getAllStations, type Station } from "@/services/adminservice/adminStationService";
import { getVehicleById, type Vehicle } from "@/services/adminservice/adminVehicleService";

const statusLabels: Record<IncidentStatus, string> = {
  REJECTED: "Đã từ chối",
  FORWARDED_TO_ADMIN: "Đã chuyển cho admin",
};

const statusColors: Record<IncidentStatus, string> = {
  REJECTED: "bg-red-100 text-red-800",
  FORWARDED_TO_ADMIN: "bg-blue-100 text-blue-800",
};

const severityLabels: Record<IncidentSeverity, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
  CRITICAL: "Nghiêm trọng",
};

const severityColors: Record<IncidentSeverity, string> = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};


const formatDateTime = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleString("vi-VN");
  } catch {
    return dateString;
  }
};

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString("vi-VN");
  } catch {
    return dateString;
  }
};

const StaffIncidentReportsPage = () => {
  const [incidents, setIncidents] = useState<IncidentReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | "all">("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentReportResponse | null>(null);

  // Maps for name lookups
  const [stationMap, setStationMap] = useState<Map<number, string>>(new Map());
  const [vehicleMap, setVehicleMap] = useState<Map<number, string>>(new Map());

  // Update form states
  const [updateStatus, setUpdateStatus] = useState<IncidentStatus>("FORWARDED_TO_ADMIN");
  const [updateResolution, setUpdateResolution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const data = await getAllIncidentReports();
      // Ensure data is always an array
      setIncidents(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error fetching incidents:", error);
      toast.error(error?.message || "Không thể tải danh sách báo cáo sự cố");
      // Set empty array on error
      setIncidents([]);
    } finally {
      setLoading(false);
    }
  };

  // Load stations for name lookup
  useEffect(() => {
    const loadStations = async () => {
      try {
        const stations = await getAllStations();
        const map = new Map<number, string>();
        stations.forEach((station) => {
          map.set(station.id, station.name);
        });
        setStationMap(map);
      } catch (error) {
        console.error("Error loading stations:", error);
      }
    };
    loadStations();
  }, []);

  // Load vehicle names when incidents are loaded
  useEffect(() => {
    const loadVehicleNames = async () => {
      if (!Array.isArray(incidents) || incidents.length === 0) return;

      // Get unique vehicle IDs from incidents
      const vehicleIds = new Set<number>();
      incidents.forEach((incident) => {
        if (incident.vehicleId) {
          vehicleIds.add(incident.vehicleId);
        }
      });

      // Load vehicle details for each unique ID
      const map = new Map<number, string>();
      await Promise.all(
        Array.from(vehicleIds).map(async (vehicleId) => {
          try {
            const vehicle = await getVehicleById(vehicleId);
            // Use licensePlate as vehicle name, fallback to model if not available
            const vehicleName = vehicle.licensePlate || vehicle.model || `Xe #${vehicleId}`;
            map.set(vehicleId, vehicleName);
          } catch (error) {
            console.error(`Error loading vehicle ${vehicleId}:`, error);
            // Keep ID as fallback
            map.set(vehicleId, `Xe #${vehicleId}`);
          }
        })
      );
      setVehicleMap(map);
    };

    loadVehicleNames();
  }, [incidents]);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const filteredIncidents = useMemo(() => {
    // Ensure incidents is an array
    if (!Array.isArray(incidents)) {
      return [];
    }

    let filtered = [...incidents];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((i) => i.status === statusFilter);
    }

    // Filter by severity
    if (severityFilter !== "all") {
      filtered = filtered.filter((i) => i.severity === severityFilter);
    }

    // Filter by search query
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (i) =>
          i.id.toString().includes(q) ||
          i.note?.toLowerCase().includes(q) ||
          i.billingId?.toString().includes(q) ||
          i.vehicleId?.toString().includes(q) ||
          i.stationId?.toString().includes(q)
      );
    }

    // Sort by severity (CRITICAL first) and then by date (newest first)
    return filtered.sort((a, b) => {
      const severityOrder: Record<IncidentSeverity, number> = {
        CRITICAL: 0,
        HIGH: 1,
        MEDIUM: 2,
        LOW: 3,
      };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [incidents, searchQuery, statusFilter, severityFilter]);

  const openViewDialog = (incident: IncidentReportResponse) => {
    setSelectedIncident(incident);
    setIsViewDialogOpen(true);
  };

  const openUpdateDialog = (incident: IncidentReportResponse) => {
    setSelectedIncident(incident);
    setUpdateStatus(incident.status);
    setUpdateResolution(incident.staffNote || "");
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateIncident = async () => {
    if (!selectedIncident) return;

    setIsSubmitting(true);
    try {
      const data: { status?: IncidentStatus; staffNote?: string; severity?: IncidentSeverity } = {};

      if (updateStatus !== selectedIncident.status) {
        data.status = updateStatus;
      }

      if (updateResolution.trim() && updateResolution !== selectedIncident.staffNote) {
        data.staffNote = updateResolution.trim();
      }

      if (Object.keys(data).length === 0) {
        toast.info("Không có thay đổi nào");
        setIsUpdateDialogOpen(false);
        return;
      }

      await updateIncidentReport(selectedIncident.id, data);
      toast.success("Cập nhật báo cáo sự cố thành công");
      setIsUpdateDialogOpen(false);
      setSelectedIncident(null);
      setUpdateResolution("");
      fetchIncidents();
    } catch (error: any) {
      toast.error(error?.message || "Không thể cập nhật báo cáo sự cố");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (!Array.isArray(incidents)) {
      return {
        total: 0,
        rejected: 0,
        forwarded: 0,
        critical: 0,
      };
    }

    const total = incidents.length;
    const rejected = incidents.filter((i) => i.status === "REJECTED").length;
    const forwarded = incidents.filter((i) => i.status === "FORWARDED_TO_ADMIN").length;
    const critical = incidents.filter((i) => i.severity === "CRITICAL").length;

    return {
      total,
      rejected,
      forwarded,
      critical,
    };
  }, [incidents]);

  return (
    <StaffLayout>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              Quản lý báo cáo khách hàng
            </h1>
            <Button onClick={fetchIncidents} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Làm mới
            </Button>
          </div>
          <p className="text-muted-foreground">
            Theo dõi và quản lý các báo cáo sự cố, tai nạn và vấn đề liên quan đến xe
          </p>
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
                    placeholder="Tìm theo ID, ghi chú, ID xe, hóa đơn..."
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
                  onValueChange={(value) => setStatusFilter(value as IncidentStatus | "all")}
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
              <div className="space-y-2 w-full md:w-auto md:min-w-[200px]">
                <Label htmlFor="severity-filter">Lọc theo mức độ</Label>
                <Select
                  value={severityFilter}
                  onValueChange={(value) => setSeverityFilter(value as IncidentSeverity | "all")}
                >
                  <SelectTrigger id="severity-filter">
                    <SelectValue placeholder="Tất cả mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    {Object.entries(severityLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Incidents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách báo cáo sự cố ({filteredIncidents.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">Đang tải...</p>
              </div>
            ) : filteredIncidents.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Không có báo cáo sự cố nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">ID</TableHead>
                      <TableHead>Hóa đơn ID</TableHead>
                      <TableHead>Xe</TableHead>
                      <TableHead>Trạm</TableHead>
                      <TableHead>Mức độ</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIncidents.map((incident) => (
                      <TableRow
                        key={incident.id}
                        className={
                          incident.severity === "CRITICAL"
                            ? "bg-red-50"
                            : incident.severity === "HIGH"
                            ? "bg-orange-50"
                            : ""
                        }
                      >
                        <TableCell className="font-medium text-blue-600">
                          #{incident.id}
                        </TableCell>
                        <TableCell>
                          {incident.billingId ? (
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>{incident.billingId}</span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {incident.vehicleId ? (
                            <div className="flex items-center gap-1">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <span>{vehicleMap.get(incident.vehicleId) || `Xe #${incident.vehicleId}`}</span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {incident.stationId ? (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{stationMap.get(incident.stationId) || `Trạm #${incident.stationId}`}</span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              severityColors[incident.severity] ||
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {severityLabels[incident.severity] || incident.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              statusColors[incident.status] || "bg-gray-100 text-gray-800"
                            }
                          >
                            {statusLabels[incident.status] || incident.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {incident.note || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDateTime(incident.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openViewDialog(incident)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openUpdateDialog(incident)}
                            >
                              <Edit className="h-4 w-4" />
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

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Chi tiết báo cáo sự cố</DialogTitle>
            </DialogHeader>
            {selectedIncident && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">ID</Label>
                    <p className="text-sm">{selectedIncident.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Trạng thái</Label>
                    <div className="mt-1">
                      <Badge
                        className={
                          statusColors[selectedIncident.status] || "bg-gray-100 text-gray-800"
                        }
                      >
                        {statusLabels[selectedIncident.status] || selectedIncident.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Mức độ</Label>
                    <div className="mt-1">
                      <Badge
                        className={
                          severityColors[selectedIncident.severity] ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {severityLabels[selectedIncident.severity] || selectedIncident.severity}
                      </Badge>
                    </div>
                  </div>
                </div>
                {selectedIncident.note && (
                  <div>
                    <Label className="text-sm font-semibold">Ghi chú ban đầu</Label>
                    <p className="text-sm whitespace-pre-wrap">{selectedIncident.note}</p>
                  </div>
                )}
                {selectedIncident.staffNote && (
                  <div>
                    <Label className="text-sm font-semibold">Ghi chú của staff</Label>
                    <p className="text-sm whitespace-pre-wrap">{selectedIncident.staffNote}</p>
                  </div>
                )}
                {selectedIncident.vehicleId && (
                  <div>
                    <Label className="text-sm font-semibold">Xe liên quan</Label>
                    <p className="text-sm">
                      {vehicleMap.get(selectedIncident.vehicleId) || `Xe #${selectedIncident.vehicleId}`}
                      <span className="text-muted-foreground ml-1">(ID: {selectedIncident.vehicleId})</span>
                    </p>
                  </div>
                )}
                {selectedIncident.billingId && (
                  <div>
                    <Label className="text-sm font-semibold">Hóa đơn liên quan</Label>
                    <p className="text-sm">ID: {selectedIncident.billingId}</p>
                  </div>
                )}
                {selectedIncident.stationId && (
                  <div>
                    <Label className="text-sm font-semibold">Trạm</Label>
                    <p className="text-sm">
                      {stationMap.get(selectedIncident.stationId) || `Trạm #${selectedIncident.stationId}`}
                      <span className="text-muted-foreground ml-1">(ID: {selectedIncident.stationId})</span>
                    </p>
                  </div>
                )}
                {selectedIncident.renterId && (
                  <div>
                    <Label className="text-sm font-semibold">Khách hàng</Label>
                    <p className="text-sm">ID: {selectedIncident.renterId}</p>
                  </div>
                )}
                {selectedIncident.imageUrls && selectedIncident.imageUrls.length > 0 && (
                  <div>
                    <Label className="text-sm font-semibold">Hình ảnh</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {selectedIncident.imageUrls.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Hình ảnh ${idx + 1}`}
                          className="w-full h-32 object-cover rounded border"
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Ngày tạo</Label>
                    <p className="text-sm">{formatDateTime(selectedIncident.createdAt)}</p>
                  </div>
                  {selectedIncident.updatedAt && (
                    <div>
                      <Label className="text-sm font-semibold">Ngày cập nhật</Label>
                      <p className="text-sm">{formatDateTime(selectedIncident.updatedAt)}</p>
                    </div>
                  )}
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

        {/* Update Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cập nhật báo cáo sự cố</DialogTitle>
              <DialogDescription>
                {selectedIncident && (
                  <>
                    Báo cáo #{selectedIncident.id}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="update-status">Trạng thái</Label>
                <Select
                  value={updateStatus}
                  onValueChange={(value) => setUpdateStatus(value as IncidentStatus)}
                >
                  <SelectTrigger id="update-status">
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
              <div className="space-y-2">
                <Label htmlFor="update-resolution">Ghi chú của staff</Label>
                <Textarea
                  id="update-resolution"
                  value={updateResolution}
                  onChange={(e) => setUpdateResolution(e.target.value)}
                  placeholder="Nhập ghi chú của staff về sự cố..."
                  rows={5}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsUpdateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button onClick={handleUpdateIncident} disabled={isSubmitting}>
                {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StaffLayout>
  );
};

export default StaffIncidentReportsPage;

