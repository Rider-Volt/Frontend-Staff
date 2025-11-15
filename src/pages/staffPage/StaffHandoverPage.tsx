import { StaffLayout } from "@/components/staff/StaffLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Check, X, Loader2 } from "lucide-react";
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
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);
  const [odometerOutKm, setOdometerOutKm] = useState<string>("0");
  const [batteryOutPercent, setBatteryOutPercent] = useState<string>("100");

  // Xem trước ảnh đã chọn từ thư viện (giao xe) - hỗ trợ nhiều ảnh
  const [deliveryPhotos, setDeliveryPhotos] = useState<Array<{ file: File; preview: string }>>([]);

  const handlePickDelivery = () => {
    const inputId = `delivery-photo-input`;
    const el = document.getElementById(inputId) as HTMLInputElement | null;
    if (el) {
      el.multiple = true;
      el.click();
    }
  };

  const onDeliveryFileChange = (files?: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const newPhotos: Array<{ file: File; preview: string }> = [];
    Array.from(files).forEach((file) => {
      const objectUrl = URL.createObjectURL(file);
      newPhotos.push({ file, preview: objectUrl });
    });
    
    setDeliveryPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removeDeliveryPhoto = (index: number) => {
    setDeliveryPhotos((prev) => {
      const photoToRemove = prev[index];
      if (photoToRemove?.preview) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearDeliveryPhotos = () => {
    deliveryPhotos.forEach((photo) => {
      if (photo.preview) {
        URL.revokeObjectURL(photo.preview);
      }
    });
    setDeliveryPhotos([]);
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
  const [odometerInKm, setOdometerInKm] = useState<string>("0");
  const [batteryInPercent, setBatteryInPercent] = useState<string>("100");
  const [isConfirmingReturn, setIsConfirmingReturn] = useState(false);

  // Xem trước ảnh đã chọn từ thư viện (trả xe) - hỗ trợ nhiều ảnh
  const [returnPhotos, setReturnPhotos] = useState<Array<{ file: File; preview: string }>>([]);

  const handlePickReturn = () => {
    const inputId = `return-photo-input`;
    const el = document.getElementById(inputId) as HTMLInputElement | null;
    if (el) {
      el.multiple = true;
      el.click();
    }
  };

  const onReturnFileChange = (files?: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const newPhotos: Array<{ file: File; preview: string }> = [];
    Array.from(files).forEach((file) => {
      const objectUrl = URL.createObjectURL(file);
      newPhotos.push({ file, preview: objectUrl });
    });
    
    setReturnPhotos((prev) => [...prev, ...newPhotos]);
  };

  const removeReturnPhoto = (index: number) => {
    setReturnPhotos((prev) => {
      const photoToRemove = prev[index];
      if (photoToRemove?.preview) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearReturnPhotos = () => {
    returnPhotos.forEach((photo) => {
      if (photo.preview) {
        URL.revokeObjectURL(photo.preview);
      }
    });
    setReturnPhotos([]);
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

  const formatBillingPeriod = (b: BillingResponse) => {
    if (b.plannedStartDate && b.plannedEndDate) {
      return `${new Date(b.plannedStartDate).toLocaleDateString()} → ${new Date(b.plannedEndDate).toLocaleDateString()}`;
    }
    if (b.startTime && b.endTime) {
      return `${new Date(b.startTime).toLocaleString()} → ${new Date(b.endTime).toLocaleString()}`;
    }
    return "-";
  };

  const handleSearchByPhone = async () => {
    if (!phoneQuery.trim()) {
      toast.error("Nhập số điện thoại");
      return;
    }
    try {
      setIsSearching(true);
      if (activeTab === "return") {
        setLoadingInUse(true);
      }
      const data = await getBillingsByPhone(phoneQuery.trim());
      
      if (activeTab === "delivery") {
        // Only show paid/approved bookings for Delivery tab
        const paid = data.filter((b) => {
          const status = String(b.status).toUpperCase();
          return status === "PAYED" || status === "PAID" || status === "APPROVED";
        });
        setBillingsByPhone(paid);
        if (paid.length === 0) {
          toast.info("Không có hóa đơn đã thanh toán nào cho số này");
        } else {
          toast.success(`Đã tìm thấy ${paid.length} hóa đơn đã thanh toán`);
        }
      } else {
        // For Return tab, narrow list to only RENTING invoices of this phone
        const rentingByPhone = data.filter((b) => String(b.status).toUpperCase() === "RENTING");
        setInUseBillings(rentingByPhone);
        if (rentingByPhone.length === 0) {
          toast.info("Không có hóa đơn đang thuê nào cho số này");
        } else {
          toast.success(`Đã tìm thấy ${rentingByPhone.length} hóa đơn đang thuê`);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Không thể tìm hóa đơn theo SDT");
    } finally {
      setIsSearching(false);
      if (activeTab === "return") {
        setLoadingInUse(false);
      }
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
      console.error(" Lỗi upload ảnh hợp đồng:", err);
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
    if (deliveryPhotos.length === 0) {
      toast.error("Chọn ít nhất một ảnh xe trước khi giao");
      return;
    }
    console.log("🚗 Giao xe - Số lượng ảnh xe:", deliveryPhotos.length);
    console.log("📋 Billing ID:", selectedBilling.id);
    console.log("📸 File ảnh hợp đồng trước ký:", contractBeforeImage);
    console.log("📸 File ảnh hợp đồng sau ký:", contractAfterImage);
    console.log("📏 Odometer:", odometerOutKm);
    console.log("🔋 Battery:", batteryOutPercent);
    try {
      setIsConfirmingDelivery(true);
      console.log("⏳ Đang check-in với ảnh xe và ảnh hợp đồng...");
      const odometer = odometerOutKm ? Number(odometerOutKm) : undefined;
      const battery = batteryOutPercent ? Number(batteryOutPercent) : undefined;
      // Gửi tất cả các ảnh đã chọn
      const photoFiles = deliveryPhotos.map((photo) => photo.file);
      const updatedBilling = await checkInByBillingId(
        selectedBilling.id, 
        photoFiles,
        contractBeforeImage || undefined,
        contractAfterImage || undefined,
        odometer,
        battery
      );
      console.log("✅ Check-in thành công, billing đã cập nhật:", updatedBilling);
      
      // Cập nhật billing trong danh sách với dữ liệu mới từ server
      setBillingsByPhone(prev => 
        prev.map(b => b.id === updatedBilling.id ? updatedBilling : b)
      );
      
      // Cập nhật preview ảnh hợp đồng từ URL server nếu có
      if (updatedBilling.contractBeforeImage && contractBeforeImagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(contractBeforeImagePreview);
        setContractBeforeImagePreview(updatedBilling.contractBeforeImage);
      }
      if (updatedBilling.contractAfterImage && contractAfterImagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(contractAfterImagePreview);
        setContractAfterImagePreview(updatedBilling.contractAfterImage);
      }
      
      toast.success("Giao xe thành công ");
      // Reset
      setPreImageUrl("");
      setDeliveryNote("");
      setSelectedBillingId("");
      setOdometerOutKm("0");
      setBatteryOutPercent("100");
      clearDeliveryPhotos();
      clearContractBeforeImage();
      clearContractAfterImage();
    } catch (err: any) {
      console.error(" Lỗi giao xe:", err);
      toast.error(err?.message || "Không thể xác nhận giao xe");
    }
    finally {
      setIsConfirmingDelivery(false);
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
      toast.error(err?.message || "Không thể tải đơn ");
    } finally {
      setLoadingInUse(false);
    }
  };

  useEffect(() => {
    if (activeTab === "return" && phoneQuery.trim().length > 0) {
      loadInUseBillings();
    } else if (activeTab === "return" && phoneQuery.trim().length === 0) {
      // Reset khi chuyển sang tab return nhưng chưa có số điện thoại
      setInUseBillings([]);
      setReturnBillingId("");
      setOdometerInKm("0");
      setBatteryInPercent("100");
    }
  }, [activeTab, phoneQuery]);

  // Reset odometer và battery khi không có billing được chọn (trả xe)
  useEffect(() => {
    if (!selectedReturnBilling) {
      setOdometerInKm("0");
      setBatteryInPercent("100");
    }
  }, [selectedReturnBilling]);

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
      // Reset odometer và battery về giá trị mặc định
      setOdometerOutKm("0");
      setBatteryOutPercent("100");
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
    if (returnPhotos.length === 0) {
      toast.error("Chọn ít nhất một ảnh xe khi trả");
      return;
    }
    const penalty = Number(penaltyCost || 0);
    const odometer = odometerInKm ? Number(odometerInKm) : undefined;
    const battery = batteryInPercent ? Number(batteryInPercent) : undefined;
    console.log(" Trả xe - Số lượng ảnh:", returnPhotos.length);
    console.log(" Billing ID:", selectedReturnBilling.id);
    console.log(" Penalty:", penalty);
    console.log("📏 Odometer khi trả:", odometer);
    console.log("🔋 Battery khi trả:", battery);
    try {
      setIsConfirmingReturn(true);
      console.log(" Đang inspect return với ảnh...");
      const photoFiles = returnPhotos.map((photo) => photo.file);
      await inspectReturnedVehicle(selectedReturnBilling.id, photoFiles, penalty, returnNote.trim(), odometer, battery);
      toast.success("Trả xe thành công, đã cập nhật hoàn tất!");
      // Reset
      setFinalImageUrl("");
      setPenaltyCost("0");
      setReturnNote("");
      setReturnBillingId("");
      setOdometerInKm("0");
      setBatteryInPercent("100");
      clearReturnPhotos();
      // Refresh list
      loadInUseBillings();
    } catch (err: any) {
      console.error(" Lỗi trả xe:", err);
      toast.error(err?.message || "Không thể xác nhận trả xe");
    }
    finally {
      setIsConfirmingReturn(false);
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
                  {phoneQuery.trim().length > 0 ? (
                    <>
                      <div className="space-y-2">
                        <Label>Chọn hóa đơn (đã thanh toán)</Label>
                        <Select value={selectedBillingId} onValueChange={setSelectedBillingId}>
                          <SelectTrigger>
                            <SelectValue placeholder={isSearching ? "Đang tìm..." : billingsByPhone.length === 0 ? "Không có hóa đơn đã thanh toán" : "Chọn hóa đơn"} />
                          </SelectTrigger>
                          <SelectContent>
                            {billingsByPhone.length === 0 ? (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                Không có hóa đơn đã thanh toán
                              </div>
                            ) : (
                              billingsByPhone.map((b) => (
                                <SelectItem key={b.id} value={String(b.id)}>
                                  {`#${b.id} • ${b.vehicle?.code || b.vehicleModel || "Xe"} • ${b.vehicleLicensePlate || "-"} • ${formatBillingPeriod(b)}`}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Nhập số điện thoại và nhấn "Tìm" để tìm hóa đơn đã thanh toán
                    </div>
                  )}
                  {selectedBilling && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label>Khách hàng</Label>
                        <Input readOnly value={selectedBilling.renterName || selectedBilling.renter?.name || ""} />
                      </div>
                      <div>
                        <Label>Trạng thái</Label>
                        <Input readOnly value={toVietnameseStatus(selectedBilling.status)} />
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
                  {selectedBilling ? (
                    <>
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
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="odometer-out">Số km đồng hồ khi giao (km)</Label>
                          <Input
                            id="odometer-out"
                            type="number"
                            min="0"
                            value={odometerOutKm}
                            onChange={(e) => setOdometerOutKm(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="battery-out">Pin khi giao (%)</Label>
                          <Input
                            id="battery-out"
                            type="number"
                            min="0"
                            max="100"
                            value={batteryOutPercent}
                            onChange={(e) => setBatteryOutPercent(e.target.value)}
                            placeholder="100"
                          />
                        </div>
                      </>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">Nhập số điện thoại và chọn hóa đơn để hiển thị thông tin xe</div>
                  )}
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
                    {contractBeforeImagePreview && (
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={clearContractBeforeImage}>
                          Xóa
                        </Button>
                      </div>
                    )}
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
                    {contractAfterImagePreview && (
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={clearContractAfterImage}>
                          Xóa
                        </Button>
                      </div>
                    )}
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
                <div className="flex flex-col gap-4">
                  {/* Grid hiển thị các ảnh đã chọn */}
                  {deliveryPhotos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {deliveryPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square border rounded-lg overflow-hidden bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.preview}
                              alt={`Ảnh xe ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                            onClick={() => removeDeliveryPhoto(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Nút thêm ảnh */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="h-32 w-full flex flex-col gap-2 p-0 overflow-hidden hover:bg-accent/50 transition-colors"
                      onClick={handlePickDelivery}
                    >
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {deliveryPhotos.length > 0 ? "Thêm ảnh khác" : "Chọn ảnh xe (có thể chọn nhiều)"}
                        </span>
                      </div>
                    </Button>
                    {deliveryPhotos.length > 0 && (
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearDeliveryPhotos}
                        >
                          Xóa tất cả
                        </Button>
                      </div>
                    )}
                    <input
                      id="delivery-photo-input"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => onDeliveryFileChange(e.target.files)}
                    />
                  </div>
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
              <Button
                onClick={handleConfirmDelivery}
                disabled={isConfirmingDelivery}
                className="transform transition-transform duration-150 active:scale-95"
              >
                {isConfirmingDelivery ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xác nhận...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Xác nhận giao xe
                  </>
                )}
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
                  {phoneQuery.trim().length > 0 ? (
                    <div className="flex items-end gap-2">
                      <div className="flex-1 space-y-2">
                        <Label>Chọn hóa đơn đang thuê</Label>
                        <Select value={returnBillingId} onValueChange={setReturnBillingId}>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingInUse ? "Đang tải..." : inUseBillings.length === 0 ? "Không có hóa đơn đang thuê" : "Chọn hóa đơn"} />
                          </SelectTrigger>
                          <SelectContent>
                            {inUseBillings.length === 0 ? (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                Không có hóa đơn đang thuê
                              </div>
                            ) : (
                              inUseBillings.map((b) => (
                                <SelectItem key={b.id} value={String(b.id)}>
                                  {`#${b.id} • ${b.vehicle?.code || b.vehicleModel || "Xe"} • ${b.vehicleLicensePlate || "-"} • ${formatBillingPeriod(b)}`}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={loadInUseBillings} disabled={loadingInUse}>
                        {loadingInUse ? "Đang tải" : "Làm mới"}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Nhập số điện thoại và nhấn "Tìm" để tìm hóa đơn đang thuê
                    </div>
                  )}
                  {selectedReturnBilling && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label>Khách hàng</Label>
                        <Input readOnly value={selectedReturnBilling.renterName || selectedReturnBilling.renter?.name || ""} />
                      </div>
                      <div>
                        <Label>Trạng thái</Label>
                        <Input readOnly value={toVietnameseStatus(selectedReturnBilling.status)} />
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
                  {selectedReturnBilling ? (
                    <>
                      <div className="space-y-2">
                        <Label>Xe</Label>
                        <Input readOnly value={`${selectedReturnBilling.vehicle?.code || ""} - ${selectedReturnBilling.vehicle?.model?.name || selectedReturnBilling.vehicleModel || ""}`} />
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
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="odometer-in">Số km đồng hồ khi trả (km)</Label>
                          <Input
                            id="odometer-in"
                            type="number"
                            min="0"
                            value={odometerInKm}
                            onChange={(e) => setOdometerInKm(e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="battery-in">Pin khi trả (%)</Label>
                          <Input
                            id="battery-in"
                            type="number"
                            min="0"
                            max="100"
                            value={batteryInPercent}
                            onChange={(e) => setBatteryInPercent(e.target.value)}
                            placeholder="100"
                          />
                        </div>
                      </>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">Nhập số điện thoại và chọn hóa đơn để hiển thị thông tin xe</div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Ảnh khi trả */}
            <Card>
              <CardHeader>
                <CardTitle>Chụp ảnh xe khi trả</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {/* Grid hiển thị các ảnh đã chọn */}
                  {returnPhotos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {returnPhotos.map((photo, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square border rounded-lg overflow-hidden bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.preview}
                              alt={`Ảnh xe khi trả ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                            onClick={() => removeReturnPhoto(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Nút thêm ảnh */}
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="h-32 w-full flex flex-col gap-2 p-0 overflow-hidden hover:bg-accent/50 transition-colors"
                      onClick={handlePickReturn}
                    >
                      <div className="flex flex-col items-center justify-center h-full gap-2">
                        <Camera className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {returnPhotos.length > 0 ? "Thêm ảnh khác" : "Chọn ảnh xe khi trả (có thể chọn nhiều)"}
                        </span>
                      </div>
                    </Button>
                    {returnPhotos.length > 0 && (
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearReturnPhotos}
                        >
                          Xóa tất cả
                        </Button>
                      </div>
                    )}
                    <input
                      id="return-photo-input"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => onReturnFileChange(e.target.files)}
                    />
                  </div>
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
              <Button
                onClick={handleConfirmReturn}
                disabled={isConfirmingReturn}
                className="transform transition-transform duration-150 active:scale-95"
              >
                {isConfirmingReturn ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xác nhận...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Xác nhận trả xe
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
};

export default StaffHandoverPage;
