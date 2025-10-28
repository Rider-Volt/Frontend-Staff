const API_BASE = "https://backend.ridervolt.app/api";

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

