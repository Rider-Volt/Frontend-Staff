import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Loader2,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Car,
  Bike,
  Eye,
  AlertCircle
} from 'lucide-react';
import { 
  getAllModels, 
  createModel,
  updateModel,
  deleteModel,
  Model,
  CreateModelRequest,
  UpdateModelRequest
} from '@/services/adminservice/adminModelService';

const AdminModels = () => {
  const [models, setModels] = useState<Model[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [viewingModel, setViewingModel] = useState<Model | null>(null);
  const [newModel, setNewModel] = useState<CreateModelRequest>({
    name: '',
    type: 'CAR',
    pricePerDay: 0,
    photoUrl: ''
  });
  const [newModelPhotoFile, setNewModelPhotoFile] = useState<File | null>(null);
  const [newModelPhotoPreview, setNewModelPhotoPreview] = useState<string>("");
  const [editModelPhotoFile, setEditModelPhotoFile] = useState<File | null>(null);
  const [editModelPhotoPreview, setEditModelPhotoPreview] = useState<string>("");

  // Tải danh sách models từ API
  useEffect(() => {
    const loadModels = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllModels();
        setModels(data);
        console.log('Models loaded:', data);
      } catch (error) {
        console.error('Error loading models:', error);
        setError(error instanceof Error ? error.message : 'Lỗi khi tải danh sách model');
      } finally {
        setLoading(false);
      }
    };
    
    loadModels();
  }, []);

  // Lọc models dựa trên từ khóa tìm kiếm
  const filteredModels = models.filter(model =>
    model.id.toString().includes(searchTerm.toLowerCase()) ||
    model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Xóa model
  const handleDeleteModel = async (modelId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa model này?')) return;
    
    try {
      await deleteModel(modelId);
      setModels(models.filter(model => model.id !== modelId));
      alert('Xóa model thành công!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi xóa model');
    }
  };

  // Thêm model mới
  const handleAddModel = async () => {
    // Validation - Kiểm tra dữ liệu đầu vào
    if (!newModel.name.trim()) {
      alert('Vui lòng nhập tên model!');
      return;
    }
    if (newModel.pricePerDay < 0) {
      alert('Giá thuê/ngày không được âm!');
      return;
    }
    
    try {
      const createdModel = await createModel(
        newModel.name,
        newModel.type,
        newModel.pricePerDay,
        newModelPhotoFile || undefined
      );
      setModels([...models, createdModel]);
      setNewModel({ name: '', type: 'CAR', pricePerDay: 0, photoUrl: '' });
      setNewModelPhotoFile(null);
      setNewModelPhotoPreview("");
      setIsAddDialogOpen(false);
      alert('Thêm model thành công!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi thêm model');
    }
  };
  
  const handlePhotoFileChange = (file?: File | null) => {
    if (!file) return;
    setNewModelPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    if (newModelPhotoPreview) {
      URL.revokeObjectURL(newModelPhotoPreview);
    }
    setNewModelPhotoPreview(objectUrl);
  };
  
  const clearPhotoFile = () => {
    if (newModelPhotoPreview) {
      URL.revokeObjectURL(newModelPhotoPreview);
    }
    setNewModelPhotoFile(null);
    setNewModelPhotoPreview("");
  };

  // Cập nhật thông tin model
  const handleUpdateModel = async () => {
    if (!editingModel) return;
    
    try {
      const updatedModel = await updateModel(
        editingModel.id,
        editingModel.name,
        editingModel.type,
        editingModel.pricePerDay,
        editModelPhotoFile || undefined
      );
      setModels(models.map(m => m.id === editingModel.id ? updatedModel : m));
      setIsEditDialogOpen(false);
      setEditingModel(null);
      setEditModelPhotoFile(null);
      setEditModelPhotoPreview("");
      alert('Cập nhật model thành công!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi cập nhật model');
    }
  };
  
  const handleEditPhotoFileChange = (file?: File | null) => {
    if (!file) return;
    setEditModelPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    if (editModelPhotoPreview) {
      URL.revokeObjectURL(editModelPhotoPreview);
    }
    setEditModelPhotoPreview(objectUrl);
  };
  
  const clearEditPhotoFile = () => {
    if (editModelPhotoPreview) {
      URL.revokeObjectURL(editModelPhotoPreview);
    }
    setEditModelPhotoFile(null);
    setEditModelPhotoPreview("");
  };

  // Lấy loại badge cho loại xe
  const getTypeBadge = (type: string) => {
    if (type === 'CAR') {
      return { variant: 'default' as const, className: 'bg-blue-100 text-blue-800', text: 'Ô tô', icon: Car };
    } else {
      return { variant: 'secondary' as const, className: 'bg-purple-100 text-purple-800', text: 'Xe máy', icon: Bike };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Đang tải danh sách model...</span>
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
      {/* Tìm kiếm và Thêm Model */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Tìm kiếm model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
          />
        </div>
      </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Thêm Model Mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Thêm Model Mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Tên Model <span className="text-red-500">*</span></Label>
                <Input 
                  placeholder="VD: Honda Wave, Toyota Vios" 
                  value={newModel.name}
                  onChange={(e) => setNewModel({...newModel, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label>Loại Xe <span className="text-red-500">*</span></Label>
                <Select
                  value={newModel.type}
                  onValueChange={(value: "CAR" | "BIKE") => setNewModel({...newModel, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại xe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAR">Ô tô</SelectItem>
                    <SelectItem value="BIKE">Xe máy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Giá/ngày (VNĐ) <span className="text-red-500">*</span></Label>
                <Input 
                  type="number"
                  placeholder="Nhập giá thuê/ngày (VD: 100000)" 
                  value={newModel.pricePerDay || ''}
                  onChange={(e) => setNewModel({...newModel, pricePerDay: parseInt(e.target.value) || 0})}
                  min="0"
                  required
                />
              </div>
              <div>
                <Label>Chọn ảnh Model</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('model-photo-input')?.click()}
                  >
                    Chọn ảnh từ thư viện
                  </Button>
                  {newModelPhotoFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearPhotoFile}
                    >
                      Xóa
                    </Button>
                  )}
                  <input
                    id="model-photo-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoFileChange(e.target.files?.[0])}
                  />
                </div>
                {newModelPhotoPreview && (
                  <div className="mt-2">
                    <img 
                      src={newModelPhotoPreview} 
                      alt="Preview"
                      className="h-32 w-48 object-cover rounded-lg border"
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">Chọn ảnh từ thiết bị của bạn (tùy chọn)</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleAddModel}>
                  Thêm Model
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Xem Chi Tiết Model */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Chi Tiết Model</DialogTitle>
            </DialogHeader>
            {viewingModel && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  {viewingModel.photoUrl && (
                    <img 
                      src={viewingModel.photoUrl} 
                      alt={viewingModel.name}
                      className="h-48 w-64 object-cover rounded-lg"
                    />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID Model</label>
                    <p className="text-sm font-semibold">{viewingModel.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tên Model</label>
                    <p className="text-sm font-semibold">{viewingModel.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Loại Xe</label>
                    <div className="mt-1">
                      <Badge 
                        variant={getTypeBadge(viewingModel.type).variant}
                        className={getTypeBadge(viewingModel.type).className}
                      >
                        {getTypeBadge(viewingModel.type).text}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Giá/ngày</label>
                    <p className="text-sm font-semibold text-green-600">
                      {viewingModel.pricePerDay.toLocaleString('vi-VN')} VNĐ
                    </p>
                  </div>
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

        {/* Dialog Chỉnh Sửa Model */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Chỉnh Sửa Model</DialogTitle>
            </DialogHeader>
            {editingModel && (
              <div className="space-y-4">
                <div>
                  <Label>Tên Model <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="Nhập tên model" 
                    value={editingModel.name}
                    onChange={(e) => setEditingModel({...editingModel, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Loại Xe <span className="text-red-500">*</span></Label>
                  <Select
                    value={editingModel.type}
                    onValueChange={(value: "CAR" | "BIKE") => setEditingModel({...editingModel, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại xe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CAR">Ô tô</SelectItem>
                      <SelectItem value="BIKE">Xe máy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Giá/ngày (VNĐ) <span className="text-red-500">*</span></Label>
                  <Input 
                    type="number"
                    placeholder="Nhập giá thuê/ngày" 
                    value={editingModel.pricePerDay || ''}
                    onChange={(e) => setEditingModel({...editingModel, pricePerDay: parseInt(e.target.value) || 0})}
                    min="0"
                    required
                  />
                </div>
                <div>
                  <Label>Ảnh hiện tại</Label>
                  {editingModel.photoUrl && (
                    <div className="mb-2">
                      <img 
                        src={editingModel.photoUrl} 
                        alt={editingModel.name}
                        className="h-32 w-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  <Label>Chọn ảnh mới (tùy chọn)</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('edit-model-photo-input')?.click()}
                    >
                      Chọn ảnh từ thư viện
                    </Button>
                    {editModelPhotoFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearEditPhotoFile}
                      >
                        Xóa
                      </Button>
                    )}
                    <input
                      id="edit-model-photo-input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleEditPhotoFileChange(e.target.files?.[0])}
                    />
                  </div>
                  {editModelPhotoPreview && (
                    <div className="mt-2">
                      <Label className="text-xs">Ảnh mới:</Label>
                      <img 
                        src={editModelPhotoPreview} 
                        alt="Preview"
                        className="h-32 w-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Chọn ảnh mới nếu muốn thay đổi</p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleUpdateModel}>
                    Cập nhật
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      

      {/* Bảng Danh Sách Models */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Models</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tên Model</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Giá/ngày</TableHead>
                <TableHead>Ảnh</TableHead>
                <TableHead className="text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-green-600 mr-2" />
                      <span className="text-gray-600">Đang tải danh sách model...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredModels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                filteredModels.map((model) => {
                  const typeBadge = getTypeBadge(model.type);
                  return (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{model.id}</TableCell>
                    <TableCell>{model.name}</TableCell>
                    <TableCell>
                        <Badge variant={typeBadge.variant} className={typeBadge.className}>
                          {typeBadge.text}
                      </Badge>
                    </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        {model.pricePerDay.toLocaleString('vi-VN')} VND
                      </TableCell>
                    <TableCell>
                      {model.photoUrl && (
                        <img 
                          src={model.photoUrl} 
                          alt={model.name}
                            className="h-12 w-16 object-cover rounded"
                        />
                      )}
                    </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setViewingModel(model);
                              setIsViewDialogOpen(true);
                            }}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setEditingModel(model);
                              setIsEditDialogOpen(true);
                            }}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteModel(model.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa
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
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminModels;

