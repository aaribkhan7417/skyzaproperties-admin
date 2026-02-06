
import React, { useState, useEffect } from 'react';
import {
  Building2, Key, Users, Calendar, TrendingUp, TrendingDown,
  MapPin, Clock, ArrowUpRight, Sparkles, PieChart as LucidePieChart,
  BarChart2, FileText, Download, ChevronDown, Plus
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import PropertyForm from './PropertyForm';
import { getDashboardStats, createProperty } from '../api';

const rentRevenueData = [
  { month: 'Jan', current: 1.2, previous: 0.9 },
  { month: 'Feb', current: 1.4, previous: 1.0 },
  { month: 'Mar', current: 1.3, previous: 1.1 },
  { month: 'Apr', current: 1.8, previous: 1.2 },
  { month: 'May', current: 1.6, previous: 1.3 },
  { month: 'Jun', current: 2.1, previous: 1.5 },
  { month: 'Jul', current: 2.4, previous: 1.7 },
];

const occupancyData = [
  { month: 'Jan', rate: 88 },
  { month: 'Feb', rate: 90 },
  { month: 'Mar', rate: 89 },
  { month: 'Apr', rate: 92 },
  { month: 'May', rate: 91 },
  { month: 'Jun', rate: 94 },
  { month: 'Jul', rate: 95 },
];

const rentByType = [
  { name: 'Apartment', value: 4.2 },
  { name: 'Villa', value: 3.8 },
  { name: 'Townhouse', value: 2.1 },
  { name: 'Penthouse', value: 2.3 },
];

const rentByLocation = [
  { name: 'Dubai Marina', value: 3.2 },
  { name: 'Downtown Dubai', value: 2.8 },
  { name: 'Palm Jumeirah', value: 4.5 },
  { name: 'JVC', value: 1.1 },
  { name: 'Business Bay', value: 1.4 },
];

const leaseTypeData = [
  { name: 'Annual', value: 75 },
  { name: 'Short-Term', value: 25 },
];

const COLORS = ['#112922', '#e2e8f0'];

const RentKPICard = ({ label, value, subtext, trend, trendValue, icon: Icon }: any) => (
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
    <p className="text-[10px] text-gray-400 mt-1">{subtext}</p>
  </div>
);

const RentModule: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await getDashboardStats();
      if (response.status === 'success') {
        setStats(response.data.rent);
      }
    } catch (error) {
      console.error("Error fetching rent stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSaveProperty = async (data: any) => {
    try {
      const response = await createProperty({ ...data, listing_type: 'Rent' });
      if (response.status === 'success') {
        alert('Rental property added successfully!');
        setShowAddForm(false);
        fetchStats();
      }
    } catch (error) {
      console.error('Error adding rental property:', error);
      alert('Failed to add rental property');
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
          <h1 className="text-3xl font-bold text-[#112922]">Rent Management</h1>
          <p className="text-sm text-gray-500">Rental yield tracking, occupancy, and tenant portfolios.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#112922] text-white rounded-xl text-xs font-bold hover:bg-emerald-950 shadow-lg shadow-[#112922]/20 transition-all font-sans"
          >
            <Plus className="w-4 h-4" /> Add Rental Property
          </button>
        </div>
      </div>

      {showAddForm && (
        <PropertyForm
          onClose={() => setShowAddForm(false)}
          onSave={handleSaveProperty}
        />
      )}

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <RentKPICard label="Total Revenue" value={loading ? "..." : formatPrice(stats?.total_revenue || 0)} subtext="YTD Rental Income" trend="up" trendValue="15.2" icon={Building2} />
        <RentKPICard label="Active Rentals" value={loading ? "..." : stats?.active_rentals || 0} subtext="Current Lease Units" trend="up" trendValue="4.5" icon={Key} />
        <RentKPICard label="Occupancy Rate" value={loading ? "..." : `${stats?.occupancy_rate || 0}%`} subtext="Portfolio Fill Rate" trend="up" trendValue="2.1" icon={Users} />
        <RentKPICard label="Avg Rent" value="AED 142K" subtext="Annualized Average" trend="down" trendValue="1.2" icon={BarChart2} />
        <RentKPICard label="Expiring Soon" value="18" subtext="Next 30 Days" trend="up" trendValue="8.4" icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Line Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-[#112922]">Rental Revenue</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#112922]" />
                <span className="text-[10px] font-bold text-gray-500 uppercase">Current Year</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
                <span className="text-[10px] font-bold text-gray-500 uppercase">Prev Year</span>
              </div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rentRevenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(v) => `${v}M`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="current" stroke="#112922" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="previous" stroke="#e2e8f0" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Area Chart */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-[#112922] mb-8">Occupancy Velocity</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={occupancyData}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#112922" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#112922" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Area type="monotone" dataKey="rate" stroke="#112922" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-[#112922] mb-6 uppercase tracking-widest">Revenue by Property Type</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rentByType}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="value" fill="#112922" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-[#112922] mb-6 uppercase tracking-widest">Yield by District</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rentByLocation} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} width={80} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#112922" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#112922] p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-white font-bold text-sm">Rent Optimizer AI</h3>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-[11px] text-white/80">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1" />
                <span>Downtown apartments show <strong>98% occupancy</strong>, suggest 5% rent hike on renewals.</span>
              </li>
            </ul>
            <button className="w-full mt-6 bg-white/10 text-white text-[10px] font-bold py-2.5 rounded-lg border border-white/10 hover:bg-white/20 transition-all">
              Review Strategy
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Collection Status</h4>
              <p className="text-lg font-black text-[#112922]">92% Collected</p>
            </div>
            <div className="w-20 h-20">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={leaseTypeData} innerRadius={25} outerRadius={35} paddingAngle={5} dataKey="value">
                    {leaseTypeData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentModule;
