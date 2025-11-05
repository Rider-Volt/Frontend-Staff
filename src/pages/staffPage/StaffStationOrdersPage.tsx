import { StaffLayout } from "@/components/staff/StaffLayout";
import StaffStationOrders from "@/components/staff/StaffStationOrders";
import { Receipt } from "lucide-react";

const StaffStationOrdersPage = () => {
  return (
    <StaffLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <Receipt className="h-8 w-8 text-blue-500 mr-3" />
                Quản lý đơn thuê
              </h1>
              <p className="text-gray-600 mt-1">Xem danh sách đơn thuê tại trạm</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-10">
          <StaffStationOrders />
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffStationOrdersPage;
