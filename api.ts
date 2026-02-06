
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Add a request interceptor to add the bearer token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = async (credentials: any) => {
    const response = await api.post('/admin/login', credentials);
    if (response.data.status === 'success') {
        localStorage.setItem('admin_token', response.data.data.token);
        localStorage.setItem('admin_user', JSON.stringify(response.data.data.user));
    }
    return response.data;
};

export const logout = async () => {
    try {
        await api.post('/admin/logout');
    } finally {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
    }
};

export const getDashboardStats = async (params?: { start_date?: string; end_date?: string }) => {
    const response = await api.get('/admin/dashboard', { params });
    return response.data;
};

export const getAdminProperties = async () => {
    const response = await api.get(`/admin/properties?_t=${new Date().getTime()}`);
    return response.data;
};

export const createProperty = async (data: any) => {
    const response = await api.post('/admin/properties', data);
    return response.data;
};

export const updateProperty = async (id: number | string, data: any) => {
    const response = await api.put(`/admin/properties/${id}`, data);
    return response.data;
};

export const deleteProperty = async (id: number | string) => {
    const response = await api.delete(`/admin/properties/${id}`);
    return response.data;
};

export const getAdminInquiries = async () => {
    const response = await api.get('/admin/inquiries');
    return response.data;
};

export const updateInquiryStatus = async (id: number | string, status: string) => {
    const response = await api.put(`/admin/inquiries/${id}`, { status });
    return response.data;
};

export const deleteInquiry = async (id: number | string) => {
    const response = await api.delete(`/admin/inquiries/${id}`);
    return response.data;
};

// --- Team Management ---
export const getTeam = async () => (await api.get('/admin/team')).data;
export const createTeamMember = async (data: any) => (await api.post('/admin/team', data)).data;
export const updateTeamMember = async (id: string, data: any) => (await api.put(`/admin/team/${id}`, data)).data;
export const deleteTeamMember = async (id: string) => (await api.delete(`/admin/team/${id}`)).data;

// --- Testimonials ---
export const getTestimonials = async () => (await api.get('/admin/testimonials')).data;
export const createTestimonial = async (data: any) => (await api.post('/admin/testimonials', data)).data;
export const updateTestimonial = async (id: string, data: any) => (await api.put(`/admin/testimonials/${id}`, data)).data;
export const deleteTestimonial = async (id: string) => (await api.delete(`/admin/testimonials/${id}`)).data;

// --- Partners ---
export const getPartners = async () => (await api.get('/admin/partners')).data;
export const createPartner = async (data: any) => (await api.post('/admin/partners', data)).data;
export const updatePartner = async (id: string, data: any) => (await api.put(`/admin/partners/${id}`, data)).data;
export const deletePartner = async (id: string) => (await api.delete(`/admin/partners/${id}`)).data;

// --- Homepage CMS ---
export const getHomepageSections = async () => (await api.get('/admin/homepage-sections')).data;
export const updateHomepageSection = async (id: string, data: any) => (await api.put(`/admin/homepage-sections/${id}`, data)).data;

