import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  MessageSquare,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';
import { 
  getAdminFeedbacks,
  resolveFeedback,
  FeedbackItem
} from '../../services/adminservice/adminFeedbackService';
import { getAllStations, Station } from '../../services/adminservice/adminStationService';
import { getStationStaff, StationStaffMember } from '../../services/adminservice/adminEmployeeService';
import { getAllBillings } from '../../services/adminservice/adminBillingService';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AdminFeedbacks = () => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [viewingFeedback, setViewingFeedback] = useState<FeedbackItem | null>(null);
  const [actionFeedback, setActionFeedback] = useState<FeedbackItem | null>(null);
  const [actionType, setActionType] = useState<'RESOLVED' | 'REJECTED' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [viewingImageFeedback, setViewingImageFeedback] = useState<FeedbackItem | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Mapping ID -> Name
  const [renterMap, setRenterMap] = useState<Map<number, string>>(new Map());
  const [stationMap, setStationMap] = useState<Map<number, string>>(new Map());
  const [staffMap, setStaffMap] = useState<Map<number, string>>(new Map());

  // Load reference data (renters, stations, staff)
  useEffect(() => {
    loadReferenceData();
  }, []);

  // Tải danh sách feedbacks từ API
  useEffect(() => {
    fetchFeedbacks();
  }, [currentPage]);

  const loadReferenceData = async () => {
    try {
      // Load renters from billings (admin doesn't have access to /staff/accounts/renters)
      try {
        const billings = await getAllBillings();
        const renterMapData = new Map<number, string>();
        billings.forEach(billing => {
          if (billing.renterId && billing.renterName) {
            // Only set if not already in map to avoid overwriting
            if (!renterMapData.has(billing.renterId)) {
              renterMapData.set(billing.renterId, billing.renterName);
            }
          }
        });
        setRenterMap(renterMapData);
        console.log('Loaded renters from billings:', renterMapData.size);
      } catch (err) {
        console.error('Error loading renters from billings:', err);
      }

      // Load stations
      try {
        const stations = await getAllStations();
        const stationMapData = new Map<number, string>();
        stations.forEach(station => {
          stationMapData.set(station.id, station.name || `Station #${station.id}`);
        });
        setStationMap(stationMapData);
      } catch (err) {
        console.error('Error loading stations:', err);
      }

      // Load staff from all stations
      try {
        const stations = await getAllStations();
        const staffMapData = new Map<number, string>();
        
        // Load staff from each station
        await Promise.all(
          stations.map(async (station) => {
            try {
              const staffList = await getStationStaff(station.id);
              staffList.forEach(staff => {
                if (!staffMapData.has(staff.accountId)) {
                  staffMapData.set(staff.accountId, staff.accountName || `Staff #${staff.accountId}`);
                }
              });
            } catch (err) {
              console.error(`Error loading staff for station ${station.id}:`, err);
            }
          })
        );
        
        setStaffMap(staffMapData);
      } catch (err) {
        console.error('Error loading staff:', err);
      }
    } catch (err) {
      console.error('Error loading reference data:', err);
    }
  };

  // Helper functions to get names
  const getRenterName = (id?: number): string => {
    if (!id) return '-';
    const name = renterMap.get(id);
    // Return name if found, otherwise show ID (will update when map loads)
    return name || `#${id}`;
  };

  const getStationName = (id?: number): string => {
    if (!id) return '-';
    return stationMap.get(id) || `#${id}`;
  };

  const getStaffName = (id?: number): string => {
    if (!id) return '-';
    return staffMap.get(id) || `#${id}`;
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminFeedbacks(currentPage, pageSize, "createdAt,desc");
      setFeedbacks(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setError(err instanceof Error ? err.message : 'Lỗi khi tải danh sách feedbacks');
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tải danh sách feedbacks');
    } finally {
      setLoading(false);
    }
  };

  // Lọc feedbacks dựa trên từ khóa tìm kiếm
  const filteredFeedbacks = feedbacks.filter(feedback => {
    if (!searchTerm.trim()) {
      return true;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const idMatch = feedback.id.toString().includes(searchLower);
    const contentMatch = feedback.content?.toLowerCase().includes(searchLower) || false;
    const statusMatch = feedback.status?.toLowerCase().includes(searchLower) || false;
    const staffNoteMatch = feedback.staffNote?.toLowerCase().includes(searchLower) || false;
    
    return idMatch || contentMatch || statusMatch || staffNoteMatch;
  });

  // Xử lý resolve/reject feedback
  const handleResolveFeedback = async () => {
    if (!actionFeedback || !actionType) return;
    
    try {
      await resolveFeedback(actionFeedback.id, actionType, adminNote);
      toast.success(`Feedback đã được ${actionType === 'RESOLVED' ? 'giải quyết' : 'từ chối'} thành công!`);
      setIsActionDialogOpen(false);
      setActionFeedback(null);
      setActionType(null);
      setAdminNote('');
      // Reload data after resolving
      await fetchFeedbacks();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi khi xử lý feedback');
    }
  };

  // Lấy badge cho trạng thái feedback
  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'PENDING_REVIEW':
        return { variant: 'outline' as const, className: 'bg-yellow-100 text-yellow-800', text: 'Chờ xử lý' };
      case 'FORWARDED':
        return { variant: 'default' as const, className: 'bg-blue-100 text-blue-800', text: 'Đã chuyển lên' };
      case 'RESOLVED':
        return { variant: 'default' as const, className: 'bg-green-100 text-green-800', text: 'Đã giải quyết' };
      case 'REJECTED':
        return { variant: 'destructive' as const, className: 'bg-red-100 text-red-800', text: 'Đã từ chối' };
      case 'APPROVED':
        return { variant: 'default' as const, className: 'bg-green-100 text-green-800', text: 'Đã duyệt' };
      default:
        return { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800', text: status || 'Không xác định' };
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải danh sách feedbacks...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-500">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tìm kiếm */}
      <div className="flex justify-start">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-80"
          />
        </div>
      </div>

      {/* Dialog Xem Chi Tiết Feedback */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi Tiết Feedback</DialogTitle>
          </DialogHeader>
          {viewingFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID Feedback</label>
                  <p className="text-sm font-semibold">#{viewingFeedback.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                  <div className="mt-1">
                    <Badge 
                      variant={getStatusBadge(viewingFeedback.status).variant} 
                      className={getStatusBadge(viewingFeedback.status).className}
                    >
                      {getStatusBadge(viewingFeedback.status).text}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Billing ID</label>
                  <p className="text-sm">{viewingFeedback.billingId ? `#${viewingFeedback.billingId}` : '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Renter</label>
                  <p className="text-sm">{getRenterName(viewingFeedback.renterId)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Station</label>
                  <p className="text-sm">{getStationName(viewingFeedback.stationId)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Staff</label>
                  <p className="text-sm">{getStaffName(viewingFeedback.staffId)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Loại</label>
                  <p className="text-sm">{viewingFeedback.type || '-'}</p>
                </div>
                {viewingFeedback.rating && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Đánh giá</label>
                    <p className="text-sm font-semibold">{viewingFeedback.rating} ⭐</p>
                  </div>
                )}
              </div>
              
              {viewingFeedback.content && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Nội dung</label>
                  <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{viewingFeedback.content}</p>
                </div>
              )}
              
              {viewingFeedback.imageUrls && viewingFeedback.imageUrls.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Ảnh đính kèm ({viewingFeedback.imageUrls.length})</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setViewingImageFeedback(viewingFeedback);
                        setViewingImage(viewingFeedback.imageUrls![0]);
                      }}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Xem tất cả ảnh ({viewingFeedback.imageUrls.length})
                    </Button>
                  </div>
                </div>
              )}
              
              {viewingFeedback.staffNote && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Ghi chú từ Staff</label>
                  <p className="text-sm mt-1 p-3 bg-blue-50 rounded-md">{viewingFeedback.staffNote}</p>
                </div>
              )}
              
              {viewingFeedback.adminNote && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Ghi chú từ Admin</label>
                  <p className="text-sm mt-1 p-3 bg-green-50 rounded-md">{viewingFeedback.adminNote}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                  <p className="text-sm">{formatDate(viewingFeedback.createdAt)}</p>
                </div>
                {viewingFeedback.updatedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ngày cập nhật</label>
                    <p className="text-sm">{formatDate(viewingFeedback.updatedAt)}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Xử Lý Feedback */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'RESOLVED' ? 'Giải quyết Feedback' : 'Từ chối Feedback'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'RESOLVED' 
                ? 'Xác nhận giải quyết feedback này. Bạn có thể thêm ghi chú (tùy chọn).'
                : 'Xác nhận từ chối feedback này. Bạn có thể thêm ghi chú (tùy chọn).'}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Nhập ghi chú (tùy chọn)..."
              rows={4}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => {
              setIsActionDialogOpen(false);
              setActionFeedback(null);
              setActionType(null);
              setAdminNote('');
            }}>
              Hủy
            </Button>
            <Button 
              onClick={handleResolveFeedback}
              variant={actionType === 'RESOLVED' ? 'default' : 'destructive'}
            >
              {actionType === 'RESOLVED' ? 'Giải quyết' : 'Từ chối'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={!!viewingImage} onOpenChange={(open) => {
        if (!open) {
          setViewingImage(null);
          setViewingImageFeedback(null);
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Hình ảnh phản hồi</span>
              {viewingImageFeedback?.imageUrls && viewingImageFeedback.imageUrls.length > 1 && (
                <span className="text-sm font-normal text-gray-500">
                  ({viewingImageFeedback.imageUrls.findIndex(url => url === viewingImage) + 1} / {viewingImageFeedback.imageUrls.length})
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto flex justify-center items-center p-4 relative">
            {viewingImageFeedback?.imageUrls && viewingImageFeedback.imageUrls.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!viewingImageFeedback?.imageUrls) return;
                    const currentIndex = viewingImageFeedback.imageUrls.indexOf(viewingImage || '');
                    const prevIndex = (currentIndex - 1 + viewingImageFeedback.imageUrls.length) % viewingImageFeedback.imageUrls.length;
                    setViewingImage(viewingImageFeedback.imageUrls[prevIndex]);
                  }}
                  className="absolute left-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!viewingImageFeedback?.imageUrls) return;
                    const currentIndex = viewingImageFeedback.imageUrls.indexOf(viewingImage || '');
                    const nextIndex = (currentIndex + 1) % viewingImageFeedback.imageUrls.length;
                    setViewingImage(viewingImageFeedback.imageUrls[nextIndex]);
                  }}
                  className="absolute right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 18 6-6-6-6"/>
                  </svg>
                </button>
              </>
            )}
            
            <div className="max-h-[60vh] flex items-center">
              {viewingImage && (
                <img 
                  src={viewingImage} 
                  alt="Feedback" 
                  className="max-h-[60vh] max-w-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '/placeholder.svg';
                  }}
                />
              )}
            </div>
          </div>
          
          {viewingImageFeedback?.imageUrls && viewingImageFeedback.imageUrls.length > 1 && (
            <div className="flex justify-center gap-2 mt-2 overflow-x-auto py-2 px-4 border-t">
              {viewingImageFeedback.imageUrls.map((url, index) => (
                <button
                  key={index}
                  className={`flex-shrink-0 w-16 h-16 border-2 rounded overflow-hidden transition-all ${
                    viewingImage === url 
                      ? 'border-blue-500 scale-105' 
                      : 'border-transparent hover:border-gray-300 hover:scale-105'
                  }`}
                  onClick={() => setViewingImage(url)}
                >
                  <img 
                    src={url} 
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/placeholder.svg';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center px-4 py-2 border-t">
            <div className="text-sm text-gray-500">
              {viewingImageFeedback?.imageUrls && viewingImage && (
                <span>Ảnh {viewingImageFeedback.imageUrls.indexOf(viewingImage) + 1} / {viewingImageFeedback.imageUrls.length}</span>
              )}
            </div>
            <a 
              href={viewingImage || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Mở ảnh gốc
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bảng Danh Sách Feedbacks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Danh Sách Feedbacks Chuyển Lên Admin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Billing</TableHead>
                <TableHead>Renter</TableHead>
                <TableHead>Station</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Nội dung</TableHead>
                <TableHead>Ảnh</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú Staff</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedbacks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-8 text-gray-500">
                    Không có feedback nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredFeedbacks.map((feedback) => {
                  const statusBadge = getStatusBadge(feedback.status);
                  const canResolve = feedback.status === 'FORWARDED' || feedback.status === 'PENDING_REVIEW';
                  
                  return (
                    <TableRow key={feedback.id}>
                      <TableCell className="font-medium">#{feedback.id}</TableCell>
                      <TableCell>{feedback.billingId ? `#${feedback.billingId}` : '-'}</TableCell>
                      <TableCell>{getRenterName(feedback.renterId)}</TableCell>
                      <TableCell>{getStationName(feedback.stationId)}</TableCell>
                      <TableCell>{getStaffName(feedback.staffId)}</TableCell>
                      <TableCell>{feedback.type || '-'}</TableCell>
                      <TableCell>
                        {feedback.rating ? (
                          <span className="font-semibold">{feedback.rating} ⭐</span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {feedback.content || '-'}
                      </TableCell>
                      <TableCell>
                        {feedback.imageUrls && feedback.imageUrls.length > 0 ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setViewingImageFeedback(feedback);
                              setViewingImage(feedback.imageUrls![0]);
                            }}
                            title={`Xem ${feedback.imageUrls.length} ảnh`}
                            className="flex items-center gap-1"
                          >
                            <ImageIcon className="h-4 w-4" />
                            <span className="text-xs">({feedback.imageUrls.length})</span>
                          </Button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant} className={statusBadge.className}>
                          {statusBadge.text}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {feedback.staffNote || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(feedback.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => {
                              setViewingFeedback(feedback);
                              setIsViewDialogOpen(true);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            {canResolve && (
                              <>
                                <DropdownMenuItem 
                                  onSelect={() => {
                                    setActionFeedback(feedback);
                                    setActionType('RESOLVED');
                                    setAdminNote(feedback.adminNote || '');
                                    setIsActionDialogOpen(true);
                                  }}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Giải quyết
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onSelect={() => {
                                    setActionFeedback(feedback);
                                    setActionType('REJECTED');
                                    setAdminNote(feedback.adminNote || '');
                                    setIsActionDialogOpen(true);
                                  }}
                                  className="text-red-600"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Từ chối
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t">
              <div className="text-sm text-gray-600">
                Hiển thị {feedbacks.length > 0 ? currentPage * pageSize + 1 : 0} - {Math.min((currentPage + 1) * pageSize, totalElements)} trong tổng số {totalElements} feedbacks
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </Button>
                <div className="text-sm text-gray-600">
                  Trang {currentPage + 1} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage >= totalPages - 1 || loading}
                >
                  Sau
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFeedbacks;

