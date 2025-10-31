const API_BASE = "https://backend.ridervolt.app/api";

export interface BillingSummary {
  id: number;
  renterId: number;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  vehicleId: number;
  vehicleModel: string;
  vehicleLicensePlate: string;
  vehiclePhotoUrl: string;
  pricePerDay: number;
  rentedDay: number;
  totalCost: number;
  bookingTime: string; // ISO datetime
  plannedStartDate: string; // YYYY-MM-DD
  plannedEndDate: string; // YYYY-MM-DD
  actualPickupAt: string | null;
  actualReturnAt: string | null;
  preImage: string | null;
  finalImage: string | null;
  status: string; // WAITING | ...
  note: string | null;
}

export type BillingDetail = BillingSummary;

function authHeaders(): HeadersInit {
  const adminToken = localStorage.getItem("admin_token");
  const accessToken = localStorage.getItem("accessToken");
  const token = adminToken || accessToken || "";
  
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getAllBillings(): Promise<BillingSummary[]> {
  const resp = await fetch(`${API_BASE}/admin/billings`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!resp.ok) {
  if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem danh sách đơn thuê.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load billings (${resp.status})`);
  }
  return (await resp.json()) as BillingSummary[];
}

export async function getBillingById(id: number): Promise<BillingDetail> {
  const resp = await fetch(`${API_BASE}/admin/billings/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem đơn thuê này.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy đơn thuê.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load billing (${resp.status})`);
  }
  return (await resp.json()) as BillingDetail;
}

export async function deleteBilling(id: number): Promise<void> {
  const resp = await fetch(`${API_BASE}/admin/billings/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xóa đơn thuê này.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy đơn thuê để xóa.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to delete billing (${resp.status})`);
  }
}


