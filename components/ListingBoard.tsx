import React, { useEffect, useState } from 'react';
import { MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { getAdminProperties } from '../api';

const ListingBoard: React.FC = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await getAdminProperties();
        if (response.status === 'success') {
          // Show latest 4 properties
          setProperties(response.data.slice(0, 4));
        }
      } catch (error) {
        console.error("Error fetching properties for board:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-2 flex items-center justify-center h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#112922]" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-2">
      <div className="flex items-center justify-between mb-6 text-left">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-[#112922]">Listing Board</h3>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Live Updates</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-xs font-bold text-[#112922] hover:underline">
            Manage All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="group cursor-pointer text-left">
            <div className="relative rounded-2xl overflow-hidden mb-3 aspect-[4/3] bg-gray-50">
              <img
                src={property.image || 'https://images.unsplash.com/photo-1600607687940-c52af084399c?q=80&w=400&auto=format&fit=crop'}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-md ${property.status === 'active' || property.status === 'Available' ? 'bg-emerald-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                  {property.status === 'active' ? 'Available' : property.status}
                </span>
              </div>
            </div>
            <h4 className="font-bold text-[#112922] text-sm group-hover:text-emerald-700 transition-colors truncate">{property.title}</h4>
            <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{property.location}</span>
            </div>
            <p className="text-[#112922] font-black text-lg">
              {property.price.toString().includes('AED') ? property.price : `AED ${typeof property.price === 'number' ? (property.price / 1000000).toFixed(1) + 'M' : property.price}`}
            </p>
          </div>
        ))}
        {properties.length === 0 && (
          <div className="col-span-4 py-20 text-center text-gray-400 text-sm">
            No properties found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingBoard;
