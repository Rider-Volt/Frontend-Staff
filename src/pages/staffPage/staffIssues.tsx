import { StaffLayout } from "@/components/staff/StaffLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Camera, Plus } from "lucide-react";
import { toast } from "sonner";

const mockIssues = [
  { id: "1", vehicle: "VinFast Klara S", issue: "Pin không sạc được", status: "pending", time: "30 phút trước" },
  { id: "2", vehicle: "Yadea Xmen Neo", issue: "Phanh sau bị kẹt", status: "resolved", time: "2 giờ trước" },
  { id: "3", vehicle: "Pega NewTech", issue: "Đèn trước không sáng", status: "pending", time: "1 ngày trước" },
];

const StaffIssues = () => {
  const handleSubmit = () => {
    toast.success("Đã gửi báo cáo sự cố!");
  };

  return (
    <StaffLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Báo cáo sự cố</h1>
          <p className="text-muted-foreground">Ghi nhận và theo dõi các sự cố xe điện</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Báo cáo sự cố mới
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="issue-vehicle">Xe gặp sự cố</Label>
                  <Input id="issue-vehicle" placeholder="29A-123.45 - VinFast Klara S" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="issue-type">Loại sự cố</Label>
                  <Input id="issue-type" placeholder="Ví dụ: Pin, Phanh, Đèn..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issue-description">Mô tả chi tiết</Label>
                  <Textarea 
                    id="issue-description" 
                    placeholder="Mô tả chi tiết tình trạng xe, triệu chứng sự cố..."
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issue-location">Vị trí xe</Label>
                  <Input id="issue-location" placeholder="Khu A, vị trí 5" />
                </div>

                <div className="space-y-2">
                  <Label>Chụp ảnh sự cố</Label>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <Button
                        key={i}
                        variant="outline"
                        className="h-32 flex flex-col gap-2"
                      >
                        <Camera className="h-6 w-6" />
                        <span>Ảnh {i}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issue-priority">Mức độ ưu tiên</Label>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button variant="outline" className="h-12">Thấp</Button>
                    <Button variant="outline" className="h-12">Trung bình</Button>
                    <Button variant="outline" className="h-12">Cao</Button>
                  </div>
                </div>

                <div className="flex gap-4 justify-end pt-4">
                  <Button variant="outline">Hủy</Button>
                  <Button onClick={handleSubmit}>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Gửi báo cáo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Sự cố gần đây</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockIssues.map((issue) => (
                  <div 
                    key={issue.id} 
                    className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium">{issue.vehicle}</div>
                      <Badge variant={issue.status === "pending" ? "destructive" : "success"}>
                        {issue.status === "pending" ? "Chưa xử lý" : "Đã xử lý"}
                      </Badge>
                    </div>
                    <p className="text-sm mb-1">{issue.issue}</p>
                    <p className="text-xs text-muted-foreground">{issue.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffIssues;
