import React, { useState, useEffect } from 'react';
import {
    getSeoSettings,
    createSeoSetting,
    updateSeoSetting,
    deleteSeoSetting,
    getBranding,
    updateBranding,
    uploadFavicon,
    uploadLogo,
    uploadSocialImage
} from '../api';
import {
    Search,
    Globe,
    FileText,
    Image as ImageIcon,
    Hash,
    ExternalLink,
    Save,
    Plus,
    Trash2,
    Edit3,
    Eye,
    Upload,
    Palette,
    Settings,
    CheckCircle,
    AlertCircle,
    X
} from 'lucide-react';

interface SeoSetting {
    id: number;
    page_identifier: string;
    page_name: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    canonical_url: string;
    robots_meta: string;
    og_title: string;
    og_description: string;
    og_image: string;
    og_type: string;
    twitter_card: string;
    twitter_title: string;
    twitter_description: string;
    twitter_image: string;
    schema_markup: string;
    is_active: boolean;
}

interface BrandingData {
    site_name: string;
    site_tagline: string;
    favicon_light: string;
    favicon_dark: string;
    favicon_ico: string;
    logo_light: string;
    logo_dark: string;
    logo_icon: string;
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    background_color: string;
    text_color: string;
    og_default_image: string;
    twitter_default_image: string;
    business_name: string;
    business_phone: string;
    business_email: string;
    business_address: string;
    business_city: string;
    business_country: string;
    social_facebook: string;
    social_instagram: string;
    social_twitter: string;
    social_linkedin: string;
    social_youtube: string;
    social_whatsapp: string;
    pwa_name: string;
    pwa_short_name: string;
    pwa_theme_color: string;
    pwa_background_color: string;
}

const SeoModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'seo' | 'branding'>('seo');
    const [seoSettings, setSeoSettings] = useState<SeoSetting[]>([]);
    const [branding, setBranding] = useState<BrandingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingSeo, setEditingSeo] = useState<SeoSetting | null>(null);
    const [showSeoForm, setShowSeoForm] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [seoRes, brandingRes] = await Promise.all([
                getSeoSettings(),
                getBranding()
            ]);
            if (seoRes.status === 'success') setSeoSettings(seoRes.data);
            if (brandingRes.status === 'success') setBranding(brandingRes.data);
        } catch (error) {
            showNotification('error', 'Failed to load data');
        }
        setLoading(false);
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSaveSeo = async (data: Partial<SeoSetting>) => {
        setSaving(true);
        try {
            if (editingSeo?.id) {
                await updateSeoSetting(editingSeo.id, data);
                showNotification('success', 'SEO settings updated successfully');
            } else {
                await createSeoSetting(data);
                showNotification('success', 'SEO settings created successfully');
            }
            await loadData();
            setShowSeoForm(false);
            setEditingSeo(null);
        } catch (error) {
            showNotification('error', 'Failed to save SEO settings');
        }
        setSaving(false);
    };

    const handleDeleteSeo = async (id: number) => {
        if (!confirm('Are you sure you want to delete this SEO setting?')) return;
        try {
            await deleteSeoSetting(id);
            showNotification('success', 'SEO setting deleted');
            await loadData();
        } catch (error) {
            showNotification('error', 'Failed to delete');
        }
    };

    const handleSaveBranding = async (data: Partial<BrandingData>) => {
        setSaving(true);
        try {
            await updateBranding(data);
            showNotification('success', 'Branding updated successfully');
            await loadData();
        } catch (error) {
            showNotification('error', 'Failed to update branding');
        }
        setSaving(false);
    };

    const handleUploadFavicon = async (file: File, type: 'light' | 'dark' | 'ico') => {
        try {
            await uploadFavicon(file, type);
            showNotification('success', `Favicon (${type}) uploaded successfully`);
            await loadData();
        } catch (error) {
            showNotification('error', 'Failed to upload favicon');
        }
    };

    const handleUploadLogo = async (file: File, type: 'light' | 'dark' | 'icon') => {
        try {
            await uploadLogo(file, type);
            showNotification('success', `Logo (${type}) uploaded successfully`);
            await loadData();
        } catch (error) {
            showNotification('error', 'Failed to upload logo');
        }
    };

    const handleUploadSocialImage = async (file: File, type: 'og' | 'twitter') => {
        try {
            await uploadSocialImage(file, type);
            showNotification('success', `Social image uploaded successfully`);
            await loadData();
        } catch (error) {
            showNotification('error', 'Failed to upload image');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#112922]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#112922]">SEO & Branding</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage website SEO, favicon, logo, and branding</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('seo')}
                    className={`px-6 py-3 font-medium transition-all ${activeTab === 'seo'
                            ? 'text-[#112922] border-b-2 border-[#112922]'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Globe className="inline mr-2" size={18} />
                    SEO Settings
                </button>
                <button
                    onClick={() => setActiveTab('branding')}
                    className={`px-6 py-3 font-medium transition-all ${activeTab === 'branding'
                            ? 'text-[#112922] border-b-2 border-[#112922]'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Palette className="inline mr-2" size={18} />
                    Branding
                </button>
            </div>

            {/* SEO Tab */}
            {activeTab === 'seo' && (
                <div className="space-y-4">
                    {/* Add Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => { setEditingSeo(null); setShowSeoForm(true); }}
                            className="bg-[#112922] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#1a3d33] transition-all"
                        >
                            <Plus size={18} />
                            Add Page SEO
                        </button>
                    </div>

                    {/* SEO List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left p-4 font-semibold text-gray-700">Page</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Meta Title</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-right p-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {seoSettings.map((seo) => (
                                    <tr key={seo.id} className="border-t border-gray-100 hover:bg-gray-50">
                                        <td className="p-4">
                                            <div className="font-medium text-[#112922]">{seo.page_name}</div>
                                            <div className="text-xs text-gray-400">{seo.page_identifier}</div>
                                        </td>
                                        <td className="p-4 text-gray-600 text-sm max-w-xs truncate">
                                            {seo.meta_title || '-'}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${seo.is_active
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {seo.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditingSeo(seo); setShowSeoForm(true); }}
                                                    className="p-2 text-gray-500 hover:text-[#112922] hover:bg-gray-100 rounded-lg transition-all"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSeo(seo.id)}
                                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Branding Tab */}
            {activeTab === 'branding' && branding && (
                <BrandingForm
                    branding={branding}
                    onSave={handleSaveBranding}
                    onUploadFavicon={handleUploadFavicon}
                    onUploadLogo={handleUploadLogo}
                    onUploadSocialImage={handleUploadSocialImage}
                    saving={saving}
                />
            )}

            {/* SEO Form Modal */}
            {showSeoForm && (
                <SeoForm
                    seo={editingSeo}
                    onSave={handleSaveSeo}
                    onClose={() => { setShowSeoForm(false); setEditingSeo(null); }}
                    saving={saving}
                />
            )}
        </div>
    );
};

// SEO Form Component
const SeoForm: React.FC<{
    seo: SeoSetting | null;
    onSave: (data: Partial<SeoSetting>) => void;
    onClose: () => void;
    saving: boolean;
}> = ({ seo, onSave, onClose, saving }) => {
    const [formData, setFormData] = useState({
        page_identifier: seo?.page_identifier || '',
        page_name: seo?.page_name || '',
        meta_title: seo?.meta_title || '',
        meta_description: seo?.meta_description || '',
        meta_keywords: seo?.meta_keywords || '',
        canonical_url: seo?.canonical_url || '',
        robots_meta: seo?.robots_meta || 'index,follow',
        og_title: seo?.og_title || '',
        og_description: seo?.og_description || '',
        og_image: seo?.og_image || '',
        og_type: seo?.og_type || 'website',
        twitter_card: seo?.twitter_card || 'summary_large_image',
        twitter_title: seo?.twitter_title || '',
        twitter_description: seo?.twitter_description || '',
        twitter_image: seo?.twitter_image || '',
        schema_markup: seo?.schema_markup || '',
        is_active: seo?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#112922]">
                        {seo ? 'Edit SEO Settings' : 'Add Page SEO'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Page Identifier</label>
                            <input
                                type="text"
                                value={formData.page_identifier}
                                onChange={(e) => setFormData({ ...formData, page_identifier: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                                placeholder="e.g., home, properties, about"
                                required
                                disabled={!!seo}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Page Name</label>
                            <input
                                type="text"
                                value={formData.page_name}
                                onChange={(e) => setFormData({ ...formData, page_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                                placeholder="e.g., Home Page"
                                required
                            />
                        </div>
                    </div>

                    {/* Meta Tags */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-[#112922] flex items-center gap-2">
                            <FileText size={18} /> Meta Tags
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Meta Title <span className="text-gray-400">({formData.meta_title.length}/70)</span>
                            </label>
                            <input
                                type="text"
                                value={formData.meta_title}
                                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                                placeholder="Page title for search engines"
                                maxLength={70}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Meta Description <span className="text-gray-400">({formData.meta_description.length}/160)</span>
                            </label>
                            <textarea
                                value={formData.meta_description}
                                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20 h-20"
                                placeholder="Brief description for search results"
                                maxLength={160}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Keywords</label>
                            <input
                                type="text"
                                value={formData.meta_keywords}
                                onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                                placeholder="keyword1, keyword2, keyword3"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
                                <input
                                    type="url"
                                    value={formData.canonical_url}
                                    onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Robots Meta</label>
                                <select
                                    value={formData.robots_meta}
                                    onChange={(e) => setFormData({ ...formData, robots_meta: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                                >
                                    <option value="index,follow">Index, Follow</option>
                                    <option value="noindex,follow">NoIndex, Follow</option>
                                    <option value="index,nofollow">Index, NoFollow</option>
                                    <option value="noindex,nofollow">NoIndex, NoFollow</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Open Graph */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-[#112922] flex items-center gap-2">
                            <ExternalLink size={18} /> Open Graph (Social Sharing)
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
                                <input
                                    type="text"
                                    value={formData.og_title}
                                    onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                                    placeholder="Leave empty to use meta title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">OG Type</label>
                                <select
                                    value={formData.og_type}
                                    onChange={(e) => setFormData({ ...formData, og_type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                                >
                                    <option value="website">Website</option>
                                    <option value="article">Article</option>
                                    <option value="product">Product</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                            <textarea
                                value={formData.og_description}
                                onChange={(e) => setFormData({ ...formData, og_description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20 h-16"
                                placeholder="Leave empty to use meta description"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                            <input
                                type="url"
                                value={formData.og_image}
                                onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                                placeholder="https://... (1200x630px recommended)"
                            />
                        </div>
                    </div>

                    {/* Twitter */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-[#112922] flex items-center gap-2">
                            <Hash size={18} /> Twitter Card
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Card Type</label>
                                <select
                                    value={formData.twitter_card}
                                    onChange={(e) => setFormData({ ...formData, twitter_card: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                                >
                                    <option value="summary_large_image">Summary Large Image</option>
                                    <option value="summary">Summary</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Title</label>
                                <input
                                    type="text"
                                    value={formData.twitter_title}
                                    onChange={(e) => setFormData({ ...formData, twitter_title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Active Toggle */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-5 h-5 rounded border-gray-300 text-[#112922] focus:ring-[#112922]"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                            Active (Enable this SEO configuration)
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-[#112922] text-white rounded-lg hover:bg-[#1a3d33] disabled:opacity-50 flex items-center gap-2"
                        >
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Save SEO Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Branding Form Component
const BrandingForm: React.FC<{
    branding: BrandingData;
    onSave: (data: Partial<BrandingData>) => void;
    onUploadFavicon: (file: File, type: 'light' | 'dark' | 'ico') => void;
    onUploadLogo: (file: File, type: 'light' | 'dark' | 'icon') => void;
    onUploadSocialImage: (file: File, type: 'og' | 'twitter') => void;
    saving: boolean;
}> = ({ branding, onSave, onUploadFavicon, onUploadLogo, onUploadSocialImage, saving }) => {
    const [formData, setFormData] = useState(branding);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const FileUpload: React.FC<{
        label: string;
        currentUrl: string;
        onUpload: (file: File) => void;
        accept?: string;
    }> = ({ label, currentUrl, onUpload, accept = ".png,.ico,.svg" }) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="flex items-center gap-4">
                {currentUrl && (
                    <img src={currentUrl} alt={label} className="w-12 h-12 object-contain bg-gray-50 rounded-lg border" />
                )}
                <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <Upload size={16} />
                    <span className="text-sm">Upload</span>
                    <input
                        type="file"
                        accept={accept}
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                    />
                </label>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Site Identity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-[#112922] mb-4 flex items-center gap-2">
                    <Settings size={18} /> Site Identity
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                        <input
                            type="text"
                            value={formData.site_name}
                            onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                        <input
                            type="text"
                            value={formData.site_tagline}
                            onChange={(e) => setFormData({ ...formData, site_tagline: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                        />
                    </div>
                </div>
            </div>

            {/* Favicons */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-[#112922] mb-4 flex items-center gap-2">
                    <ImageIcon size={18} /> Favicons
                </h3>
                <div className="grid grid-cols-3 gap-6">
                    <FileUpload
                        label="Favicon (Light mode)"
                        currentUrl={formData.favicon_light}
                        onUpload={(file) => onUploadFavicon(file, 'light')}
                    />
                    <FileUpload
                        label="Favicon (Dark mode)"
                        currentUrl={formData.favicon_dark}
                        onUpload={(file) => onUploadFavicon(file, 'dark')}
                    />
                    <FileUpload
                        label="Favicon (.ico)"
                        currentUrl={formData.favicon_ico}
                        onUpload={(file) => onUploadFavicon(file, 'ico')}
                        accept=".ico,.png"
                    />
                </div>
            </div>

            {/* Logos */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-[#112922] mb-4 flex items-center gap-2">
                    <ImageIcon size={18} /> Logos
                </h3>
                <div className="grid grid-cols-3 gap-6">
                    <FileUpload
                        label="Logo (Light BG)"
                        currentUrl={formData.logo_light}
                        onUpload={(file) => onUploadLogo(file, 'light')}
                        accept=".png,.jpg,.svg,.webp"
                    />
                    <FileUpload
                        label="Logo (Dark BG)"
                        currentUrl={formData.logo_dark}
                        onUpload={(file) => onUploadLogo(file, 'dark')}
                        accept=".png,.jpg,.svg,.webp"
                    />
                    <FileUpload
                        label="Icon Only"
                        currentUrl={formData.logo_icon}
                        onUpload={(file) => onUploadLogo(file, 'icon')}
                        accept=".png,.svg"
                    />
                </div>
            </div>

            {/* Brand Colors */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-[#112922] mb-4 flex items-center gap-2">
                    <Palette size={18} /> Brand Colors
                </h3>
                <div className="grid grid-cols-5 gap-4">
                    {[
                        { key: 'primary_color', label: 'Primary' },
                        { key: 'secondary_color', label: 'Secondary' },
                        { key: 'accent_color', label: 'Accent' },
                        { key: 'background_color', label: 'Background' },
                        { key: 'text_color', label: 'Text' },
                    ].map(({ key, label }) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={(formData as any)[key]}
                                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                    className="w-10 h-10 rounded cursor-pointer border-0"
                                />
                                <input
                                    type="text"
                                    value={(formData as any)[key]}
                                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Social Images */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-[#112922] mb-4 flex items-center gap-2">
                    <ExternalLink size={18} /> Default Social Images
                </h3>
                <div className="grid grid-cols-2 gap-6">
                    <FileUpload
                        label="Open Graph Image (1200x630)"
                        currentUrl={formData.og_default_image}
                        onUpload={(file) => onUploadSocialImage(file, 'og')}
                        accept=".jpg,.png,.webp"
                    />
                    <FileUpload
                        label="Twitter Image"
                        currentUrl={formData.twitter_default_image}
                        onUpload={(file) => onUploadSocialImage(file, 'twitter')}
                        accept=".jpg,.png,.webp"
                    />
                </div>
            </div>

            {/* Business Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-[#112922] mb-4">Business Information</h3>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                        <input
                            type="text"
                            value={formData.business_name}
                            onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                            type="text"
                            value={formData.business_phone}
                            onChange={(e) => setFormData({ ...formData, business_phone: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.business_email}
                            onChange={(e) => setFormData({ ...formData, business_email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                        />
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            value={formData.business_address}
                            onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                            type="text"
                            value={formData.business_city}
                            onChange={(e) => setFormData({ ...formData, business_city: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                        />
                    </div>
                </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-[#112922] mb-4">Social Media Links</h3>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { key: 'social_facebook', label: 'Facebook' },
                        { key: 'social_instagram', label: 'Instagram' },
                        { key: 'social_twitter', label: 'Twitter/X' },
                        { key: 'social_linkedin', label: 'LinkedIn' },
                        { key: 'social_youtube', label: 'YouTube' },
                        { key: 'social_whatsapp', label: 'WhatsApp' },
                    ].map(({ key, label }) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                            <input
                                type="text"
                                value={(formData as any)[key] || ''}
                                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#112922]/20"
                                placeholder={key === 'social_whatsapp' ? '+971...' : 'https://...'}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3 bg-[#112922] text-white rounded-xl hover:bg-[#1a3d33] disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Branding Settings'}
                </button>
            </div>
        </form>
    );
};

export default SeoModule;
