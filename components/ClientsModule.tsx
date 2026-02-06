
import React, { useState } from 'react';
import {
  Users, UserCheck, Briefcase, DollarSign, RotateCcw,
  Search, Filter, ChevronDown, Download, MoreHorizontal,
  Mail, Phone, MessageSquare, Calendar, FileText,
  TrendingUp, Sparkles, X, ArrowUpRight, MapPin,
  Building2, History, Clock
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList
} from 'recharts';
import { getAdminInquiries, updateInquiryStatus, deleteInquiry as deleteInquiryApi } from '../api';
import { useEffect } from 'react';

const interestData = [
  { name: 'Apartment', value: 40 },
  { name: 'Villa', value: 35 },
  { name: 'Penthouse', value: 15 },
  { name: 'Townhouse', value: 10 },
];

const funnelData = [
  { value: 100, name: 'Enquiry', fill: '#112922' },
  { value: 80, name: 'Qualified', fill: '#1a3a30' },
  { value: 50, name: 'Site Visit', fill: '#234b3e' },
  { value: 20, name: 'Negotiation', fill: '#2c5d4c' },
  { value: 12, name: 'Closed', fill: '#356e5a' },
];

const COLORS = ['#112922', '#2a5a4a', '#448c72', '#a8c6ba'];

const ClientKPICard = ({ label, value, trend, trendValue, icon: Icon }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-[#112922]">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-green-600 bg-green-50">
        <TrendingUp className="w-3 h-3" />
        {trendValue}%
      </div>
    </div>
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-2xl font-black text-[#112922]">{value}</h3>
  </div>
);

interface ClientsModuleProps {
  initialSelectedId?: string | null;
  onInquirySelect?: (id: string | null) => void;
}

const ClientsModule: React.FC<ClientsModuleProps> = ({ initialSelectedId, onInquirySelect }) => {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInquiries = async () => {
    try {
      const response = await getAdminInquiries();
      if (response.status === 'success') {
        const data = response.data;
        setInquiries(data);

        // Auto-select if requested externally
        if (initialSelectedId) {
          const inq = data.find((i: any) => i.id.toString() === initialSelectedId);
          if (inq) {
            // Map to client object
            const clientObj = {
              id: inq.id.toString(),
              name: inq.name,
              email: inq.email,
              phone: inq.phone,
              agent: 'Unassigned',
              budget: inq.property?.price ? `AED ${inq.property.price.toLocaleString()}` : 'N/A',
              type: inq.property?.title || 'General Enquiry',
              stage: inq.status === 'new' ? 'Enquiry' : inq.status === 'contacted' ? 'Qualified' : 'Closed',
              status: inq.status || 'new',
              lastActivity: inq.created_at?.split('T')[0],
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(inq.name)}&background=112922&color=fff`,
              message: inq.message,
              propertyId: inq.property_id
            };
            setSelectedClient(clientObj);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [initialSelectedId]);

  const handleCloseDrawer = () => {
    setSelectedClient(null);
    if (onInquirySelect) onInquirySelect(null);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const response = await updateInquiryStatus(id, newStatus);
      if (response.status === 'success') {
        setInquiries(prev => prev.map(inq => inq.id.toString() === id ? { ...inq, status: newStatus } : inq));
        if (selectedClient && selectedClient.id === id) {
          setSelectedClient({ ...selectedClient, status: newStatus });
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const response = await deleteInquiryApi(id);
      if (response.status === 'success') {
        setInquiries(prev => prev.filter(inq => inq.id.toString() !== id));
        setSelectedClient(null);
      }
    } catch (error) {
      console.error("Error deleting inquiry:", error);
    }
  };

  const clients = inquiries.map(inq => ({
    id: inq.id.toString(),
    name: inq.name,
    email: inq.email,
    phone: inq.phone,
    agent: 'Unassigned',
    budget: inq.property?.price ? `AED ${inq.property.price.toLocaleString()}` : 'N/A',
    type: inq.property?.title || 'General Enquiry',
    stage: inq.status === 'new' ? 'Enquiry' : inq.status === 'contacted' ? 'Qualified' : 'Closed',
    status: inq.status || 'new',
    lastActivity: inq.created_at?.split('T')[0],
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(inq.name)}&background=112922&color=fff`,
    message: inq.message,
    propertyId: inq.property_id
  }));

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#112922]">Client Relationship</h1>
          <p className="text-sm text-gray-500">Manage high-net-worth investor journeys and deal pipelines.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const headers = ["ID", "Name", "Email", "Phone", "Type", "Budget", "Status"];
              const csvContent = [
                headers.join(","),
                ...clients.map(c => [
                  c.id,
                  `"${c.name}"`,
                  c.email,
                  c.phone,
                  `"${c.type}"`,
                  `"${c.budget}"`,
                  c.status
                ].join(","))
              ].join("\n");

              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement("a");
              if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                const dateStr = new Date().toISOString().split('T')[0];
                link.setAttribute("download", `skyza_inquiries_report_${dateStr}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#112922] text-white rounded-xl text-xs font-bold hover:bg-emerald-950 transition-all shadow-lg shadow-[#112922]/20">
            <Download className="w-4 h-4" />
            Export CRM Data
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <ClientKPICard label="Total Active Clients" value="1,240" trendValue="8.4" icon={Users} />
        <ClientKPICard label="High-Value (10M+)" value="180" trendValue="12.2" icon={UserCheck} />
        <ClientKPICard label="Deals in Progress" value="45" trendValue="5.1" icon={Briefcase} />
        <ClientKPICard label="Avg Deal Size" value="AED 6.2M" trendValue="2.4" icon={DollarSign} />
        <ClientKPICard label="Repeat Rate" value="12%" trendValue="1.5" icon={RotateCcw} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deal Stage Funnel */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-[#112922] mb-8 uppercase tracking-widest">Deal Stage Funnel</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  <LabelList position="right" fill="#94a3b8" stroke="none" dataKey="name" fontSize={10} fontWeight={700} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Client Interest Donut */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-[#112922] mb-8 uppercase tracking-widest">Interest Distribution</h3>
          <div className="flex-1 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={interestData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                  {interestData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-y-2 mt-6">
            {interestData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-[10px] font-bold text-gray-500 uppercase">{item.name}</span>
                <span className="text-[10px] font-black text-[#112922] ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Client Insights */}
        <div className="bg-[#112922] p-8 rounded-3xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold">Client Intelligence</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[11px] text-white/90 leading-relaxed">
                  <span className="text-emerald-400 font-bold">Alexander Volkov</span> has 78% closing probability. Prefers Palm Jumeirah waterfront villas. Follow-up recommended within 24h.
                </p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[11px] text-white/90 leading-relaxed">
                  <span className="text-emerald-400 font-bold">High Intent Alert:</span> 12 new enquiries from the HK market matching our high-value penthouse portfolio.
                </p>
              </div>
            </div>
          </div>
          <button className="w-full mt-8 bg-white/10 text-white text-xs font-bold py-3.5 rounded-xl border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2">
            View Value Analytics <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Client Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div className="relative w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by client name, email or agent..."
              className="w-full bg-gray-50/50 border border-transparent focus:border-[#112922]/10 focus:bg-white rounded-xl py-2.5 pl-11 pr-4 text-xs transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50">
              <Filter className="w-3.5 h-3.5" /> All Status
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50">
              <Calendar className="w-3.5 h-3.5" /> Date Added
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50">
              <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Client Profile</th>
                <th className="px-6 py-4">Budget Range</th>
                <th className="px-6 py-4">Deal Stage</th>
                <th className="px-6 py-4">Assigned Agent</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedClient(client)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={client.avatar} className="w-10 h-10 rounded-xl object-cover" alt={client.name} />
                      <div>
                        <h4 className="text-sm font-bold text-[#112922]">{client.name}</h4>
                        <p className="text-[10px] text-gray-400">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-[#112922]">{client.budget}</div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{client.type}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${client.status === 'new' ? 'bg-blue-50 text-blue-600' :
                      client.status === 'contacted' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                      {client.stage}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-600">{client.agent}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${client.status === 'new' ? 'bg-blue-500' :
                        client.status === 'contacted' ? 'bg-emerald-500' :
                          'bg-gray-300'
                        }`} />
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{client.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(client.id);
                        }}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Client Detail Side Drawer */}
      {selectedClient && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={handleCloseDrawer} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={selectedClient.avatar} className="w-16 h-16 rounded-2xl object-cover" alt="" />
                <div>
                  <h2 className="text-2xl font-bold text-[#112922]">{selectedClient.name}</h2>
                  <p className="text-sm text-gray-400">Inquiry ID: #INQ-{selectedClient.id}</p>
                </div>
              </div>
              <button onClick={handleCloseDrawer} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => window.open(`mailto:${selectedClient.email}`)}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all">
                  <Mail className="w-5 h-5 text-[#112922]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Email Client</span>
                </button>
                <button
                  onClick={() => window.open(`https://wa.me/${selectedClient.phone.replace(/[^0-9]/g, '')}`)}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all">
                  <MessageSquare className="w-5 h-5 text-[#112922]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">WhatsApp</span>
                </button>
              </div>

              {/* Inquiry Message */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Inquiry Message</h4>
                <p className="text-sm text-[#112922] leading-relaxed whitespace-pre-wrap">
                  {selectedClient.message}
                </p>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Investment Profile</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400">Budget/Property</p>
                      <p className="text-sm font-bold text-[#112922]">{selectedClient.budget}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400">Reference</p>
                      {selectedClient.propertyId ? (
                        <a
                          href={`/property/${selectedClient.propertyId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-[#112922] hover:text-gold flex items-center gap-1 group"
                        >
                          {selectedClient.type}
                          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>
                      ) : (
                        <p className="text-sm font-bold text-[#112922]">{selectedClient.type}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Contact Details</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400">Phone Number</p>
                      <p className="text-sm font-bold text-[#112922]">{selectedClient.phone}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400">Discovery Date</p>
                      <p className="text-sm font-bold text-[#112922]">{selectedClient.lastActivity}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Management */}
              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Management Status</h4>
                <div className="flex gap-2">
                  {['new', 'contacted', 'closed'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedClient.id, status)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedClient.status === status
                        ? 'bg-[#112922] text-white shadow-lg'
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-gray-100 flex gap-4 bg-gray-50/50">
              <button
                onClick={() => handleStatusUpdate(selectedClient.id, 'contacted')}
                className="flex-1 py-3 bg-[#112922] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#112922]/20 hover:bg-emerald-950 transition-all">
                Mark as Contacted
              </button>
              <button
                onClick={() => handleDelete(selectedClient.id)}
                className="px-6 py-3 border border-red-100 text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsModule;
