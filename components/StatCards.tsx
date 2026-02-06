
import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, ArrowRight, Loader2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getDashboardStats } from '../api';
import { useLanguage } from '../context/LanguageContext';

interface CardProps {
  label: string;
  value: string;
  subValue: string;
  growth: number;
  trend: 'up' | 'down';
  color: string;
}

const StatCard: React.FC<CardProps> = ({ label, value, subValue, growth, trend, color }) => {
  const { t } = useLanguage();
  // Mini chart mock data
  const data = Array.from({ length: 10 }, () => ({ val: Math.floor(Math.random() * 50) + 10 }));

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <h3 className="text-3xl font-bold text-[#112922]">{value}</h3>
        </div>
        <div className="w-20 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <Area
                type="monotone"
                dataKey="val"
                stroke={color}
                fill={color}
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded-full ${trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {growth}%
          </div>
          <span className="text-xs text-gray-400 font-medium">{subValue}</span>
        </div>
        <button className="text-xs font-bold text-[#112922] flex items-center gap-1 group-hover:gap-2 transition-all">
          {t('view_more')} <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

const StatCards: React.FC = () => {
  const { t } = useLanguage();
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
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-[#112922]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        label={t('total_properties')}
        value={stats?.total_properties?.toLocaleString() || '0'}
        subValue={t('lifetime_count')}
        growth={12}
        trend="up"
        color="#10B981"
      />
      <StatCard
        label={t('active_listings')}
        value={stats?.active_properties?.toLocaleString() || '0'}
        subValue={t('live_on_website')}
        growth={stats?.active_properties > 0 ? 5 : 0}
        trend="up"
        color="#F59E0B"
      />
      <StatCard
        label={t('sold_properties')}
        value={stats?.sold_properties?.toLocaleString() || '0'}
        subValue={t('successful_deals')}
        growth={2}
        trend="up"
        color="#6366F1"
      />
      <StatCard
        label="Leads & Subscribers"
        value={((stats?.total_inquiries || 0) + (stats?.total_subscribers || 0)).toLocaleString()}
        subValue={`${stats?.total_subscribers || 0} newsletter joins`}
        growth={15}
        trend="up"
        color="#EC4899"
      />
    </div>
  );
};

export default StatCards;
