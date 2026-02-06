
import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Eye, Edit3, Copy, Trash2, MapPin, Star, ChevronDown, Lock, Globe, Check } from 'lucide-react';
import { Property, PropertyStatus, Visibility } from '../types';

interface PropertyTableProps {
  properties: Property[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onEdit: (property: Property) => void;
  onDelete: (id: string) => void;
  onQuickView: (property: Property) => void;
  onStatusChange: (id: string, status: PropertyStatus) => void;
  onVisibilityChange: (id: string, visibility: Visibility) => void;
}

const PropertyTable: React.FC<PropertyTableProps> = ({
  properties,
  selectedIds,
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onQuickView,
  onStatusChange,
  onVisibilityChange
}) => {
  const isAllSelected = properties.length > 0 && selectedIds.length === properties.length;
  const [activeMenu, setActiveMenu] = useState<{ id: string, type: 'status' | 'visibility' | 'actions' } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = (e: React.MouseEvent, id: string, type: 'status' | 'visibility' | 'actions') => {
    e.stopPropagation();
    if (activeMenu?.id === id && activeMenu?.type === type) {
      setActiveMenu(null);
    } else {
      setActiveMenu({ id, type });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-md">
          <tr className="border-b border-gray-100">
            <th className="px-6 py-4 w-12">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={onSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-[#112922] focus:ring-[#112922]"
              />
            </th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Property</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Location</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Specs</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Price (AED)</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Visibility</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {properties.map((property) => (
            <tr key={property.id} className={`hover:bg-gray-50/50 transition-colors group ${selectedIds.includes(property.id) ? 'bg-emerald-50/30' : ''}`}>
              <td className="px-6 py-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(property.id)}
                  onChange={() => onSelect(property.id)}
                  className="w-4 h-4 rounded border-gray-300 text-[#112922] focus:ring-[#112922]"
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer" onClick={() => onQuickView(property)}>
                    <img src={property.imageUrl} alt={property.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    {property.isFeatured && (
                      <div className="absolute top-0 left-0 p-1 bg-amber-400 rounded-br-lg shadow-sm">
                        <Star className="w-2.5 h-2.5 text-white fill-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4
                      className="text-sm font-bold text-[#112922] group-hover:text-emerald-800 transition-colors cursor-pointer"
                      onClick={() => onQuickView(property)}
                    >
                      {property.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest">{property.type}</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${(property as any).listing_type === 'Rent' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                        {(property as any).listing_type || 'Sale'}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  {property.location}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-xs font-medium text-gray-600">
                  {property.bedrooms} BHK • {property.bathrooms} Bath
                  <p className="text-[10px] text-gray-400 mt-0.5">{property.area.toLocaleString()} sqft</p>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-bold text-[#112922]">
                  {property.price.toLocaleString()}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="relative inline-block">
                  <button
                    onClick={(e) => toggleMenu(e, property.id, 'status')}
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full transition-all ${property.status === 'Available' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' :
                      property.status === 'Sold' ? 'bg-red-50 text-red-600 hover:bg-red-100' :
                        property.status === 'Reserved' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' :
                          'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                    {property.status}
                    <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-200 ${activeMenu?.id === property.id && activeMenu?.type === 'status' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeMenu?.id === property.id && activeMenu?.type === 'status' && (
                    <div ref={menuRef} className="absolute left-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      {(['Available', 'Sold', 'Reserved', 'Off-Market'] as PropertyStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => { onStatusChange(property.id, s); setActiveMenu(null); }}
                          className="w-full text-left px-4 py-2 text-[10px] font-bold text-gray-600 hover:bg-gray-50 hover:text-[#112922] flex items-center justify-between"
                        >
                          {s}
                          {property.status === s && <Check className="w-3 h-3 text-emerald-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="relative inline-block">
                  <button
                    onClick={(e) => toggleMenu(e, property.id, 'visibility')}
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${property.visibility === 'Public' ? 'border-gray-100 text-gray-600 hover:bg-gray-50' : 'border-[#112922]/20 bg-[#112922]/5 text-[#112922] hover:bg-[#112922]/10'
                      }`}>
                    {property.visibility === 'Public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {property.visibility}
                    <ChevronDown className={`w-3 h-3 opacity-50 transition-transform duration-200 ${activeMenu?.id === property.id && activeMenu?.type === 'visibility' ? 'rotate-180' : ''}`} />
                  </button>
                  {activeMenu?.id === property.id && activeMenu?.type === 'visibility' && (
                    <div ref={menuRef} className="absolute left-0 top-full mt-1 w-40 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                      {(['Public', 'Private Vault'] as Visibility[]).map((v) => (
                        <button
                          key={v}
                          onClick={() => { onVisibilityChange(property.id, v); setActiveMenu(null); }}
                          className="w-full text-left px-4 py-2 text-[10px] font-bold text-gray-600 hover:bg-gray-50 hover:text-[#112922] flex items-center gap-2"
                        >
                          {v === 'Public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {v}
                          {property.visibility === v && <Check className="w-3 h-3 text-emerald-500 ml-auto" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onQuickView(property)}
                    className="p-2 text-gray-400 hover:text-[#112922] hover:bg-gray-100 rounded-lg transition-all"
                    title="Quick Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEdit(property)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#112922] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-900 transition-all shadow-sm"
                  >
                    <Edit3 className="w-3 h-3" /> Update
                  </button>
                  <div className="relative">
                    <button
                      onClick={(e) => toggleMenu(e, property.id, 'actions')}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {activeMenu?.id === property.id && activeMenu?.type === 'actions' && (
                      <div ref={menuRef} className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <button className="w-full text-left px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                          <Copy className="w-3 h-3" /> Duplicate
                        </button>
                        <button
                          onClick={() => { onDelete(property.id); setActiveMenu(null); }}
                          className="w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-red-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PropertyTable;
