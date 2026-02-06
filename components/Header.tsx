import React, { useState, useEffect } from 'react';
import { Search, Calendar, Download, ChevronDown, Bell } from 'lucide-react';
import { getAdminInquiries, getNewsletterSubscribers } from '../api';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  onInquirySelect: (id: string) => void;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onInquirySelect, onTabChange }) => {
  const { t, language, setLanguage } = useLanguage();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '2024-05-05', end: '2024-06-05' });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [newInquiryCount, setNewInquiryCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const [inqRes, newsRes] = await Promise.all([
        getAdminInquiries(),
        getNewsletterSubscribers()
      ]);

      if (inqRes.status === 'success' && newsRes.status === 'success') {
        const inqs = inqRes.data.map((i: any) => ({ ...i, type: 'inquiry' }));
        const news = newsRes.data.map((s: any) => ({
          ...s,
          type: 'subscriber',
          name: s.email,
          message: 'Just joined the "Market Insights" newsletter.',
          status: 'new'
        }));

        const combined = [...inqs, ...news].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setNotifications(combined.slice(0, 15));
        setNewInquiryCount(inqs.filter((i: any) => i.status === 'new').length + news.length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (item: any) => {
    if (item.type === 'inquiry') {
      onInquirySelect(item.id.toString());
    } else {
      onTabChange('newsletter');
    }
    setIsNotifOpen(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  };

  const handleExport = () => {
    const reportData = "Report Date,Type,Value\n" +
      `${new Date().toISOString()},Overview,Summary Report`;
    const blob = new Blob([reportData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overview_report_${dateRange.start}_to_${dateRange.end}.csv`;
    a.click();
  };

  return (
    <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center gap-8 flex-1 max-w-2xl text-left">
        <h1 className="text-2xl font-bold text-[#112922]">{t('overview')}</h1>
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 transition-colors group-focus-within:text-[#112922] rtl:left-auto rtl:right-4" />
          <input
            type="text"
            placeholder={t('search_placeholder')}
            className="w-full bg-gray-50 border border-transparent focus:border-[#112922]/20 focus:bg-white focus:ring-4 focus:ring-[#112922]/5 rounded-xl py-2.5 pl-11 pr-4 text-sm transition-all outline-none rtl:pl-4 rtl:pr-11"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Switcher */}


        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2.5 text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-xl relative transition-colors"
          >
            <Bell className="w-5 h-5" />
            {newInquiryCount > 0 && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 border-2 border-white rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                {newInquiryCount}
              </span>
            )}
          </button>
          {isNotifOpen && (
            <div className="absolute top-12 right-0 w-96 bg-white border border-gray-100 shadow-xl rounded-2xl p-0 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 text-left">
              <div className="p-4 border-b border-gray-50 flex justify-between items-center">
                <h4 className="font-bold text-[#112922]">Lead Intelligence</h4>
                <span className="text-[10px] font-bold bg-[#112922] text-white px-2 py-0.5 rounded-full">{newInquiryCount} Active Items</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? notifications.map((item, i) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-all ${item.type === 'subscriber' ? 'bg-blue-50/30' : 'bg-emerald-50/40'}`}
                  >
                    <div className="flex justify-between items-start mb-1 text-left">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${item.type === 'subscriber' ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {item.type === 'subscriber' ? 'Newsletter Join' : 'Property Lead'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-black text-[#112922] text-left">{item.name || item.email}</p>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 italic leading-relaxed text-left">
                      "{item.message}"
                    </p>
                  </div>
                )) : (
                  <div className="p-8 text-center text-gray-400 text-xs">No notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#112922] text-white rounded-xl font-medium hover:bg-[#1a3a30] transition-all shadow-lg shadow-[#112922]/20"
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
