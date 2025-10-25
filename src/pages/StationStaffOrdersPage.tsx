import { Layout } from "@/components/Layout";
import StationStaffOrders from "@/components/StationStaffOrders";

const StationStaffOrdersPage = () => {
  return (
    <Layout>
      <div className="p-6">
        <StationStaffOrders />
      </div>
    </Layout>
  );
};

export default StationStaffOrdersPage;
