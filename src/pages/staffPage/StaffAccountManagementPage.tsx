import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StaffRenterManagement from '@/components/staff/StaffRenterManagement';
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
                Quản Lý Khách Hàng
              </h1>
              <p className="text-gray-600">Xem danh sách khách hàng </p>
            </div>
            {/* Buttons removed as requested */}
          </div>
        </div>

        <div className="px-6 pb-10">
          <StaffRenterManagement />
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffAccountManagementPage;
