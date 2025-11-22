import React, { useEffect, useState } from "react";
import { StaffLayout } from "@/components/staff/StaffLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getPendingFeedbacks, FeedbackItem, approveFeedback, rejectFeedback, forwardFeedback } from "@/services/staffservice/staffFeedbackService";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Image as ImageIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const StaffFeedbacksPage: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionFor, setActionFor] = useState<{ item: FeedbackItem; action: "approve" | "reject" | "forward" } | null>(null);
  const [actionNote, setActionNote] = useState("");

  async function load() {
    try {
      setLoading(true);
      const res = await getPendingFeedbacks(0, 100, "createdAt,desc");
      setFeedbacks(res.content || []);
      if (res.content && res.content.length === 0) {
        toast.info("Không có feedback nào đang chờ xử lý. Có thể các feedbacks trong database chưa có status 'PENDING_REVIEW'.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Không thể tải feedbacks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleAction = async (action: "approve" | "reject" | "forward", item: FeedbackItem) => {
    const note = window.prompt("Ghi chú cho hành động (tùy chọn):", item.staffNote || "") ?? "";
    try {
      if (action === "approve") {
        await approveFeedback(item.id, note);
      } else if (action === "reject") {
        await rejectFeedback(item.id, note);
      } else if (action === "forward") {
        await forwardFeedback(item.id, note);
      }
      toast.success(`Feedback ${action} thành công`);
      setFeedbacks((prev) => prev.filter((f) => f.id !== item.id));
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Thất bại");
    }
  };

  return (
    <StaffLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm p-6 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center">
              <ImageIcon className="h-8 w-8 text-blue-500 mr-3" />
              Quản lý Feedback
            </h1>
            <p className="text-gray-600">Thực hiện xử lý các phản hồi của khách hàng: duyệt, từ chối hoặc chuyển lên admin.</p>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm feedback theo ID, nội dung..." className="pl-10 w-80" />
            </div>
            <Button onClick={load} variant="outline" disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" /> {loading ? 'Đang tải...' : 'Làm mới'}
            </Button>
          </div>
        </div>

        <div className="px-6 pb-10">
          <Card className="shadow-sm">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-lg font-semibold">Danh sách feedback đang chờ</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>ID</TableHead>
                      <TableHead>Billing</TableHead>
                      <TableHead>Renter</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Nội dung</TableHead>
                      <TableHead>Ảnh</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ghi chú staff</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbacks
                      .filter((f) => {
                        const q = search.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          String(f.id).includes(q) ||
                          (f.content || "").toLowerCase().includes(q) ||
                          (f.status || "").toLowerCase().includes(q)
                        );
                      })
                      .map((f) => (
                        <TableRow key={f.id}>
                          <TableCell className="font-medium text-blue-600">#{f.id}</TableCell>
                          <TableCell>{f.billingId ? `#${f.billingId}` : '-'}</TableCell>
                          <TableCell>{f.renterId ? `#${f.renterId}` : '-'}</TableCell>
                          <TableCell>{f.staffId ? `#${f.staffId}` : '-'}</TableCell>
                          <TableCell>{f.type}</TableCell>
                          <TableCell>{f.rating ?? '-'}</TableCell>
                          <TableCell className="max-w-sm truncate">{f.content}</TableCell>
                          <TableCell>
                            {f.imageUrl ? (
                              <Button variant="outline" size="sm" onClick={() => setViewingImage(f.imageUrl!)}>
                                Xem ảnh
                              </Button>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>{f.status}</TableCell>
                          <TableCell className="max-w-xs truncate">{f.staffNote || '-'}</TableCell>
                          <TableCell>{f.createdAt ? f.createdAt.slice(0, 19).replace('T', ' ') : '-'}</TableCell>
                          <TableCell className="text-right">
                            {(f.status === "PENDING_REVIEW" || !f.status || f.status === "") ? (
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => { setActionFor({ item: f, action: 'approve' }); setActionNote(f.staffNote || ''); setActionDialogOpen(true); }}>
                                  Duyệt
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => { setActionFor({ item: f, action: 'reject' }); setActionNote(f.staffNote || ''); setActionDialogOpen(true); }}>
                                  Từ chối
                                </Button>
                                <Button size="sm" onClick={() => { setActionFor({ item: f, action: 'forward' }); setActionNote(f.staffNote || ''); setActionDialogOpen(true); }}>
                                  Chuyển
                                </Button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">
                                {f.status === "APPROVED" ? "Đã duyệt" : f.status === "REJECTED" ? "Đã từ chối" : f.status || "Chưa có trạng thái"}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}

                    {feedbacks.filter((f) => {
                      const q = search.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        String(f.id).includes(q) ||
                        (f.content || "").toLowerCase().includes(q) ||
                        (f.status || "").toLowerCase().includes(q)
                      );
                    }).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center py-8 text-gray-500">Không có feedback nào</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image viewer dialog */}
        <Dialog open={!!viewingImage} onOpenChange={(open) => !open && setViewingImage(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Ảnh feedback</DialogTitle>
              <DialogDescription>Xem ảnh gửi kèm phản hồi</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {viewingImage ? (
                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                <img src={viewingImage} alt="feedback image" className="w-full h-auto rounded" />
              ) : null}
            </div>
          </DialogContent>
        </Dialog>

        {/* Action dialog */}
        <Dialog open={actionDialogOpen} onOpenChange={(open) => !open && setActionDialogOpen(false)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Xác nhận hành động</DialogTitle>
              <DialogDescription>Nhập ghi chú (tùy chọn) trước khi xác nhận hành động trên feedback.</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <Textarea value={actionNote} onChange={(e) => setActionNote(e.target.value)} placeholder="Ghi chú cho hành động" />
            </div>
            <DialogFooter className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setActionDialogOpen(false); setActionFor(null); }}>Hủy</Button>
              <Button onClick={async () => {
                if (!actionFor) return;
                try {
                  const { item, action } = actionFor;
                  if (action === 'approve') await approveFeedback(item.id, actionNote);
                  if (action === 'reject') await rejectFeedback(item.id, actionNote);
                  if (action === 'forward') await forwardFeedback(item.id, actionNote);
                  toast.success('Thao tác thành công');
                  setFeedbacks(prev => prev.filter(f => f.id !== actionFor.item.id));
                } catch (err: any) {
                  console.error(err);
                  toast.error(err?.message || 'Thao tác thất bại');
                } finally {
                  setActionDialogOpen(false);
                  setActionFor(null);
                  setActionNote('');
                }
              }}>Xác nhận</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </StaffLayout>
  );
};

export default StaffFeedbacksPage;
