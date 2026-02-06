
import React, { useState } from 'react';
import { 
  Users, Briefcase, DollarSign, Percent, Clock, 
  TrendingUp, TrendingDown, Sparkles, Filter, 
  Download, Calendar, ChevronDown, MoreHorizontal,
  Mail, Phone, MessageSquare, ArrowUpRight, 
  X, ShieldCheck, Star, Award, Building2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, Cell, PieChart, Pie
} from 'recharts';

interface Agent {
  id: string;
  name: string;
  role: 'Senior Advisor' | 'Property Consultant' | 'Sales Manager';
  deals: number;
  revenue: number;
  conversion: number;
  responseTime: string;
  commission: number;
  status: 'Active' | 'Inactive';
  avatar: string;
}

const mockAgents: Agent[] = [
  { id: '1', name: 'Sarah Jenkins', role: 'Sales Manager', deals: 24, revenue: 142000000, conversion: 12.4, responseTime: '8m', commission: 2840000, status: 'Active', avatar: 'https://i.pravatar.cc/150?u=sarah' },
  { id: '2', name: 'Michael Chen', role: 'Senior Advisor', deals: 18, revenue: 92400000, conversion: 10.8, responseTime: '12m', commission: 1848000, status: 'Active', avatar: 'https://i.pravatar.cc/150?u=michael' },
  { id: '3', name: 'Omar Al-Fayed', role: 'Property Consultant', deals: 14, revenue: 78200000, conversion: 9.2, responseTime: '15m', commission: 1564000, status: 'Active', avatar: 'https://i.pravatar.cc/150?u=omar' },
  { id: '4', name: 'Elena Rodriguez', role: 'Senior Advisor', deals: 11, revenue: 42000000, conversion: 8.5, responseTime: '18m', commission: 840000, status: 'Active', avatar: 'https://i.pravatar.cc/150?u=elena' },
  { id: '5', name: 'James Wilson', role: 'Property Consultant', deals: 6, revenue: 21500000, conversion: 5.2, responseTime: '32m', commission: 430000, status: 'Inactive', avatar: 'https://i.pravatar.cc/150?u=james' },
];

const revenueByAgent = mockAgents.map(a => ({ name: a.name, revenue: a.revenue / 1000000 }));
const dealsOverTime = [
  { name: 'Jan', deals: 12 }, { name: 'Feb', deals: 18 }, { name: 'Mar', deals: 15 },
  { name: 'Apr', deals: 24 }, { name: 'May', deals: 21 }, { name: 'Jun', deals: 28 },
];

const commissionData = [
  { name: 'Paid', value: 72, color: '#112922' },
  { name: 'Pending', value: 28, color: '#a8c6ba' },
];

