
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, MapPin, Camera, Info, Radio, TrendingUp, Heart } from 'lucide-react';
import { getAdminLocations, createLocation, updateLocation, deleteLocation } from '../api';

const LocationsModule: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        connectivity: '',
        lifestyle: '',
        roi: '',
        image: null as File | null
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getAdminLocations();
            if (response.status === 'success') setItems(response.data);
        } catch (error) {
            console.error("Error fetching locations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('connectivity', formData.connectivity);
            data.append('lifestyle', formData.lifestyle);
            data.append('roi', formData.roi);
            if (formData.image) {
                data.append('image', formData.image);
            }

            if (editingItem) {
                await updateLocation(editingItem.id, data);
            } else {
                await createLocation(data);
            }
            
            setIsFormOpen(false);
            setEditingItem(null);
            resetForm();
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Failed to save location.");
        }
    };

    const handleDelete = async (id: string | number) => {
        if (window.confirm('Delete this location? This may affect properties assigned to it.')) {
            try {
                await deleteLocation(id);
                setItems(items.filter(i => i.id !== id));
            } catch (error) {
                console.error(error);
                alert("Failed to delete.");
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            connectivity: '',
            lifestyle: '',
            roi: '',
            image: null
        });
        setImagePreview(null);
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            connectivity: item.connectivity || '',
            lifestyle: item.lifestyle || '',
            roi: item.roi || '',
            image: null
        });
        setImagePreview(item.image);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#112922] tracking-tight">Dubai Categories</h1>
                    <p className="text-gray-500 mt-1">Manage districts and neighborhood profiles.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormOpen(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#112922] text-white rounded-xl font-bold shadow-lg shadow-[#112922]/20 hover:bg-[#1a3a30] transition-all"
                >
                    <Plus className="w-5 h-5" />
                    New District
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#112922]"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all relative">
                            <div className="h-48 overflow-hidden relative">
                                {item.image ? (
                                    <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                        <MapPin size={48} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute bottom-4 left-4">
                                    <h3 className="text-xl font-bold text-white">{item.name}</h3>
                                </div>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#112922]/60 bg-gray-50 p-2 rounded-lg">
                                        <TrendingUp size={12} className="text-gold" />
                                        <span>ROI: {item.roi || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#112922]/60 bg-gray-50 p-2 rounded-lg">
                                        <Radio size={12} className="text-gold" />
                                        <span>Conn: {item.connectivity || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button onClick={() => openEdit(item)} className="p-2 bg-white/90 backdrop-blur-md shadow-lg rounded-xl hover:text-[#112922] transition-colors"><Edit3 size={16} /></button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/90 backdrop-blur-md shadow-lg rounded-xl hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-400">No districts added yet</h3>
                            <p className="text-sm text-gray-400">Click the button above to add your first Dubai neighborhood.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <h3 className="text-2xl font-black text-[#112922]">
                                {editingItem ? 'Edit District' : 'Add New District'}
                            </h3>
                            <button onClick={() => setIsFormOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-all font-bold text-xl">✕</button>
                        </div>

                        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold block mb-1.5 uppercase tracking-widest text-[#112922]/50 italic">District Name</label>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                placeholder="e.g. Downtown Dubai" 
                                                className="w-full p-4 bg-gray-50 rounded-2xl focus:bg-white border border-transparent focus:border-[#112922]/10 outline-none transition-all font-medium text-[#112922]" 
                                                value={formData.name} 
                                                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                                            />
                                            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold block mb-1.5 uppercase tracking-widest text-[#112922]/50 italic">Short Description</label>
                                        <textarea 
                                            placeholder="The heart of the city..." 
                                            className="w-full p-4 bg-gray-50 rounded-2xl h-32 focus:bg-white border border-transparent focus:border-[#112922]/10 outline-none transition-all resize-none font-medium text-[#112922]" 
                                            value={formData.description} 
                                            onChange={e => setFormData({ ...formData, description: e.target.value })} 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold block mb-1.5 uppercase tracking-widest text-[#112922]/50 italic">Cover Image</label>
                                    <div 
                                        className="relative aspect-[4/3] rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 overflow-hidden group cursor-pointer"
                                        onClick={() => document.getElementById('location-image')?.click()}
                                    >
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Camera className="text-white" size={32} />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
                                                <Camera size={32} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Click to upload</span>
                                            </div>
                                        )}
                                        <input 
                                            id="location-image"
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleFileChange} 
                                            className="hidden" 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs font-bold block mb-1.5 uppercase tracking-widest text-[#112922]/50 italic">Target Yield (ROI)</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="e.g. 8.2%" 
                                            className="w-full p-3.5 bg-gray-50 rounded-2xl focus:bg-white border border-transparent focus:border-[#112922]/10 outline-none transition-all font-medium text-[#112922]" 
                                            value={formData.roi} 
                                            onChange={e => setFormData({ ...formData, roi: e.target.value })} 
                                        />
                                        <TrendingUp className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1.5 uppercase tracking-widest text-[#112922]/50 italic">Connectivity Score</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="e.g. 9.5/10" 
                                            className="w-full p-3.5 bg-gray-50 rounded-2xl focus:bg-white border border-transparent focus:border-[#112922]/10 outline-none transition-all font-medium text-[#112922]" 
                                            value={formData.connectivity} 
                                            onChange={e => setFormData({ ...formData, connectivity: e.target.value })} 
                                        />
                                        <Radio className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1.5 uppercase tracking-widest text-[#112922]/50 italic">Lifestyle Tag</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Urban Luxury" 
                                            className="w-full p-3.5 bg-gray-50 rounded-2xl focus:bg-white border border-transparent focus:border-[#112922]/10 outline-none transition-all font-medium text-[#112922]" 
                                            value={formData.lifestyle} 
                                            onChange={e => setFormData({ ...formData, lifestyle: e.target.value })} 
                                        />
                                        <Heart className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50/50">
                            <button 
                                onClick={() => setIsFormOpen(false)} 
                                className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave} 
                                className="px-10 py-3 bg-[#112922] text-white font-bold rounded-2xl shadow-xl shadow-[#112922]/20 hover:bg-[#1a3a30] active:scale-95 transition-all"
                            >
                                {editingItem ? 'Update Category' : 'Create Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationsModule;
