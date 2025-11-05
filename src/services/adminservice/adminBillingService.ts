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
  bookingTime: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualPickupAt: string | null;
  actualReturnAt: string | null;
  preImage: string | null;
  finalImage: string | null;
  status: string;
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

async function handleErrorResponse(
  resp: Response,
  defaultMessage: string,
  statusMessages?: Record<number, string>
): Promise<never> {
  // Xử lý các mã trạng thái cụ thể
  if (statusMessages && statusMessages[resp.status]) {
    throw new Error(statusMessages[resp.status]);
  }

  // Cố gắng trích xuất thông báo lỗi từ phản hồi
  let errorMessage = defaultMessage;
  try {
    const contentType = resp.headers.get("content-type");
    const responseText = await resp.text();

    if (contentType?.includes("application/json")) {
      try {
        const errorJson = JSON.parse(responseText);
        errorMessage =
          errorJson?.message || errorJson?.error || errorJson?.detail || errorMessage;
      } catch {
        errorMessage = responseText || errorMessage;
      }
    } else {
      errorMessage = responseText || errorMessage;
    }
  } catch {
    errorMessage = resp.statusText || errorMessage;
  }

  throw new Error(errorMessage);
}

export async function getAllBillings(): Promise<BillingSummary[]> {
  const resp = await fetch(`${API_BASE}/admin/billings`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!resp.ok) {
    await handleErrorResponse(
      resp,
      `Không thể tải danh sách đơn thuê (${resp.status})`,
      {
        401: "Bạn không có quyền xem danh sách đơn thuê.",
        403: "Bạn không có quyền xem danh sách đơn thuê.",
      }
    );
  }

  return (await resp.json()) as BillingSummary[];
}

export async function getBillingById(id: number): Promise<BillingDetail> {
  const resp = await fetch(`${API_BASE}/admin/billings/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!resp.ok) {
    await handleErrorResponse(
      resp,
      `Không thể tải đơn thuê (${resp.status})`,
      {
        401: "Bạn không có quyền xem đơn thuê này.",
        403: "Bạn không có quyền xem đơn thuê này.",
        404: "Không tìm thấy đơn thuê.",
      }
    );
  }

  return (await resp.json()) as BillingDetail;
}

export async function deleteBilling(id: number): Promise<void> {
  const resp = await fetch(`${API_BASE}/admin/billings/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!resp.ok) {
    await handleErrorResponse(
      resp,
      `Không thể xóa đơn thuê (${resp.status})`,
      {
        401: "Bạn không có quyền xóa đơn thuê này.",
        403: "Bạn không có quyền xóa đơn thuê này.",
        404: "Không tìm thấy đơn thuê để xóa.",
      }
    );
  }
}

