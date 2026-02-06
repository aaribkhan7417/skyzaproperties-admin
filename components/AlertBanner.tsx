import React, { useEffect, useState } from 'react';
import { UserCheck, ArrowRight, Loader2, Mail, User } from 'lucide-react';
import { getDashboardStats } from '../api';

interface AlertBannerProps {
  onInquirySelect: (id: string) => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ onInquirySelect }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const response = await getDashboardStats();
        if (response.status === 'success') {
          setData(response.data);
        }
      } catch (error) {
        console.error("Error fetching latest stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  if (loading) return null;

  const latestInquiry = data?.latest_inquiry;
  const latestSubscriber = data?.latest_subscriber;

  // Decide which one to show (show the absolute latest)
  const showSubscriber = latestSubscriber && (!latestInquiry || new Date(latestSubscriber.created_at) > new Date(latestInquiry.created_at));

  if (!latestInquiry && !latestSubscriber) {
    return (
      <div className="bg-[#112922] rounded-2xl p-6 relative overflow-hidden flex items-center justify-between text-left">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
            <UserCheck className="text-white w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-bold text-lg">No recent activity found</h4>
            <p className="text-white/60 text-sm">Your website is live. New leads and subscribers will appear here.</p>
          </div>
        </div>
      </div>
    );
  }

  if (showSubscriber) {
    return (
      <div className="bg-[#112922] rounded-2xl p-6 relative overflow-hidden flex items-center justify-between group text-left transition-all hover:shadow-2xl hover:shadow-[#112922]/20">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
            <Mail className="text-white w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-bold text-lg tracking-tight">
              New Newsletter Join: {latestSubscriber.email}
            </h4>
            <p className="text-white/60 text-sm italic">
              "Just joined the Market Insights newsletter."
            </p>
          </div>
        </div>
        <div className="text-white/30 text-[10px] font-bold uppercase tracking-widest absolute right-6 top-4">
          Recent Activity
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#112922] rounded-2xl p-6 relative overflow-hidden flex items-center justify-between group text-left">
      <div className="flex items-center gap-6 relative z-10 text-left">
        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
          <User className="text-white w-6 h-6" />
        </div>
        <div className="max-w-[600px]">
          <h4 className="text-white font-bold text-lg tracking-tight">
            New Lead: {latestInquiry.name} is interested in {latestInquiry.property?.title || 'a property'}
          </h4>
          <p className="text-white/60 text-[10px] line-clamp-1 italic">
            "{latestInquiry.message}"
          </p>
        </div>
      </div>

      <button
        onClick={() => onInquirySelect(latestInquiry.id.toString())}
        className="bg-white text-[#112922] font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-all shadow-xl shadow-black/10 flex items-center gap-2 group relative z-10 whitespace-nowrap">
        Analyze Lead
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default AlertBanner;
