import { StaffLayout } from "@/components/staff/StaffLayout";
import StaffStationOrders from "@/components/staff/StaffStationOrders";

const StaffStationOrdersPage = () => {
  return (
    <StaffLayout>
      <div className="p-6">
        <StaffStationOrders />
      </div>
    </StaffLayout>
  );
};

export default StaffStationOrdersPage;
