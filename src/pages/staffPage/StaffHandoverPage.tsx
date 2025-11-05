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
  uploadContractBeforeImage,
  uploadContractAfterImage,
  type BillingResponse,
} from "@/services/staffservice/staffBillingService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Danh sách kiểm tra hư hỏng đã được loại bỏ theo yêu cầu

const StaffHandoverPage = () => {
  const [activeTab, setActiveTab] = useState("delivery");

  // Delivery (Giao xe)
  const [phoneQuery, setPhoneQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [billingsByPhone, setBillingsByPhone] = useState<BillingResponse[]>([]);
  const [selectedBillingId, setSelectedBillingId] = useState<string>("");
  const [preImageUrl, setPreImageUrl] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [contractBeforeImage, setContractBeforeImage] = useState<File | null>(null);
  const [contractBeforeImagePreview, setContractBeforeImagePreview] = useState<string>("");
  const [isUploadingContract, setIsUploadingContract] = useState(false);
  const [contractAfterImage, setContractAfterImage] = useState<File | null>(null);
  const [contractAfterImagePreview, setContractAfterImagePreview] = useState<string>("");
  const [isUploadingContractAfter, setIsUploadingContractAfter] = useState(false);

  // Xem trước ảnh đã chọn từ thư viện (giao xe)
  const [deliveryPhoto, setDeliveryPhoto] = useState<string>("");
  const [deliveryFile, setDeliveryFile] = useState<File | null>(null);

  const handlePickDelivery = () => {
    const inputId = `delivery-photo-input`;
    const el = document.getElementById(inputId) as HTMLInputElement | null;
    if (el) el.click();
  };

  const onDeliveryFileChange = (file?: File | null) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    if (deliveryPhoto) {
      URL.revokeObjectURL(deliveryPhoto);
    }
    setDeliveryPhoto(objectUrl);
    setDeliveryFile(file);
  };

  const clearDeliveryPhoto = () => {
    if (deliveryPhoto) {
      URL.revokeObjectURL(deliveryPhoto);
    }
    setDeliveryPhoto("");
    setDeliveryFile(null);
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

  // Xem trước ảnh đã chọn từ thư viện (trả xe)
  const [returnPhoto, setReturnPhoto] = useState<string>("");
  const [returnFile, setReturnFile] = useState<File | null>(null);

  const handlePickReturn = () => {
    const inputId = `return-photo-input`;
    const el = document.getElementById(inputId) as HTMLInputElement | null;
    if (el) el.click();
  };

  const onReturnFileChange = (file?: File | null) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    if (returnPhoto) {
      URL.revokeObjectURL(returnPhoto);
    }
    setReturnPhoto(objectUrl);
    setReturnFile(file);
  };

  const clearReturnPhoto = () => {
    if (returnPhoto) {
      URL.revokeObjectURL(returnPhoto);
    }
    setReturnPhoto("");
    setReturnFile(null);
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

  // Không cần tương tác với danh sách kiểm tra hư hỏng

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

  const handleContractBeforeImageChange = (file?: File | null) => {
    if (!file) return;
    
    // Tạo preview ngay lập tức
    const objectUrl = URL.createObjectURL(file);
    if (contractBeforeImagePreview) {
      URL.revokeObjectURL(contractBeforeImagePreview);
    }
    
    // Set state để preview hiển thị ngay
    setContractBeforeImagePreview(objectUrl);
    setContractBeforeImage(file);
  };

  const handleUploadContractBeforeImage = async () => {
    if (!selectedBilling) {
      toast.error("Chọn hóa đơn trước");
      return;
    }
    if (!contractBeforeImage) {
      toast.error("Chọn ảnh hợp đồng trước khi ký");
      return;
    }
    
    try {
      setIsUploadingContract(true);
      const updatedBilling = await uploadContractBeforeImage(selectedBilling.id, contractBeforeImage);
      
      // Cập nhật preview từ URL backend nếu có
      if (updatedBilling.contractBeforeImage && contractBeforeImagePreview?.startsWith('blob:')) {
        const imageUrl = updatedBilling.contractBeforeImage;
        URL.revokeObjectURL(contractBeforeImagePreview);
        setContractBeforeImagePreview(imageUrl);
      }
      
      setBillingsByPhone(prev => 
        prev.map(b => b.id === updatedBilling.id ? updatedBilling : b)
      );
      toast.success(" ảnh hợp đồng thành công!");
    } catch (err: any) {
      console.error(" Lỗi ảnh hợp đồng:", err);
      toast.error(err?.message || "Không thể upload ảnh hợp đồng");
    } finally {
      setIsUploadingContract(false);
    }
  };

  const clearContractBeforeImage = () => {
    if (contractBeforeImagePreview) {
      URL.revokeObjectURL(contractBeforeImagePreview);
    }
    setContractBeforeImagePreview("");
    setContractBeforeImage(null);
  };


  const handleContractAfterImageChange = (file?: File | null) => {
    if (!file) return;
    
    // Tạo preview ngay lập tức
    const objectUrl = URL.createObjectURL(file);
    if (contractAfterImagePreview) {
      URL.revokeObjectURL(contractAfterImagePreview);
    }
    
    // Set state để preview hiển thị ngay
    setContractAfterImagePreview(objectUrl);
    setContractAfterImage(file);
  };

  const handleUploadContractAfterImage = async () => {
    if (!selectedBilling) {
      toast.error("Chọn hóa đơn trước");
      return;
    }
    if (!contractAfterImage) {
      toast.error("Chọn ảnh hợp đồng sau khi ký");
      return;
    }
    
    try {
      setIsUploadingContractAfter(true);
      const updatedBilling = await uploadContractAfterImage(selectedBilling.id, contractAfterImage);
      
      // Cập nhật preview từ URL backend nếu có
      if (updatedBilling.contractAfterImage && contractAfterImagePreview?.startsWith('blob:')) {
        const imageUrl = updatedBilling.contractAfterImage;
        URL.revokeObjectURL(contractAfterImagePreview);
        setContractAfterImagePreview(imageUrl);
      }
      
      setBillingsByPhone(prev => 
        prev.map(b => b.id === updatedBilling.id ? updatedBilling : b)
      );
      toast.success("Upload ảnh hợp đồng thành công!");
    } catch (err: any) {
      console.error("❌ Lỗi upload ảnh hợp đồng:", err);
      toast.error(err?.message || "Không thể upload ảnh hợp đồng");
    } finally {
      setIsUploadingContractAfter(false);
    }
  };

  const clearContractAfterImage = () => {
    if (contractAfterImagePreview) {
      URL.revokeObjectURL(contractAfterImagePreview);
    }
    setContractAfterImagePreview("");
    setContractAfterImage(null);
  };


  const handleConfirmDelivery = async () => {
    if (!selectedBilling) {
      toast.error("Chọn hóa đơn để giao xe");
      return;
    }
    if (!deliveryFile) {
      toast.error("Chọn ảnh xe trước khi giao");
      return;
    }
    console.log(" Giao xe - File ảnh:", deliveryFile);
    console.log(" Billing ID:", selectedBilling.id);
    try {
      console.log(" Đang check-in với ảnh...");
      await checkInByBillingId(selectedBilling.id, deliveryFile);
      toast.success("Giao xe thành công (đã check-in)!");
      // Reset
      setPreImageUrl("");
      setDeliveryNote("");
      setSelectedBillingId("");
      clearDeliveryPhoto();
      clearContractBeforeImage();
      clearContractAfterImage();
    } catch (err: any) {
      console.error(" Lỗi giao xe:", err);
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

  // Load ảnh hợp đồng từ billing khi chọn billing mới
  useEffect(() => {
    if (!selectedBilling) {
      // Reset khi không có billing được chọn
      if (contractBeforeImagePreview && !contractBeforeImage) {
        const preview = contractBeforeImagePreview;
        if (!preview.startsWith('blob:')) {
          // Chỉ clear nếu không phải blob URL (không phải ảnh mới chọn)
          setContractBeforeImagePreview("");
        }
      }
      if (contractAfterImagePreview && !contractAfterImage) {
        const preview = contractAfterImagePreview;
        if (!preview.startsWith('blob:')) {
          // Chỉ clear nếu không phải blob URL (không phải ảnh mới chọn)
          setContractAfterImagePreview("");
        }
      }
      return;
    }

    // Chỉ load từ billing nếu chưa có ảnh local được chọn
    // Không override nếu đang có blob URL (ảnh mới chọn)
    if (!contractBeforeImage && !contractBeforeImagePreview?.startsWith('blob:')) {
      if (selectedBilling.contractBeforeImage) {
        setContractBeforeImagePreview(selectedBilling.contractBeforeImage);
      }
    }
    
    if (!contractAfterImage && !contractAfterImagePreview?.startsWith('blob:')) {
      if (selectedBilling.contractAfterImage) {
        setContractAfterImagePreview(selectedBilling.contractAfterImage);
      }
    }
  }, [selectedBilling?.id]);

  const handleConfirmReturn = async () => {
    if (!selectedReturnBilling) {
      toast.error("Chọn hóa đơn để trả xe");
      return;
    }
    if (!returnFile) {
      toast.error("Chọn ảnh xe khi trả");
      return;
    }
    const penalty = Number(penaltyCost || 0);
    console.log(" Trả xe - File ảnh:", returnFile);
    console.log(" Billing ID:", selectedReturnBilling.id);
    console.log(" Penalty:", penalty);
    try {
      console.log(" Đang inspect return với ảnh...");
      await inspectReturnedVehicle(selectedReturnBilling.id, returnFile, penalty, returnNote.trim());
      toast.success("Trả xe thành công, đã cập nhật hoàn tất!");
      // Reset
      setFinalImageUrl("");
      setPenaltyCost("0");
      setReturnNote("");
      setReturnBillingId("");
      clearReturnPhoto();
      // Refresh list
      loadInUseBillings();
    } catch (err: any) {
      console.error(" Lỗi trả xe:", err);
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

  {/* Tìm kiếm theo SĐT áp dụng cho cả hai tab */}
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
                {/* Thông tin khách hàng */}
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

              {/* Thông tin xe */}
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
                    <Label>Biển số</Label>
                    <Input readOnly value={selectedBilling?.vehicleLicensePlate || ""} />
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

            {/* Danh sách kiểm tra đã được loại bỏ theo yêu cầu */}

            {/* Ảnh hợp đồng */}
            <Card>
              <CardHeader>
                <CardTitle>Ảnh hợp đồng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Contract Before Image */}
                  <div className="flex flex-col gap-3">
                    {contractBeforeImagePreview ? (
                      <div 
                        className="h-40 w-full border rounded-lg overflow-hidden bg-white cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => document.getElementById("contract-before-image-input")?.click()}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={contractBeforeImagePreview} 
                          alt="Hợp đồng trước ký" 
                          className="h-full w-full object-contain"
                          onLoad={() => console.log("✅ Ảnh trước ký đã load:", contractBeforeImagePreview)}
                          onError={(e) => console.error("❌ Lỗi load ảnh trước ký:", e, contractBeforeImagePreview)}
                        />
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="h-40 w-full flex flex-col gap-2 p-0 overflow-hidden hover:bg-accent/50 transition-colors"
                        onClick={() => document.getElementById("contract-before-image-input")?.click()}
                      >
                        <div className="flex flex-col items-center justify-center h-full gap-2">
                          <Camera className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm font-medium">Ảnh trước ký</span>
                        </div>
                      </Button>
                    )}
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUploadContractBeforeImage}
                        disabled={!contractBeforeImage || !selectedBilling || isUploadingContract}
                      >
                        {isUploadingContract ? "Đang upload..." : "Upload"}
                      </Button>
                      {contractBeforeImagePreview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearContractBeforeImage}
                          disabled={isUploadingContract}
                        >
                          Xóa
                        </Button>
                      )}
                    </div>
                    <input
                      id="contract-before-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleContractBeforeImageChange(e.target.files?.[0])}
                    />
                  </div>

                  {/* Contract After Image */}
                  <div className="flex flex-col gap-3">
                    {contractAfterImagePreview ? (
                      <div 
                        className="h-40 w-full border rounded-lg overflow-hidden bg-white cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => document.getElementById("contract-after-image-input")?.click()}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={contractAfterImagePreview} 
                          alt="Hợp đồng sau ký" 
                          className="h-full w-full object-contain"
                          onLoad={() => console.log("✅ Ảnh sau ký đã load:", contractAfterImagePreview)}
                          onError={(e) => console.error("❌ Lỗi load ảnh sau ký:", e, contractAfterImagePreview)}
                        />
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="h-40 w-full flex flex-col gap-2 p-0 overflow-hidden hover:bg-accent/50 transition-colors"
                        onClick={() => document.getElementById("contract-after-image-input")?.click()}
                      >
                        <div className="flex flex-col items-center justify-center h-full gap-2">
                          <Camera className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm font-medium">Ảnh sau ký</span>
                        </div>
                      </Button>
                    )}
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUploadContractAfterImage}
                        disabled={!contractAfterImage || !selectedBilling || isUploadingContractAfter}
                      >
                        {isUploadingContractAfter ? "Đang upload..." : "Upload"}
                      </Button>
                      {contractAfterImagePreview && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearContractAfterImage}
                          disabled={isUploadingContractAfter}
                        >
                          Xóa
                        </Button>
                      )}
                    </div>
                    <input
                      id="contract-after-image-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleContractAfterImageChange(e.target.files?.[0])}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ảnh xe */}
            <Card>
              <CardHeader>
                <CardTitle>Chụp ảnh xe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 max-w-2xl">
                  <Button
                    variant="outline"
                    className="h-64 w-full flex flex-col gap-2 p-0 overflow-hidden hover:bg-accent/50 transition-colors"
                    onClick={handlePickDelivery}
                  >
                    {deliveryPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={deliveryPhoto} alt="Ảnh xe" className="h-full w-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-3">
                        <Camera className="h-10 w-10 text-muted-foreground" />
                        <span className="text-base font-medium">Chọn ảnh xe</span>
                      </div>
                    )}
                  </Button>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!deliveryPhoto}
                      onClick={clearDeliveryPhoto}
                    >
                      Xóa
                    </Button>
                  </div>
                  <input
                    id="delivery-photo-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onDeliveryFileChange(e.target.files?.[0])}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ghi chú */}
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

            {/* Hành động */}
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
              {/* Thông tin khách hàng (Trả xe) */}
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

              {/* Thông tin xe (Trả xe) */}
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
                    <Label>Biển số</Label>
                    <Input readOnly value={selectedReturnBilling?.vehicleLicensePlate || ""} />
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

            {/* Ảnh khi trả */}
            <Card>
              <CardHeader>
                <CardTitle>Chụp ảnh xe khi trả</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 max-w-2xl">
                  <Button
                    variant="outline"
                    className="h-64 w-full flex flex-col gap-2 p-0 overflow-hidden hover:bg-accent/50 transition-colors"
                    onClick={handlePickReturn}
                  >
                    {returnPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={returnPhoto} alt="Ảnh xe khi trả" className="h-full w-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-3">
                        <Camera className="h-10 w-10 text-muted-foreground" />
                        <span className="text-base font-medium">Chọn ảnh xe</span>
                      </div>
                    )}
                  </Button>
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!returnPhoto}
                      onClick={clearReturnPhoto}
                    >
                      Xóa
                    </Button>
                  </div>
                  <input
                    id="return-photo-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onReturnFileChange(e.target.files?.[0])}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ghi chú trả xe */}
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
