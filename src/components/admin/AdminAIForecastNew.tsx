import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ComposedChart } from 'recharts';
import { 
  getAIPeakHours, 
  getAIForecastDemand,
  PeakHourAnalysis,
  AIForecast 
} from '@/services/adminservice/adminReportService';
import { Loader2, AlertCircle, RefreshCw, Brain, TrendingUp, Calendar, MapPin, Lightbulb } from 'lucide-react';

const AdminAIForecastNew = () => {
  const [peakHourData, setPeakHourData] = useState<PeakHourAnalysis | null>(null);
  const [forecastData, setForecastData] = useState<AIForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [peakHours, forecast] = await Promise.all([
        getAIPeakHours(),
        getAIForecastDemand()
      ]);
      
      setPeakHourData(peakHours);
      setForecastData(forecast);
    } catch (err) {
      console.error('Error fetching AI forecast data:', err);
      setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu dự báo AI');
    } finally {
      setLoading(false);
    }
  };

  // Transform peak hours for calendar/heatmap view
  const getPeakHoursHeatmap = () => {
    if (!peakHourData) return [];
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => {
      const hourStr = `${hour.toString().padStart(2, '0')}:00`;
      const isPeak = peakHourData.peakHours.includes(hourStr);
      const isLow = peakHourData.lowDemandHours.includes(hourStr);
      
      return {
        hour,
        hourStr,
        label: hourStr,
        intensity: isPeak ? 100 : isLow ? 20 : 50,
        type: isPeak ? 'peak' : isLow ? 'low' : 'normal'
      };
    });
  };

  // Transform forecast data for demand curve
  const getDemandForecastData = () => {
    if (!forecastData?.stationForecasts) return [];
    
    // Create forecast timeline data
    const stations = forecastData.stationForecasts;
    const days = ['Hôm nay', 'Ngày mai', '3 ngày', '1 tuần', '2 tuần', '1 tháng'];
    
    return days.map((day, index) => {
      const baseDemand = 50;
      const growthRate = 1 + (index * 0.15); // Simulated growth
      
      return {
        period: day,
        predictedDemand: Math.round(baseDemand * growthRate),
        confidence: 100 - (index * 10), // Decreasing confidence over time
        averageIncrease: stations.reduce((sum, s) => sum + s.predictedDemandIncrease, 0) / stations.length
      };
    });
  };

  // Get calendar view data (weekly heatmap)
  const getWeeklyHeatmap = () => {
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const heatmapData: Array<{ day: string; hour: number; intensity: number }> = [];
    
    days.forEach(day => {
      hours.forEach(hour => {
        const hourStr = `${hour.toString().padStart(2, '0')}:00`;
        const isPeak = peakHourData?.peakHours.includes(hourStr);
        const isLow = peakHourData?.lowDemandHours.includes(hourStr);
        
        // Add some variation for different days
        const dayVariation = day === 'T7' || day === 'CN' ? 1.2 : 1.0;
        
        heatmapData.push({
          day,
          hour,
          intensity: isPeak ? 100 * dayVariation : isLow ? 20 : 50
        });
      });
    });
    
    return { days, hours, data: heatmapData };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Đang tải dữ liệu dự báo AI...</span>
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

  const peakHoursHeatmap = getPeakHoursHeatmap();
  const demandForecastData = getDemandForecastData();
  const weeklyHeatmap = getWeeklyHeatmap();

  return (
    <div className="space-y-6">
      {/* AI Header Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="font-semibold text-lg">AI dự báo nhu cầu thuê và gợi ý mở rộng đội xe</h3>
              <p className="text-sm text-gray-600 mt-1">
                Sử dụng trí tuệ nhân tạo để dự đoán nhu cầu thuê xe và đưa ra các đề xuất chiến lược
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predicted Peak Hours - Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-purple-600" />
            Giờ Cao Điểm Dự Đoán
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Heatmap hiển thị giờ cao điểm được dự đoán bởi AI
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Weekly Calendar Heatmap */}
            <div>
              <h4 className="font-semibold mb-3">Heatmap theo tuần</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 text-xs">Giờ</th>
                      {weeklyHeatmap.days.map(day => (
                        <th key={day} className="border p-2 text-xs font-semibold">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyHeatmap.hours.filter((_, i) => i % 2 === 0).map(hour => (
                      <tr key={hour}>
                        <td className="border p-2 text-xs font-medium">
                          {hour.toString().padStart(2, '0')}:00
                        </td>
                        {weeklyHeatmap.days.map(day => {
                          const cellData = weeklyHeatmap.data.find(
                            d => d.day === day && d.hour === hour
                          );
                          const intensity = cellData?.intensity || 0;
                          const bgColor = 
                            intensity >= 80 ? 'bg-red-500' :
                            intensity >= 60 ? 'bg-orange-400' :
                            intensity >= 40 ? 'bg-yellow-400' :
                            'bg-gray-200';
                          
                          return (
                            <td
                              key={`${day}-${hour}`}
                              className={`border ${bgColor} p-2 text-center text-xs text-white font-semibold`}
                              style={{ opacity: 0.6 + (intensity / 100) * 0.4 }}
                              title={`${day} ${hour}:00 - Nhu cầu: ${Math.round(intensity)}%`}
                            >
                              {Math.round(intensity)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-4 text-xs mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Rất cao (80-100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-400 rounded"></div>
                  <span>Cao (60-80%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span>Trung bình (40-60%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <span>Thấp (&lt;40%)</span>
                </div>
              </div>
            </div>

            {/* Daily Peak Hours Bar */}
            <div>
              <h4 className="font-semibold mb-3">Giờ cao điểm trong ngày</h4>
              <div className="grid grid-cols-12 gap-1">
                {peakHoursHeatmap.map((item) => {
                  const bgColor = 
                    item.type === 'peak' ? 'bg-red-500' :
                    item.type === 'low' ? 'bg-gray-300' :
                    'bg-yellow-400';
                  
                  return (
                    <div
                      key={item.hour}
                      className={`${bgColor} p-2 text-center text-xs text-white rounded`}
                      style={{ opacity: 0.6 + (item.intensity / 100) * 0.4 }}
                      title={`${item.hourStr}: ${item.intensity}%`}
                    >
                      {item.hour}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Suggestion */}
            {peakHourData?.redistributionSuggestion && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                  <Brain className="h-4 w-4 mr-2" />
                  Đề xuất từ AI:
                </h4>
                <p className="text-sm text-purple-800">{peakHourData.redistributionSuggestion}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rental Demand Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Nhu Cầu Thuê Xe Sắp Tới
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Dự báo nhu cầu thuê xe với đường cong dự đoán
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Forecast Curve */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={demandForecastData}>
                  <defs>
                    <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="predictedDemand" 
                    stroke="#10b981" 
                    fillOpacity={1}
                    fill="url(#demandGradient)"
                    name="Nhu cầu dự đoán (%)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="#3b82f6" 
                    strokeDasharray="5 5"
                    name="Độ tin cậy (%)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Forecast Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {demandForecastData.map((item, index) => (
                <div 
                  key={index}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-semibold">{item.period}</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        Nhu cầu dự đoán: <span className="font-semibold text-green-600">{item.predictedDemand}%</span>
                      </p>
                    </div>
                    <Badge variant={item.confidence >= 80 ? 'default' : 'secondary'}>
                      {item.confidence}% tin cậy
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Station Expansion Suggestions */}
      {forecastData?.stationForecasts && forecastData.stationForecasts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
              Gợi ý Mở Thêm Xe Ở Khu Vực
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Các đề xuất mở rộng đội xe dựa trên dự báo AI
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Station Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {forecastData.stationForecasts.map((station) => (
                  <div 
                    key={station.stationId}
                    className="p-5 border-2 rounded-lg hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-blue-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <h5 className="font-bold text-lg">{station.stationName}</h5>
                      </div>
                      <Badge className="bg-green-600">
                        Ưu tiên cao
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Dự đoán tăng nhu cầu:</span>
                        <span className="font-bold text-green-600 text-lg">
                          +{station.predictedDemandIncrease}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Số xe đề xuất thêm:</span>
                        <span className="font-bold text-blue-600 text-lg">
                          {station.suggestedAdditionalVehicles} xe
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">Lý do:</span> {station.reasoning}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Suggestions */}
              {forecastData.fleetExpansionSuggestions && forecastData.fleetExpansionSuggestions.length > 0 && (
                <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
                  <h4 className="font-bold text-lg mb-3 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-green-600" />
                    Tổng hợp gợi ý mở rộng đội xe:
                  </h4>
                  <ul className="space-y-2">
                    {forecastData.fleetExpansionSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span className="text-sm text-gray-800">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button onClick={fetchData} variant="outline" size="lg">
          <RefreshCw className="h-4 w-4 mr-2" />
          Làm mới dữ liệu
        </Button>
      </div>
    </div>
  );
};

export default AdminAIForecastNew;

