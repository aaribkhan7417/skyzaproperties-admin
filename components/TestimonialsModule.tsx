
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, Star, MessageSquare, Download, Camera } from 'lucide-react';
import { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial, uploadImage } from '../api';

const TestimonialsModule: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState({
        client_name: '',
        client_role: '',
        client_photo: '',
        text: '',
        rating: 5,
        visibility: true,
        property_ref: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getTestimonials();
            if (response.status === 'success') setItems(response.data);
        } catch (error) {
            console.error("Error fetching testimonials:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                    setFormData({ ...formData, client_photo: response.data.url });
                    alert('Image uploaded successfully!');
                }
            } catch (error: any) {
                console.error('Upload error:', error);
                if (error.response?.status === 422 && error.response.data.errors) {
                    const firstError = Object.values(error.response.data.errors)[0] as string[];
                    alert(firstError[0]);
                } else {
                    alert(error.response?.data?.message || 'Failed to upload image. Please try again.');
                }
            } finally {
                setUploadingImage(false);
            }
        }
    };

    const handleSave = async () => {
        try {
            if (editingItem) {
                await updateTestimonial(editingItem.id, formData);
            } else {
                await createTestimonial(formData);
            }
            setIsFormOpen(false);
            setEditingItem(null);
            resetForm();
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Failed to save.");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this testimonial?')) {
            await deleteTestimonial(id);
            setItems(items.filter(i => i.id !== id));
        }
    };

    const resetForm = () => {
        setFormData({ client_name: '', client_role: '', client_photo: '', text: '', rating: 5, visibility: true, property_ref: '' });
    };

    const openEdit = (item: any) => {
        setEditingItem(item);
        setFormData({
            client_name: item.client_name,
            client_role: item.client_role || '',
            client_photo: item.client_photo || '',
            text: item.text,
            rating: item.rating,
            visibility: item.visibility,
            property_ref: item.property_ref || ''
        });
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#112922] tracking-tight">Success Stories</h1>
                    <p className="text-gray-500 mt-1">Manage client testimonials and success stories.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsFormOpen(true); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#112922] text-white rounded-xl font-bold shadow-lg shadow-[#112922]/20 hover:bg-[#1a3a30] transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Story
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <div key={item.id} className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                    {item.client_photo && <img src={item.client_photo} className="w-full h-full object-cover" />}
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#112922]">{item.client_name}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{item.client_role}</p>
                                    <div className="flex text-yellow-500 mt-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={10} fill={i < item.rating ? "currentColor" : "none"} className={i < item.rating ? "" : "text-gray-200"} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.visibility ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                {item.visibility ? 'Visible' : 'Hidden'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 italic mb-4 line-clamp-4">"{item.text}"</p>

                        {item.property_ref && (
                            <div className="text-[10px] text-[#112922]/60 font-bold uppercase tracking-widest border-t border-gray-50 pt-3">
                                Property: {item.property_ref}
                            </div>
                        )}

                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button onClick={() => openEdit(item)} className="p-1.5 bg-white shadow-sm rounded-lg hover:text-[#112922] transition-colors"><Edit3 size={14} /></button>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 bg-white shadow-sm rounded-lg hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                            <h3 className="text-xl font-bold text-[#112922]">Add / Edit Story</h3>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">✕</button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold block mb-1 uppercase tracking-widest text-gray-400">Client Name</label>
                                    <input type="text" placeholder="James Anderson" className="w-full p-3 bg-gray-50 rounded-xl focus:bg-white border border-transparent focus:border-gray-100 outline-none transition-all" value={formData.client_name} onChange={e => setFormData({ ...formData, client_name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold block mb-1 uppercase tracking-widest text-gray-400">Client Role</label>
                                    <input type="text" placeholder="Investment Banker" className="w-full p-3 bg-gray-50 rounded-xl focus:bg-white border border-transparent focus:border-gray-100 outline-none transition-all" value={formData.client_role} onChange={e => setFormData({ ...formData, client_role: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold block mb-2 uppercase tracking-widest text-gray-400">Client Photo</label>
                                <div className="space-y-3">
                                    {formData.client_photo && (
                                        <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 mx-auto">
                                            <img src={formData.client_photo} className="w-full h-full object-cover" alt="Preview" />
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <label className="flex-1 cursor-pointer">
                                            <div className="flex items-center justify-center gap-2 px-4 py-3 bg-[#112922] text-white rounded-xl font-bold hover:bg-[#1a3a30] transition-all shadow-sm">
                                                <Camera className="w-4 h-4" />
                                                {uploadingImage ? 'Uploading...' : 'Upload from Gallery'}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploadingImage}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-px bg-gray-200"></div>
                                        <span className="text-xs text-gray-400 font-bold">OR</span>
                                        <div className="flex-1 h-px bg-gray-200"></div>
                                    </div>

                                    <input
                                        type="text"
                                        placeholder="Or paste image URL (https://...)"
                                        className="w-full p-3 bg-gray-50 rounded-xl focus:bg-white border border-transparent focus:border-gray-100 outline-none transition-all text-xs"
                                        value={formData.client_photo}
                                        onChange={e => setFormData({ ...formData, client_photo: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold block mb-1 uppercase tracking-widest text-gray-400">Property Purchased</label>
                                <input type="text" placeholder="Palm Jumeirah Villa" className="w-full p-3 bg-gray-50 rounded-xl focus:bg-white border border-transparent focus:border-gray-100 outline-none transition-all" value={formData.property_ref} onChange={e => setFormData({ ...formData, property_ref: e.target.value })} />
                            </div>

                            <div>
                                <label className="text-xs font-bold block mb-1 uppercase tracking-widest text-gray-400">Success Story / Testimonial</label>
                                <textarea placeholder="Share the journey..." className="w-full p-3 bg-gray-50 rounded-xl h-32 focus:bg-white border border-transparent focus:border-gray-100 outline-none transition-all resize-none" value={formData.text} onChange={e => setFormData({ ...formData, text: e.target.value })} />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-xs font-bold block mb-2 uppercase tracking-widest text-gray-400">Rating</label>
                                    <select className="w-full p-3 bg-gray-50 rounded-xl outline-none" value={formData.rating} onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}>
                                        {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-bold block mb-2 uppercase tracking-widest text-gray-400">Visibility</label>
                                    <select className="w-full p-3 bg-gray-50 rounded-xl outline-none" value={formData.visibility ? 'true' : 'false'} onChange={e => setFormData({ ...formData, visibility: e.target.value === 'true' })}>
                                        <option value="true">Visible</option>
                                        <option value="false">Hidden</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50">
                            <button onClick={() => setIsFormOpen(false)} className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                            <button onClick={handleSave} className="px-8 py-2.5 bg-[#112922] text-white font-bold rounded-xl shadow-lg shadow-[#112922]/20 hover:bg-[#1a3a30] transition-all">Save Story</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestimonialsModule;
