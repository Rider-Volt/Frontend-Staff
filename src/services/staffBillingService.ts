
const API_BASE = "https://backend.ridervolt.app/api";

export type BillingStatus = "PENDING" | "PAYED" | "CANCELLED" | "RENTING" | "APPROVED" | "COMPLETED";

export interface BillingResponse {
  id: number;
  rentedDay: number;
  bookingTime: string; // ISO
  startTime: string; // ISO
  endTime: string; // ISO
  preImage?: string | null;
  finalImage?: string | null;
  status: BillingStatus;
  vehicleId?: number;
  vehicleModel?: string;
  renterId?: number;
  renterName?: string;
  renterEmail?: string;
  renterPhone?: string;
  renter?: {
    id?: number;
    name?: string;
    phone?: string;
    email?: string;
  } | null;
  vehicle?: {
    id?: number;
    code?: string;
    station?: { id?: number; name?: string } | null;
    model?: { id?: number; name?: string; photoUrl?: string; type?: string; pricePerDay?: number | string } | null;
  } | null;
}

function authHeaders(): HeadersInit {
  // Use dedicated staff token, not renter token
  const token = localStorage.getItem("staff_token") || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getStationBillings(): Promise<BillingResponse[]> {
  const resp = await fetch(`${API_BASE}/staff/billings/station`, {
    method: "GET",
    headers: { ...authHeaders() },
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền hoặc chưa đăng nhập nhân viên. Vui lòng đăng nhập lại.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load station billings (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse[];
}

export async function updateBillingStatus(
  id: number,
  status: BillingStatus
): Promise<BillingResponse> {
  const url = new URL(`${API_BASE}/staff/billings/${id}/status`);
  url.searchParams.set("status", status);
  const resp = await fetch(url.toString(), {
    method: "PATCH",
    headers: { ...authHeaders() },
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền cập nhật. Vui lòng đăng nhập nhân viên.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to update billing status (${resp.status})`);
  }
  return (await resp.json()) as BillingResponse;
}
