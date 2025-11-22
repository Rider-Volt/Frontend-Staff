const API_BASE = "https://backend.ridervolt.app/api";

export type ReportStatus = "DRAFT" | "FINALIZED" | "ARCHIVED";

export interface ReportResponse {
  id: number;
  stationId: number;
  stationName: string;
  periodStart: string; // ISO date string
  periodEnd: string; // ISO date string
  totalTrips: number;
  successfulTrips: number;
  canceledTrips: number;
  totalRevenue: number;
  avgRating: number;
  note: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReportRequest {
  // stationId is automatically detected from staff's assigned station (1 staff = 1 station)
  periodStart: string; // ISO date string (YYYY-MM-DD)
  periodEnd: string; // ISO date string (YYYY-MM-DD)
  totalTrips: number;
  successfulTrips: number;
  canceledTrips: number;
  totalRevenue: number;
  avgRating: number;
  note?: string;
  // status defaults to "DRAFT" and is not included in request
}

export interface UpdateReportRequest {
  periodStart?: string;
  periodEnd?: string;
  totalTrips?: number;
  successfulTrips?: number;
  canceledTrips?: number;
  totalRevenue?: number;
  avgRating?: number;
  note?: string;
  status?: ReportStatus;
}

export interface UpdateReportStatusRequest {
  status: ReportStatus;
  note?: string;
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("staff_token") || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// GET /api/staff/business-reports - Get all reports
export async function getAllReports(): Promise<ReportResponse[]> {
  const resp = await fetch(`${API_BASE}/staff/business-reports`, {
    method: "GET",
    headers: { 
      ...authHeaders(),
      "Content-Type": "application/json"
    },
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem danh sách báo cáo. Vui lòng đăng nhập lại.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load reports (${resp.status})`);
  }
  return (await resp.json()) as ReportResponse[];
}

// GET /api/staff/business-reports/{reportId} - Get report by ID
export async function getReportById(reportId: number): Promise<ReportResponse> {
  const resp = await fetch(`${API_BASE}/staff/business-reports/${reportId}`, {
    method: "GET",
    headers: { 
      ...authHeaders(),
      "Content-Type": "application/json"
    },
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem báo cáo này.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy báo cáo.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load report (${resp.status})`);
  }
  return (await resp.json()) as ReportResponse;
}

// GET /api/staff/business-reports/status/{status} - Get reports by status
export async function getReportsByStatus(status: ReportStatus): Promise<ReportResponse[]> {
  const resp = await fetch(`${API_BASE}/staff/business-reports/status/${status}`, {
    method: "GET",
    headers: { 
      ...authHeaders(),
      "Content-Type": "application/json"
    },
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem báo cáo theo trạng thái.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load reports by status (${resp.status})`);
  }
  return (await resp.json()) as ReportResponse[];
}

// POST /api/staff/business-reports - Create new report
export async function createReport(data: CreateReportRequest): Promise<ReportResponse> {
  const resp = await fetch(`${API_BASE}/staff/business-reports`, {
    method: "POST",
    headers: { 
      ...authHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data),
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền tạo báo cáo.");
    }
    if (resp.status === 400) {
      const errorText = await resp.text().catch(() => "Dữ liệu không hợp lệ.");
      throw new Error(errorText || "Dữ liệu không hợp lệ.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to create report (${resp.status})`);
  }
  return (await resp.json()) as ReportResponse;
}

// PUT /api/staff/business-reports/{reportId} - Update report
export async function updateReport(
  reportId: number,
  data: UpdateReportRequest
): Promise<ReportResponse> {
  const resp = await fetch(`${API_BASE}/staff/business-reports/${reportId}`, {
    method: "PUT",
    headers: { 
      ...authHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data),
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền cập nhật báo cáo.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy báo cáo để cập nhật.");
    }
    if (resp.status === 400) {
      const errorText = await resp.text().catch(() => "Dữ liệu không hợp lệ.");
      throw new Error(errorText || "Dữ liệu không hợp lệ.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to update report (${resp.status})`);
  }
  return (await resp.json()) as ReportResponse;
}

// PATCH /api/staff/business-reports/{reportId}/status - Update report status
// Supports DRAFT→FINALIZED, FINALIZED→ARCHIVED transitions
export async function updateReportStatus(
  reportId: number,
  status: ReportStatus,
  note?: string
): Promise<ReportResponse> {
  const body: UpdateReportStatusRequest = { status };
  if (note && note.trim()) {
    body.note = note.trim();
  }
  const resp = await fetch(`${API_BASE}/staff/business-reports/${reportId}/status`, {
    method: "PATCH",
    headers: { 
      ...authHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền cập nhật trạng thái báo cáo.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy báo cáo.");
    }
    if (resp.status === 400) {
      const errorText = await resp.text().catch(() => "Trạng thái không hợp lệ hoặc chuyển đổi không được phép.");
      throw new Error(errorText || "Trạng thái không hợp lệ hoặc chuyển đổi không được phép.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to update report status (${resp.status})`);
  }
  return (await resp.json()) as ReportResponse;
}

// DELETE /api/staff/business-reports/{reportId} - Delete report (only if DRAFT)
export async function deleteReport(reportId: number): Promise<void> {
  const resp = await fetch(`${API_BASE}/staff/business-reports/${reportId}`, {
    method: "DELETE",
    headers: { ...authHeaders() },
  });
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xóa báo cáo.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy báo cáo để xóa.");
    }
    if (resp.status === 400) {
      const errorText = await resp.text().catch(() => "Chỉ có thể xóa báo cáo ở trạng thái DRAFT.");
      throw new Error(errorText || "Chỉ có thể xóa báo cáo ở trạng thái DRAFT.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to delete report (${resp.status})`);
  }
}

