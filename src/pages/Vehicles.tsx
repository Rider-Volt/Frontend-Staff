import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Car, History, MapPin, Plus, Upload, Image as ImageIcon, Pencil, Lock, Unlock, Trash } from "lucide-react";

// Types
type VehicleStatus = "available" | "maintenance" | "disabled";
type VehicleType = "car" | "scooter";

interface Vehicle {
  id: string;
  model: string;
  segment: string;
  plate: string;
  station: string;
  pricePerDay: number;
  batteryPercent: number;
  vehicleType: VehicleType;
  status: VehicleStatus;
  image?: string;
}

interface VehicleTracking {
  id: string;
  vehicleId: string;
  action: "pickup" | "return" | "maintenance_start" | "maintenance_end" | "location_change";
  timestamp: Date;
  location: string;
  performedBy: string;
  notes?: string;
  customerName?: string;
}

// Demo data
const initialVehicles: Vehicle[] = [
  { id: "VF8-001", model: "VinFast VF8", segment: "SUV 5+2", plate: "30G-123.45", station: "EV Station A", pricePerDay: 800000, batteryPercent: 92, vehicleType: "car", status: "available", image: "/images/imagecar/vf8.jpg" },
  { id: "VF7-011", model: "VinFast VF7", segment: "Crossover", plate: "51H-678.90", station: "EV Station B", pricePerDay: 500000, batteryPercent: 85, vehicleType: "car", status: "available", image: "/images/imagecar/vf7.jpg" },
  { id: "VF6-005", model: "VinFast VF6", segment: "Crossover", plate: "47A-333.22", station: "EV Station C", pricePerDay: 300000, batteryPercent: 100, vehicleType: "car", status: "maintenance", image: "/images/imagecar/vf6.jpg" },
  { id: "KLA-101", model: "VinFast Klara", segment: "E-Scooter", plate: "29E1-456.78", station: "EV Station A", pricePerDay: 150000, batteryPercent: 100, vehicleType: "scooter", status: "disabled", image: "/images/imagecar/klaraneo.jpg" },
];

const mockTrackingData: VehicleTracking[] = [
  { id: "TR001", vehicleId: "VF8-001", action: "pickup", timestamp: new Date("2024-01-15T09:30:00"), location: "EV Station A", performedBy: "Nguyễn Văn A", customerName: "Trần Thị B", notes: "Khách nhận xe đúng giờ" },
  { id: "TR002", vehicleId: "VF8-001", action: "return", timestamp: new Date("2024-01-16T10:15:00"), location: "EV Station A", performedBy: "Nguyễn Văn A", customerName: "Trần Thị B", notes: "Xe trả tốt, pin 92%" },
  { id: "TR003", vehicleId: "VF6-005", action: "maintenance_start", timestamp: new Date("2024-01-14T14:00:00"), location: "EV Station C", performedBy: "Kỹ thuật viên C", notes: "Bảo trì định kỳ" },
  { id: "TR004", vehicleId: "VF7-011", action: "location_change", timestamp: new Date("2024-01-13T16:30:00"), location: "EV Station A", performedBy: "Nhân viên D", notes: "Chuyển từ Station B" },
];

const formatCurrency = (v: number) => `${v.toLocaleString()}đ/ngày`;

const Vehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [trackingData] = useState<VehicleTracking[]>(mockTrackingData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | VehicleStatus>("all");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = vehicles;
    if (statusFilter !== "all") list = list.filter(v => v.status === statusFilter);
    if (!q) return list;
    return list.filter(v => [v.id, v.model, v.segment, v.plate, v.station].some(f => f.toLowerCase().includes(q)));
  }, [vehicles, search, statusFilter]);

  const filteredTracking = useMemo(() => {
    let list = trackingData;
    if (selectedVehicle) list = list.filter(t => t.vehicleId === selectedVehicle);
    return list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [trackingData, selectedVehicle]);

  const handleSave = (vehicle: Vehicle) => {
    setVehicles(prev => {
      const exists = prev.some(v => v.id === vehicle.id);
      return exists ? prev.map(v => (v.id === vehicle.id ? vehicle : v)) : [vehicle, ...prev];
    });
    setModalOpen(false);
    setEditing(null);
  };

  const toggleStatus = (id: string) => {
    setVehicles(prev => prev.map(v => (v.id === id ? { ...v, status: v.status === "disabled" ? "available" : "disabled" } : v)));
  };

  const removeVehicle = (id: string) => setVehicles(prev => prev.filter(v => v.id !== id));

  return (
    <Layout>
      <div className="p-6 md:p-8">
        <Tabs defaultValue="vehicles" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vehicles" className="flex items-center gap-2">
              <Car className="h-4 w-4" /> Quản lý xe
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2">
              <History className="h-4 w-4" /> Theo dõi lịch sử
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles" className="space-y-6 mt-4">
            <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-gray-800">Danh Sách Xe Điện</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <Input
                    placeholder="Tìm theo mã xe, model, biển số, trạm..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full sm:max-w-md"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded-md px-3 py-2 text-sm"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="available">Sẵn sàng</option>
                      <option value="maintenance">Bảo trì</option>
                      <option value="disabled">Tạm khóa</option>
                    </select>
                    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditing(null)} className="bg-green-500 hover:bg-green-600">
                          <Plus className="h-4 w-4 mr-2" /> Thêm xe
                        </Button>
                      </DialogTrigger>
                      <VehicleFormModal editing={editing} onSave={handleSave} showGallery={showGallery} setShowGallery={setShowGallery} />
                    </Dialog>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ảnh</TableHead>
                        <TableHead>Mã xe</TableHead>
                        <TableHead>Model</TableHead>
                        <TableHead>Phân khúc</TableHead>
                        <TableHead>Loại xe</TableHead>
                        <TableHead>Pin</TableHead>
                        <TableHead>Biển số</TableHead>
                        <TableHead>Trạm</TableHead>
                        <TableHead>Giá/ngày</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVehicles.map(v => (
                        <TableRow key={v.id} className="hover:bg-gray-50">
                          <TableCell>
                            {v.image ? (
                              <img
                                src={v.image}
                                alt={v.model}
                                className="w-12 h-8 object-cover rounded border"
                                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                              />
                            ) : (
                              <div className="w-12 h-8 bg-gray-200 rounded border flex items-center justify-center">
                                <Car className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{v.id}</TableCell>
                          <TableCell>{v.model}</TableCell>
                          <TableCell className="text-gray-600">{v.segment}</TableCell>
                          <TableCell className="text-gray-600">{v.vehicleType === "car" ? "Ô tô" : "Xe máy điện"}</TableCell>
                          <TableCell>{v.batteryPercent}%</TableCell>
                          <TableCell>{v.plate}</TableCell>
                          <TableCell>{v.station}</TableCell>
                          <TableCell className="font-semibold text-green-700">{formatCurrency(v.pricePerDay)}</TableCell>
                          <TableCell>
                            {v.status === "available" && <Badge className="bg-green-100 text-green-800">Sẵn sàng</Badge>}
                            {v.status === "maintenance" && <Badge className="bg-yellow-100 text-yellow-800">Bảo trì</Badge>}
                            {v.status === "disabled" && <Badge className="bg-gray-100 text-gray-800">Tạm khóa</Badge>}
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Dialog open={modalOpen && editing?.id === v.id} onOpenChange={setModalOpen}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setEditing(v); setModalOpen(true); }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <VehicleFormModal editing={editing?.id === v.id ? v : null} onSave={handleSave} showGallery={showGallery} setShowGallery={setShowGallery} />
                            </Dialog>
                            <Button variant="outline" size="sm" onClick={() => toggleStatus(v.id)}>
                              {v.status === "disabled" ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600" onClick={() => removeVehicle(v.id)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6 mt-4">
            <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                  <History className="h-5 w-5 text-blue-500 mr-2" /> Lịch sử giao/nhận và tình trạng xe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                  <select
                    className="border rounded-md px-3 py-2 text-sm"
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                  >
                    <option value="">Tất cả xe</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.id} - {vehicle.model}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="Tìm theo hành động, vị trí, người thực hiện..."
                    className="flex-1"
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Xe</TableHead>
                        <TableHead>Hành động</TableHead>
                        <TableHead>Vị trí</TableHead>
                        <TableHead>Người thực hiện</TableHead>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Ghi chú</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTracking.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-medium">
                            {t.timestamp.toLocaleString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Car className="w-4 h-4 text-gray-500" /> {t.vehicleId}
                            </div>
                          </TableCell>
                          <TableCell>{t.action}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-500" /> {t.location}
                            </div>
                          </TableCell>
                          <TableCell>{t.performedBy}</TableCell>
                          <TableCell>{t.customerName || "-"}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={t.notes}>{t.notes || "-"}</div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Vehicles;

// --- Modal component ---
interface VehicleFormModalProps {
  editing: Vehicle | null;
  onSave: (v: Vehicle) => void;
  showGallery: boolean;
  setShowGallery: (v: boolean) => void;
}

const galleryImages = [
  { name: "VF e34", path: "/images/imagecar/e34.jpg" },
  { name: "VF 3", path: "/images/imagecar/vf3.jpg" },
  { name: "VF 5", path: "/images/imagecar/vf5.jpg" },
  { name: "VF 6", path: "/images/imagecar/vf6.jpg" },
  { name: "VF 7", path: "/images/imagecar/vf7.jpg" },
  { name: "VF 8", path: "/images/imagecar/vf8.jpg" },
  { name: "VF 9", path: "/images/imagecar/vf9.jpg" },
  { name: "Feliz", path: "/images/imagecar/feliz.jpg" },
  { name: "Klara Neo", path: "/images/imagecar/klaraneo.jpg" },
  { name: "Evo Neo", path: "/images/imagecar/evoneo.jpg" },
  { name: "Evo Grand", path: "/images/imagecar/evogrand.jpg" },
  { name: "Vento Neo", path: "/images/imagecar/ventoneo.jpg" },
];

const VehicleFormModal = ({ editing, onSave, showGallery, setShowGallery }: VehicleFormModalProps) => {
  const [form, setForm] = useState<Vehicle>(
    editing || { id: "", model: "", segment: "", plate: "", station: "", pricePerDay: 100000, batteryPercent: 50, vehicleType: "car", status: "available", image: "" }
  );

  const isEdit = Boolean(editing);

  const handleChange = (key: keyof Vehicle, value: string | number | VehicleStatus) => {
    setForm(prev => ({ ...prev, [key]: value } as Vehicle));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setForm(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <DialogContent className="sm:max-w-[560px]">
      <DialogHeader>
        <DialogTitle>{isEdit ? "Cập nhật xe" : "Thêm xe mới"}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
        <Input placeholder="Mã xe" value={form.id} onChange={(e) => handleChange("id", e.target.value)} />
        <Input placeholder="Model" value={form.model} onChange={(e) => handleChange("model", e.target.value)} />
        <Input placeholder="Phân khúc" value={form.segment} onChange={(e) => handleChange("segment", e.target.value)} />
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={form.vehicleType}
          onChange={(e) => handleChange("vehicleType", e.target.value as VehicleType)}
        >
          <option value="car">Ô tô</option>
          <option value="scooter">Xe máy điện</option>
        </select>
        <Input type="number" placeholder="Pin (%)" value={form.batteryPercent} onChange={(e) => handleChange("batteryPercent", Number(e.target.value))} />
        <Input placeholder="Biển số" value={form.plate} onChange={(e) => handleChange("plate", e.target.value)} />
        <Input placeholder="Trạm" value={form.station} onChange={(e) => handleChange("station", e.target.value)} />
        <Input type="number" placeholder="Giá/ngày" value={form.pricePerDay} onChange={(e) => handleChange("pricePerDay", Number(e.target.value))} />
        <select
          className="border rounded-md px-3 py-2 text-sm"
          value={form.status}
          onChange={(e) => handleChange("status", e.target.value as VehicleStatus)}
        >
          <option value="available">Sẵn sàng</option>
          <option value="maintenance">Bảo trì</option>
          <option value="disabled">Tạm khóa</option>
        </select>
      </div>

      <div className="py-4 border-t">
        <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh xe</label>
        <div className="space-y-3">
          {form.image && (
            <div className="mb-3">
              <img
                src={form.image}
                alt="Vehicle preview"
                className="w-full h-32 object-cover rounded-md border"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}

          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <div className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Upload ảnh</span>
              </div>
            </label>
            <Button type="button" variant="outline" onClick={() => setShowGallery(!showGallery)} className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span className="text-sm">Thư viện</span>
            </Button>
          </div>

          {showGallery && (
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="text-sm font-medium text-gray-700 mb-2">Chọn ảnh từ thư viện:</div>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {galleryImages.map((img) => (
                  <div key={img.path} className="cursor-pointer border rounded-md overflow-hidden hover:border-blue-500 transition-colors" onClick={() => { setShowGallery(false); setForm(prev => ({ ...prev, image: img.path })); }}>
                    <img src={img.path} alt={img.name} className="w-full h-16 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <div className="p-1 text-xs text-center bg-white">{img.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button className="bg-green-500 hover:bg-green-600" onClick={() => onSave(form)}>Lưu</Button>
      </DialogFooter>
    </DialogContent>
  );
}