import React from 'react';
import { Plus, Users, Mail, Settings, ArrowRight } from 'lucide-react';

interface QuickActionsProps {
  onTabChange: (tab: string) => void;
}

const AISuggestion: React.FC<QuickActionsProps> = ({ onTabChange }) => {
  const actions = [
    {
      label: 'Add Property',
      icon: Plus,
      tab: 'properties',
    },
    {
      label: 'View Leads',
      icon: Users,
      tab: 'leads',
    },
    {
      label: 'Campaigns',
      icon: Mail,
      tab: 'newsletter',
    },
    {
      label: 'Settings',
      icon: Settings,
      tab: 'settings',
    }
  ];

  return (
    <div className="bg-[#112922] rounded-2xl p-6 relative overflow-hidden h-full flex flex-col justify-between text-left border border-[#112922] group hover:border-[#C5A059]/20 transition-colors duration-500">
      
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#1a3c32_0%,_transparent_50%)] pointer-events-none opacity-60" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#C5A059]/10 rounded-full blur-[50px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mb-6">
        <h3 className="text-xl font-serif text-white tracking-tight mb-1">Quick Access</h3>
        <p className="text-white/40 text-[11px] uppercase tracking-widest font-medium">Manage your workspace</p>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => onTabChange(action.tab)}
            className="flex flex-col items-start justify-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#C5A059]/40 transition-all duration-300 group/btn h-24 relative overflow-hidden"
          >
             {/* Hover Gradient */}
             <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />

            <div className="mb-auto p-2 bg-[#1a3c32] rounded-lg text-[#C5A059] group-hover/btn:text-white group-hover/btn:bg-[#C5A059] transition-colors duration-300">
              <action.icon className="w-4 h-4" />
            </div>
            
            <div className="w-full flex items-center justify-between mt-2">
              <span className="text-white/80 text-xs font-medium group-hover/btn:text-white transition-colors">
                {action.label}
              </span>
              <ArrowRight className="w-3 h-3 text-white/20 -translate-x-2 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AISuggestion;
