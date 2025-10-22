import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard } from "lucide-react";
import { toast } from "sonner";

const Payment = () => {
  const handlePayment = () => {
    toast.success("Thanh toán thành công!");
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Thanh toán</h1>
          <p className="text-muted-foreground">Xử lý thanh toán và đặt cọc cho khách hàng</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Tabs defaultValue="rental">
              <TabsList className="mb-6 grid w-full grid-cols-2">
                <TabsTrigger value="rental">Thanh toán thuê xe</TabsTrigger>
                <TabsTrigger value="deposit">Đặt cọc / Hoàn cọc</TabsTrigger>
              </TabsList>

              <TabsContent value="rental" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin thanh toán</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="rental-customer">Khách hàng</Label>
                      <Input id="rental-customer" placeholder="Nguyễn Văn A" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rental-vehicle">Xe thuê</Label>
                      <Input id="rental-vehicle" placeholder="29A-123.45 - VinFast Klara S" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rental-days">Số ngày thuê</Label>
                      <Input id="rental-days" type="number" placeholder="3" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rental-price">Đơn giá/ngày</Label>
                      <Input id="rental-price" value="150,000 VNĐ" readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rental-total">Tổng tiền</Label>
                      <Input id="rental-total" value="450,000 VNĐ" readOnly className="font-bold" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Phương thức thanh toán</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <Button variant="outline" className="h-20 flex flex-col gap-2">
                        <DollarSign className="h-6 w-6" />
                        <span>Tiền mặt</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col gap-2">
                        <CreditCard className="h-6 w-6" />
                        <span>Chuyển khoản</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4 justify-end">
                  <Button variant="outline">Hủy</Button>
                  <Button onClick={handlePayment}>Xác nhận thanh toán</Button>
                </div>
              </TabsContent>

              <TabsContent value="deposit" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin đặt cọc</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="deposit-customer">Khách hàng</Label>
                      <Input id="deposit-customer" placeholder="Nguyễn Văn A" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deposit-vehicle">Xe thuê</Label>
                      <Input id="deposit-vehicle" placeholder="29A-123.45 - VinFast Klara S" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deposit-amount">Số tiền đặt cọc</Label>
                      <Input id="deposit-amount" placeholder="2,000,000 VNĐ" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deposit-method">Phương thức</Label>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Button variant="outline" className="h-16">Nhận đặt cọc</Button>
                        <Button variant="outline" className="h-16">Hoàn cọc</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4 justify-end">
                  <Button variant="outline">Hủy</Button>
                  <Button onClick={handlePayment}>Xác nhận</Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Recent Transactions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Giao dịch gần đây</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { customer: "Trần Thị B", amount: "300,000 VNĐ", type: "rental", time: "10 phút trước" },
                  { customer: "Lê Văn C", amount: "2,000,000 VNĐ", type: "deposit", time: "1 giờ trước" },
                  { customer: "Phạm Thị D", amount: "450,000 VNĐ", type: "rental", time: "2 giờ trước" },
                ].map((transaction, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{transaction.customer}</p>
                      <p className="text-sm text-muted-foreground">{transaction.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{transaction.amount}</p>
                      <Badge variant={transaction.type === "rental" ? "default" : "secondary"}>
                        {transaction.type === "rental" ? "Thuê xe" : "Đặt cọc"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Payment;
