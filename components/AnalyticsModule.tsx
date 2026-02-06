
import React from 'react';
import { 
  TrendingUp, Activity, MousePointer2, Clock, 
  Users, Sparkles, Filter, Download, Calendar,
  ChevronDown, ArrowUpRight, Globe, MessageCircle, 
  Target, BarChart2, PieChart as LucidePieChart
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Legend, Funnel, FunnelChart, LabelList
} from 'recharts';

const trafficData = [
  { name: '01 May', organic: 2400, paid: 1800, referral: 600 },
  { name: '05 May', organic: 3200, paid: 2100, referral: 800 },
  { name: '10 May', organic: 2800, paid: 2500, referral: 700 },
  { name: '15 May', organic: 4500, paid: 2200, referral: 1200 },
  { name: '20 May', organic: 3800, paid: 2800, referral: 900 },
  { name: '25 May', organic: 5200, paid: 3100, referral: 1100 },
  { name: '30 May', organic: 4900, paid: 2900, referral: 1000 },
];

const leadSourceData = [
  { name: 'Website', value: 45, color: '#112922' },
  { name: 'WhatsApp', value: 30, color: '#2a5a4a' },
  { name: 'Ads', value: 15, color: '#448c72' },
  { name: 'Referral', value: 10, color: '#a8c6ba' },
];

const funnelData = [
  { value: 10000, name: 'Visitors', fill: '#112922' },
  { value: 2500, name: 'Leads', fill: '#1a3a30' },
  { value: 800, name: 'Qualified', fill: '#234b3e' },
  { value: 120, name: 'Closed', fill: '#2c5d4c' },
];

const roiData = [
  { month: 'Jan', spend: 45, revenue: 180 },
  { month: 'Feb', spend: 52, revenue: 210 },
  { month: 'Mar', spend: 48, revenue: 240 },
  { month: 'Apr', spend: 61, baseline: 50, revenue: 310 },
  { month: 'May', spend: 55, revenue: 290 },
  { month: 'Jun', spend: 72, revenue: 450 },
];

const engagementData = [
  { location: 'Palm Jumeirah', views: 8500, saves: 1200, enquiries: 450 },
  { location: 'Downtown', views: 7200, saves: 980, enquiries: 380 },
  { location: 'Marina', views: 6400, saves: 820, enquiries: 290 },
  { location: 'JVC', views: 4100, saves: 310, enquiries: 120 },
];

