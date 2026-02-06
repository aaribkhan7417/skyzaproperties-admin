
import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, Globe, FileText, Share2,
    Settings as SettingsIcon, Search, Plus, Trash2,
    Edit2, Save, X, ExternalLink, RefreshCw, CheckCircle, BarChart3, AlertCircle, Image
} from 'lucide-react';
import {
    getSeoPages, createSeoPage, updateSeoPage, deleteSeoPage,
    getSeoRedirects, createSeoRedirect, updateSeoRedirect, deleteSeoRedirect,
    getAdminSettings, updateAdminSettings, clearSystemCache
} from '../api';
import { toast } from 'react-hot-toast';

const SeoManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'global' | 'pages' | 'redirects' | 'tech'>('pages');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>({ pages: 0, redirects: 0, sitemap: 'Healthy' });

    // Data States
    const [pages, setPages] = useState<any[]>([]);
    const [redirects, setRedirects] = useState<any[]>([]);
    const [globalSettings, setGlobalSettings] = useState<any>({});

    // Edit States
    const [isPageModalOpen, setIsPageModalOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<any>(null);
    const [pageForm, setPageForm] = useState<any>({
        page_identifier: '', page_name: '', title: '', meta_description: '', meta_keywords: '', reading_time: '', content_type: 'website', author: '', no_index: false, no_follow: false, schema_type: 'WebPage'
    });

    const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false);
    const [editingRedirect, setEditingRedirect] = useState<any>(null);
    const [redirectForm, setRedirectForm] = useState({ source_url: '', target_url: '', status_code: 301 });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [pagesData, redirectsData, settingsData] = await Promise.all([
                getSeoPages(),
                getSeoRedirects(),
                getAdminSettings()
            ]);
            setPages(pagesData.data || []);
            setRedirects(redirectsData.data || []);
            setGlobalSettings(settingsData.data || {});

            // Stats
            setStats({
                pages: pagesData.data?.length || 0,
                redirects: redirectsData.data?.length || 0,
                sitemap: 'Generated' // Mock for now
            });
        } catch (error) {
            console.error('Failed to fetch SEO data', error);
            toast.error('Failed to load SEO data');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveGlobal = async () => {
        try {
            const formData = new FormData();
            Object.keys(globalSettings).forEach(key => {
                const value = globalSettings[key];
                if (value !== null && value !== undefined) {
                    // Handle file objects if present
                    if (key === 'default_og_image_file' || key === 'favicon_url_file' || key === 'apple_touch_icon_file' || key === 'favicon_dark_file') {
                        formData.append(key, value);
                    } else if (key === 'default_og_image' || key === 'favicon_url' || key === 'apple_touch_icon' || key === 'favicon_dark') {
                        formData.append(key, value);
                    } else {
                        formData.append(key, value);
                    }
                }
            });

            await updateAdminSettings(formData);
            await clearSystemCache();
            toast.success('Global SEO Settings Saved & Cache Cleared');

            // Re-fetch to normalize state
            await fetchAllData();

            // Clear file objects from state to clean inputs
            setGlobalSettings(prev => ({
                ...prev,
                favicon_url_file: undefined,
                apple_touch_icon_file: undefined,
                favicon_dark_file: undefined,
                default_og_image_file: undefined
            }));

        } catch (error) {
            toast.error('Failed to save settings');
        }
    };

    const handleSavePage = async () => {
        try {
            if (editingPage) {
                await updateSeoPage(editingPage.id, pageForm);
                toast.success('Page SEO Updated');
            } else {
                await createSeoPage(pageForm);
                toast.success('New Page SEO Created');
            }
            setIsPageModalOpen(false);
            setEditingPage(null);
            fetchAllData();
        } catch (error) {
            toast.error('Failed to save page SEO');
        }
    };

    const handleDeletePage = async (id: number) => {
        if (!confirm('Are you sure? This will remove custom SEO for this page.')) return;
        try {
            await deleteSeoPage(id);
            toast.success('Page Deleted');
            fetchAllData();
        } catch (error) {
            toast.error('Failed to delete page');
        }
    };

    const handleSaveRedirect = async () => {
        try {
            if (editingRedirect) {
                await updateSeoRedirect(editingRedirect.id, redirectForm);
                toast.success('Redirect Rule Updated');
            } else {
                await createSeoRedirect(redirectForm);
                toast.success('Redirect Rule Created');
            }
            setIsRedirectModalOpen(false);
            setEditingRedirect(null);
            fetchAllData();
        } catch (error) {
            toast.error('Failed to save redirect');
        }
    };

    const handleDeleteRedirect = async (id: number) => {
        if (!confirm('Delete this redirect rule?')) return;
        try {
            await deleteSeoRedirect(id);
            toast.success('Redirect Deleted');
            fetchAllData();
        } catch (error) {
            toast.error('Failed to delete redirect');
        }
    };

    const handleClearCache = async () => {
        try {
            await clearSystemCache();
            toast.success('System Cache Cleared Successfully');
        } catch (error: any) {
            toast.error('Failed to clear cache');
        }
    };

    const getImageUrl = (path: string | null | undefined): string => {
        if (!path) return '';
        if (path.startsWith('data:')) return path;
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
        return `${baseUrl}${path}`;
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#112922] font-serif">SEO Manager</h1>
                    <p className="text-gray-500 mt-1">Advanced Search Engine Optimization & Technical Controls</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleClearCache}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                    >
                        <RefreshCw className="w-4 h-4" /> Clear Cache
                    </button>
                    <a
                        href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/sitemap.xml`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-[#C5A25D] text-white rounded-lg hover:bg-[#b08d4d] transition-colors font-medium text-sm shadow-md shadow-[#C5A25D]/20"
                    >
                        <ExternalLink className="w-4 h-4" /> View Sitemap
                    </a>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 mb-6 bg-white p-1 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                {[
                    { id: 'pages', label: 'Pages SEO', icon: FileText },
                    { id: 'global', label: 'Global Settings', icon: Globe },
                    { id: 'redirects', label: 'Redirects', icon: Share2 },
                    { id: 'tech', label: 'Technical Health', icon: BarChart3 },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-[#112922] text-white shadow-md'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

                {/* PAGES TAB */}
                {activeTab === 'pages' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-lg text-gray-800">Page-by-Page optimization</h3>
                            <button
                                onClick={() => {
                                    setEditingPage(null);
                                    setPageForm({ page_identifier: '', page_name: '', title: '', meta_description: '', meta_keywords: '', reading_time: '', content_type: 'website', author: '', no_index: false, no_follow: false, schema_type: 'WebPage' });
                                    setIsPageModalOpen(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-[#112922] text-white rounded-lg hover:bg-[#1a3a30] transition-colors text-sm font-bold"
                            >
                                <Plus className="w-4 h-4" /> Add Page Record
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-gray-100">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#f8f9fa] text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4 font-bold rounded-tl-xl">Page Name</th>
                                        <th className="px-6 py-4 font-bold">Identifier / Slug</th>
                                        <th className="px-6 py-4 font-bold">SEO Title</th>
                                        <th className="px-6 py-4 font-bold text-center">In Sitemap</th>
                                        <th className="px-6 py-4 font-bold rounded-tr-xl text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {pages.map((page) => (
                                        <tr key={page.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-800">{page.page_name}</td>
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">{page.page_identifier}</td>
                                            <td className="px-6 py-4 text-gray-600 max-w-[200px] truncate">{page.title || '-'}</td>
                                            <td className="px-6 py-4 text-center">
                                                {page.no_index ?
                                                    <span className="inline-flex items-center px-2 py-1 rounded bg-red-100 text-red-600 text-[10px] font-bold">NOINDEX</span> :
                                                    <span className="inline-flex items-center px-2 py-1 rounded bg-green-100 text-green-600 text-[10px] font-bold">INDEX</span>
                                                }
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingPage(page);
                                                            setPageForm(page);
                                                            setIsPageModalOpen(true);
                                                        }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePage(page.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {pages.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-sm">
                                                No specific page records found. Global settings will be applied.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* GLOBAL SETTINGS TAB */}
                {activeTab === 'global' && (
                    <div className="max-w-4xl space-y-8">
                        <div>
                            <h3 className="font-bold text-lg text-gray-800 mb-4">Site Identity (Defaults)</h3>
                            <div className="grid gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Website Name</label>
                                    <input
                                        type="text"
                                        value={globalSettings.site_name || ''}
                                        onChange={e => setGlobalSettings({ ...globalSettings, site_name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#C5A25D] focus:ring-1 focus:ring-[#C5A25D] outline-none text-sm font-medium transition-all"
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Theme Color</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="color"
                                                value={globalSettings.theme_color || '#000000'}
                                                onChange={e => setGlobalSettings({ ...globalSettings, theme_color: e.target.value })}
                                                className="h-[46px] w-[50px] p-0 border-0 rounded-xl overflow-hidden cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={globalSettings.theme_color || ''}
                                                onChange={e => setGlobalSettings({ ...globalSettings, theme_color: e.target.value })}
                                                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                                                placeholder="#000000"
                                            />
                                        </div>
                                    </div>
                                    {/* Main Favicon */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Main Favicon</label>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center overflow-hidden relative group">
                                                {globalSettings.favicon_url ? (
                                                    <img key={globalSettings.favicon_url} src={getImageUrl(globalSettings.favicon_url)} alt="Favicon" className="w-8 h-8 object-contain" />
                                                ) : (
                                                    <Image className="w-5 h-5 text-gray-300" />
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                    <label className="cursor-pointer w-full h-full flex items-center justify-center">
                                                        <Edit2 className="w-4 h-4 text-white" />
                                                        <input
                                                            type="file"
                                                            accept=".ico,.png,.svg"
                                                            onChange={(e) => {
                                                                if (e.target.files?.[0]) {
                                                                    const file = e.target.files[0];
                                                                    const reader = new FileReader();
                                                                    reader.onload = (ev) => {
                                                                        setGlobalSettings({
                                                                            ...globalSettings,
                                                                            favicon_url: ev.target?.result,
                                                                            favicon_url_file: file,
                                                                            favicon_ico: ev.target?.result
                                                                        });
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 mb-1">Standard 32x32px or 16x16px</p>
                                                <p className="text-[10px] text-gray-400 font-mono">{globalSettings.favicon_url ? 'Custom Icon Set' : 'Default System Icon'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Apple Touch Icon */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Apple Touch Icon</label>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl border border-gray-200 bg-white flex items-center justify-center overflow-hidden relative group">
                                                {globalSettings.apple_touch_icon ? (
                                                    <img src={getImageUrl(globalSettings.apple_touch_icon)} alt="Apple Icon" className="w-8 h-8 object-contain" />
                                                ) : (
                                                    <Image className="w-5 h-5 text-gray-300" />
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                    <label className="cursor-pointer w-full h-full flex items-center justify-center">
                                                        <Edit2 className="w-4 h-4 text-white" />
                                                        <input
                                                            type="file"
                                                            accept=".png"
                                                            onChange={(e) => {
                                                                if (e.target.files?.[0]) {
                                                                    const file = e.target.files[0];
                                                                    const reader = new FileReader();
                                                                    reader.onload = (ev) => {
                                                                        setGlobalSettings({
                                                                            ...globalSettings,
                                                                            apple_touch_icon: ev.target?.result,
                                                                            apple_touch_icon_file: file
                                                                        });
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 mb-1">iOS Home Screen (180x180px)</p>
                                                <p className="text-[10px] text-gray-400 font-mono">{globalSettings.apple_touch_icon ? 'Custom Icon Set' : 'Not Set'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dark Mode Favicon */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Dark Mode Favicon</label>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-900 flex items-center justify-center overflow-hidden relative group">
                                                {globalSettings.favicon_dark ? (
                                                    <img src={getImageUrl(globalSettings.favicon_dark)} alt="Dark Icon" className="w-8 h-8 object-contain" />
                                                ) : (
                                                    <Image className="w-5 h-5 text-gray-600" />
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                    <label className="cursor-pointer w-full h-full flex items-center justify-center">
                                                        <Edit2 className="w-4 h-4 text-white" />
                                                        <input
                                                            type="file"
                                                            accept=".png,.ico,.svg"
                                                            onChange={(e) => {
                                                                if (e.target.files?.[0]) {
                                                                    const file = e.target.files[0];
                                                                    const reader = new FileReader();
                                                                    reader.onload = (ev) => {
                                                                        setGlobalSettings({
                                                                            ...globalSettings,
                                                                            favicon_dark: ev.target?.result,
                                                                            favicon_dark_file: file
                                                                        });
                                                                    };
                                                                    reader.readAsDataURL(file);
                                                                }
                                                            }}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-500 mb-1">For dark themes</p>
                                                <p className="text-[10px] text-gray-400 font-mono">{globalSettings.favicon_dark ? 'Custom Icon Set' : 'Not Set'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Global Keywords</label>
                                    <textarea
                                        value={globalSettings.meta_keywords || ''}
                                        onChange={e => setGlobalSettings({ ...globalSettings, meta_keywords: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                                        placeholder="Comma separated global keywords..."
                                    />
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Default Meta Description</label>
                                        <textarea
                                            value={globalSettings.meta_description || ''}
                                            onChange={e => setGlobalSettings({ ...globalSettings, meta_description: e.target.value })}
                                            rows={9}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#C5A25D] focus:ring-1 focus:ring-[#C5A25D] outline-none text-sm font-medium transition-all"
                                            placeholder="Default description regarding your website..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Default Social Image (OG Image)</label>
                                        <div className="bg-gray-50 rounded-xl border border-gray-200 aspect-video flex items-center justify-center overflow-hidden relative group">
                                            {globalSettings.default_og_image && getImageUrl(globalSettings.default_og_image) ? (
                                                <img
                                                    src={getImageUrl(globalSettings.default_og_image)}
                                                    alt="Social Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-center p-6">
                                                    <Globe className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                                                    <span className="text-xs text-gray-400 font-medium">No Image Set</span>
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-gray-100 transition-colors">
                                                    <Share2 className="w-4 h-4" /> Change Image
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            if (e.target.files?.[0]) {
                                                                const file = e.target.files[0];
                                                                const reader = new FileReader();
                                                                reader.onload = (ev) => {
                                                                    setGlobalSettings({
                                                                        ...globalSettings,
                                                                        default_og_image: ev.target?.result,
                                                                        default_og_image_file: file
                                                                    });
                                                                };
                                                                reader.readAsDataURL(file);
                                                            }
                                                        }}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>

                                            {globalSettings.default_og_image && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Remove default social image?')) {
                                                            setGlobalSettings({ ...globalSettings, default_og_image: '', default_og_image_file: null });
                                                        }
                                                    }}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-2">
                                            Used when links are shared on social media. 1200x630px recommended.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg text-gray-800 mb-4 tracking-tight flex items-center gap-2">
                                <Search className="w-5 h-5 text-green-600" /> Validation & Analytics
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Google Analytics ID</label>
                                    <input
                                        type="text"
                                        value={globalSettings.google_analytics_id || ''}
                                        onChange={e => setGlobalSettings({ ...globalSettings, google_analytics_id: e.target.value })}
                                        placeholder="G-XXXXXXXXXX"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Google Search Console Token</label>
                                    <input
                                        type="text"
                                        value={globalSettings.google_search_console_id || ''}
                                        onChange={e => setGlobalSettings({ ...globalSettings, google_search_console_id: e.target.value })}
                                        placeholder="Verification Code"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-700"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg text-gray-800 mb-4 tracking-tight flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-blue-600" /> Social Media & Identity
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Twitter Site (@handle)</label>
                                    <input
                                        type="text"
                                        value={globalSettings.twitter_site || ''}
                                        onChange={e => setGlobalSettings({ ...globalSettings, twitter_site: e.target.value })}
                                        placeholder="@username"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Twitter Creator (@handle)</label>
                                    <input
                                        type="text"
                                        value={globalSettings.twitter_creator || ''}
                                        onChange={e => setGlobalSettings({ ...globalSettings, twitter_creator: e.target.value })}
                                        placeholder="@creator"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Facebook URL</label>
                                    <input
                                        type="text"
                                        value={globalSettings.facebook_url || ''}
                                        onChange={e => setGlobalSettings({ ...globalSettings, facebook_url: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Instagram URL</label>
                                    <input
                                        type="text"
                                        value={globalSettings.instagram_url || ''}
                                        onChange={e => setGlobalSettings({ ...globalSettings, instagram_url: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">LinkedIn URL</label>
                                    <input
                                        type="text"
                                        value={globalSettings.linkedin_url || ''}
                                        onChange={e => setGlobalSettings({ ...globalSettings, linkedin_url: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg text-gray-800 mb-4 tracking-tight">Custom Tracking Scripts</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Header Scripts (&lt;head&gt;)</label>
                                    <textarea
                                        value={globalSettings.scripts_header || ''}
                                        onChange={e => setGlobalSettings({ ...globalSettings, scripts_header: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-xs font-mono text-green-400 focus:ring-1 focus:ring-green-500 outline-none"
                                        rows={4}
                                        placeholder="<!-- Scripts here -->"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Footer Scripts (&lt;/body&gt;)</label>
                                    <textarea
                                        value={globalSettings.scripts_body || ''}
                                        onChange={e => setGlobalSettings({ ...globalSettings, scripts_body: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-xs font-mono text-green-400 focus:ring-1 focus:ring-green-500 outline-none"
                                        rows={4}
                                        placeholder="<!-- Scripts here -->"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <button
                                onClick={handleSaveGlobal}
                                className="flex items-center gap-2 px-8 py-3 bg-[#112922] text-white rounded-xl shadow-lg shadow-[#112922]/20 hover:bg-[#1a3a30] transition-all font-bold"
                            >
                                <Save className="w-4 h-4" /> Save Global Settings
                            </button>
                        </div>
                    </div>
                )}

                {/* REDIRECTS TAB */}
                {activeTab === 'redirects' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">Redirect Management</h3>
                                <p className="text-sm text-gray-500">Manage 301/302 redirects to preserve SEO juice</p>
                            </div>
                            <button
                                onClick={() => {
                                    setEditingRedirect(null);
                                    setRedirectForm({ source_url: '', target_url: '', status_code: 301 });
                                    setIsRedirectModalOpen(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-[#112922] text-white rounded-lg hover:bg-[#1a3a30] transition-colors text-sm font-bold"
                            >
                                <Plus className="w-4 h-4" /> New Redirect
                            </button>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-gray-100">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-[#f8f9fa] text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4 font-bold rounded-tl-xl w-1/3">Source URL (Old)</th>
                                        <th className="px-6 py-4 font-bold w-1/3">Target URL (New)</th>
                                        <th className="px-6 py-4 font-bold">Type</th>
                                        <th className="px-6 py-4 font-bold rounded-tr-xl text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {redirects.map((redirect) => (
                                        <tr key={redirect.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-gray-600 truncate">{redirect.source_url}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-600 truncate">{redirect.target_url}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold ${redirect.status_code === 301 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {redirect.status_code}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteRedirect(redirect.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {redirects.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">
                                                No redirects configured.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TECHNICAL HEALTH TAB */}
                {activeTab === 'tech' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                                <h3 className="text-lg font-bold text-green-900">Sitemap Status</h3>
                            </div>
                            <p className="text-green-800/80 text-sm mb-4">Your sitemap is automatically generated and updated whenever you modify content.</p>
                            <a
                                href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/sitemap.xml`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 hover:underline"
                            >
                                Check Sitemap <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                            <div className="flex items-center gap-3 mb-4">
                                <FileText className="w-6 h-6 text-blue-600" />
                                <h3 className="text-lg font-bold text-blue-900">Robots.txt</h3>
                            </div>
                            <p className="text-blue-800/80 text-sm mb-4">Search engine crawlers instructions are optimized for Google indexing.</p>
                            <a
                                href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/robots.txt`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800 hover:underline"
                            >
                                View File <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <AlertCircle className="w-6 h-6 text-gray-600" />
                                <h3 className="text-lg font-bold text-gray-900">Cache Management</h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">If your changes aren't reflecting on the website instantly, try clearing the system cache. This refreshes all SEO data and settings.</p>
                            <button
                                onClick={handleClearCache}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <RefreshCw className="w-4 h-4" /> Clear System Cache Now
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Page Edit Modal */}
            {isPageModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
                            <h3 className="font-bold text-lg text-gray-800">{editingPage ? 'Edit Page SEO' : 'New Page Record'}</h3>
                            <button onClick={() => setIsPageModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Page Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={pageForm.page_name}
                                        onChange={e => setPageForm({ ...pageForm, page_name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium"
                                        placeholder="e.g. Home Page"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Identifier / Slug <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={pageForm.page_identifier}
                                        onChange={e => setPageForm({ ...pageForm, page_identifier: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-600"
                                        placeholder="e.g. home"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">SEO Title <span className="text-blue-500 text-[10px] ml-1">Recommend 60 chars</span></label>
                                <input
                                    type="text"
                                    value={pageForm.title || ''}
                                    onChange={e => setPageForm({ ...pageForm, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Page Title | Website Name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Meta Description <span className="text-blue-500 text-[10px] ml-1">Recommend 160 chars</span></label>
                                <textarea
                                    value={pageForm.meta_description || ''}
                                    onChange={e => setPageForm({ ...pageForm, meta_description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Summary of the page content..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Page Keywords</label>
                                <textarea
                                    value={pageForm.meta_keywords || ''}
                                    onChange={e => setPageForm({ ...pageForm, meta_keywords: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    placeholder="Comma separated keywords..."
                                />
                            </div>

                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Reading Time</label>
                                    <input
                                        type="text"
                                        value={pageForm.reading_time || ''}
                                        onChange={e => setPageForm({ ...pageForm, reading_time: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                        placeholder="e.g. 5 mins"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Content Type</label>
                                    <select
                                        value={pageForm.content_type || 'website'}
                                        onChange={e => setPageForm({ ...pageForm, content_type: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                    >
                                        <option value="website">Website</option>
                                        <option value="article">Article</option>
                                        <option value="product">Product</option>
                                        <option value="profile">Profile</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Author</label>
                                    <input
                                        type="text"
                                        value={pageForm.author || ''}
                                        onChange={e => setPageForm({ ...pageForm, author: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                            </div>


                            <div className="flex gap-6 pt-4 border-t border-gray-100">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${pageForm.no_index ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300'}`}>
                                        {pageForm.no_index && <CheckCircle className="w-3.5 h-3.5" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={pageForm.no_index}
                                        onChange={e => setPageForm({ ...pageForm, no_index: e.target.checked })}
                                        className="hidden"
                                    />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">No Index (Hide from Google)</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${pageForm.no_follow ? 'bg-amber-500 border-amber-500 text-white' : 'border-gray-300'}`}>
                                        {pageForm.no_follow && <CheckCircle className="w-3.5 h-3.5" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={pageForm.no_follow}
                                        onChange={e => setPageForm({ ...pageForm, no_follow: e.target.checked })}
                                        className="hidden"
                                    />
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-amber-600 transition-colors">No Follow (Links ignored)</span>
                                </label>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 sticky bottom-0">
                            <button onClick={() => setIsPageModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-100 transition-all">Cancel</button>
                            <button onClick={handleSavePage} className="px-6 py-2.5 rounded-xl bg-[#112922] text-white font-bold hover:bg-[#1a3a30] transition-all shadow-lg shadow-[#112922]/20">
                                {editingPage ? 'Update Page' : 'Save Record'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Redirect Edit Modal */}
            {isRedirectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                            <h3 className="font-bold text-lg text-gray-800">{editingRedirect ? 'Edit Redirect' : 'New Redirect Rule'}</h3>
                            <button onClick={() => setIsRedirectModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Source URL (Old Path)</label>
                                <input
                                    type="text"
                                    value={redirectForm.source_url}
                                    onChange={e => setRedirectForm({ ...redirectForm, source_url: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                                    placeholder="/old-page"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Target URL (New Path)</label>
                                <input
                                    type="text"
                                    value={redirectForm.target_url}
                                    onChange={e => setRedirectForm({ ...redirectForm, target_url: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                                    placeholder="/new-page"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Redirect Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all flex-1">
                                        <input
                                            type="radio"
                                            name="status_code"
                                            checked={redirectForm.status_code == 301}
                                            onChange={() => setRedirectForm({ ...redirectForm, status_code: 301 })}
                                            className="text-[#112922] focus:ring-[#112922]"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 text-sm">301 Permanent</span>
                                            <span className="text-[10px] text-gray-400">SEO Juice Transferred</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all flex-1">
                                        <input
                                            type="radio"
                                            name="status_code"
                                            checked={redirectForm.status_code == 302}
                                            onChange={() => setRedirectForm({ ...redirectForm, status_code: 302 })}
                                            className="text-[#112922] focus:ring-[#112922]"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800 text-sm">302 Temporary</span>
                                            <span className="text-[10px] text-gray-400">SEO Juice NOT Transferred</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                            <button onClick={() => setIsRedirectModalOpen(false)} className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-100 transition-all">Cancel</button>
                            <button onClick={handleSaveRedirect} className="px-6 py-2.5 rounded-xl bg-[#112922] text-white font-bold hover:bg-[#1a3a30] transition-all shadow-lg shadow-[#112922]/20">
                                {editingRedirect ? 'Update Redirect' : 'Create Rule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeoManager;
