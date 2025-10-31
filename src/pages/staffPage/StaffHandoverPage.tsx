import { StaffLayout } from "@/components/staff/StaffLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Check } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getBillingsByPhone,
  getStationBillings,
  updatePreImageFile,
  checkInByBillingId,
  updateFinalImageFile,
  inspectReturnedVehicle,
  type BillingResponse,
} from "@/services/staffservice/staffBillingService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Checklist for damage was removed as requested

const StaffHandoverPage = () => {
  const [activeTab, setActiveTab] = useState("delivery");

  // Delivery (Giao xe)
  const [phoneQuery, setPhoneQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [billingsByPhone, setBillingsByPhone] = useState<BillingResponse[]>([]);
  const [selectedBillingId, setSelectedBillingId] = useState<string>("");
  const [preImageUrl, setPreImageUrl] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");

  // Local previews for library-selected photos (delivery)
  const deliveryPositions = ["Trước", "Sau", "Trái", "Phải"] as const;
  type DeliveryPosition = typeof deliveryPositions[number];
  const [deliveryPhotos, setDeliveryPhotos] = useState<Record<DeliveryPosition, string>>({
    "Trước": "",
    "Sau": "",
    "Trái": "",
    "Phải": "",
  });
  const [deliveryFiles, setDeliveryFiles] = useState<Record<DeliveryPosition, File | null>>({
    "Trước": null,
    "Sau": null,
    "Trái": null,
    "Phải": null,
  });

  const handlePickDelivery = (position: DeliveryPosition) => {
    const inputId = `delivery-photo-input-${position}`;
    const el = document.getElementById(inputId) as HTMLInputElement | null;
    if (el) el.click();
  };

  const onDeliveryFileChange = (position: DeliveryPosition, file?: File | null) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setDeliveryPhotos((prev) => {
      const prevUrl = prev[position];
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return { ...prev, [position]: objectUrl };
    });
    setDeliveryFiles((prev) => ({ ...prev, [position]: file }));
  };

  const clearDeliveryPhoto = (position: DeliveryPosition) => {
    setDeliveryPhotos((prev) => {
      const prevUrl = prev[position];
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return { ...prev, [position]: "" };
    });
    setDeliveryFiles((prev) => ({ ...prev, [position]: null }));
  };

  const selectedBilling: BillingResponse | undefined = useMemo(
    () => billingsByPhone.find(b => String(b.id) === selectedBillingId),
    [billingsByPhone, selectedBillingId]
  );

  // Return (Trả xe)
  const [inUseBillings, setInUseBillings] = useState<BillingResponse[]>([]);
  const [loadingInUse, setLoadingInUse] = useState(false);
  const [returnBillingId, setReturnBillingId] = useState<string>("");
  const [finalImageUrl, setFinalImageUrl] = useState("");
  const [penaltyCost, setPenaltyCost] = useState<string>("0");
  const [returnNote, setReturnNote] = useState("");

  // Local previews for library-selected photos (return)
  const [returnPhotos, setReturnPhotos] = useState<Record<DeliveryPosition, string>>({
    "Trước": "",
    "Sau": "",
    "Trái": "",
    "Phải": "",
  });
  const [returnFiles, setReturnFiles] = useState<Record<DeliveryPosition, File | null>>({
    "Trước": null,
    "Sau": null,
    "Trái": null,
    "Phải": null,
  });

  const handlePickReturn = (position: DeliveryPosition) => {
    const inputId = `return-photo-input-${position}`;
    const el = document.getElementById(inputId) as HTMLInputElement | null;
    if (el) el.click();
  };

  const onReturnFileChange = (position: DeliveryPosition, file?: File | null) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setReturnPhotos((prev) => {
      const prevUrl = prev[position];
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return { ...prev, [position]: objectUrl };
    });
    setReturnFiles((prev) => ({ ...prev, [position]: file }));
  };

  const clearReturnPhoto = (position: DeliveryPosition) => {
    setReturnPhotos((prev) => {
      const prevUrl = prev[position];
      if (prevUrl) URL.revokeObjectURL(prevUrl);
      return { ...prev, [position]: "" };
    });
    setReturnFiles((prev) => ({ ...prev, [position]: null }));
  };

  const selectedReturnBilling: BillingResponse | undefined = useMemo(
    () => inUseBillings.find(b => String(b.id) === returnBillingId),
    [inUseBillings, returnBillingId]
  );

  const toVietnameseStatus = (status?: string) => {
    const s = String(status || "").toUpperCase();
    switch (s) {
      case "PENDING":
      case "WAITING":
        return "Chờ";
      case "APPROVED":
      case "CONFIRMED":
        return "Đã xác nhận";
      case "RENTING":
        return "Đang thuê";
      case "PAYED":
      case "PAID":
        return "Đã thanh toán";
      case "COMPLETED":
      case "DONE":
        return "Hoàn thành";
      case "CANCELLED":
      case "CANCELED":
        return "Đã hủy";
      default:
        return status || "-";
    }
  };

  // No damage checklist interactions required

  const handleSearchByPhone = async () => {
    if (!phoneQuery.trim()) {
      toast.error("Nhập số điện thoại");
      return;
    }
    try {
      setIsSearching(true);
      const data = await getBillingsByPhone(phoneQuery.trim());
      // Only show paid/approved bookings for Delivery tab
      const paid = data.filter((b) => b.status === "PAYED" || b.status === "APPROVED");
      setBillingsByPhone(paid);
      // For Return tab, narrow list to only RENTING invoices of this phone
      if (activeTab === "return") {
        const rentingByPhone = data.filter((b) => String(b.status).toUpperCase() === "RENTING");
        setInUseBillings(rentingByPhone);
      }
      if (paid.length === 0 && inUseBillings.length === 0) {
        toast.info("Không có hóa đơn nào cho số này");
      } else {
        toast.success(`Đã lọc: ${paid.length} đã thanh toán`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể tìm hóa đơn theo SDT");
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!selectedBilling) {
      toast.error("Chọn hóa đơn để giao xe");
      return;
    }
    // Dùng ảnh "Trước" đã chọn từ thư viện thay cho URL
    const frontFile = deliveryFiles["Trước"];
    if (!frontFile) {
      toast.error("Chọn ảnh 'Trước' trước khi giao xe");
      return;
    }
    console.log("🚗 Giao xe - File ảnh:", frontFile);
    console.log("🚗 Billing ID:", selectedBilling.id);
    try {
      console.log("📤 Đang check-in với ảnh...");
      await checkInByBillingId(selectedBilling.id, frontFile);
      toast.success("Giao xe thành công (đã check-in)!");
      // Reset
      setPreImageUrl("");
      setDeliveryNote("");
      setSelectedBillingId("");
      setDeliveryPhotos({ "Trước": "", "Sau": "", "Trái": "", "Phải": "" });
      setDeliveryFiles({ "Trước": null, "Sau": null, "Trái": null, "Phải": null });
    } catch (err: any) {
      console.error("❌ Lỗi giao xe:", err);
      toast.error(err?.message || "Không thể xác nhận giao xe");
    }
  };

  const loadInUseBillings = async () => {
    try {
      setLoadingInUse(true);
      const phone = phoneQuery.trim();
      if (!phone) {
        setInUseBillings([]);
        toast.info("Nhập số điện thoại để lọc hóa đơn đang thuê");
        return;
      }
      // Lọc theo SDT và trạng thái RENTING
      const data = await getBillingsByPhone(phone);
      const rentingByPhone = data.filter((b) => String(b.status).toUpperCase() === "RENTING");
      setInUseBillings(rentingByPhone);
      if (rentingByPhone.length === 0) toast.info("Số này không có đơn đang thuê");
    } catch (err: any) {
      toast.error(err?.message || "Không thể tải đơn IN_USE");
    } finally {
      setLoadingInUse(false);
    }
  };

  useEffect(() => {
    if (activeTab === "return") {
      loadInUseBillings();
    }
  }, [activeTab]);

  const handleConfirmReturn = async () => {
    if (!selectedReturnBilling) {
      toast.error("Chọn hóa đơn để trả xe");
      return;
    }
    // Dùng ảnh "Trước" đã chọn khi trả xe
    const frontReturnFile = returnFiles["Trước"];
    if (!frontReturnFile) {
      toast.error("Chọn ảnh 'Trước' khi trả xe");
      return;
    }
    const penalty = Number(penaltyCost || 0);
    console.log("🔄 Trả xe - File ảnh:", frontReturnFile);
    console.log("🔄 Billing ID:", selectedReturnBilling.id);
    console.log("🔄 Penalty:", penalty);
    try {
      console.log("📤 Đang inspect return với ảnh...");
      await inspectReturnedVehicle(selectedReturnBilling.id, frontReturnFile, penalty, returnNote.trim());
      toast.success("Trả xe thành công, đã cập nhật hoàn tất!");
      // Reset
      setFinalImageUrl("");
      setPenaltyCost("0");
      setReturnNote("");
      setReturnBillingId("");
      setReturnPhotos({ "Trước": "", "Sau": "", "Trái": "", "Phải": "" });
      setReturnFiles({ "Trước": null, "Sau": null, "Trái": null, "Phải": null });
      // Refresh list
      loadInUseBillings();
    } catch (err: any) {
      console.error("❌ Lỗi trả xe:", err);
      toast.error(err?.message || "Không thể xác nhận trả xe");
    }
  };

  return (
    <StaffLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Giao/Trả xe</h1>
          <p className="text-muted-foreground">Thực hiện thủ tục bàn giao xe cho khách hàng</p>
        </div>

        {/* Global phone search for both tabs */}
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <Label htmlFor="global-customer-phone">Số điện thoại khách (áp dụng cho cả hai tab)</Label>
            <Input
              id="global-customer-phone"
              placeholder="0912345678"
              value={phoneQuery}
              onChange={(e) => setPhoneQuery(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleSearchByPhone} disabled={isSearching}>
              {isSearching ? "Đang tìm..." : "Tìm"}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="delivery">Giao xe</TabsTrigger>
            <TabsTrigger value="return">Trả xe</TabsTrigger>
          </TabsList>

          <TabsContent value="delivery" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin khách hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {billingsByPhone.length > 0 && (
                    <div className="space-y-2">
                      <Label>Chọn hóa đơn (đã thanh toán)</Label>
                      <Select value={selectedBillingId} onValueChange={setSelectedBillingId}>
                        <SelectTrigger>
                          <SelectValue placeholder=" Chọn hóa đơn" />
                        </SelectTrigger>
                        <SelectContent>
                          {billingsByPhone.map((b) => (
                            <SelectItem key={b.id} value={String(b.id)}>
                              {`#${b.id} • ${b.vehicle?.code || b.vehicleModel || "Xe"}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {selectedBilling && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Khách hàng</Label>
                        <Input readOnly value={selectedBilling.renterName || selectedBilling.renter?.name || ""} />
                      </div>
                      <div>
                        <Label>Thời gian thuê</Label>
                        <Input
                          readOnly
                          value={
                            selectedBilling.plannedStartDate && selectedBilling.plannedEndDate
                              ? `${new Date(selectedBilling.plannedStartDate).toLocaleDateString()} → ${new Date(selectedBilling.plannedEndDate).toLocaleDateString()}`
                              : selectedBilling.startTime && selectedBilling.endTime
                                ? `${new Date(selectedBilling.startTime).toLocaleString()} → ${new Date(selectedBilling.endTime).toLocaleString()}`
                                : "-"
                          }
                        />
                      </div>
                      <div>
                        <Label>Trạng thái</Label>
                        <Input readOnly value={toVietnameseStatus(selectedBilling.status)} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vehicle Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin xe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Xe</Label>
                    <Input readOnly value={selectedBilling ? `${selectedBilling.vehicle?.code || ""} - ${selectedBilling.vehicle?.model?.name || selectedBilling.vehicleModel || ""}` : ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>Trạm</Label>
                    <Input readOnly value={selectedBilling?.vehicle?.station?.name || selectedBilling?.stationName || ""} />
                  </div>
                  {selectedBilling?.vehicle?.model?.pricePerDay ? (
                    <div className="space-y-2">
                      <Label>Giá/ngày</Label>
                      <Input readOnly value={String(selectedBilling.vehicle.model.pricePerDay)} />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            {/* Checklist removed as requested */}

            {/* Photos */}
            <Card>
              <CardHeader>
                <CardTitle>Chụp ảnh xe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {deliveryPositions.map((position) => (
                    <div key={position} className="flex flex-col items-stretch gap-2">
                      <Button
                        variant="outline"
                        className="h-32 flex flex-col gap-2"
                        onClick={() => handlePickDelivery(position)}
                      >
                        {deliveryPhotos[position] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={deliveryPhotos[position]} alt={position} className="h-16 w-full object-cover rounded" />
                        ) : (
                          <Camera className="h-6 w-6" />
                        )}
                        <span>{position}</span>
                      </Button>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!deliveryPhotos[position]}
                          onClick={() => clearDeliveryPhoto(position)}
                        >
                          Xóa
                        </Button>
                      </div>
                      <input
                        id={`delivery-photo-input-${position}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onDeliveryFileChange(position, e.target.files?.[0])}
                      />
                    </div>
                  ))}
                </div>
                {/* Không cần URL ảnh: dùng ảnh 'Trước' đã chọn */}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Nhập ghi chú về tình trạng xe..."
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button variant="outline">Hủy</Button>
              <Button onClick={handleConfirmDelivery}>
                <Check className="h-4 w-4 mr-2" />
                Xác nhận giao xe
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="return" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Customer Info (Return) */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin khách hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {phoneQuery.trim().length > 0 && (
                    <div className="flex items-end gap-2">
                      <div className="flex-1 space-y-2">
                        <Label>Chọn hóa đơn đang thuê</Label>
                        <Select value={returnBillingId} onValueChange={setReturnBillingId}>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingInUse ? "Đang tải..." : "Chọn hóa đơn"} />
                          </SelectTrigger>
                          <SelectContent>
                            {inUseBillings.map((b) => (
                              <SelectItem key={b.id} value={String(b.id)}>
                                {`#${b.id} • ${b.vehicle?.code || b.vehicleModel || "Xe"}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={loadInUseBillings} disabled={loadingInUse}>
                        {loadingInUse ? "Đang tải" : "Làm mới"}
                      </Button>
                    </div>
                  )}
                  {selectedReturnBilling && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Khách hàng</Label>
                        <Input readOnly value={selectedReturnBilling.renterName || selectedReturnBilling.renter?.name || ""} />
                      </div>
                      <div>
                        <Label>Thời gian thuê</Label>
                        <Input
                          readOnly
                          value={
                            selectedReturnBilling.plannedStartDate && selectedReturnBilling.plannedEndDate
                              ? `${new Date(selectedReturnBilling.plannedStartDate).toLocaleDateString()} → ${new Date(selectedReturnBilling.plannedEndDate).toLocaleDateString()}`
                              : selectedReturnBilling.startTime && selectedReturnBilling.endTime
                                ? `${new Date(selectedReturnBilling.startTime).toLocaleString()} → ${new Date(selectedReturnBilling.endTime).toLocaleString()}`
                                : "-"
                          }
                        />
                      </div>
                      <div>
                        <Label>Trạng thái</Label>
                        <Input readOnly value={toVietnameseStatus(selectedReturnBilling.status)} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Vehicle Info (Return) */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin xe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Xe</Label>
                    <Input readOnly value={selectedReturnBilling ? `${selectedReturnBilling.vehicle?.code || ""} - ${selectedReturnBilling.vehicle?.model?.name || selectedReturnBilling.vehicleModel || ""}` : ""} />
                  </div>
                  <div className="space-y-2">
                    <Label>Trạm</Label>
                    <Input readOnly value={selectedReturnBilling?.vehicle?.station?.name || selectedReturnBilling?.stationName || ""} />
                  </div>
                  {selectedReturnBilling?.vehicle?.model?.pricePerDay ? (
                    <div className="space-y-2">
                      <Label>Giá/ngày</Label>
                      <Input readOnly value={String(selectedReturnBilling.vehicle.model.pricePerDay)} />
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            {/* Return Photos */}
            <Card>
              <CardHeader>
                <CardTitle>Chụp ảnh xe khi trả</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {deliveryPositions.map((position) => (
                    <div key={position} className="flex flex-col items-stretch gap-2">
                      <Button
                        variant="outline"
                        className="h-32 flex flex-col gap-2"
                        onClick={() => handlePickReturn(position)}
                      >
                        {returnPhotos[position] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={returnPhotos[position]} alt={position} className="h-16 w-full object-cover rounded" />
                        ) : (
                          <Camera className="h-6 w-6" />
                        )}
                        <span>{position}</span>
                      </Button>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!returnPhotos[position]}
                          onClick={() => clearReturnPhoto(position)}
                        >
                          Xóa
                        </Button>
                      </div>
                      <input
                        id={`return-photo-input-${position}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => onReturnFileChange(position, e.target.files?.[0])}
                      />
                    </div>
                  ))}
                </div>
                {/* Không cần URL ảnh: dùng ảnh 'Trước' đã chọn */}
              </CardContent>
            </Card>

            {/* Return Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú tình trạng xe khi trả</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Ghi chú về tình trạng xe khi nhận lại..."
                    value={returnNote}
                    onChange={(e) => setReturnNote(e.target.value)}
                  />
                  <div className="space-y-2">
                    <Label>Tiền phạt (nếu có)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={penaltyCost}
                      onChange={(e) => setPenaltyCost(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button variant="outline">Hủy</Button>
              <Button onClick={handleConfirmReturn}>
                <Check className="h-4 w-4 mr-2" />
                Xác nhận trả xe
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
};

export default StaffHandoverPage;