// --- Hero Slides ---
export const getHeroSlides = async () => (await api.get('/cms/hero-slides')).data;
export const createHeroSlide = async (formData: FormData) => {
    return (await api.post('/cms/hero-slides', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
};
export const updateHeroSlide = async (id: string, formData: FormData) => {
    formData.append('_method', 'PUT');
    return (await api.post(`/cms/hero-slides/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
};
export const deleteHeroSlide = async (id: string) => (await api.delete(`/cms/hero-slides/${id}`)).data;

// --- Locations (Dubai Categories) ---
export const getAdminLocations = async () => (await api.get('/admin/locations')).data;
export const createLocation = async (formData: FormData) => {
    return (await api.post('/admin/locations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
};
export const updateLocation = async (id: string | number, formData: FormData) => {
    formData.append('_method', 'PUT');
    return (await api.post(`/admin/locations/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
};
export const deleteLocation = async (id: string | number) => (await api.delete(`/admin/locations/${id}`)).data;

// --- Settings ---
export const getAdminSettings = async () => (await api.get('/admin/settings')).data;
export const updateAdminSettings = async (data: any) => {
    const isFormData = data instanceof FormData;
    return (await api.post('/admin/settings', data, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    })).data;
};
export const getPublicSettings = async () => (await api.get('/cms/settings')).data;

// --- Profile ---
export const getProfile = async () => (await api.get('/admin/me')).data;
export const updateProfile = async (data: any) => (await api.post('/admin/profile', data)).data;

// --- Newsletter ---
export const getNewsletterSubscribers = async () => (await api.get('/admin/newsletter')).data;
export const deleteNewsletterSubscriber = async (id: number | string) => (await api.delete(`/admin/newsletter/${id}`)).data;

export const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/admin/media/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        // Important: let the browser set the boundary for multipart/form-data
        transformRequest: (data, headers) => {
            delete headers['Content-Type'];
            return data;
        },
    });
    return response.data;
};

export const uploadGalleryImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/admin/properties/upload-gallery', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data, headers) => {
            delete headers['Content-Type'];
            return data;
        },
    });
    return response.data;
};

export const uploadGalleryImagesBatch = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('images[]', file);
    });

    const response = await api.post('/admin/properties/upload-gallery-batch', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data, headers) => {
            delete headers['Content-Type'];
            return data;
        },
    });
    return response.data;
};

// ---// SEO Manager (New System)
export const getSeoPages = async () => (await api.get('/admin/seo-pages')).data;
export const createSeoPage = async (data: any) => (await api.post('/admin/seo-pages', data)).data;
export const updateSeoPage = async (id: number, data: any) => (await api.put(`/admin/seo-pages/${id}`, data)).data;
export const deleteSeoPage = async (id: number) => (await api.delete(`/admin/seo-pages/${id}`)).data;

export const getSeoRedirects = async () => (await api.get('/admin/seo-redirects')).data;
export const createSeoRedirect = async (data: any) => (await api.post('/admin/seo-redirects', data)).data;
export const updateSeoRedirect = async (id: number, data: any) => (await api.put(`/admin/seo-redirects/${id}`, data)).data;
export const deleteSeoRedirect = async (id: number) => (await api.delete(`/admin/seo-redirects/${id}`)).data;

export const clearSystemCache = async () => (await api.post('/admin/system/clear-cache', {})).data;

// --- SEO Settings ---
export const getSeoSettings = async () => (await api.get('/admin/seo')).data;
export const getSeoSetting = async (identifier: string) => (await api.get(`/admin/seo/${identifier}`)).data;
export const createSeoSetting = async (data: any) => (await api.post('/admin/seo', data)).data;
export const updateSeoSetting = async (id: string | number, data: any) => (await api.put(`/admin/seo/${id}`, data)).data;
export const deleteSeoSetting = async (id: string | number) => (await api.delete(`/admin/seo/${id}`)).data;
export const previewSeo = async (identifier: string) => (await api.get(`/admin/seo/${identifier}/preview`)).data;

// --- Branding Settings ---
export const getBranding = async () => (await api.get('/admin/branding')).data;
export const updateBranding = async (data: any) => (await api.post('/admin/branding', data)).data;
export const uploadFavicon = async (file: File, type: 'light' | 'dark' | 'ico') => {
    const formData = new FormData();
    formData.append('favicon', file);
    formData.append('type', type);
    return (await api.post('/admin/branding/favicon', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
};
export const uploadLogo = async (file: File, type: 'light' | 'dark' | 'icon') => {
    const formData = new FormData();
    formData.append('logo', file);
    formData.append('type', type);
    return (await api.post('/admin/branding/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
};
export const uploadSocialImage = async (file: File, type: 'og' | 'twitter') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    return (await api.post('/admin/branding/social-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })).data;
};

export default api;


