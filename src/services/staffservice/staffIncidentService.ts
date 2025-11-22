const API_BASE = "https://backend.ridervolt.app/api";

export type IncidentStatus = "REJECTED" | "FORWARDED_TO_ADMIN";

export type IncidentSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface IncidentReportResponse {
  id: number;
  billingId?: number;
  renterId?: number;
  vehicleId?: number;
  stationId?: number;
  note?: string; // Ghi chú ban đầu từ người báo cáo
  staffNote?: string; // Ghi chú của staff
  imageUrls?: string[];
  severity: IncidentSeverity;
  status: IncidentStatus;
  staffId?: number;
  adminId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  totalPages: number;
  totalElements: number;
  pageable: {
    pageNumber: number;
    pageSize: number;
    offset: number;
    sort: Array<{
      direction: string;
      nullHandling: string;
      ascending: boolean;
      property: string;
      ignoreCase: boolean;
    }>;
    paged: boolean;
    unpaged: boolean;
  };
  size: number;
  content: T[];
  number: number;
  sort: Array<{
    direction: string;
    nullHandling: string;
    ascending: boolean;
    property: string;
    ignoreCase: boolean;
  }>;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface UpdateIncidentRequest {
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  staffNote?: string; // Ghi chú của staff khi cập nhật
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("staff_token") || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// GET /api/staff/incident-reports - Get all incident reports (paginated)
export async function getAllIncidentReports(
  page: number = 0,
  size: number = 100,
  sort: string = "createdAt,desc"
): Promise<IncidentReportResponse[]> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: sort,
  });
  
  const resp = await fetch(`${API_BASE}/staff/incident-reports?${params.toString()}`, {
    method: "GET",
    headers: { 
      ...authHeaders(),
      "Content-Type": "application/json"
    },
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem danh sách báo cáo sự cố. Vui lòng đăng nhập lại.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load incident reports (${resp.status})`);
  }
  const data = (await resp.json()) as PaginatedResponse<IncidentReportResponse>;
  // Extract content array from paginated response
  return Array.isArray(data.content) ? data.content : [];
}

// PATCH /api/staff/incident-reports/{id} - Update incident report
export async function updateIncidentReport(
  incidentId: number,
  data: UpdateIncidentRequest
): Promise<IncidentReportResponse> {
  const resp = await fetch(`${API_BASE}/staff/incident-reports/${incidentId}`, {
    method: "PATCH",
    headers: { 
      ...authHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data),
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền cập nhật báo cáo sự cố.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy báo cáo sự cố để cập nhật.");
    }
    if (resp.status === 400) {
      const errorText = await resp.text().catch(() => "Dữ liệu không hợp lệ.");
      throw new Error(errorText || "Dữ liệu không hợp lệ.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to update incident report (${resp.status})`);
  }
  return (await resp.json()) as IncidentReportResponse;
}

