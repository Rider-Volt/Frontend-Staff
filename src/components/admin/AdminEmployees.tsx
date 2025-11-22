import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { getAllStations } from "@/services/adminservice/adminStationService";
import {
  assignStaffToStation,
  endStaffAssignment,
  getStationStaff,
  transferStaff,
  type StationStaffMember,
} from "@/services/adminservice/adminEmployeeService";
import {
  ArrowLeftRight,
  UserPlus,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StationOption {
  id: number;
  name: string;
}

const AdminEmployees = () => {
  const { toast } = useToast();
  const [stations, setStations] = useState<StationOption[]>([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);

  const [staff, setStaff] = useState<StationStaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSearch, setStaffSearch] = useState("");

  const [selectedStaff, setSelectedStaff] = useState<StationStaffMember | null>(
    null
  );

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    if (selectedStationId !== null) {
      loadStationStaff(selectedStationId);
    } else {
      setStaff([]);
      setSelectedStaff(null);
    }
  }, [selectedStationId]);

  const loadStations = async () => {
    try {
      setStationsLoading(true);
      const data = await getAllStations();
      const mapped = data.map((station) => ({
        id: station.id,
        name: station.name,
      }));
      setStations(mapped);
      if (mapped.length > 0) {
        setSelectedStationId((prev) => prev ?? mapped[0].id);
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách điểm thuê",
        variant: "destructive",
      });
    } finally {
      setStationsLoading(false);
    }
  };

  const loadStationStaff = async (stationId: number) => {
    try {
      setStaffLoading(true);
      const data = await getStationStaff(stationId);
      setStaff(data);
      setSelectedStaff((prev) => {
        if (!prev) {
          return data.length > 0 ? data[0] : null;
        }
        const stillExists = data.find(
          (item) => item.accountId === prev.accountId
        );
        return stillExists ?? (data.length > 0 ? data[0] : null);
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error instanceof Error
            ? error.message
            : "Không thể tải danh sách nhân viên của trạm",
        variant: "destructive",
      });
    } finally {
      setStaffLoading(false);
    }
  };

  const filteredStaff = useMemo(() => {
    const query = staffSearch.trim().toLowerCase();
    if (!query) return staff;
    return staff.filter((item) =>
      [
        item.accountId.toString(),
        item.accountName ?? "",
        item.accountEmail ?? "",
        item.roleAtStation ?? "",
        item.stationName ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [staff, staffSearch]);

  const handleAssignStaff = async (accountId: number, startedAt?: string) => {
    if (!selectedStationId) return;

    try {
      setActionLoading(true);
      await assignStaffToStation(selectedStationId, accountId, startedAt);
      toast({
        title: "Thành công",
        description: "Đã gán nhân viên vào điểm thuê.",
      });
      setAssignDialogOpen(false);
      await loadStationStaff(selectedStationId);
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error instanceof Error
            ? error.message
            : "Không thể gán nhân viên vào điểm thuê",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTransferStaff = async (targetStationId: number) => {
    if (!selectedStaff) return;

    try {
      setActionLoading(true);
      await transferStaff(selectedStaff.accountId, targetStationId);
      toast({
        title: "Thành công",
        description: "Đã chuyển nhân viên sang điểm thuê mới.",
      });
      setTransferDialogOpen(false);
      if (selectedStationId !== null) {
        await loadStationStaff(selectedStationId);
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error instanceof Error
            ? error.message
            : "Không thể chuyển nhân viên",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndAssignment = async (staffMember: StationStaffMember) => {
    if (selectedStationId === null) return;

    const staffLabel =
      staffMember.accountName || `Nhân viên #${staffMember.accountId}`;
    const confirmed = confirm(
      `Bạn có chắc chắn muốn kết thúc phân công của ${staffLabel}?`
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      await endStaffAssignment(selectedStationId, staffMember.accountId);
      toast({
        title: "Thành công",
        description: "Đã kết thúc phân công của nhân viên.",
      });
      if (selectedStaff?.accountId === staffMember.accountId) {
        setSelectedStaff(null);
      }
      if (selectedStationId !== null) {
        await loadStationStaff(selectedStationId);
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description:
          error instanceof Error
            ? error.message
            : "Không thể kết thúc phân công",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const selectedStaffName =
    selectedStaff?.accountName ||
    `Nhân viên #${selectedStaff?.accountId ?? ""}`;

  const transferOptions = stations.filter(
    (station) => station.id !== selectedStationId
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border border-gray-100">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Quản lý phân công nhân viên
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setAssignDialogOpen(true)}
                disabled={selectedStationId === null}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Gán nhân viên
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-col md:flex-row md:items-end gap-3">
            <div className="md:w-60">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Chọn điểm thuê
              </label>
              <Select
                value={
                  selectedStationId !== null
                    ? selectedStationId.toString()
                    : undefined
                }
                onValueChange={(value) => {
                  const id = parseInt(value, 10);
                  setSelectedStationId(Number.isNaN(id) ? null : id);
                }}
                disabled={stationsLoading || stations.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      stationsLoading ? "Đang tải..." : "Chọn điểm thuê"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id.toString()}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:flex-1">
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Tìm kiếm nhân viên
              </label>
              <Input
                placeholder="Tìm theo tên, email, số điện thoại..."
                value={staffSearch}
                onChange={(event) => setStaffSearch(event.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="rounded-lg border border-gray-100 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Mã NV</TableHead>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Điểm thuê</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Ngày bắt đầu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-48 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      <div className="flex items-center justify-center text-gray-600">
                        <div className="h-6 w-6 border-2 border-b-transparent border-green-600 rounded-full animate-spin mr-3" />
                        Đang tải dữ liệu nhân viên...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-gray-500"
                    >
                      Không có nhân viên nào trong danh sách.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((item) => {
                    const isSelected =
                      selectedStaff?.accountId === item.accountId;
                    const statusLabel = item.isActive
                      ? "Đang hoạt động"
                      : item.endedAt
                      ? "Đã kết thúc"
                      : "Không còn hoạt động";
                    return (
                      <TableRow
                        key={item.accountId}
                        onClick={() => setSelectedStaff(item)}
                        className={`cursor-pointer transition ${
                          isSelected ? "bg-green-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <TableCell className="font-medium text-gray-700">
                          #{item.accountId}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium text-gray-800">
                            {item.accountName || "Chưa có tên"}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {item.stationName || "-"}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {item.accountEmail || "-"}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {item.roleAtStation || "-"}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {item.startedAt
                            ? new Date(item.startedAt).toLocaleString()
                            : "-"}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {statusLabel}
                          {!item.isActive && item.endedAt && (
                            <div className="text-xs text-gray-500">
                              Kết thúc:{" "}
                              {new Date(item.endedAt).toLocaleString()}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-full bg-green-50 hover:bg-green-100 border-green-100"
                                onClick={(event) => event.stopPropagation()}
                                disabled={actionLoading}
                              >
                                <span className="text-xl leading-none">⋯</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <DropdownMenuItem
                                onSelect={() => handleEndAssignment(item)}
                              >
                                <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                Kết thúc phân công
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AssignStaffDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        onAssign={handleAssignStaff}
        loading={actionLoading}
        stationName={stations.find((s) => s.id === selectedStationId)?.name}
      />

      <TransferStaffDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        stations={transferOptions}
        loading={actionLoading}
        onTransfer={handleTransferStaff}
        staffName={selectedStaffName}
      />
    </div>
  );
};

interface AssignStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (accountId: number, startedAt?: string) => void;
  loading: boolean;
  stationName?: string;
}

const AssignStaffDialog = ({
  open,
  onOpenChange,
  onAssign,
  loading,
  stationName,
}: AssignStaffDialogProps) => {
  const [accountId, setAccountId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setAccountId("");
      setStartDate("");
    }
  }, [open]);

  const handleSubmit = () => {
    const parsedId = parseInt(accountId, 10);
    if (Number.isNaN(parsedId) || parsedId <= 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã nhân viên hợp lệ.",
        variant: "destructive",
      });
      return;
    }
    const formattedStartDate = startDate ? `${startDate}T00:00:00` : undefined;
    onAssign(parsedId, formattedStartDate);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Gán nhân viên vào điểm thuê
          </DialogTitle>
          <DialogDescription>
            Nhập mã nhân viên để gán vào{" "}
            <span className="font-medium text-gray-800">
              {stationName || "điểm thuê được chọn"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Mã nhân viên
            </label>
            <Input
              type="number"
              placeholder="Ví dụ: 1024"
              value={accountId}
              onChange={(event) => setAccountId(event.target.value)}
              min={1}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Ngày bắt đầu (tùy chọn)
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSubmit}
            disabled={loading}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface TransferStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stations: StationOption[];
  loading: boolean;
  onTransfer: (stationId: number) => void;
  staffName: string;
}

const TransferStaffDialog = ({
  open,
  onOpenChange,
  stations,
  loading,
  onTransfer,
  staffName,
}: TransferStaffDialogProps) => {
  const [targetStation, setTargetStation] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    if (!open) {
      setTargetStation("");
    }
  }, [open]);

  const handleSubmit = () => {
    const parsed = parseInt(targetStation, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn điểm thuê hợp lệ.",
        variant: "destructive",
      });
      return;
    }
    onTransfer(parsed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Chuyển điểm thuê cho nhân viên
          </DialogTitle>
          <DialogDescription>
            Chọn điểm thuê mới cho{" "}
            <span className="font-medium text-gray-800">{staffName}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Điểm thuê mới
            </label>
            <Select
              value={targetStation || undefined}
              onValueChange={setTargetStation}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn điểm thuê" />
              </SelectTrigger>
              <SelectContent>
                {stations.length === 0 ? (
                  <div className="py-3 px-2 text-sm text-gray-500">
                    Không có điểm thuê khác để chuyển.
                  </div>
                ) : (
                  stations.map((station) => (
                    <SelectItem
                      key={station.id}
                      value={station.id.toString()}
                    >
                      {station.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSubmit}
            disabled={loading || stations.length === 0}
          >
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Xác nhận chuyển
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminEmployees;


