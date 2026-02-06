
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Globe, Camera } from 'lucide-react';
import { getPartners, createPartner, updatePartner, deletePartner, uploadImage } from '../api';

const PartnersModule: React.FC = () => {
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        description: '',
        website: '',
        order: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getPartners();
            if (response.status === 'success') setPartners(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.size > 20 * 1024 * 1024) {
                alert('Image size must be less than 20MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }

            setUploadingImage(true);
            try {
                const response = await uploadImage(file);
                if (response.status === 'success') {
                    setFormData({ ...formData, logo: response.data.url });
                    alert('Logo uploaded successfully!');
                }
            } catch (error: any) {
                console.error('Upload error:', error);
                if (error.response?.status === 422 && error.response.data.errors) {
                    const firstError = Object.values(error.response.data.errors)[0] as string[];
                    alert(firstError[0]);
                } else {
                    alert(error.response?.data?.message || 'Failed to upload logo. Please try again.');
                }
            } finally {
                setUploadingImage(false);
            }
        }
    };

    const handleSave = async () => {
        try {
            if (editingItem) {
                await updatePartner(editingItem.id, formData);
            } else {
                await createPartner(formData);
            }
            setIsFormOpen(false);
            setEditingItem(null);
            resetForm();
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete partner?')) {
            await deletePartner(id);
            setPartners(partners.filter(p => p.id !== id));
        }
    };

    const resetForm = () => {
        setFormData({ name: '', logo: '', description: '', website: '', order: 0 });
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            logo: item.logo || '',
            description: item.description || '',
            website: item.website || '',
            order: item.order
        });
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-[#112922] tracking-tight">Architects & Partners</h1>
                    <p className="text-gray-500 mt-1">Manage partner logos and links.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormOpen(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#112922] text-white rounded-xl font-bold shadow-lg shadow-[#112922]/20 hover:bg-[#1a3a30] transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Partner
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {partners.map((partner) => (
                    <div key={partner.id} className="group relative bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center text-center hover:shadow-xl transition-all h-48">
                        <div className="w-20 h-20 mb-4 flex items-center justify-center opacity-80 grayscale group-hover:grayscale-0 transition-all">
                            {partner.logo ? <img src={partner.logo} className="max-w-full max-h-full" /> : <Globe className="text-gray-300" />}
                        </div>
                        <h4 className="font-bold text-sm text-[#112922]">{partner.name}</h4>
                        {partner.website && <a href={partner.website} target="_blank" className="text-[10px] text-blue-500 hover:underline mt-1 truncate max-w-full">{partner.website}</a>}

                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button onClick={() => openEdit(partner)} className="p-1.5 bg-gray-50 rounded-lg hover:text-[#112922]"><Edit3 size={12} /></button>
                            <button onClick={() => handleDelete(partner.id)} className="p-1.5 bg-gray-50 rounded-lg hover:text-red-500"><Trash2 size={12} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <h3 className="text-lg font-bold text-[#112922]">Add / Edit Partner</h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                            <div>
                                <label className="text-xs font-bold block mb-1 uppercase tracking-widest text-gray-400">Partner Name</label>
                                <input type="text" placeholder="Partner Name" className="w-full p-2 bg-gray-50 rounded-lg focus:bg-white outline-none" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            <div>
                                <label className="text-xs font-bold block mb-2 uppercase tracking-widest text-gray-400">Partner Logo</label>
                                <div className="space-y-3">
                                    {formData.logo && (
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 mx-auto flex items-center justify-center p-2 border border-gray-100">
                                            <img src={formData.logo} className="max-w-full max-h-full object-contain" alt="Preview" />
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <label className="flex-1 cursor-pointer">
                                            <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#112922] text-white rounded-xl font-bold hover:bg-[#1a3a30] transition-all shadow-sm text-sm">
                                                <Camera className="w-4 h-4" />
                                                {uploadingImage ? 'Uploading...' : 'Upload Logo'}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoUpload}
                                                disabled={uploadingImage}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-px bg-gray-200"></div>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">OR</span>
                                        <div className="flex-1 h-px bg-gray-200"></div>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Logo URL (https://...)"
                                        className="w-full px-4 py-2 bg-gray-50 rounded-xl focus:bg-white border border-transparent focus:border-gray-100 outline-none transition-all text-sm"
                                        value={formData.logo}
                                        onChange={e => setFormData({ ...formData, logo: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold block mb-1 uppercase tracking-widest text-gray-400">Website URL</label>
                                <input type="text" placeholder="https://..." className="w-full px-4 py-2 bg-gray-50 rounded-xl focus:bg-white border border-transparent focus:border-gray-100 outline-none transition-all text-sm" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50">
                            <button onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                            <button onClick={handleSave} className="px-6 py-2 bg-[#112922] text-white font-bold rounded-lg hover:bg-[#1a3a30] transition-all shadow-lg shadow-[#112922]/20">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnersModule;
