import { StaffLayout } from "@/components/staff/StaffLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const checklistItems = [
  "Kiểm tra thân xe, không trầy xước",
  "Kiểm tra đèn chiếu sáng",
  "Kiểm tra phanh trước/sau",
  "Kiểm tra lốp xe",
  "Kiểm tra gương chiếu hậu",
  "Kiểm tra mức pin đầy đủ",
  "Kiểm tra bộ sạc kèm theo",
];

const StaffHandoverPage = () => {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("delivery");

  const handleCheckItem = (item: string) => {
    setCheckedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleSubmit = () => {
    toast.success(activeTab === "delivery" ? "Giao xe thành công!" : "Nhận xe thành công!");
    setCheckedItems([]);
  };

  return (
    <StaffLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Giao/Nhận xe</h1>
          <p className="text-muted-foreground">Thực hiện thủ tục bàn giao xe cho khách hàng</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="delivery">Giao xe</TabsTrigger>
            <TabsTrigger value="return">Nhận xe</TabsTrigger>
          </TabsList>

          <TabsContent value="delivery" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin khách hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-name">Họ và tên</Label>
                    <Input id="customer-name" placeholder="Nguyễn Văn A" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-id">CMND/CCCD</Label>
                    <Input id="customer-id" placeholder="001234567890" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-license">Số GPLX</Label>
                    <Input id="customer-license" placeholder="B1-123456" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-phone">Số điện thoại</Label>
                    <Input id="customer-phone" placeholder="0912345678" />
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin xe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-select">Chọn xe</Label>
                    <Input id="vehicle-select" placeholder="29A-123.45 - VinFast Klara S" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="battery-level">Mức pin hiện tại</Label>
                    <Input id="battery-level" value="95%" readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rental-duration">Thời gian thuê</Label>
                    <Input id="rental-duration" placeholder="3 ngày" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deposit">Tiền đặt cọc</Label>
                    <Input id="deposit" placeholder="2,000,000 VNĐ" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>Kiểm tra xe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checklistItems.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={item}
                        checked={checkedItems.includes(item)}
                        onCheckedChange={() => handleCheckItem(item)}
                      />
                      <label
                        htmlFor={item}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Photos */}
            <Card>
              <CardHeader>
                <CardTitle>Chụp ảnh xe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {["Trước", "Sau", "Trái", "Phải"].map((position) => (
                    <Button
                      key={position}
                      variant="outline"
                      className="h-32 flex flex-col gap-2"
                    >
                      <Camera className="h-6 w-6" />
                      <span>{position}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea placeholder="Nhập ghi chú về tình trạng xe..." />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button variant="outline">Hủy</Button>
              <Button onClick={handleSubmit} disabled={checkedItems.length !== checklistItems.length}>
                <Check className="h-4 w-4 mr-2" />
                Xác nhận giao xe
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="return" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Return Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin nhận xe</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="return-vehicle">Biển số xe</Label>
                    <Input id="return-vehicle" placeholder="29A-123.45" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="return-customer">Khách hàng</Label>
                    <Input id="return-customer" placeholder="Nguyễn Văn A" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="return-battery">Mức pin khi trả</Label>
                    <Input id="return-battery" placeholder="45%" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="return-km">Quãng đường đã đi (km)</Label>
                    <Input id="return-km" placeholder="150" />
                  </div>
                </CardContent>
              </Card>

              {/* Damage Check */}
              <Card>
                <CardHeader>
                  <CardTitle>Kiểm tra hư hỏng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {checklistItems.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={`return-${item}`}
                          checked={checkedItems.includes(item)}
                          onCheckedChange={() => handleCheckItem(item)}
                        />
                        <label
                          htmlFor={`return-${item}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Return Photos */}
            <Card>
              <CardHeader>
                <CardTitle>Chụp ảnh xe khi nhận</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {["Trước", "Sau", "Trái", "Phải"].map((position) => (
                    <Button
                      key={position}
                      variant="outline"
                      className="h-32 flex flex-col gap-2"
                    >
                      <Camera className="h-6 w-6" />
                      <span>{position}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Return Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú tình trạng xe</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea placeholder="Ghi chú về tình trạng xe khi nhận lại..." />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-end">
              <Button variant="outline">Hủy</Button>
              <Button onClick={handleSubmit}>
                <Check className="h-4 w-4 mr-2" />
                Xác nhận nhận xe
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </StaffLayout>
  );
};

export default StaffHandoverPage;
