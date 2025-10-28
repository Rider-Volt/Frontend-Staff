import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StaffAccountManagement from '@/components/staff/StaffAccountManagement';
import { StaffLayout } from '@/components/staff/StaffLayout';

const StaffAccountManagementPage = () => {
  const navigate = useNavigate();

  return (
    <StaffLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Users className="h-8 w-8 text-blue-500 mr-3" />
                Quản Lý Tài Khoản Khách Hàng
              </h1>
              <p className="text-gray-600">Quản lý trạng thái và thông tin tài khoản khách hàng</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="border-blue-500 text-blue-700 hover:bg-blue-100"
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
          <StaffAccountManagement />
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffAccountManagementPage;
