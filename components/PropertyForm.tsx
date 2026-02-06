import React, { useState, useEffect } from 'react';
import {
  X, Save, ChevronRight, ChevronLeft,
  Layout, Ruler, Image as ImageIcon, AlignLeft,
  DollarSign, Lock, Check, Upload, Sparkles
} from 'lucide-react';
import { Property } from '../types';
import { uploadImage, uploadGalleryImage, uploadGalleryImagesBatch, getAdminLocations } from '../api';

interface PropertyFormProps {
  property?: Property | null;
  onClose: () => void;
  onSave: (data: any) => void;
}

const tabs = [
  { id: 'basic', label: 'Basic Details', icon: Layout },
  { id: 'specs', label: 'Specifications', icon: Ruler },
  { id: 'launches', label: 'Off-Plan', icon: Sparkles },
  { id: 'media', label: 'Media', icon: ImageIcon },
  { id: 'desc', label: 'Description', icon: AlignLeft },
  { id: 'pricing', label: 'Pricing & Tags', icon: DollarSign },
  { id: 'vault', label: 'Private Vault', icon: Lock },
];

const PropertyForm: React.FC<PropertyFormProps> = ({ property, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryVideos, setGalleryVideos] = useState<string[]>([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await getAdminLocations();
        if (res.status === 'success') {
          setLocations(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch locations", error);
      }
    };
    fetchLocations();

    // Initialize gallery from property data
    if (property) {
      if (property.images) {
        try {
          const imgs = typeof property.images === 'string' ? JSON.parse(property.images) : property.images;
          setGalleryImages(Array.isArray(imgs) ? imgs : []);
        } catch (e) {
          setGalleryImages([]);
        }
      }
      if (property.videos) {
        try {
          const vids = typeof property.videos === 'string' ? JSON.parse(property.videos) : property.videos;
          setGalleryVideos(Array.isArray(vids) ? vids : []);
        } catch (e) {
          setGalleryVideos([]);
        }
      }
    }
  }, [property]);

  const [formData, setFormData] = useState<any>(property || {
    title: '',
    type: 'Apartment',
    location: '',
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    area_sqft: 0,
    status: 'active',
    featured: false,
    description: '',
    parking: 0,
    visibility: 'Public',
    roi: '',
    image: 'https://images.unsplash.com/photo-1600607687940-c52af084399c?q=80&w=400&auto=format&fit=crop'
  });

  const handleNext = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

  // Real Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      setUploadingImage(true);
      try {
        const response = await uploadImage(file);
        if (response.status === 'success') {
          setFormData({ ...formData, image: response.data.url });
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

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);

      // Validate files
      const validFiles = files.filter((file: File) => {
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large (max 10MB)`);
          return false;
        }
        if (!file.type.startsWith('image/')) {
          alert(`File ${file.name} is not an image`);
          return false;
        }
        return true;
      }) as File[];

      if (validFiles.length === 0) return;

      setUploadingGallery(true);
      try {
        const response = await uploadGalleryImagesBatch(validFiles);
        if (response.status === 'success') {
          setGalleryImages(prev => [...prev, ...response.data.urls]);
          alert(`${validFiles.length} image(s) uploaded successfully!`);
        }
      } catch (error: any) {
        console.error('Gallery upload error:', error);
        alert('Failed to upload gallery images. Please check file sizes or try fewer images.');
      } finally {
        setUploadingGallery(false);
        // Clear the input so the same files can be selected again
        e.target.value = '';
      }
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-100 focus:border-[#112922]/20 focus:bg-white focus:ring-4 focus:ring-[#112922]/5 rounded-xl py-2.5 px-4 text-sm transition-all outline-none text-[#112922]";
  const labelClass = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2";

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex items-center justify-end">
      <div className="bg-white w-full max-w-4xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#112922]">{property ? 'Edit Property' : 'Add New Property'}</h2>
            <p className="text-sm text-gray-500">Dubai Luxury Market Standards</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-50 px-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'border-[#112922] text-[#112922]'
                : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-bold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto space-y-8">
            {activeTab === 'basic' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className={labelClass}>Property Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Burj Vista Sky Collection"
                      className={inputClass}
                      value={formData.title || formData.name || ''}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Property Type <span className="text-red-500">*</span></label>
                    <div className="space-y-2">
                      <select
                        className={inputClass}
                        value={['Apartment', 'Villa', 'Penthouse', 'Townhouse'].includes(formData.type) ? formData.type : 'custom'}
                        onChange={e => {
                          if (e.target.value === 'custom') {
                            setFormData({ ...formData, type: '' });
                          } else {
                            setFormData({ ...formData, type: e.target.value });
                          }
                        }}
                      >
                        <option value="Apartment">Apartment</option>
                        <option value="Villa">Villa</option>
                        <option value="Penthouse">Penthouse</option>
                        <option value="Townhouse">Townhouse</option>
                        <option value="custom">+ Custom Type...</option>
                      </select>
                      {!['Apartment', 'Villa', 'Penthouse', 'Townhouse'].includes(formData.type) && (
                        <input
                          type="text"
                          className={inputClass}
                          placeholder="Type custom property type..."
                          value={formData.type}
                          onChange={e => setFormData({ ...formData, type: e.target.value })}
                          autoFocus
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Section Category</label>
                    <div className="space-y-2">
                      <select
                        className={inputClass}
                        value={['', 'off_plan', 'ready', 'prime'].includes(formData.category) ? formData.category : 'custom'}
                        onChange={e => {
                          if (e.target.value === 'custom') {
                            setFormData({ ...formData, category: '' });
                          } else {
                            setFormData({ ...formData, category: e.target.value });
                          }
                        }}
                      >
                        <option value="">None</option>
                        <option value="off_plan">First Launches</option>
                        <option value="ready">Ready Assets</option>
                        <option value="prime">Prime City</option>
                        <option value="custom">+ Custom Category...</option>
                      </select>
                      {!['', 'off_plan', 'ready', 'prime'].includes(formData.category) && (
                        <input
                          type="text"
                          className={inputClass}
                          placeholder="Type custom category..."
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          autoFocus
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Listing Type <span className="text-red-500">*</span></label>
                    <div className="space-y-2">
                      <select
                        className={inputClass}
                        value={['Sale', 'Rent'].includes(formData.listing_type || 'Sale') ? (formData.listing_type || 'Sale') : 'custom'}
                        onChange={e => {
                          if (e.target.value === 'custom') {
                            setFormData({ ...formData, listing_type: '' });
                          } else {
                            setFormData({ ...formData, listing_type: e.target.value });
                          }
                        }}
                      >
                        <option value="Sale">For Sale</option>
                        <option value="Rent">For Rent</option>
                        <option value="custom">+ Custom Type...</option>
                      </select>
                      {!['Sale', 'Rent'].includes(formData.listing_type || 'Sale') && (
                        <input
                          type="text"
                          className={inputClass}
                          placeholder="Type custom listing type..."
                          value={formData.listing_type}
                          onChange={e => setFormData({ ...formData, listing_type: e.target.value })}
                          autoFocus
                        />
                      )}
                    </div>
                  </div>
                  {(formData.listing_type === 'Rent' || property?.listing_type === 'Rent') && (
                    <div>
                      <label className={labelClass}>Rent Frequency</label>
                      <div className="space-y-2">
                        <select
                          className={inputClass}
                          value={['Yearly', 'Monthly', 'Weekly', 'Daily'].includes(formData.rent_frequency || 'Yearly') ? (formData.rent_frequency || 'Yearly') : 'custom'}
                          onChange={e => {
                            if (e.target.value === 'custom') {
                              setFormData({ ...formData, rent_frequency: '' });
                            } else {
                              setFormData({ ...formData, rent_frequency: e.target.value });
                            }
                          }}
                        >
                          <option value="Yearly">Yearly</option>
                          <option value="Monthly">Monthly</option>
                          <option value="Weekly">Weekly</option>
                          <option value="Daily">Daily</option>
                          <option value="custom">+ Custom Frequency...</option>
                        </select>
                        {!['Yearly', 'Monthly', 'Weekly', 'Daily'].includes(formData.rent_frequency || 'Yearly') && (
                          <input
                            type="text"
                            className={inputClass}
                            placeholder="Type custom frequency..."
                            value={formData.rent_frequency}
                            onChange={e => setFormData({ ...formData, rent_frequency: e.target.value })}
                            autoFocus
                          />
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <label className={labelClass}>Price (AED) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className={inputClass}
                      value={formData.price || ''}
                      onChange={e => setFormData({ ...formData, price: e.target.value === '' ? '' : Number(e.target.value) })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Location <span className="text-red-500">*</span></label>
                    <div className="space-y-2">
                      <select
                        className={inputClass}
                        value={locations.map(l => l.name).includes(formData.location) ? formData.location : (formData.location === '' ? '' : 'custom')}
                        onChange={e => {
                          if (e.target.value === 'custom') {
                            // Keep current
                          } else {
                            setFormData({ ...formData, location: e.target.value });
                          }
                        }}
                      >
                        <option value="">Select Location</option>
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.name}>{loc.name}</option>
                        ))}
                        <option value="custom">+ Custom Location...</option>
                      </select>
                      {(!locations.map(l => l.name).includes(formData.location) && formData.location !== '') && (
                        <input
                          type="text"
                          className={inputClass}
                          placeholder="Type custom location..."
                          value={formData.location}
                          onChange={e => setFormData({ ...formData, location: e.target.value })}
                          autoFocus
                        />
                      )}
                      {(formData.location === '' && document.activeElement?.tagName !== 'SELECT') && (
                        <input
                          type="text"
                          className={inputClass}
                          placeholder="Search location or type custom..."
                          value={formData.location}
                          onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <h4 className="text-sm font-bold text-[#112922]">Featured Listing</h4>
                    <p className="text-xs text-gray-500">Show this on the homepage luxury collection</p>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.featured ? 'bg-[#112922]' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.featured ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label className={labelClass}>Bedrooms (BHK) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    className={inputClass}
                    value={formData.bedrooms}
                    onChange={e => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Bathrooms <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    className={inputClass}
                    value={formData.bathrooms}
                    onChange={e => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Built-up Area (sqft) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    className={inputClass}
                    value={formData.area_sqft || formData.area}
                    onChange={e => setFormData({ ...formData, area_sqft: Number(e.target.value), area: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Parking Slots</label>
                  <input
                    type="number"
                    className={inputClass}
                    placeholder="0"
                    value={formData.parking || 0}
                    onChange={e => setFormData({ ...formData, parking: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className={labelClass}>ROI (Return on Investment)</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="e.g., 8.2%"
                    value={formData.roi || ''}
                    onChange={e => setFormData({ ...formData, roi: e.target.value })}
                  />
                  <p className="text-xs text-gray-400 mt-1">Displayed on Ready Assets cards</p>
                </div>
              </div>
            )}
            {activeTab === 'launches' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                      <p className="text-xs text-amber-800 font-medium">These fields are specifically for the "FUTURE Launches" and "Off-Plan" sections of the website.</p>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Developer Name</label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="e.g., Emaar, Damac"
                      value={formData.developer || ''}
                      onChange={e => setFormData({ ...formData, developer: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Handover Date</label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="e.g., Q4 2026"
                      value={formData.handover_date || ''}
                      onChange={e => setFormData({ ...formData, handover_date: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Project Highlights (One per line)</label>
                    <textarea
                      className={inputClass + " h-32 resize-none"}
                      placeholder="e.g. Waterfront Living&#10;Private Beach Access&#10;Luxury Spa"
                      value={Array.isArray(formData.highlights) ? formData.highlights.join('\n') : (formData.highlights || '')}
                      onChange={e => setFormData({ ...formData, highlights: e.target.value.split('\n').filter(h => h.trim() !== '') })}
                    />
                    <p className="text-xs text-gray-400 mt-1">These will appear as bullet points on the Future Launches cards.</p>
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Payment Plan</label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="e.g., 80/20 with Q4 Handover"
                      value={formData.payment_plan || ''}
                      onChange={e => setFormData({ ...formData, payment_plan: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'media' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Main Property Image Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-[#112922] border-b border-gray-100 pb-2">Main Property Image</h3>
                  {/* Current Image Preview */}
                  {formData.image && (
                    <div className="relative rounded-2xl overflow-hidden border border-gray-100">
                      <img
                        src={formData.image}
                        alt="Property"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-green-600">
                        ✓ Current Image
                      </div>
                    </div>
                  )}

                  {/* Upload Area */}
                  <div className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all relative ${uploadingImage
                    ? 'border-[#112922] bg-[#112922]/5'
                    : 'border-gray-200 hover:border-[#112922]/30 group'
                    }`}>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />

                    {uploadingImage ? (
                      <div className="space-y-3">
                        <div className="w-16 h-16 bg-[#112922] rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                          <Upload className="w-8 h-8 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-[#112922]">Uploading...</h4>
                        <p className="text-xs text-gray-400">Please wait</p>
                      </div>
                    ) : (
                      <div>
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                        </div>
                        <h4 className="text-sm font-bold text-[#112922]">Upload Property Image</h4>
                        <p className="text-xs text-gray-400 mt-1">Click to select from your gallery (Max 5MB)</p>
                        <p className="text-xs text-green-600 mt-2 font-bold">✓ Real Upload Enabled</p>
                      </div>
                    )}
                  </div>

                  {/* Manual URL Input (Fallback) */}
                  <div>
                    <label className={labelClass}>Or paste Image URL</label>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="https://example.com/image.jpg"
                      value={formData.image || ''}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                    />
                    <p className="text-xs text-gray-400 mt-2">You can also paste an image URL directly</p>
                  </div>
                </div>

                {/* Gallery Images Section */}
                <div className="space-y-6 pt-8 border-t border-gray-100">
                  <div>
                    <h3 className="text-lg font-bold text-[#112922] mb-2">Gallery Images</h3>
                    <p className="text-xs text-gray-500">Upload multiple images for the property gallery (Max 20 images). These will appear in the Visual Gallery section on the property detail page.</p>
                  </div>

                  {/* Gallery Grid */}
                  {galleryImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {galleryImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={img}
                            className="w-full h-32 object-cover rounded-xl border border-gray-100"
                            alt={`Gallery ${idx + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm hover:bg-red-600"
                          >
                            ×
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                            {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  {galleryImages.length < 20 && (
                    <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all relative ${uploadingGallery
                      ? 'border-[#112922] bg-[#112922]/5'
                      : 'border-gray-200 hover:border-[#112922]/30 group'
                      }`}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleGalleryImageUpload}
                        disabled={uploadingGallery}
                      />
                      <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-sm font-bold text-[#112922]">
                        {uploadingGallery ? 'Uploading Gallery...' : '+ Add Gallery Images'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Select multiple images (Max 10MB each)</p>
                    </div>
                  )}
                </div>

                {/* Gallery Videos Section */}
                <div className="space-y-6 pt-8 border-t border-gray-100">
                  <div>
                    <h3 className="text-lg font-bold text-[#112922] mb-2">Gallery Videos</h3>
                    <p className="text-xs text-gray-500">Add video URLs (YouTube, Vimeo, or direct links) for the property gallery.</p>
                  </div>

                  {/* Video List */}
                  {galleryVideos.map((vid, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={vid}
                        onChange={(e) => {
                          const newVids = [...galleryVideos];
                          newVids[idx] = e.target.value;
                          setGalleryVideos(newVids);
                        }}
                        placeholder="https://youtube.com/watch?v=..."
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => setGalleryVideos(galleryVideos.filter((_, i) => i !== idx))}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex-shrink-0 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Add Video Button */}
                  <button
                    type="button"
                    onClick={() => setGalleryVideos([...galleryVideos, ''])}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm font-bold text-gray-400 hover:text-[#112922] hover:border-[#112922] transition-all"
                  >
                    + Add Video URL
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'desc' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label className={labelClass}>Full Description <span className="text-red-500">*</span></label>
                  <textarea
                    className={inputClass + " h-48 resize-none"}
                    placeholder="Enter detailed property description (required)..."
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label className={labelClass}>Listing Price (AED)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">AED</span>
                    <input
                      type="number"
                      className={`${inputClass} pl-14 font-bold text-lg`}
                      placeholder="0.00"
                      value={formData.price || ''}
                      onChange={e => setFormData({ ...formData, price: e.target.value === '' ? '' : Number(e.target.value) })}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Enter the full amount (e.g., 5500000). The website will format it automatically.</p>
                </div>
              </div>
            )}

            {activeTab === 'vault' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 text-center py-12">
                <div className="w-20 h-20 bg-[#112922]/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-10 h-10 text-[#112922]" />
                </div>
                <h3 className="text-xl font-bold text-[#112922]">Private Vault Visibility</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Enabling Private Vault makes this property visible only to verified investors.
                </p>
                <div className="flex justify-center pt-4">
                  <button
                    onClick={() => setFormData({ ...formData, visibility: formData.visibility === 'Public' ? 'Private Vault' : 'Public' })}
                    className={`px-8 py-3 rounded-xl font-bold transition-all ${formData.visibility === 'Private Vault'
                      ? 'bg-[#112922] text-white'
                      : 'bg-gray-100 text-gray-600'
                      }`}
                  >
                    {formData.visibility === 'Private Vault' ? 'Vault Enabled' : 'Enable Vault Access'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white">
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'basic' ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-gray-500 font-bold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            {activeTab !== 'vault' ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-[#112922] text-white rounded-xl font-bold hover:bg-emerald-900 transition-all shadow-lg shadow-black/10"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  const dataToSave = {
                    ...formData,
                    images: galleryImages,
                    videos: galleryVideos
                  };
                  onSave(dataToSave);
                }}
                className="flex items-center gap-2 px-10 py-3 bg-[#112922] text-white rounded-xl font-bold hover:bg-emerald-900 transition-all shadow-xl shadow-black/20"
              >
                <Check className="w-4 h-4" /> {property ? 'Update Property' : 'Save Property'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;
