
import React from 'react';
import {
    LayoutDashboard,
    Building2,
    Key,
    BadgeDollarSign,
    Users,
    Contact,
    Sparkles,
    Settings,
    LogOut,
    Layout,
    Mail,
    MapPin,
    Globe,
    FileText,
    MessageSquare
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, onLogout }) => {
    const { t } = useLanguage();
    const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');

    const menuItems = [
        { id: 'overview', label: t('overview'), icon: LayoutDashboard },
        { id: 'properties', label: t('properties'), icon: Building2 },
        { id: 'leads', label: t('leads'), icon: Contact },
        { id: 'sales', label: t('sales'), icon: BadgeDollarSign },
        { id: 'rent', label: t('rentals'), icon: Key },
        { id: 'inquiries', label: 'Inquiries', icon: Mail },
        { id: 'blog', label: 'Blog Posts', icon: FileText },
        { id: 'newsletter', label: 'Newsletter', icon: Mail },
        { id: 'team', label: 'Team Members', icon: Users },
        { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
        { id: 'seo', label: 'SEO Manager', icon: Globe },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-50 rtl:left-auto rtl:right-0 rtl:border-l rtl:border-r-0">
            <div className="p-4 flex items-center gap-2">
                <div className="flex flex-col">
                    <span className="text-xl font-bold text-[#112922] tracking-tight">Skyza</span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Properties</span>
                </div>
            </div>

            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group ${activeTab === item.id
                            ? 'bg-[#112922] text-white shadow-lg shadow-[#112922]/20'
                            : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <item.icon className={`w-4 h-4 flex-shrink-0 ${activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-[#112922]'}`} />
                        <span className="font-medium text-sm">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 mt-auto border-t border-gray-50">
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
                    <img
                        src={`https://ui-avatars.com/api/?name=${adminUser.name || 'Admin'}&background=112922&color=fff&rounded=true`}
                        alt="User"
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#112922] truncate">{adminUser.name || 'Skyza Admin'}</p>
                        <p className="text-[10px] text-gray-500 truncate">{adminUser.role || 'Super Admin'}</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1.5 flex-shrink-0"
                        title="Log Out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
