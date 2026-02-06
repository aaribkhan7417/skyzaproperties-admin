import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown, TrendingUp, Wallet, ReceiptText, Loader2 } from 'lucide-react';
import { getDashboardStats } from '../api';

const data = [
  { name: 'Mon', sales: 40, profit: 24, cost: 20 },
  { name: 'Tue', sales: 30, profit: 13, cost: 35 },
  { name: 'Wed', sales: 65, profit: 98, cost: 45 },
  { name: 'Thu', sales: 45, profit: 39, cost: 28 },
  { name: 'Fri', sales: 75, profit: 48, cost: 50 },
  { name: 'Sat', sales: 55, profit: 38, cost: 40 },
  { name: 'Sun', sales: 85, profit: 43, cost: 55 },
];

const SalesChart: React.FC = () => {
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
        console.error("Error fetching stats for chart:", error);
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
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-2 flex items-center justify-center h-[450px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#112922]" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-2">
      <div className="flex items-center justify-between mb-8 text-left">
        <div>
          <h3 className="text-xl font-bold text-[#112922]">Sales Statistics</h3>
          <p className="text-sm text-gray-500">Transaction activity overview</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          Last month <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(value) => `${value}k`}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Line type="monotone" dataKey="sales" stroke="#112922" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="profit" stroke="#F59E0B" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="cost" stroke="#6366F1" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-50 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Total Sales Value</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#112922] whitespace-nowrap">{formatPrice(stats?.sales?.total_value || 0)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 border-x border-gray-50 px-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Wallet className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Annual Revenue</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#112922] whitespace-nowrap">{formatPrice(stats?.rent?.total_revenue || 0)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <ReceiptText className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium whitespace-nowrap">Deals Closed</p>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#112922] whitespace-nowrap">{stats?.sales?.deals_closed || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;
