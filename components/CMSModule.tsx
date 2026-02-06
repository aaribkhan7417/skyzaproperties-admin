
import React, { useState, useEffect } from 'react';
import { Save, Layout, Plus, Trash2, Edit2, Image as ImageIcon, Video } from 'lucide-react';
import { getHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide, getAdminSettings, updateAdminSettings } from '../api';

const CMSModule: React.FC = () => {
    const [slides, setSlides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Global Video State
    const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
    const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
    const [uploadingVideo, setUploadingVideo] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '', // Added
        price: '', // Added
        stat: '', // Added
        features: '', // Added as string
        button_text: 'Explore Properties',
        button_link: '/properties',
        order: 0,
        image: null as File | null
    });
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        fetchSlides();
        fetchSettings();
    }, []);

    const fetchSlides = async () => {
        try {
            const response = await getHeroSlides();
            if (response.status === 'success') {
                setSlides(response.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
           const response = await getAdminSettings();
           if(response.status === 'success' && response.data.hero_video_url) {
               setCurrentVideoUrl(response.data.hero_video_url);
           }
        } catch (error) {
            console.error("Failed to fetch settings", error);
        }
    };

    const handleVideoUpload = async () => {
        if (!newVideoFile) return;
        setUploadingVideo(true);
        const data = new FormData();
        data.append('hero_video', newVideoFile);
        
        // Settings update expects method POST but since we are sending file, simple POST is fine.
        // But wait, updateAdminSettings usually updates all settings. 
        // We only want to update video.
        // It's fine, the backend validates nullable fields. If we only send hero_video, others are not required?
        // Wait, backend validation: 'site_name' => 'nullable|string'. It does not require them to be present.
        // So sending just hero_video is fine.
        
        try {
            const response = await updateAdminSettings(data);
            if (response.status === 'success') {
                setCurrentVideoUrl(response.data.hero_video_url);
                setNewVideoFile(null);
                alert("Global video updated successfully!");
            }
        } catch (error) {
            console.error("Failed to upload video", error);
            alert("Failed to upload video.");
        } finally {
             setUploadingVideo(false);
        }
    };

    const handleEdit = (slide: any) => {
        setIsEditing(true);
        setEditingId(slide.id);
        
        let featuresStr = '';
        if (Array.isArray(slide.features)) {
            featuresStr = slide.features.join(', ');
        } else if (typeof slide.features === 'string') {
             // Try parse? if it looks like json. Or just use it if it's already comma separated (legacy?)
             // DB casts to array, so it should be array if not null.
             featuresStr = slide.features;
        }

        setFormData({
            title: slide.title || '',
            subtitle: slide.subtitle || '',
            description: slide.description || '', // Added
            price: slide.price || '', // Added
            stat: slide.stat || '', // Added
            features: featuresStr, // Added
            button_text: slide.button_text || '',
            button_link: slide.button_link || '',
            order: slide.order || 0,
            image: null
        });
        setPreviewImage(slide.image);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await deleteHeroSlide(id);
            fetchSlides();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const resetForm = () => {
        setIsEditing(false);
        setEditingId(null);
        setFormData({
            title: '',
            subtitle: '',
            description: '',
            price: '',
            stat: '',
            features: '',
            button_text: 'Explore Properties',
            button_link: '/properties',
            order: 0,
            image: null
        });
        setPreviewImage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('title', formData.title);
        data.append('subtitle', formData.subtitle);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('stat', formData.stat);
        data.append('features', formData.features); // Send as string, backend handles split
        data.append('button_text', formData.button_text);
        data.append('button_link', formData.button_link);
        data.append('order', formData.order.toString());
        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            if (isEditing && editingId) {
                await updateHeroSlide(editingId, data);
            } else {
                await createHeroSlide(data);
            }
            fetchSlides();
            resetForm();
        } catch (error) {
            console.error("Failed to save", error);
            alert("Failed to save slide.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#112922] tracking-tight">Hero Slider</h1>
                    <p className="text-gray-500 mt-1">Manage the hero slides and global background on your homepage.</p>
                </div>
                {!isEditing && (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#112922] text-white rounded-xl font-bold hover:bg-[#1a3a30] transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Slide
                    </button>
                )}
            </div>

            {/* Global Video Section */}
            {!isEditing && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Video className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[#112922]">Global Background Video</h3>
                            <p className="text-xs text-gray-500">This video plays behind all slides unless overridden.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden relative">
                             {currentVideoUrl ? (
                                 <video 
                                    src={currentVideoUrl} 
                                    className="w-full h-full object-cover"
                                    controls
                                 />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                                     Default Video Active
                                 </div>
                             )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Upload New Video (MP4/WebM, Max 50MB)</label>
                                <input 
                                    type="file" 
                                    accept="video/mp4,video/webm,video/quicktime"
                                    className="block w-full text-sm text-slate-500
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-full file:border-0
                                      file:text-xs file:font-semibold
                                      file:bg-[#112922] file:text-white
                                      hover:file:bg-[#1a3a30]
                                    "
                                    onChange={(e) => e.target.files && setNewVideoFile(e.target.files[0])}
                                />
                            </div>
                            
                            {newVideoFile && (
                                <button 
                                    onClick={handleVideoUpload}
                                    disabled={uploadingVideo}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                                >
                                    {uploadingVideo ? 'Uploading...' : 'Save New Video'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List Column */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-gray-400">Loading slides...</div>
                    ) : (
                        slides.map((slide) => (
                            <div key={slide.id} className="group relative bg-white border border-gray-100 rounded-2xl p-4 overflow-hidden hover:shadow-md transition-all flex items-center gap-4">
                                {/* Image Preview */}
                                <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
                                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-[#112922] truncate">{slide.title}</h3>
                                    <p className="text-sm text-gray-500 truncate">{slide.subtitle}</p>
                                    <div className="flex items-center gap-2 mt-2 text-xs">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-gray-600">Order: {slide.order}</span>
                                        <a href={slide.button_link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline truncate max-w-[150px] block">{slide.button_link}</a>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => handleEdit(slide)}
                                        className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-[#112922] hover:text-white transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(slide.id)}
                                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Form Column */}
                {isEditing && (
                    <div className="animate-in slide-in-from-right-8 duration-500">
                        <div className="bg-white border border-gray-100 rounded-2xl p-6 sticky top-8 shadow-xl shadow-black/5">
                            <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit Slide' : 'New Slide'}</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none font-bold"
                                        placeholder="Headline"
                                        value={formData.title}
                                        onChange={e => setFormData({...formData, title: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subtitle</label>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none"
                                        placeholder="Sub-headline"
                                        value={formData.subtitle}
                                        onChange={e => setFormData({...formData, subtitle: e.target.value})}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                    <textarea 
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none h-24 resize-none"
                                        placeholder="Detailed description..."
                                        value={formData.description}
                                        onChange={e => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price Label</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none"
                                            value={formData.price}
                                            onChange={e => setFormData({...formData, price: e.target.value})}
                                            placeholder="From AED 1.2M"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stat / Yield</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none"
                                            value={formData.stat}
                                            onChange={e => setFormData({...formData, stat: e.target.value})}
                                            placeholder="8% Yield / High ROI"
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Features (Comma Separated)</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none"
                                        value={formData.features}
                                        onChange={e => setFormData({...formData, features: e.target.value})}
                                        placeholder="Sea View, Gym, Pool"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Button Text</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none"
                                            value={formData.button_text}
                                            onChange={e => setFormData({...formData, button_text: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Link</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none"
                                            value={formData.button_link}
                                            onChange={e => setFormData({...formData, button_link: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Order Priority</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none"
                                        value={formData.order}
                                        onChange={e => setFormData({...formData, order: parseInt(e.target.value)})}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Thumbnail Image (Optional)</label>
                                    <p className="text-xs text-gray-400 mb-3">Used for Admin Panel reference only. Website uses global video background.</p>
                                    
                                    <div className="relative group cursor-pointer">
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            className="hidden"
                                            id="hero-image-upload"
                                            onChange={(e) => {
                                                if(e.target.files?.[0]) {
                                                    setFormData({...formData, image: e.target.files[0]});
                                                    setPreviewImage(URL.createObjectURL(e.target.files[0]));
                                                }
                                            }}
                                        />
                                        <label 
                                            htmlFor="hero-image-upload"
                                            className="block w-full aspect-video bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden relative"
                                        >
                                            {previewImage ? (
                                                <img src={previewImage} className="absolute inset-0 w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                                                    <span className="text-xs text-gray-400 font-bold">Click to Upload</span>
                                                </>
                                            )}
                                            
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="text-white text-xs font-bold">Change Image</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4">
                                    <button 
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-3 bg-[#112922] text-white rounded-xl font-bold shadow-lg shadow-[#112922]/20 hover:bg-[#1a3a30] transition-all"
                                    >
                                        Save Slide
                                    </button>
                                </div>

                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CMSModule;
