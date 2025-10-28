import { useState, useEffect } from 'react';
import { Brain, TrendingUp, Car, Clock, AlertCircle, Loader2, MapPin, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAIForecast, type AIForecast, type StationForecast } from '@/services/adminservice/adminReportService';

const AdminAIForecast = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AIForecast | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAIForecast();
      setData(result);
    } catch (err) {
      console.error('Error loading AI forecast:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải dự báo AI');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-lg text-gray-600">Đang tải dự báo AI...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-lg text-red-600 font-semibold">{error}</p>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không có dữ liệu dự báo</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Brain className="h-7 w-7 text-blue-500 mr-3" />
          Dự Báo AI Mở Rộng Đội Xe
        </h2>
        <p className="text-gray-600">Dự báo nhu cầu và đề xuất mở rộng đội xe dựa trên AI</p>
        <Badge variant="outline" className="mt-2 text-blue-600 border-blue-200">
          Kỳ dự báo: {data.forecastPeriod}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Trạm được phân tích</p>
                <p className="text-3xl font-bold text-blue-800">
                  {data.stationForecasts.length}
                </p>
                <p className="text-xs text-blue-600 mt-2">trạm</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <MapPin className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Tổng xe đề xuất</p>
                <p className="text-3xl font-bold text-green-800">
                  {data.stationForecasts.reduce((sum, station) => sum + station.suggestedAdditionalVehicles, 0)}
                </p>
                <p className="text-xs text-green-600 mt-2">xe</p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <Car className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Đề xuất mở rộng</p>
                <p className="text-3xl font-bold text-purple-800">
                  {data.fleetExpansionSuggestions.length}
                </p>
                <p className="text-xs text-purple-600 mt-2">gợi ý</p>
              </div>
              <div className="p-3 bg-purple-500 rounded-full">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Station Forecasts */}
      <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
            <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
            Dự Báo Theo Trạm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.stationForecasts.length > 0 ? (
              data.stationForecasts.map((station: StationForecast) => (
                <div key={station.stationId} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {station.stationName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          Tăng nhu cầu: +{station.predictedDemandIncrease}%
                        </span>
                        <span className="flex items-center">
                          <Car className="h-4 w-4 text-blue-500 mr-1" />
                          Đề xuất thêm: {station.suggestedAdditionalVehicles} xe
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      ID: {station.stationId}
                    </Badge>
                  </div>
                  <div className="mt-3 p-3 bg-white rounded border border-gray-100">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      <strong>Lý do:</strong> {station.reasoning}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có dữ liệu dự báo trạm</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Fleet Expansion Suggestions */}
      <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
            <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
            Đề Xuất Mở Rộng Đội Xe
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.fleetExpansionSuggestions.length > 0 ? (
              data.fleetExpansionSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Badge className="bg-yellow-100 text-yellow-800 mt-1">
                    #{index + 1}
                  </Badge>
                  <p className="text-gray-800 leading-relaxed flex-1">{suggestion}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">Chưa có đề xuất mở rộng</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Peak Hour Analysis */}
      <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
            <Clock className="h-5 w-5 text-orange-500 mr-2" />
            Phân Tích Giờ Cao Điểm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak Hours */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
                Giờ Cao Điểm
              </h4>
              <div className="space-y-2">
                {data.peakHourAnalysis.peakHours.length > 0 ? (
                  data.peakHourAnalysis.peakHours.map((hour, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                      <Badge className="bg-green-100 text-green-800 mr-2">
                        #{index + 1}
                      </Badge>
                      <span className="text-gray-800 font-medium">{hour}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Chưa có dữ liệu giờ cao điểm</p>
                )}
              </div>
            </div>

            {/* Low Demand Hours */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 text-blue-500 mr-2 rotate-180" />
                Giờ Thấp Điểm
              </h4>
              <div className="space-y-2">
                {data.peakHourAnalysis.lowDemandHours.length > 0 ? (
                  data.peakHourAnalysis.lowDemandHours.map((hour, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                      <Badge className="bg-blue-100 text-blue-800 mr-2">
                        #{index + 1}
                      </Badge>
                      <span className="text-gray-800 font-medium">{hour}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Chưa có dữ liệu giờ thấp điểm</p>
                )}
              </div>
            </div>
          </div>

          {/* Redistribution Suggestion */}
          {data.peakHourAnalysis.redistributionSuggestion && (
            <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Đề Xuất Phân Phối</h4>
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {data.peakHourAnalysis.redistributionSuggestion}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAIForecast;
