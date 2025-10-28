import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminStations from '@/components/admin/AdminStations';
import { AdminLayout } from '@/components/admin/AdminLayout';

const AdminStationsPage = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Quản Lý Điểm Thuê</h1>
            <p className="text-gray-600">Thêm, sửa, đóng/mở điểm thuê</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="border-green-500 text-green-700 hover:bg-green-100"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm Mới
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-500 text-gray-700 hover:bg-gray-100"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>

        <div className="px-6 pb-10">
          <AdminStations />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStationsPage;


