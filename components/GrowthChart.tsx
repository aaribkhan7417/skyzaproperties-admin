import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { getDashboardStats } from '../api';

const data = [
  { quarter: 'Q1', sale: 400, rent: 240 },
  { quarter: 'Q2', sale: 600, rent: 380 },
  { quarter: 'Q3', sale: 450, rent: 320 },
  { quarter: 'Q4', sale: 700, rent: 450 },
];

const GrowthChart: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStats();
        if (response.status === 'success') {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Error fetching stats for growth chart:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `AED ${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `AED ${(price / 1000).toFixed(1)}K`;
    return `AED ${price}`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-1 flex items-center justify-center h-[420px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#112922]" />
      </div>
    );
  }

  const totalRevenue = (stats?.sales?.total_value || 0) + (stats?.rent?.total_revenue || 0);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-1">
      <div className="flex items-center justify-between mb-2 text-left">
        <h3 className="text-xl font-bold text-[#112922]">Growth Statistics</h3>
        <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-1 rounded">Yearly</span>
      </div>

      <div className="mb-6 text-left">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Total Revenue</p>
        <div className="flex items-end gap-2">
          <h2 className="text-3xl font-bold text-[#112922]">{formatPrice(totalRevenue)}</h2>
          <div className="flex items-center gap-1 text-green-600 text-sm font-bold pb-1">
            <ArrowUpRight className="w-4 h-4" /> 12%
          </div>
        </div>
      </div>

      <div className="h-[250px] w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="quarter"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dy={10}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="sale" radius={[4, 4, 0, 0]} barSize={24} fill="#112922" />
            <Bar dataKey="rent" radius={[4, 4, 0, 0]} barSize={24} fill="#e2e8f0" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-[#112922]"></div>
          <span className="text-xs font-medium text-gray-500">Property Sale</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-gray-200"></div>
          <span className="text-xs font-medium text-gray-500">Property Rent</span>
        </div>
      </div>
    </div>
  );
};

export default GrowthChart;
