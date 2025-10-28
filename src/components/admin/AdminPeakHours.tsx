import { useState, useEffect } from 'react';
import { Clock, TrendingUp, TrendingDown, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPeakHourAnalysis, type PeakHourAnalysis } from '@/services/adminservice/adminReportService';

const AdminPeakHours = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PeakHourAnalysis | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getPeakHourAnalysis();
      setData(result);
    } catch (err) {
      console.error('Error loading peak hour analysis:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu phân tích giờ cao điểm');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-green-500" />
          <span className="text-lg text-gray-600">Đang tải dữ liệu phân tích...</span>
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
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không có dữ liệu phân tích</p>
      </div>
    );
  }

  const peakHours = Array.isArray(data.peakHours) ? data.peakHours : [];
  const lowHours = Array.isArray(data.lowDemandHours) ? data.lowDemandHours : [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Phân Tích Giờ Cao Điểm</h2>
        <p className="text-gray-600">Phân tích mẫu đặt xe để xác định giờ cao điểm và thấp điểm</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Giờ cao điểm</p>
                <p className="text-3xl font-bold text-green-800">
                  {peakHours.length}
                </p>
                <p className="text-xs text-green-600 mt-2">giờ có nhu cầu cao</p>
              </div>
              <div className="p-3 bg-green-500 rounded-full">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Giờ thấp điểm</p>
                <p className="text-3xl font-bold text-blue-800">
                  {lowHours.length}
                </p>
                <p className="text-xs text-blue-600 mt-2">giờ có nhu cầu thấp</p>
              </div>
              <div className="p-3 bg-blue-500 rounded-full">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              Giờ Cao Điểm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {peakHours.length > 0 ? (
                peakHours.map((hour, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <Badge className="bg-green-100 text-green-800 mr-2">
                      #{index + 1}
                    </Badge>
                    <span className="flex-1 text-gray-800 font-medium">{hour}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có dữ liệu giờ cao điểm</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center">
              <TrendingDown className="h-5 w-5 text-blue-500 mr-2" />
              Giờ Thấp Điểm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowHours.length > 0 ? (
                lowHours.map((hour, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <Badge className="bg-blue-100 text-blue-800 mr-2">
                      #{index + 1}
                    </Badge>
                    <span className="flex-1 text-gray-800 font-medium">{hour}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Chưa có dữ liệu giờ thấp điểm</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Redistribution Suggestion */}
      {data.redistributionSuggestion && (
        <Card className="shadow-sm hover:shadow-md transition border border-gray-100 rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <ArrowRight className="h-5 w-5 text-orange-500 mr-2" />
              Đề xuất Phân phối Xe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="text-gray-800 leading-6 whitespace-pre-wrap">
                {data.redistributionSuggestion}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPeakHours;