const AnalyticsKPICard = ({ label, value, trend, trendValue, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#112922]">
        <Icon className="w-5 h-5" />
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
        {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <Activity className="w-3 h-3 rotate-180" />}
        {trendValue}%
      </div>
    </div>
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-2xl font-black text-[#112922]">{value}</h3>
  </div>
);

const AnalyticsModule: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#112922]">Executive Insights</h1>
          <p className="text-sm text-gray-500">Cross-platform performance and market behavior analytics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-600">May 2024</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#112922] text-white rounded-xl text-xs font-bold hover:bg-emerald-950 transition-all shadow-lg shadow-[#112922]/20">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <AnalyticsKPICard label="Website Traffic" value="124.5k" trend="up" trendValue="18.2" icon={Globe} />
        <AnalyticsKPICard label="Property Views" value="48.2k" trend="up" trendValue="12.4" icon={BarChart2} />
        <AnalyticsKPICard label="Lead Conversion" value="3.82%" trend="up" trendValue="0.5" icon={Target} />
        <AnalyticsKPICard label="Avg. Time on Page" value="4m 12s" trend="down" trendValue="2.1" icon={Clock} />
        <AnalyticsKPICard label="AI High Intent" value="1,240" trend="up" trendValue="24.5" icon={Sparkles} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Traffic Trend */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-[#112922]">Traffic Distribution</h3>
              <p className="text-xs text-gray-400">User acquisition channels across the portfolio</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#112922]" />
                <span className="text-[10px] font-bold text-gray-500 uppercase">Organic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#448c72]" />
                <span className="text-[10px] font-bold text-gray-500 uppercase">Paid</span>
              </div>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#112922" stopOpacity={0.05}/>
                    <stop offset="95%" stopColor="#112922" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="organic" stroke="#112922" strokeWidth={3} fillOpacity={1} fill="url(#colorOrganic)" />
                <Area type="monotone" dataKey="paid" stroke="#448c72" strokeWidth={2} fillOpacity={0} strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Donut */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-[#112922] mb-2">Lead Sources</h3>
          <p className="text-xs text-gray-400 mb-8">Where high-value enquirers originate</p>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {leadSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {leadSourceData.map((source) => (
              <div key={source.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: source.color }} />
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{source.name}</span>
                <span className="text-[10px] font-black text-[#112922] ml-auto">{source.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lead Funnel */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-[#112922] mb-8">Conversion Funnel</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip />
                <Funnel
                  dataKey="value"
                  data={funnelData}
                  isAnimationActive
                >
                  <LabelList position="right" fill="#94a3b8" stroke="none" dataKey="name" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Property Engagement */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-[#112922] mb-8">Hotspot Engagement</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={engagementData} barGap={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="location" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="views" fill="#112922" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="enquiries" fill="#a8c6ba" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#112922] rounded-sm" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">Views</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#a8c6ba] rounded-sm" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">Enquiries</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Marketing ROI */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-[#112922] mb-8">Marketing ROI (Spend vs Revenue)</h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={roiData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(v) => `AED ${v}k`} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(v) => `AED ${v}k`} />
                <Tooltip />
                <Bar yAxisId="left" dataKey="spend" fill="#a8c6ba" radius={[4, 4, 0, 0]} barSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#112922" strokeWidth={3} dot={{ r: 4, fill: '#112922' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Analytics Insights */}
        <div className="space-y-6">
          <div className="bg-[#112922] p-8 rounded-3xl relative overflow-hidden h-full">
            <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold">Predictive Insights</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[11px] text-white/90 leading-relaxed">
                  <span className="text-emerald-400 font-black">Private Vault</span> listings are converting at a <span className="font-bold underline decoration-emerald-400">34% higher rate</span> than public listings this quarter.
                </p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[11px] text-white/90 leading-relaxed">
                  WhatsApp leads exhibit a <span className="text-emerald-400 font-bold">2.4x faster close rate</span> compared to standard web forms. Integration optimization recommended.
                </p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[11px] text-white/90 leading-relaxed">
                  Demand in <span className="text-emerald-400 font-bold">Downtown Dubai</span> is shifting toward 3-bed penthouses, showing a 40% increase in high-intent clicks.
                </p>
              </div>
            </div>
            
            <button className="w-full mt-8 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-3.5 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2">
              Deep Dive Analytics <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Agent Performance Ranking */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold text-[#112922]">Lead Handling Efficiency</h3>
            <p className="text-xs text-gray-400">Response time and conversion ranking</p>
          </div>
          <button className="text-xs font-bold text-[#112922] hover:underline">Full Report</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Sarah Jenkins', time: '14 min', conv: '12.4%', score: 98, leads: 420 },
            { name: 'Michael Chen', time: '22 min', conv: '10.8%', score: 92, leads: 380 },
            { name: 'Omar Al-Fayed', time: '18 min', conv: '9.2%', score: 89, leads: 310 },
          ].map((agent, i) => (
            <div key={agent.name} className="p-6 bg-gray-50/50 rounded-2xl border border-gray-50 group hover:border-[#112922]/20 transition-all">
               <div className="flex items-center justify-between mb-4">
                 <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black text-[#112922]">
                   {agent.name.split(' ').map(n => n[0]).join('')}
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] font-bold text-gray-400 uppercase">Efficiency Score</p>
                   <p className="text-lg font-black text-[#112922]">{agent.score}</p>
                 </div>
               </div>
               <h4 className="font-bold text-[#112922] mb-4">{agent.name}</h4>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Avg Response</p>
                    <p className="text-xs font-bold text-gray-700">{agent.time}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Conversion</p>
                    <p className="text-xs font-bold text-emerald-600">{agent.conv}</p>
                  </div>
               </div>
               <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{agent.leads} Leads handled</span>
                  <div className="w-20 bg-gray-200 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-[#112922]" style={{ width: `${agent.score}%` }} />
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModule;