const AgentKPICard = ({ label, value, trend, trendValue, icon: Icon }: any) => (
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

const AgentsModule: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#112922]">Agent Performance</h1>
          <p className="text-sm text-gray-500">Track productivity and revenue contributions across the brokerage.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-bold text-gray-600">This Month</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-[#112922] text-white rounded-xl text-xs font-bold hover:bg-emerald-950 transition-all shadow-lg shadow-[#112922]/20">
            <Download className="w-4 h-4" />
            Performance Export
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <AgentKPICard label="Active Agents" value="24" trend="up" trendValue="4.2" icon={Users} />
        <AgentKPICard label="Deals Closed" value="156" trend="up" trendValue="8.1" icon={Briefcase} />
        <AgentKPICard label="Total Revenue" value="AED 1.4B" trend="up" trendValue="12.4" icon={DollarSign} />
        <AgentKPICard label="Avg Conversion" value="8.4%" trend="up" trendValue="1.5" icon={Percent} />
        <AgentKPICard label="Avg Response" value="12m" trend="down" trendValue="2.1" icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-[#112922] uppercase tracking-widest">Revenue per Advisor (AED Millions)</h3>
            <div className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 rounded-full bg-[#112922]" />
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Met</span>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByAgent}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="revenue" fill="#112922" radius={[6, 6, 0, 0]} barSize={40}>
                   {revenueByAgent.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#112922' : '#a8c6ba'} />
                   ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Agent Insights */}
        <div className="space-y-6">
           <div className="bg-[#112922] p-8 rounded-3xl relative overflow-hidden flex flex-col h-full">
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-white font-bold">Brokerage Intelligence</h3>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-[11px] text-white/90 leading-relaxed">
                    <span className="text-emerald-400 font-bold">Sarah Jenkins</span> has the highest conversion rate in waterfront villas (14%). Suggested as lead for new Palm projects.
                  </p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-[11px] text-white/90 leading-relaxed">
                    Agent response time directly impacts conversion by <span className="text-emerald-400 font-bold">18%</span>. Implementing a 15-min auto-reminder for 3 underperforming agents.
                  </p>
                </div>
              </div>
              
              <button className="w-full mt-auto bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-3.5 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2">
                Launch Performance Review <ArrowUpRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

      {/* Commission & Conversion Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-sm font-bold text-[#112922] uppercase tracking-widest">Conversion Rank (%)</h3>
             <button className="text-[10px] font-bold text-gray-400 hover:text-[#112922] transition-colors">By Quarter</button>
           </div>
           <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={mockAgents} layout="vertical">
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} width={100} />
                 <Tooltip />
                 <Bar dataKey="conversion" fill="#112922" radius={[0, 4, 4, 0]} barSize={12} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-8">
           <div className="flex-1">
             <h3 className="text-sm font-bold text-[#112922] uppercase tracking-widest mb-2">Commission Payout</h3>
             <p className="text-xs text-gray-400 mb-8">Total pending vs paid commissions</p>
             <div className="space-y-4">
               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                 <span className="text-xs font-bold text-gray-500">Paid Out</span>
                 <span className="text-sm font-black text-[#112922]">AED 6.2M</span>
               </div>
               <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                 <span className="text-xs font-bold text-gray-500">Pending</span>
                 <span className="text-sm font-black text-amber-600">AED 1.8M</span>
               </div>
             </div>
           </div>
           <div className="w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={commissionData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                    {commissionData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Agent Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
           <h3 className="text-lg font-bold text-[#112922]">Agency Roster</h3>
           <div className="flex gap-2">
             <button className="px-4 py-2 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50">Filter Role</button>
             <button className="px-4 py-2 bg-[#112922] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#112922]/10">Add Agent</button>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Advisor</th>
                <th className="px-6 py-4">Deals</th>
                <th className="px-6 py-4">Total Revenue</th>
                <th className="px-6 py-4">Conversion</th>
                <th className="px-6 py-4">Response</th>
                <th className="px-6 py-4">Commission</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockAgents.map((agent) => (
                <tr 
                  key={agent.id} 
                  className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedAgent(agent)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={agent.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                      <div>
                        <h4 className="text-sm font-bold text-[#112922]">{agent.name}</h4>
                        <p className="text-[10px] text-gray-400">{agent.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-[#112922]">{agent.deals}</td>
                  <td className="px-6 py-4 text-xs font-bold text-[#112922]">AED {(agent.revenue / 1000000).toFixed(1)}M</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 bg-gray-100 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${agent.conversion * 5}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600">{agent.conversion}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-600">{agent.responseTime}</td>
                  <td className="px-6 py-4 text-xs font-black text-[#112922]">AED {(agent.commission / 1000).toFixed(0)}K</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${agent.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                      {agent.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-300 hover:text-[#112922] hover:bg-gray-100 rounded-lg transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agent Detail Drawer */}
      {selectedAgent && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedAgent(null)} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={selectedAgent.avatar} className="w-16 h-16 rounded-2xl object-cover shadow-lg" alt="" />
                <div>
                   <div className="flex items-center gap-2">
                     <h2 className="text-2xl font-bold text-[#112922]">{selectedAgent.name}</h2>
                     <ShieldCheck className="w-5 h-5 text-emerald-500" />
                   </div>
                   <p className="text-sm text-gray-400 font-medium">{selectedAgent.role} • ID: SKY-00{selectedAgent.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               <div className="grid grid-cols-3 gap-4">
                 <div className="p-4 bg-gray-50 rounded-2xl text-center">
                    <Award className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Rank</p>
                    <p className="text-lg font-black text-[#112922]">#1</p>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-2xl text-center">
                    <Star className="w-5 h-5 text-[#112922] mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Rating</p>
                    <p className="text-lg font-black text-[#112922]">4.9/5</p>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-2xl text-center">
                    <Users className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Leads</p>
                    <p className="text-lg font-black text-[#112922]">420</p>
                 </div>
               </div>

               <div>
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Historical Performance</h4>
                 <div className="h-[180px]">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={dealsOverTime}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" hide />
                       <Tooltip />
                       <Line type="monotone" dataKey="deals" stroke="#112922" strokeWidth={3} dot={{ r: 4, fill: '#112922' }} />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                 <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Assigned Leads</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'John Doe', stage: 'Negotiation' },
                        { name: 'Jane Smith', stage: 'Site Visit' },
                        { name: 'Ahmed Ali', stage: 'Enquiry' }
                      ].map((lead, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <span className="text-xs font-bold text-[#112922]">{lead.name}</span>
                          <span className="text-[9px] font-black bg-white px-2 py-0.5 rounded shadow-sm text-gray-500">{lead.stage}</span>
                        </div>
                      ))}
                    </div>
                 </div>
                 <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Commission Log</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 rounded-xl">
                        <p className="text-[10px] font-bold text-emerald-800 uppercase">Paid - June</p>
                        <p className="text-xs font-black text-emerald-900">AED 140,000</p>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl">
                        <p className="text-[10px] font-bold text-amber-800 uppercase">Pending - July</p>
                        <p className="text-xs font-black text-amber-900">AED 82,400</p>
                      </div>
                    </div>
                 </div>
               </div>
            </div>

            <div className="p-8 border-t border-gray-100 flex gap-4 bg-gray-50/50">
              <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#112922] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#112922]/20 hover:bg-emerald-950 transition-all">
                <Mail className="w-4 h-4" /> Message Advisor
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-4 border border-gray-100 bg-white text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-100 transition-all">
                <Building2 className="w-4 h-4" /> View Properties
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentsModule;
