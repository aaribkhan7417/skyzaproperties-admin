
import React, { useState, useEffect } from 'react';
import {
    Settings, Mail, Phone, MapPin, Globe,
    Facebook, Instagram, Linkedin, Twitter,
    Building2, Save, Loader2, Link as LinkIcon,
    User as UserIcon, Camera
} from 'lucide-react';
import { getAdminSettings, updateAdminSettings, getProfile, updateProfile } from '../api';
import { useSettings } from '../context/SettingsContext';

const SettingsModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'general' | 'contact' | 'social' | 'company'>('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { refreshSettings } = useSettings();
    const [logoFile, setLogoFile] = useState<File | null>(null);

    const [settings, setSettings] = useState<any>({
        site_name: '',
        meta_description: '',
        email_1: '',
        email_2: '',
        phone_1: '',
        phone_2: '',
        address: '',
        company_name: '',
        company_description: '',
        facebook_url: '',
        instagram_url: '',
        linkedin_url: '',
        whatsapp_number: '',
        footer_text: '',
        partner_link_1_name: '',
        partner_link_1_url: '',
        partner_link_2_url: '',
        favicon_url: '',
        default_og_image: '',
        google_analytics_id: '',
        google_search_console_id: ''
    });

    // Helper function to get proper image URL
    const getImageUrl = (path: string | null | undefined): string => {
        if (!path) return '';
        if (path.startsWith('data:')) return path;
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
        return `${baseUrl}${path}`;
    };

    const [profile, setProfile] = useState<any>({
        name: '',
        email: '',
        full_name: '',
        designation: '',
        phone: '',
        bio: '',
        avatar: ''
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [settingsRes, profileRes] = await Promise.all([
                getAdminSettings(),
                getProfile()
            ]);

            if (settingsRes.status === 'success') {
                setSettings(settingsRes.data);
            }
            if (profileRes.status === 'success') {
                setProfile(profileRes.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    const handleRemoveLogo = async () => {
        if (confirm('Are you sure you want to remove the logo? The site name will be displayed as text instead.')) {
            setSaving(true);
            try {
                const formData = new FormData();
                // Send all current settings
                Object.keys(settings).forEach(key => {
                    if (key !== 'company_logo' && settings[key] !== null && settings[key] !== undefined) {
                        formData.append(key, settings[key]);
                    }
                });
                // Explicitly set company_logo to empty string to trigger removal
                formData.append('company_logo', '');

                const response = await updateAdminSettings(formData);
                if (response.status === 'success') {
                    alert('Logo removed successfully! Site name will now be displayed as text.');
                    setLogoFile(null);
                    setSettings(response.data);
                    await refreshSettings(); // Refresh global settings
                } else {
                    alert(response.message || 'Failed to remove logo');
                }
            } catch (error: any) {
                console.error('Error removing logo:', error);
                alert('Failed to remove logo. Please try again.');
            } finally {
                setSaving(false);
            }
        }
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            Object.keys(settings).forEach(key => {
                if (settings[key] !== null && settings[key] !== undefined) {
                    formData.append(key, settings[key]);
                }
            });
            if (logoFile) {
                formData.append('company_logo', logoFile);
            }

            const response = await updateAdminSettings(formData);
            if (response.status === 'success') {
                alert('Settings updated successfully!');
                setSettings(response.data); // Update state with new data (including new logo URL)
                setLogoFile(null); // Reset file input
                await refreshSettings(); // Refresh global settings to update Sidebar
            } else {
                alert(response.message || 'Failed to update settings');
            }
        } catch (error: any) {
            console.error('Error updating settings:', error);
            const errorMsg = error.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join('\n')
                : error.response?.data?.message || 'Failed to update settings';
            alert(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const response = await updateProfile(profile);
            if (response.status === 'success') {
                alert('Profile updated successfully!');
                localStorage.setItem('admin_user', JSON.stringify(response.data));
            } else {
                alert(response.message || 'Failed to update profile');
            }
        } catch (error: any) {
            console.error('Error updating profile:', error);
            const errorMsg = error.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join('\n')
                : error.response?.data?.message || 'Failed to update profile';
            alert(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handleChangeSettings = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleChangeProfile = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile((prev: any) => ({ ...prev, [name]: value }));
    };

    // --- Locations Logic ---
    const [locations, setLocations] = useState<{ title: string; address: string }[]>([
        { title: 'Head Office', address: '' }
    ]);

    // Initialize locations from settings.address on load
    useEffect(() => {
        if (settings.address && !loading) {
            try {
                // Check if it looks like JSON
                if (settings.address.trim().startsWith('[')) {
                    const parsed = JSON.parse(settings.address);
                    if (Array.isArray(parsed)) {
                        setLocations(parsed);
                        return;
                    }
                }
                // Fallback for legacy text
                setLocations([{ title: 'Main Office', address: settings.address }]);
            } catch (e) {
                setLocations([{ title: 'Main Office', address: settings.address }]);
            }
        }
    }, [loading]); // Run once when loading finishes (and we have settings)

    // Update settings.address whenever locations change
    useEffect(() => {
        const serialized = JSON.stringify(locations);
        if (serialized !== settings.address && !loading) {
            setSettings((prev: any) => ({ ...prev, address: serialized }));
        }
    }, [locations]);

    const handleAddLocation = () => {
        setLocations([...locations, { title: '', address: '' }]);
    };

    const handleRemoveLocation = (index: number) => {
        const newLocations = locations.filter((_, i) => i !== index);
        setLocations(newLocations);
    };

    const handleLocationChange = (index: number, field: 'title' | 'address', value: string) => {
        const newLocations = [...locations];
        newLocations[index][field] = value;
        setLocations(newLocations);
    };
    // -----------------------

    if (loading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-[#112922] animate-spin" />
            </div>
        );
    }

    const inputClass = "w-full bg-white border border-gray-200 focus:border-[#112922] focus:ring-1 focus:ring-[#112922] rounded-xl py-3.5 px-5 text-sm font-medium transition-all outline-none text-[#112922] placeholder:text-gray-400 hover:border-gray-300 shadow-sm";
    const labelClass = "block text-sm font-bold text-[#112922] mb-2";
    const helperClass = "text-xs text-gray-500 mt-1.5 leading-relaxed";

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl pb-24 mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
                <div>
                    <h1 className="text-3xl font-black text-[#112922] tracking-tight">System Settings</h1>
                    <p className="text-gray-500 text-base mt-2 max-w-2xl">
                        Manage global configurations. Changes here will immediately reflect across your <strong>Main Website</strong> (Header, Footer, Contact Page) and <strong>Admin Dashboard</strong>.
                    </p>
                </div>
                <button
                    onClick={activeTab === 'profile' ? handleSaveProfile : handleSaveSettings}
                    disabled={saving}
                    className="flex items-center gap-2.5 px-8 py-3.5 bg-[#112922] text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-[#1a3a30] transition-all shadow-lg shadow-[#112922]/20 disabled:opacity-50 active:scale-95 shrink-0"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save {activeTab === 'profile' ? 'Profile' : 'Changes'}
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 gap-8 overflow-x-auto scrollbar-hide px-2">
                {[
                    { id: 'profile', label: 'My Profile', icon: UserIcon },
                    { id: 'general', label: 'General & Branding', icon: Settings },
                    { id: 'contact', label: 'Contact Info', icon: Mail },
                    { id: 'social', label: 'Social Media', icon: LinkIcon },
                    { id: 'company', label: 'Brand & Identity', icon: Building2 },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 py-4 border-b-[3px] transition-all flex-shrink-0 relative top-[1.5px] ${activeTab === tab.id
                            ? 'border-[#112922] text-[#112922]'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'stroke-[2.5px]' : ''}`} />
                        <span className={`text-base ${activeTab === tab.id ? 'font-bold' : 'font-medium'}`}>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content Card */}
            <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 min-h-[600px]">
                {activeTab === 'profile' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-4xl">
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-8 flex items-start gap-3">
                            <div className="p-2 bg-blue-100/50 rounded-lg text-blue-600">
                                <UserIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-blue-900">Personal Admin Profile</h4>
                                <p className="text-sm text-blue-700/80 mt-1 leading-relaxed">
                                    This information is private and only visible to you and other super admins in the dashboard. It is not shown publicly on the website.
                                </p>
                            </div>
                        </div>

                        {/* Avatar Section */}
                        <div className="flex items-center gap-6 pb-8 mb-8 border-b border-gray-100">
                            <div className="relative group shrink-0">
                                <div className="w-24 h-24 rounded-full bg-gray-50 border-2 border-white shadow-lg overflow-hidden flex items-center justify-center">
                                    {profile.avatar ? (
                                        <img src={profile.avatar} className="w-full h-full object-cover" alt="Avatar" />
                                    ) : (
                                        <UserIcon className="w-10 h-10 text-gray-300" />
                                    )}
                                </div>
                                <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#112922] rounded-full shadow-lg border-2 border-white flex items-center justify-center text-white hover:bg-[#1a3a30] transition-all">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-[#112922]">{profile.name || 'Admin User'}</h3>
                                <p className="text-sm font-medium text-gray-500 px-3 py-1 bg-gray-100 rounded-full w-fit">{profile.designation || 'Administrator'}</p>
                            </div>
                        </div>

                        {/* Profile Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <label className={labelClass}>Display Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleChangeProfile}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    onChange={handleChangeProfile}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Full Legal Name</label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={profile.full_name}
                                    onChange={handleChangeProfile}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Designation / Role</label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={profile.designation}
                                    onChange={handleChangeProfile}
                                    placeholder="e.g. Senior Broker"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Direct Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={profile.phone}
                                    onChange={handleChangeProfile}
                                    className={inputClass}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className={labelClass}>Bio / Professional Summary</label>
                                <textarea
                                    name="bio"
                                    value={profile.bio}
                                    onChange={handleChangeProfile}
                                    rows={4}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'general' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-4xl">
                        <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 mb-8 flex items-start gap-3">
                            <div className="p-2 bg-purple-100/50 rounded-lg text-purple-600">
                                <Globe className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-purple-900">Website Branding</h4>
                                <p className="text-sm text-purple-700/80 mt-1 leading-relaxed">
                                    Set your website's primary identity. Basic branding that appears across all pages.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {/* Site Name */}
                            <div>
                                <label className={labelClass}>Website Name</label>
                                <input
                                    type="text"
                                    name="site_name"
                                    value={settings.site_name || ''}
                                    onChange={handleChangeSettings}
                                    placeholder="e.g. Skyza Properties"
                                    className={inputClass}
                                />
                                <p className={helperClass}>
                                    This name is used in the browser tab and as the default site title.
                                </p>
                            </div>

                            {/* Favicon Upload Section (Simplified) */}
                            <div className="pt-6 border-t border-gray-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[#112922]">Favicon</h3>
                                        <p className="text-xs text-gray-500">Upload a single icon for browser tabs (PNG or ICO)</p>
                                    </div>
                                </div>

                                <div className="max-w-xs">
                                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-gray-200 transition-all">
                                        <div className="w-16 h-16 mx-auto bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center mb-4 overflow-hidden">
                                            {settings.favicon_url && getImageUrl(settings.favicon_url) ? (
                                                <img
                                                    src={getImageUrl(settings.favicon_url)}
                                                    alt="Favicon"
                                                    className="w-12 h-12 object-contain"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="text-center text-xs text-gray-400 font-bold">No Icon</div>
                                            )}
                                        </div>
                                        <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                            </svg>
                                            Upload Icon
                                            <input
                                                type="file"
                                                accept=".png,.ico"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        const file = e.target.files[0];
                                                        const reader = new FileReader();
                                                        reader.onload = (ev) => {
                                                            setSettings((prev: any) => ({ ...prev, favicon_url: ev.target?.result, favicon_url_file: file }));
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 text-center">Recommended: 512x512 PNG</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'contact' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-4xl">
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 mb-8 flex items-start gap-3">
                            <div className="p-2 bg-amber-100/50 rounded-lg text-amber-600">
                                <Phone className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-amber-900">Public Contact Information</h4>
                                <p className="text-sm text-amber-700/80 mt-1 leading-relaxed">
                                    These details will be publicly displayed on your <strong>Contact Us</strong> page and in the <strong>Website Footer</strong>. Visitors will use these to reach you.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <label className={labelClass}>Primary Email (Sales/Info)</label>
                                <input
                                    type="email"
                                    name="email_1"
                                    value={settings.email_1}
                                    onChange={handleChangeSettings}
                                    placeholder="contact@skyza.com"
                                    className={inputClass}
                                />
                                <p className={helperClass}>Main contact email displayed in the footer.</p>
                            </div>
                            <div>
                                <label className={labelClass}>Secondary Email (Support/HR)</label>
                                <input
                                    type="email"
                                    name="email_2"
                                    value={settings.email_2}
                                    onChange={handleChangeSettings}
                                    placeholder="support@skyza.com"
                                    className={inputClass}
                                />
                                <p className={helperClass}>Optional secondary email for the contact page.</p>
                            </div>
                            <div>
                                <label className={labelClass}>Primary Phone (Hotline)</label>
                                <input
                                    type="text"
                                    name="phone_1"
                                    value={settings.phone_1}
                                    onChange={handleChangeSettings}
                                    placeholder="+971 50 123 4567"
                                    className={inputClass}
                                />
                                <p className={helperClass}>Displayed prominently in the header and footer.</p>
                            </div>
                            <div>
                                <label className={labelClass}>Secondary Phone (Office)</label>
                                <input
                                    type="text"
                                    name="phone_2"
                                    value={settings.phone_2}
                                    onChange={handleChangeSettings}
                                    placeholder="+971 4 123 4567"
                                    className={inputClass}
                                />
                                <p className={helperClass}>Alternative number for the contact page.</p>
                            </div>

                            <div className="col-span-2 pt-6 pb-4">
                                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <label className="flex items-center gap-2.5 text-sm font-bold text-emerald-800 uppercase tracking-wide mb-3">
                                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.554 4.189 1.604 6.04L0 24l6.104-1.602a11.803 11.803 0 005.942 1.6h.005c6.634 0 12.032-5.396 12.035-12.03a11.77 11.77 0 00-3.527-8.503z" /></svg>
                                        WhatsApp Chat Button Number
                                    </label>
                                    <input
                                        type="text"
                                        name="whatsapp_number"
                                        value={settings.whatsapp_number}
                                        onChange={handleChangeSettings}
                                        placeholder="+971 50 123 4567"
                                        className="w-full bg-white border border-emerald-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3.5 px-5 text-sm font-medium transition-all outline-none text-[#112922] placeholder:text-gray-300 shadow-sm"
                                    />
                                    <p className="text-xs text-emerald-700 mt-2 font-medium">
                                        ⚠️ Important: This number triggers the floating WhatsApp chat button on your website. Ensure it includes the country code (e.g., +971...).
                                    </p>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <div className="flex items-center justify-between mb-3">
                                    <label className={labelClass}>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Physical Office Locations
                                        </div>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAddLocation}
                                        className="text-xs font-bold text-[#112922] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                                    >
                                        + Add Location
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {locations.map((loc, index) => (
                                        <div key={index} className="flex flex-col gap-3 p-5 bg-gray-50 border border-gray-100 rounded-xl group relative hover:border-gray-300 hover:shadow-sm transition-all">
                                            <div className="flex gap-4">
                                                <div className="mt-1">
                                                    <div className="w-8 h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 font-bold text-xs">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Location Title / Branch Name</label>
                                                        <input
                                                            type="text"
                                                            value={loc.title}
                                                            onChange={(e) => handleLocationChange(index, 'title', e.target.value)}
                                                            placeholder="e.g. Dubai Head Office"
                                                            className="w-full bg-white border border-gray-200 focus:border-[#112922] focus:ring-1 focus:ring-[#112922] rounded-lg py-2 px-3 text-sm font-bold text-[#112922] shadow-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Full Address</label>
                                                        <textarea
                                                            value={loc.address}
                                                            onChange={(e) => {
                                                                handleLocationChange(index, 'address', e.target.value);
                                                                e.target.style.height = 'auto';
                                                                e.target.style.height = `${e.target.scrollHeight}px`;
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.height = 'auto';
                                                                e.target.style.height = `${e.target.scrollHeight}px`;
                                                            }}
                                                            placeholder="Office 123, Text Tower, Business Bay..."
                                                            rows={4}
                                                            className="w-full bg-white border border-gray-200 focus:border-[#112922] focus:ring-1 focus:ring-[#112922] rounded-lg py-3 px-4 text-sm text-gray-600 shadow-sm overflow-hidden min-h-[100px]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {locations.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveLocation(index)}
                                                    className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Remove Location"
                                                >
                                                    <span className="sr-only">Remove</span>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className={helperClass}>
                                    These locations will be listed in the <strong>Footer</strong> and on the <strong>Contact Page</strong>.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'social' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-4xl">
                        <div className="bg-pink-50/50 border border-pink-100 rounded-xl p-4 mb-8 flex items-start gap-3">
                            <div className="p-2 bg-pink-100/50 rounded-lg text-pink-600">
                                <LinkIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-pink-900">Social Media Links</h4>
                                <p className="text-sm text-pink-700/80 mt-1 leading-relaxed">
                                    Links added here will appear as icons in your website footer and potentially in the mobile menu.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <label className={labelClass}>Facebook Page URL</label>
                                <div className="relative">
                                    <Facebook className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="url"
                                        name="facebook_url"
                                        value={settings.facebook_url}
                                        onChange={handleChangeSettings}
                                        placeholder="https://facebook.com/skyza"
                                        className={`${inputClass} pl-14`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Instagram Profile URL</label>
                                <div className="relative">
                                    <Instagram className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="url"
                                        name="instagram_url"
                                        value={settings.instagram_url}
                                        onChange={handleChangeSettings}
                                        placeholder="https://instagram.com/skyza"
                                        className={`${inputClass} pl-14`}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>LinkedIn Company URL</label>
                                <div className="relative">
                                    <Linkedin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="url"
                                        name="linkedin_url"
                                        value={settings.linkedin_url}
                                        onChange={handleChangeSettings}
                                        placeholder="https://linkedin.com/company/skyza"
                                        className={`${inputClass} pl-14`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'company' && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-5xl">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 flex items-start gap-3">
                            <div className="p-2 bg-slate-200/50 rounded-lg text-slate-700">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">Brand Identity & Footer Content</h4>
                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                    Upload your company logo and define the description text that appears at the bottom of every page in the footer.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">

                            {/* Logo Upload - Full Width */}
                            <div className="col-span-2">
                                <label className={labelClass}>Main Company Logo (Header & Footer)</label>
                                <div className="flex flex-col sm:flex-row items-center gap-8 p-1">
                                    <div className="w-40 h-40 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                                        {logoFile ? (
                                            <img src={URL.createObjectURL(logoFile)} alt="Preview" className="w-full h-full object-contain p-4" />
                                        ) : settings.company_logo ? (
                                            <img
                                                src={settings.company_logo.startsWith('http') ? settings.company_logo : `${import.meta.env.VITE_API_URL?.replace('/api', '')}${settings.company_logo}`}
                                                alt="Current Logo"
                                                className="w-full h-full object-contain p-4"
                                                onError={(e) => {
                                                    if (!settings.company_logo.startsWith('http')) {
                                                        (e.target as HTMLImageElement).src = settings.company_logo;
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="text-center">
                                                <span className="text-xs text-gray-400 font-medium block">No Logo Uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex gap-4">
                                            <label className="inline-flex cursor-pointer items-center gap-2.5 px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                                                <Camera className="w-4 h-4" />
                                                <span>Select New Logo File...</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleLogoChange}
                                                    className="hidden"
                                                />
                                            </label>
                                            {(settings.company_logo || logoFile) && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveLogo}
                                                    className="px-6 py-3 text-sm text-red-600 hover:text-red-700 font-bold hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                                >
                                                    Remove Logo
                                                </button>
                                            )}
                                        </div>

                                        <p className="text-xs text-gray-500 leading-relaxed max-w-lg">
                                            <strong>Recommendation:</strong> Use a high-quality <strong>PNG with a transparent background</strong>. <br />
                                            This logo will replace the text title in the top navigation bar and the website footer.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2 border-t border-gray-100 pt-2"></div>

                            <div className="col-span-2 md:col-span-1">
                                <label className={labelClass}>Official Company Name</label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={settings.company_name}
                                    onChange={handleChangeSettings}
                                    placeholder="Skyza Real Estate LLC"
                                    className={inputClass}
                                />
                                <p className={helperClass}>Used in legal copyrights (e.g., © 2024 Skyza Real Estate).</p>
                            </div>

                            <div className="col-span-2">
                                <label className={labelClass}>Footer "About Us" Description</label>
                                <textarea
                                    name="company_description"
                                    value={settings.company_description}
                                    onChange={handleChangeSettings}
                                    rows={4}
                                    placeholder="Briefly describe your company..."
                                    className={inputClass}
                                />
                                <p className={helperClass}>
                                    This paragraph appears directly below your logo in the website footer. Keep it between 2-3 sentences.
                                </p>
                            </div>

                            <div className="col-span-2 pt-8">
                                <h4 className="text-sm font-bold text-[#112922] uppercase tracking-wider mb-6 flex items-center gap-2 pb-3 border-b border-gray-100">
                                    <LinkIcon className="w-4 h-4" />
                                    Custom Footer Links (Partners/Portals)
                                </h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Link 1 Title</label>
                                        <input
                                            type="text"
                                            name="partner_link_1_name"
                                            value={settings.partner_link_1_name}
                                            onChange={handleChangeSettings}
                                            placeholder="e.g. Partner Login"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Link 1 URL</label>
                                        <input
                                            type="url"
                                            name="partner_link_1_url"
                                            value={settings.partner_link_1_url}
                                            onChange={handleChangeSettings}
                                            placeholder="https://..."
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Link 2 Title</label>
                                        <input
                                            type="text"
                                            name="partner_link_2_name"
                                            value={settings.partner_link_2_name}
                                            onChange={handleChangeSettings}
                                            placeholder="e.g. Employee Portal"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Link 2 URL</label>
                                        <input
                                            type="url"
                                            name="partner_link_2_url"
                                            value={settings.partner_link_2_url}
                                            onChange={handleChangeSettings}
                                            placeholder="https://..."
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsModule;
