
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Briefcase,
  Target, Percent, Users, Sparkles, Calendar,
  Download, ChevronDown, ArrowUpRight, Wallet, CheckCircle, Clock, Plus
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import PropertyForm from './PropertyForm';
import { getDashboardStats, createProperty } from '../api';

const revenueData = [
  { name: 'Jan', current: 45, previous: 38 },
  { name: 'Feb', current: 52, previous: 42 },
  { name: 'Mar', current: 48, previous: 45 },
  { name: 'Apr', current: 61, previous: 50 },
  { name: 'May', current: 55, previous: 48 },
  { name: 'Jun', current: 72, previous: 55 },
  { name: 'Jul', current: 85, previous: 60 },
];

const typeData = [
  { name: 'Apartment', value: 450 },
  { name: 'Villa', value: 680 },
  { name: 'Penthouse', value: 320 },
  { name: 'Townhouse', value: 210 },
];

const locationData = [
  { name: 'Palm Jumeirah', value: 850 },
  { name: 'Downtown Dubai', value: 720 },
  { name: 'Dubai Marina', value: 540 },
  { name: 'Business Bay', value: 380 },
  { name: 'Creek Harbour', value: 310 },
];

const funnelData = [
  { step: 'Leads', value: 1200, fill: '#112922' },
  { step: 'Qualified', value: 850, fill: '#1a3a30' },
  { step: 'Site Visit', value: 420, fill: '#234b3e' },
  { step: 'Negotiation', value: 180, fill: '#2c5d4c' },
  { step: 'Closed', value: 92, fill: '#356e5a' },
];

const agents = [
  { id: 1, name: 'Sarah Jenkins', deals: 14, volume: 'AED 84.5M', commission: 1600000, performance: 98 },
  { id: 2, name: 'Michael Chen', deals: 11, volume: 'AED 62.1M', commission: 1200000, performance: 92 },
  { id: 3, name: 'Omar Al-Fayed', deals: 9, volume: 'AED 58.4M', commission: 1100000, performance: 89 },
  { id: 4, name: 'Elena Rodriguez', deals: 8, volume: 'AED 42.0M', commission: 840000, performance: 85 },
];

const SalesKPICard = ({ label, value, trend, trendValue, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#112922]">
        <Icon className="w-5 h-5" />
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
        {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {trendValue}%
      </div>
    </div>
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-2xl font-black text-[#112922]">{value}</h3>
  </div>
);

const SalesModule: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchStats = async (p: string, range?: { start: string, end: string }) => {
    setLoading(true);
    try {
      let params: any = {};
      if (p === 'week') {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);
        params = { start_date: start.toISOString().split('T')[0], end_date: end.toISOString().split('T')[0] };
      } else if (p === 'month') {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 30);
        params = { start_date: start.toISOString().split('T')[0], end_date: end.toISOString().split('T')[0] };
      } else if (p === 'custom' && range?.start && range?.end) {
        params = { start_date: range.start, end_date: range.end };
      }

      const response = await getDashboardStats(params);
      if (response.status === 'success') {
        setStats(response.data.sales);
      }
    } catch (error) {
      console.error("Error fetching sales stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(period, customRange);
  }, [period]);

  const handleCustomSubmit = () => {
    fetchStats('custom', customRange);
  };

  const handleSaveSale = async (data: any) => {
    try {
      const response = await createProperty({ ...data, listing_type: 'Sale' });
      if (response.status === 'success') {
        alert('Sale property added successfully!');
        setShowAddForm(false);
        fetchStats(period, customRange);
      }
    } catch (error) {
      console.error('Error adding sale property:', error);
      alert('Failed to add sale property');
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `AED ${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `AED ${(price / 1000).toFixed(1)}K`;
    return `AED ${price}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#112922]">Sales Analytics</h1>
          <p className="text-sm text-gray-500">Executive performance overview and market insights.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 bg-white rounded-xl border border-gray-100 text-xs font-bold text-gray-600 outline-none focus:ring-2 focus:ring-[#112922]/10 h-10"
          >
            <option value="all">Lifetime</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="custom">Custom Range</option>
          </select>

          {period === 'custom' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                className="px-2 py-1.5 bg-white border border-gray-100 rounded-lg text-xs"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                className="px-2 py-1.5 bg-white border border-gray-100 rounded-lg text-xs"
              />
              <button
                onClick={handleCustomSubmit}
                className="p-1.5 bg-[#112922] text-white rounded-lg"
              >
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#112922] text-white rounded-xl text-xs font-bold hover:bg-emerald-950 transition-all shadow-lg shadow-[#112922]/20 font-sans h-10"
          >
            <Plus className="w-4 h-4" /> Add Sale Property
          </button>
        </div>
      </div>

      {showAddForm && (
        <PropertyForm
          onClose={() => setShowAddForm(false)}
          onSave={handleSaveSale}
        />
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <SalesKPICard label="Sales Value" value={loading ? "..." : formatPrice(stats?.total_value || 0)} trend="up" trendValue="12.4" icon={DollarSign} />
        <SalesKPICard label="Deals Closed" value={loading ? "..." : stats?.deals_closed || 0} trend="up" trendValue="8.1" icon={Briefcase} />
        <SalesKPICard label="Active Listings" value={loading ? "..." : stats?.active_listings || 0} trend="up" trendValue="2.4" icon={Target} />
        <SalesKPICard label="Commission" value={loading ? "..." : formatPrice((stats?.total_value || 0) * 0.02)} trend="up" trendValue="14.5" icon={Users} />
        <SalesKPICard label="Conversion" value="7.6%" trend="up" trendValue="1.2" icon={Percent} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-[#112922]">Revenue Trend</h3>
              <p className="text-xs text-gray-400">Monthly sales volume compared to previous year</p>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#112922" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#112922" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} tickFormatter={(val) => `${val}M`} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 800, color: '#112922', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="current" stroke="#112922" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" />
                <Area type="monotone" dataKey="previous" stroke="#e2e8f0" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights & Funnel */}
        <div className="space-y-8">
          <div className="bg-[#112922] p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h3 className="text-white font-bold text-sm">AI Strategy Insight</h3>
            </div>
            <p className="text-white/80 text-xs leading-relaxed mb-6">
              Villas in <span className="text-white font-bold">Palm Jumeirah</span> are seeing a 15% increase in site visit-to-closed conversion this month.
            </p>
            <button className="w-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold py-2.5 rounded-lg border border-white/10">
              Generate Detailed Report
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-[#112922] mb-6 uppercase tracking-widest">Sales Funnel</h3>
            <div className="space-y-4">
              {funnelData.map((item) => (
                <div key={item.step} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-gray-400 uppercase">{item.step}</span>
                  </div>
                  <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(item.value / 1200) * 100}%`, backgroundColor: item.fill }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-[#112922] mb-8">Inventory Distribution</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="h-[240px]">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">By Property Type</p>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#112922', '#2a5a4a', '#448c72', '#a8c6ba'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="h-[240px]">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">By Location</p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} width={80} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" fill="#112922" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-[#112922]">Top Performers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="pb-4">Agent</th>
                  <th className="pb-4 text-right">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agents.map((agent) => (
                  <tr key={agent.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-[#112922]">{agent.name}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[10px] font-black text-gray-400">{agent.performance}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesModule;
