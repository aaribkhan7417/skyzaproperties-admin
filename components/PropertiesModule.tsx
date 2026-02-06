
import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Filter, LayoutGrid, List, ChevronRight,
  Edit3 as LucideEdit3, TrendingUp, X, MapPin,
  Eye, Calendar, BarChart2, Zap, Lock, Globe, Download
} from 'lucide-react';
import PropertyTable from './PropertyTable';
import PropertyForm from './PropertyForm';
import { Property, PropertyType, PropertyStatus, Visibility } from '../types';
import { getAdminProperties, createProperty, updateProperty, deleteProperty } from '../api';
import { useEffect } from 'react';



const KPICard = ({ label, value, trend, trendValue, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${trend === 'up' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'}`}>
        {trend === 'up' ? '+' : '-'}{trendValue}%
      </div>
    </div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-black text-[#112922]">{value}</h3>
    </div>
  </div>
);

const PropertiesModule: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await getAdminProperties();
      let dbProperties: any[] = [];

      if (response.status === 'success') {
        dbProperties = response.data.map((p: any) => {
          // Auto-assign category if missing based on known titles
          let category = p.category;
          if (!category) {
            const title = p.title;
            const readyTitles = [
              'Opera District Residences', 'Marina Gate Exclusive', 'Canal Front Residences', 'Marina Bliss Suite',
              'Maple Family Estate', 'Emerald Hills Townhouse', 'Jumeirah Islands Garden', 'The Royal Frond Palace'
            ];
            const offPlanTitles = ['Seaside Ritual', 'The Heights Country Club', 'Zenith Skylofts', 'Oasis Terraces', 'Palace Residences', 'Velvet Residences'];
            const primeTitles = ['Burj Vista Sky Collection', 'Frond M Signature Villa', 'Azure Heights Palm'];

            if (readyTitles.includes(title)) category = 'ready';
            else if (offPlanTitles.includes(title)) category = 'off_plan';
            else if (primeTitles.includes(title)) category = 'prime';
          }

          return {
            ...p,
            name: p.title,
            area: p.area_sqft,
            isFeatured: !!p.featured,
            dateAdded: p.created_at?.split('T')[0],
            imageUrl: p.image || 'https://images.unsplash.com/photo-1600607687940-c52af084399c?q=80&w=400&auto=format&fit=crop',
            status: p.status === 'active' ? 'Available' : (p.status === 'sold' ? 'Sold' : 'Reserved'),
            category: category,
            visibility: p.featured ? 'Public' : 'Private Vault'
          };
        });
      }

      setProperties(dbProperties);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedVisibility, setSelectedVisibility] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Location options matching website
  const locations = ['All', 'Downtown Dubai', 'Palm Jumeirah', 'Dubai Marina', 'Business Bay', 'JVC', 'Dubai Hills', 'JLT', 'Al Barari'];

  // Category sections - Matching database values
  const categories = [
    { id: 'All', label: 'All Properties', icon: '🏢' },
    { id: 'off_plan', label: 'First Launches', icon: '🚀' },
    { id: 'ready', label: 'Ready Assets', icon: '✨' },
    { id: 'prime', label: 'Prime City', icon: '💎' }
  ];

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'All' || p.type === selectedType;
      const matchesVisibility = selectedVisibility === 'All' || p.visibility === selectedVisibility;
      const matchesLocation = selectedLocation === 'All' || p.location === selectedLocation;

      // Category logic - Use the database field but also allow smart fallback based on location for Prime City
      let matchesCategory = selectedCategory === 'All';

      if (!matchesCategory) {
        if (selectedCategory === 'prime') {
          // Show in Prime City if category is prime OR location is a prime location
          const primeLocations = ['Palm Jumeirah', 'Downtown Dubai', 'Dubai Marina', 'Business Bay'];
          const isPrimeLoc = p.location && primeLocations.some(loc => p.location.includes(loc));
          matchesCategory = p.category === 'prime' || isPrimeLoc;
        } else {
          matchesCategory = p.category === selectedCategory;
        }
      }

      // Status filter
      const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;

      return matchesSearch && matchesType && matchesVisibility && matchesLocation && matchesCategory && matchesStatus;
    });
  }, [properties, searchQuery, selectedType, selectedVisibility, selectedLocation, selectedCategory, selectedStatus]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(prev => prev.length === filteredProperties.length ? [] : filteredProperties.map(p => p.id));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property? This action is permanent.')) {
      try {
        await deleteProperty(id);
        setProperties(properties.filter(p => p.id !== id));
        setSelectedIds(prev => prev.filter(i => i !== id));
      } catch (error) {
        alert("Failed to delete property");
      }
    }
  };

  const handleStatusChange = async (id: string, newStatusLabel: PropertyStatus) => {
    // 1. Map Frontend Label -> Backend Value
    let backendStatus = 'active';
    switch(newStatusLabel) {
        case 'Available': backendStatus = 'active'; break;
        case 'Sold': backendStatus = 'sold'; break;
        case 'Reserved': backendStatus = 'reserved'; break;
        case 'Off-Market': backendStatus = 'inactive'; break;
        default: backendStatus = 'active'; 
    }

    // 2. Optimistic UI Update
    setProperties(prev => prev.map(p => p.id === id ? { ...p, status: newStatusLabel } : p));

    try {
        // 3. API Call
        const response = await updateProperty(id, { status: backendStatus });
        if (response.status !== 'success') {
             throw new Error("Failed to update status");
        }
    } catch (error) {
        console.error("Status update error", error);
        // Revert on failure
        fetchProperties(); 
        alert("Failed to update status on server.");
    }
  };

  const handleVisibilityChange = async (id: string, newVisibility: Visibility) => {
    // 1. Map Frontend Label -> Backend Value (using 'featured' as proxy for Public/Private per current logic)
    const isFeatured = newVisibility === 'Public';

    // 2. Optimistic UI Update
    setProperties(prev => prev.map(p => p.id === id ? { ...p, visibility: newVisibility, isFeatured: isFeatured } : p));

    try {
        // 3. API Call
        const response = await updateProperty(id, { featured: isFeatured });
        if (response.status !== 'success') {
             throw new Error("Failed to update visibility");
        }
    } catch (error) {
        console.error("Visibility update error", error);
        // Revert
        fetchProperties();
        alert("Failed to update visibility.");
    }
  };

  // Fix: Defined handleEdit to manage editing state and opening the form
  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      let response;

      if (editingProperty) {
        response = await updateProperty(editingProperty.id, data);
      } else {
        response = await createProperty(data);
      }

      if (response && response.status === 'success') {
        // Force refresh with a slight delay to ensure DB write completion
        setTimeout(() => {
          fetchProperties();
        }, 500);
        setIsFormOpen(false);
        setEditingProperty(null);
      } else {
        throw new Error(response?.message || 'Operation failed');
      }
    } catch (error: any) {
      console.error("Save error:", error);
      let errorMsg = "Failed to save property. Please check your data.";
      if (error.response && error.response.data && error.response.data.errors) {
        // Format validation errors
        const errors = error.response.data.errors;
        const messages = Object.keys(errors).map(key => `${key}: ${errors[key].join(', ')}`);
        errorMsg = "Validation Failed:\n" + messages.join('\n');
      } else if (error.message) {
        errorMsg = error.message;
      }
      alert(errorMsg);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative pb-24">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#112922]">Properties Portfolio</h1>
          <p className="text-sm text-gray-500">Manage Dubai's elite luxury listings and private vaults.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-[#112922] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[#112922] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => {
              const headers = ["ID", "Title", "Type", "Price", "Location", "Status", "Date Added"];
              const csvContent = [
                headers.join(","),
                ...properties.map(p => [
                  p.id,
                  `"${p.name.replace(/"/g, '""')}"`, // Handle commas/quotes in title
                  p.type,
                  p.price,
                  `"${p.location.replace(/"/g, '""')}"`,
                  p.status,
                  p.dateAdded || ''
                ].join(","))
              ].join("\n");

              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement("a");
              if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                const dateStr = new Date().toISOString().split('T')[0];
                link.setAttribute("download", `skyza_properties_report_${dateStr}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-[#112922] rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
          >
            <Download className="w-5 h-5" /> Export
          </button>
          <button
            onClick={() => { setEditingProperty(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-[#112922] text-white rounded-xl font-bold hover:bg-emerald-950 transition-all shadow-lg shadow-[#112922]/20"
          >
            <Plus className="w-5 h-5" /> Add Property
          </button>
        </div>
      </div>

      {/* Advanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          label="Portfolio Value"
          value="AED 1.2B"
          trend="up"
          trendValue="8.4"
          icon={BarChart2}
          colorClass="bg-[#112922]/5 text-[#112922]"
        />
        <KPICard
          label="Active Listings"
          value={filteredProperties.length}
          trend="up"
          trendValue="12.2"
          icon={Zap}
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <KPICard
          label="Vault Access"
          value="12 Units"
          trend="down"
          trendValue="2.1"
          icon={Lock}
          colorClass="bg-amber-50 text-amber-600"
        />
        <KPICard
          label="Avg. Conversion"
          value="4.2%"
          trend="up"
          trendValue="0.5"
          icon={TrendingUp}
          colorClass="bg-indigo-50 text-indigo-600"
        />
      </div>

      {/* Category Quick Access Chips */}
      <div className="bg-gradient-to-r from-[#112922] to-emerald-900 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-sm uppercase tracking-wider">Property Categories</h3>
          <span className="text-white/60 text-xs">{filteredProperties.length} properties</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${selectedCategory === cat.id
                ? 'bg-white text-[#112922] shadow-lg scale-105'
                : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                }`}
            >
              <span className="text-lg">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-wrap items-center gap-4 shadow-sm sticky top-24 z-30">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search listings by name, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50/50 border border-transparent focus:border-[#112922]/10 focus:bg-white rounded-xl py-2.5 pl-11 pr-4 text-sm transition-all outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Location Filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 outline-none hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc === 'All' ? '📍 All Locations' : loc}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 outline-none hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <option value="All">All Types</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Penthouse">Penthouse</option>
            <option value="Townhouse">Townhouse</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 outline-none hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
          </select>

          {/* Visibility Filter */}
          <select
            value={selectedVisibility}
            onChange={(e) => setSelectedVisibility(e.target.value)}
            className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 outline-none hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <option value="All">All Visibility</option>
            <option value="Public">Public Only</option>
            <option value="Private Vault">Private Vault</option>
          </select>

          <button
            onClick={() => setIsFiltersOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Filter className="w-4 h-4" /> More Filters
          </button>

          {/* Clear Filters Button */}
          {(selectedCategory !== 'All' || selectedLocation !== 'All' || selectedType !== 'All' || selectedStatus !== 'All' || selectedVisibility !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedLocation('All');
                setSelectedType('All');
                setSelectedStatus('All');
                setSelectedVisibility('All');
                setSearchQuery('');
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600 hover:bg-red-100 transition-all"
            >
              <X className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Property Listing View */}
      {filteredProperties.length > 0 ? (
        viewMode === 'list' ? (
          <PropertyTable
            properties={filteredProperties}
            selectedIds={selectedIds}
            onSelect={toggleSelect}
            onSelectAll={toggleSelectAll}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onQuickView={setPreviewProperty}
            onStatusChange={handleStatusChange}
            onVisibilityChange={handleVisibilityChange}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((p, idx) => (
              <div
                key={p.id}
                className={`group relative flex flex-col bg-white overflow-hidden rounded-2xl border transition-all duration-300 transform hover:-translate-y-2 cursor-pointer shadow-sm hover:shadow-xl ${selectedIds.includes(p.id) ? 'border-[#112922] ring-1 ring-[#112922]' : 'border-gray-100'}`}
                onClick={() => setPreviewProperty(p)}
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden shrink-0">
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                  {/* Category Badge */}
                  {p.category && (
                    <div className="absolute top-4 left-4">
                      <div className="bg-white text-[#112922] text-[8px] uppercase tracking-widest px-2.5 py-1 font-black rounded-lg shadow-sm border border-gray-100">
                        {p.category.replace('_', ' ')}
                      </div>
                    </div>
                  )}

                  {/* Multi-Select */}
                  <div className="absolute top-4 right-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={(e) => { e.stopPropagation(); toggleSelect(p.id); }}
                      className="w-4 h-4 rounded border-gray-300 text-[#112922] focus:ring-[#112922] bg-white/50"
                    />
                  </div>

                  {/* Status Badge */}
                  <div className="absolute bottom-4 right-4">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold text-white uppercase tracking-wider ${p.status === 'Available' ? 'bg-emerald-500' : (p.status === 'Sold' ? 'bg-red-500' : 'bg-amber-500')}`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="absolute bottom-4 left-4">
                    <p className="text-lg font-black text-white tracking-tight">
                      AED {p.price.toLocaleString()}
                      {p.listing_type === 'Rent' || p.rent_frequency ? ' / Year' : ''}
                    </p>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="mb-4">
                    <h4 className="font-bold text-[#112922] text-md line-clamp-1 mb-1">{p.name}</h4>
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 uppercase tracking-widest leading-none">
                      <MapPin className="w-3 h-3" /> {p.location}
                    </p>
                  </div>

                  {/* Stats Grid - Matching frontend style */}
                  <div className="grid grid-cols-2 gap-y-2 py-3 border-y border-gray-50 mb-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{p.bedrooms} BHK</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{p.area} SQFT</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{p.bathrooms} Baths</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                      <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{p.parking} Slots</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewProperty(p); }}
                      className="flex-1 py-2 bg-gray-50 text-[#112922] text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-gray-100 transition-colors border border-gray-100"
                    >
                      Preview
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                      className="flex-1 py-2 bg-[#112922] text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-emerald-900 transition-colors shadow-sm"
                    >
                      Update ✎
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-24 text-center">
          <p className="text-gray-400 font-medium">No luxury properties match your refined search criteria.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedType('All'); setSelectedVisibility('All'); }}
            className="text-[#112922] font-bold mt-2 hover:underline"
          >
            Reset filter view
          </button>
        </div>
      )}

      {/* Advanced Filters Drawer */}
      {isFiltersOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsFiltersOpen(false)} />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#112922]">Advanced Filters</h3>
              <button onClick={() => setIsFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Price Range (AED)</label>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Min" className="w-full bg-gray-50 border border-transparent focus:border-[#112922]/20 focus:bg-white rounded-xl py-2 px-3 text-xs outline-none" />
                  <input type="text" placeholder="Max" className="w-full bg-gray-50 border border-transparent focus:border-[#112922]/20 focus:bg-white rounded-xl py-2 px-3 text-xs outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Bedrooms</label>
                <div className="flex flex-wrap gap-2">
                  {['Studio', '1', '2', '3', '4', '5+'].map(num => (
                    <button key={num} className="px-4 py-2 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:border-[#112922] hover:text-[#112922] transition-all">
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Property Status</label>
                <div className="space-y-2">
                  {['Available', 'Sold', 'Reserved', 'Off-Market'].map(status => (
                    <label key={status} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#112922] focus:ring-[#112922]" />
                      <span className="text-xs font-medium text-gray-600 group-hover:text-[#112922] transition-colors">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 grid grid-cols-2 gap-4">
              <button className="py-3 text-xs font-bold text-gray-400 hover:text-gray-600 transition-all">Clear All</button>
              <button className="py-3 bg-[#112922] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#112922]/20 hover:bg-emerald-950 transition-all">Apply Filters</button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Preview Drawer */}
      {previewProperty && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setPreviewProperty(null)} />
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            <div className="relative h-[240px]">
              <img src={previewProperty.imageUrl} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => setPreviewProperty(null)} className="p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-xl transition-all"><X className="w-5 h-5" /></button>
              </div>
              <div className="absolute bottom-4 left-6">
                <span className="px-3 py-1 bg-[#112922] text-white text-[10px] font-bold rounded-full uppercase tracking-widest">{previewProperty.status}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-bold text-[#112922]">{previewProperty.name}</h2>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Market Price</p>
                    <p className="text-xl font-black text-[#112922]">AED {previewProperty.price.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                  <MapPin className="w-4 h-4" /> {previewProperty.location}
                </div>
                <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Beds</p>
                    <p className="text-sm font-bold text-[#112922]">{previewProperty.bedrooms}</p>
                  </div>
                  <div className="text-center border-x border-gray-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Baths</p>
                    <p className="text-sm font-bold text-[#112922]">{previewProperty.bathrooms}</p>
                  </div>
                  <div className="text-center border-r border-gray-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Area</p>
                    <p className="text-sm font-bold text-[#112922]">{previewProperty.area}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Type</p>
                    <p className="text-sm font-bold text-[#112922]">{previewProperty.type}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Engagement Analytics</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-100 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Eye className="w-5 h-5" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Total Views</p>
                      <p className="text-sm font-bold text-[#112922]">{previewProperty.views?.toLocaleString() || '1,240'}</p>
                    </div>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Calendar className="w-5 h-5" /></div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Enquiries</p>
                      <p className="text-sm font-bold text-[#112922]">{previewProperty.enquiries || '45'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 grid grid-cols-2 gap-4">
              <button
                onClick={() => { handleEdit(previewProperty); setPreviewProperty(null); }}
                className="py-3 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                <LucideEdit3 className="w-4 h-4" /> Edit Details
              </button>
              <button className="py-3 bg-[#112922] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#112922]/20 hover:bg-emerald-950 transition-all flex items-center justify-center gap-2">
                Manage Vault <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <PropertyForm
          property={editingProperty}
          onClose={() => { setIsFormOpen(false); setEditingProperty(null); }}
          onSave={handleSave}
        />
      )}

      {/* Bulk Actions Bar (Sticky) */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-0 right-0 max-w-lg mx-auto bg-[#112922] text-white p-4 rounded-2xl shadow-2xl shadow-black/40 flex items-center justify-between z-50 animate-in slide-in-from-bottom-8 duration-300">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center font-bold text-xs">{selectedIds.length}</div>
            <span className="text-sm font-medium">Selected Listings</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-xs font-bold hover:bg-white/10 rounded-lg transition-all flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" /> Move to Vault
            </button>
            <button className="px-4 py-2 bg-white text-[#112922] text-xs font-bold rounded-lg hover:bg-gray-100 transition-all flex items-center gap-2 shadow-sm">
              <Globe className="w-3.5 h-3.5" /> Publish Publicly
            </button>
          </div>
          <button
            onClick={() => setSelectedIds([])}
            className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertiesModule;
