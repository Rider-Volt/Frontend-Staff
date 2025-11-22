import React, { useEffect, useState } from 'react';
import { getRevenueByDate, RevenuePeriodResult } from '@/services/adminservice/adminDashboardService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

function formatDayLabel(date: Date) {
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function toIsoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

interface ChartData {
  day: string;
  label: string;
  revenue: number;
  orders: number;
}

export default function SevenDayRevenue() {
  const [data, setData] = useState<Array<{ day: string; result?: RevenuePeriodResult; error?: string }>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Load last 7 days relative to today (no user selection)
  async function loadLastSevenDays() {
    setLoading(true);
    try {
      const end = new Date();
      // Use UTC-based dates to ensure consistent day boundaries
      const days: Date[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(end);
        d.setUTCDate(end.getUTCDate() - i);
        days.push(d);
      }

      const isoDays = days.map(toIsoDay);
      const promises = isoDays.map((iso) =>
        getRevenueByDate(iso)
          .then((res) => ({ day: iso, result: res }))
          .catch((err: any) => ({ day: iso, error: err?.message ?? 'Lỗi' }))
      );

      const results = await Promise.all(promises);
      setData(results);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLastSevenDays();
  }, []);

  // Transform data for chart
  const chartData: ChartData[] = data
    .filter((d) => !d.error)
    .map((d) => {
      const dateObj = new Date(d.day + 'T00:00:00Z');
      return {
        day: d.day,
        label: formatDayLabel(dateObj),
        revenue: d.result?.revenue ?? 0,
        orders: d.result?.totalOrders ?? 0,
      };
    });

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 0);

  const chartConfig = {
    revenue: {
      label: 'Doanh thu',
      color: 'hsl(var(--chart-1))',
    },
  };

  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('vi-VN')}₫`;
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-white">
      <p className="text-sm font-medium text-gray-600 mb-4">Doanh thu 7 ngày gần nhất</p>

      {loading && (
        <div className="h-64 flex items-center justify-center text-sm text-gray-500">
          Đang tải...
        </div>
      )}

      {!loading && data.length === 0 && (
        <div className="h-64 flex items-center justify-center text-sm text-gray-500">
          Không có dữ liệu
        </div>
      )}

      {!loading && chartData.length > 0 && (
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                  return value.toString();
                }}
              />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartData;
                    return (
                      <div className="rounded-lg border bg-white p-3 shadow-lg">
                        <div className="text-sm font-medium text-gray-800 mb-1">{data.label}</div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex justify-between gap-4">
                            <span>Doanh thu:</span>
                            <span className="font-semibold text-gray-800">
                              {formatCurrency(data.revenue)}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span>Đơn hàng:</span>
                            <span className="font-semibold text-gray-800">{data.orders}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="revenue"
                fill="var(--color-revenue)"
                radius={[4, 4, 0, 0]}
                style={{
                  fill: 'hsl(221.2 83.2% 53.3%)',
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {!loading && data.some((d) => d.error) && (
        <div className="mt-2 text-xs text-red-600">
          Một số ngày có lỗi khi tải dữ liệu
        </div>
      )}
    </div>
  );
}
