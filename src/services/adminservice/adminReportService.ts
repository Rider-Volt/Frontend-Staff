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

export interface PeakHourAnalysis {
  peakHours: string[];
  lowDemandHours: string[];
  redistributionSuggestion: string;
}

export interface StationForecast {
  stationId: number;
  stationName: string;
  predictedDemandIncrease: number;
  suggestedAdditionalVehicles: number;
  reasoning: string;
}

export interface PeakHourAnalysisData {
  peakHours: string[];
  lowDemandHours: string[];
  redistributionSuggestion: string;
}

export interface AIForecast {
  forecastPeriod: string;
  stationForecasts: StationForecast[];
  fleetExpansionSuggestions: string[];
  peakHourAnalysis: PeakHourAnalysisData;
}

function authHeaders(): HeadersInit {
  const adminToken = localStorage.getItem("admin_token");
  const accessToken = localStorage.getItem("accessToken");
  const token = adminToken || accessToken || "";
  
  if (!token) {
    console.error('No token found in localStorage');
  }
  
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Lấy phân tích giờ cao điểm
export async function getPeakHourAnalysis(): Promise<PeakHourAnalysis> {
  const resp = await fetch(`${API_BASE}/admin/reports/peak-hours`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền truy cập báo cáo.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load peak hour analysis (${resp.status})`);
  }
  
  return (await resp.json()) as PeakHourAnalysis;
}

// Lấy dự báo AI cho mở rộng đội xe
export async function getAIForecast(): Promise<AIForecast> {
  const resp = await fetch(`${API_BASE}/admin/reports/ai-forecast`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền truy cập báo cáo AI.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load AI forecast (${resp.status})`);
  }
  
  return (await resp.json()) as AIForecast;
}

// ===== API /admin/ai/* endpoints =====

// Lấy phân tích giờ cao điểm từ AI
export async function getAIPeakHours(): Promise<PeakHourAnalysis> {
  const resp = await fetch(`${API_BASE}/admin/ai/peak-hours`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền truy cập dự báo AI.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load AI peak hours (${resp.status})`);
  }
  
  return (await resp.json()) as PeakHourAnalysis;
}

// Lấy dự báo nhu cầu thuê từ AI
export async function getAIForecastDemand(): Promise<AIForecast> {
  const resp = await fetch(`${API_BASE}/admin/ai/forecast`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền truy cập dự báo nhu cầu AI.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load AI forecast demand (${resp.status})`);
  }
  
  return (await resp.json()) as AIForecast;
}

// ===== API /admin/analytics/* endpoints =====

// GET /api/admin/analytics/station/{stationId} - Get all non-draft reports for a specific station
export async function getStationReports(stationId: number): Promise<ReportResponse[]> {
  const resp = await fetch(`${API_BASE}/admin/analytics/station/${stationId}`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem báo cáo của trạm này.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy trạm.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load station reports (${resp.status})`);
  }
  
  return (await resp.json()) as ReportResponse[];
}

// GET /api/admin/analytics/station/{stationId}/status/{status} - Get reports by station and status
export async function getStationReportsByStatus(
  stationId: number,
  status: "FINALIZED" | "ARCHIVED"
): Promise<ReportResponse[]> {
  const resp = await fetch(`${API_BASE}/admin/analytics/station/${stationId}/status/${status}`, {
    method: "GET",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền xem báo cáo theo trạng thái.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy trạm hoặc báo cáo.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to load reports by status (${resp.status})`);
  }
  
  return (await resp.json()) as ReportResponse[];
}

// PATCH /api/admin/analytics/{reportId}/archive - Archive a finalized report
export async function archiveReport(reportId: number): Promise<ReportResponse> {
  const resp = await fetch(`${API_BASE}/admin/analytics/${reportId}/archive`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  
  if (!resp.ok) {
    if (resp.status === 401 || resp.status === 403) {
      throw new Error("Bạn không có quyền lưu trữ báo cáo.");
    }
    if (resp.status === 404) {
      throw new Error("Không tìm thấy báo cáo.");
    }
    if (resp.status === 400) {
      const errorText = await resp.text().catch(() => "Chỉ có thể lưu trữ báo cáo ở trạng thái FINALIZED.");
      throw new Error(errorText || "Chỉ có thể lưu trữ báo cáo ở trạng thái FINALIZED.");
    }
    const text = await resp.text().catch(() => resp.statusText);
    throw new Error(text || `Failed to archive report (${resp.status})`);
  }
  
  return (await resp.json()) as ReportResponse;
}

