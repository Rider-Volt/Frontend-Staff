import React from 'react';
import { ShieldCheck } from 'lucide-react';
import StaffIdentityVerification from '@/components/staff/StaffIdentityVerification';
import { StaffLayout } from '@/components/staff/StaffLayout';

const StaffIdentityVerificationPage = () => {
  return (
    <StaffLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <ShieldCheck className="h-8 w-8 text-blue-500 mr-3" />
                Xác Minh Danh Tính
              </h1>
              <p className="text-gray-600">Quản lý xác minh danh tính khách hàng</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-10">
          <StaffIdentityVerification />
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffIdentityVerificationPage;

