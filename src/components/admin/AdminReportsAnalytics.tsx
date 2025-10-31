import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { 
  getPeakHourAnalysis, 
  getAIForecast,
  PeakHourAnalysis,
  AIForecast 
} from '@/services/adminservice/adminReportService';
import { Loader2, AlertCircle, RefreshCw, Calendar, TrendingUp, MapPin } from 'lucide-react';

const AdminReportsAnalytics = () => {
  const [peakHourData, setPeakHourData] = useState<PeakHourAnalysis | null>(null);
  const [forecastData, setForecastData] = useState<AIForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('all');

  // Load data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [peakHours, forecast] = await Promise.all([
        getPeakHourAnalysis(),
        getAIForecast()
      ]);
      
      setPeakHourData(peakHours);
      setForecastData(forecast);
    } catch (err) {
      console.error('Error fetching reports data:', err);
      setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  // Transform peak hours data for chart
  const getPeakHoursChartData = () => {
    if (!peakHourData) return [];
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => {
      const hourStr = `${hour.toString().padStart(2, '0')}:00`;
      const isPeak = peakHourData.peakHours.includes(hourStr);
      const isLow = peakHourData.lowDemandHours.includes(hourStr);
      
      return {
        hour: hourStr,
        peak: isPeak ? 1 : 0,
        low: isLow ? 1 : 0,
        demand: isPeak ? 100 : isLow ? 20 : 50
      };
    });
  };

  // Transform forecast data for chart
  const getForecastChartData = () => {
    if (!forecastData?.stationForecasts) return [];
    
    return forecastData.stationForecasts.map(station => ({
      station: station.stationName,
      predictedIncrease: station.predictedDemandIncrease,
      suggestedVehicles: station.suggestedAdditionalVehicles
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2">Đang tải dữ liệu báo cáo...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <span className="ml-2 text-red-500">{error}</span>
        <Button onClick={fetchData} className="ml-4" variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Thử lại
        </Button>
      </div>
    );
  }

  const peakHoursChartData = getPeakHoursChartData();
  const forecastChartData = getForecastChartData();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ Lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Ngày</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="region">Khu vực</Label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn khu vực" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="north">Miền Bắc</SelectItem>
                  <SelectItem value="central">Miền Trung</SelectItem>
                  <SelectItem value="south">Miền Nam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="vehicleType">Loại xe</Label>
              <Select value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn loại xe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="CAR">Ô tô</SelectItem>
                  <SelectItem value="BIKE">Xe máy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Làm mới dữ liệu
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Peak Hours Analysis */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Phân Tích Giờ Cao Điểm
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Phân tích giờ cao điểm và giờ có nhu cầu thấp
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Bar Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHoursChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="demand" fill="#10b981" name="Nhu cầu (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Heatmap-like visualization */}
            <div className="grid grid-cols-12 gap-1 mt-4">
              {peakHoursChartData.map((item) => {
                const intensity = item.demand / 100;
                const color = item.peak 
                  ? 'bg-red-500' 
                  : item.low 
                  ? 'bg-gray-300' 
                  : 'bg-yellow-400';
                
                return (
                  <div
                    key={item.hour}
                    className={`${color} p-2 text-center text-xs text-white rounded`}
                    style={{ opacity: 0.6 + intensity * 0.4 }}
                    title={`${item.hour}: Nhu cầu ${item.demand}%`}
                  >
                    {item.hour.split(':')[0]}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 text-sm mt-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Giờ cao điểm</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                <span>Giờ bình thường</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <span>Nhu cầu thấp</span>
              </div>
            </div>

            {/* Redistribution Suggestion */}
            {peakHourData?.redistributionSuggestion && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Đề xuất tái phân bổ:</h4>
                <p className="text-sm text-blue-800">{peakHourData.redistributionSuggestion}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Forecast - Fleet Expansion */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Dự Báo Mở Rộng Đội Xe
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Xu hướng và dự báo mở rộng đội xe dựa trên AI
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Area Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="station" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="predictedIncrease" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.6}
                    name="Dự đoán tăng nhu cầu (%)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="suggestedVehicles" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.4}
                    name="Số xe đề xuất thêm"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart alternative view */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="station" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="predictedIncrease" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Dự đoán tăng nhu cầu (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="suggestedVehicles" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Số xe đề xuất thêm"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Station Forecasts Table */}
            {forecastData?.stationForecasts && forecastData.stationForecasts.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Chi tiết dự báo theo trạm
                </h4>
                <div className="space-y-3">
                  {forecastData.stationForecasts.map((station) => (
                    <div 
                      key={station.stationId}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-semibold">{station.stationName}</h5>
                          <p className="text-sm text-gray-600 mt-1">{station.reasoning}</p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-green-600 font-semibold">
                            +{station.predictedDemandIncrease}% nhu cầu
                          </div>
                          <div className="text-blue-600 font-semibold mt-1">
                            +{station.suggestedAdditionalVehicles} xe
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fleet Expansion Suggestions */}
            {forecastData?.fleetExpansionSuggestions && forecastData.fleetExpansionSuggestions.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">🚀 Gợi ý mở rộng đội xe:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                  {forecastData.fleetExpansionSuggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReportsAnalytics;

