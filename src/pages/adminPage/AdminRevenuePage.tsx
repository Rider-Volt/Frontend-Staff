import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminRevenue from '@/components/admin/AdminRevenue';
import { AdminLayout } from '@/components/admin/AdminLayout';

const AdminRevenuePage = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Báo Cáo Doanh Thu</h1>
              <p className="text-gray-600">Thống kê và phân tích doanh thu thuê xe điện</p>
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

        <div className="px-6 pb-10 max-w-7xl mx-auto">
          <AdminRevenue />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRevenuePage;