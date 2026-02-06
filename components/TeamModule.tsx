
import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Search, Download, User, Briefcase, Camera, ArrowRight } from 'lucide-react';
import { getTeam, createTeamMember, updateTeamMember, deleteTeamMember, uploadImage } from '../api';

const TeamModule: React.FC = () => {
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        role: '',
        experience: '',
        bio: '',
        image: '',
        status: 'active',
        location: 'Dubai',
        languages: ''
    });

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        setLoading(true);
        try {
            const response = await getTeam();
            if (response.status === 'success') {
                setMembers(response.data);
            }
        } catch (error) {
            console.error("Error fetching team:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingMember) {
                await updateTeamMember(editingMember.id, {
                    ...formData,
                    languages: formData.languages.split(',').map(l => l.trim()).filter(l => l)
                });
            } else {
                await createTeamMember({
                    ...formData,
                    languages: formData.languages.split(',').map(l => l.trim()).filter(l => l)
                });
            }
            setIsFormOpen(false);
            setEditingMember(null);
            resetForm();
            fetchTeam();
        } catch (error: any) {
            console.error("Error saving team member:", error);
            if (error.response && error.response.data && error.response.data.errors) {
                const errorMessages = Object.values(error.response.data.errors).flat();
                alert(`Cannot save team member:\n• ${errorMessages.join('\n• ')}`);
            } else {
                alert("Failed to save team member. " + (error.message || "Please check your connection."));
            }
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to remove this team member?')) {
            try {
                await deleteTeamMember(id);
                setMembers(members.filter(m => m.id !== id));
            } catch (error) {
                console.error("Error deleting member:", error);
            }
        }
    };

    const resetForm = () => {
        setFormData({ name: '', role: '', experience: '', bio: '', image: '', status: 'active', location: 'Dubai', languages: '' });
    };

    const openEdit = (member: any) => {
        setEditingMember(member);
        setFormData({
            name: member.name,
            role: member.role,
            experience: member.experience || '',
            bio: member.bio || '',
            image: member.image || '',
            status: member.status,
            location: member.location || 'Dubai',
            languages: Array.isArray(member.languages) ? member.languages.join(', ') : (member.languages || '')
        });
        setIsFormOpen(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validate file size (20MB max)
            if (file.size > 20 * 1024 * 1024) {
                alert('Image size must be less than 20MB');
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

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleExport = () => {
        const headers = ["ID", "Name", "Role", "Status", "Date Added"];
        const csvContent = [
            headers.join(","),
            ...members.map(m => [
                m.id,
                `"${m.name}"`,
                `"${m.role}"`,
                m.status,
                m.created_at
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `team_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#112922] tracking-tight">Team Management</h1>
                    <p className="text-gray-500 mt-1">Manage your agents, advisors, and staff.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button
                        onClick={() => { resetForm(); setIsFormOpen(true); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#112922] text-white rounded-xl font-bold shadow-lg shadow-[#112922]/20 hover:bg-[#1a3a30] transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Add Member
                    </button>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="relative w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search team..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#112922]/10"
                        />
                    </div>
                    <span className="text-xs font-bold text-gray-400 uppercase">{filteredMembers.length} Members</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Member</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredMembers.map((member) => (
                                <tr key={member.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                                                {member.image ? (
                                                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 m-auto text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-[#112922]">{member.name}</p>
                                                <p className="text-xs text-gray-400 truncate max-w-[200px]">{member.bio || 'No bio provided'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="w-3 h-3 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-600">{member.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-[#112922]">{member.location || 'Dubai'}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${member.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(member)} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-[#112922] transition-all">
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(member.id)} className="p-2 hover:bg-red-50 hover:shadow-sm rounded-lg text-gray-400 hover:text-red-500 transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Form Modal */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                            <div>
                                <h3 className="text-xl font-black text-[#112922] tracking-tight">{editingMember ? 'Edit Team Member' : 'Add New Member'}</h3>
                                <p className="text-sm text-gray-400 mt-0.5">Fill in the details below to update your team.</p>
                            </div>
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                            >
                                <Plus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="space-y-8">

                                {/* Section 1: Personal Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-5 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#112922]/20 focus:ring-4 focus:ring-[#112922]/5 transition-all outline-none font-medium text-[#112922] placeholder:text-gray-400"
                                            placeholder="e.g. Sarah Jenkins"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Role / Designation</label>
                                        <input
                                            type="text"
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-5 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#112922]/20 focus:ring-4 focus:ring-[#112922]/5 transition-all outline-none font-medium text-[#112922] placeholder:text-gray-400"
                                            placeholder="e.g. Senior Broker"
                                        />
                                    </div>
                                </div>

                                {/* Section 2: Professional Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Experience</label>
                                        <input
                                            type="text"
                                            value={formData.experience}
                                            onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                            className="w-full px-5 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#112922]/20 focus:ring-4 focus:ring-[#112922]/5 transition-all outline-none font-medium text-[#112922] placeholder:text-gray-400"
                                            placeholder="e.g. 5+ Years"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Languages (Comma separated)</label>
                                        <input
                                            type="text"
                                            value={formData.languages}
                                            onChange={e => setFormData({ ...formData, languages: e.target.value })}
                                            className="w-full px-5 py-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-[#112922]/20 focus:ring-4 focus:ring-[#112922]/5 transition-all outline-none font-medium text-[#112922] placeholder:text-gray-400"
                                            placeholder="e.g. English, Hindi, Arabic"
                                        />
                                    </div>
                                </div>

                                {/* Section 3: Profile Image */}
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4 block">Profile Image</label>
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        {/* Preview Area */}
                                        <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-white shadow-sm shrink-0 border border-gray-100">
                                            {formData.image ? (
                                                <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                                    <User className="w-8 h-8 mb-1" />
                                                    <span className="text-[10px] font-medium">No Image</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Controls */}
                                        <div className="flex-1 w-full space-y-3">
                                            <div className="flex gap-3">
                                                <label className="flex-1 cursor-pointer group">
                                                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-[#112922] text-white rounded-xl font-bold group-hover:bg-[#1a3a30] transition-all shadow-md shadow-[#112922]/10 active:scale-95">
                                                        <Camera className="w-4 h-4" />
                                                        {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        disabled={uploadingImage}
                                                        className="hidden"
                                                    />
                                                </label>
                                                <button
                                                    onClick={() => setFormData({ ...formData, image: '' })}
                                                    className="px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95"
                                                    title="Remove Image"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t border-gray-200"></div>
                                                </div>
                                                <div className="relative flex justify-center text-xs">
                                                    <span className="px-2 bg-gray-50 text-gray-400 font-medium">OR PASTE URL</span>
                                                </div>
                                            </div>

                                            <input
                                                type="text"
                                                value={formData.image}
                                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                                                className="w-full px-4 py-2 bg-white rounded-xl border border-gray-200 focus:border-[#112922]/30 focus:ring-2 focus:ring-[#112922]/5 transition-all text-xs font-medium"
                                                placeholder="https://example.com/image.jpg"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Section 4: Bio */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Professional Bio</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-[#112922]/20 focus:ring-4 focus:ring-[#112922]/5 transition-all outline-none font-medium text-[#112922] placeholder:text-gray-400 h-32 resize-none leading-relaxed"
                                        placeholder="Write a brief introduction about the team member..."
                                    />
                                </div>

                                {/* Section 5: Status & Location */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#FDFCF0] rounded-2xl border border-[#C5A059]/20">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#C5A059] uppercase tracking-wide ml-1">Team Location</label>
                                        <div className="relative">
                                            <select
                                                value={formData.location}
                                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                                                className="w-full px-5 py-3 bg-white rounded-xl border border-[#C5A059]/30 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 transition-all outline-none font-bold text-[#112922] appearance-none cursor-pointer"
                                            >
                                                <option value="Dubai">Dubai Team</option>
                                                <option value="India">India Team</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#C5A059]">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#C5A059] uppercase tracking-wide ml-1">Account Status</label>
                                        <div className="relative">
                                            <select
                                                value={formData.status}
                                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full px-5 py-3 bg-white rounded-xl border border-[#C5A059]/30 focus:border-[#C5A059] focus:ring-4 focus:ring-[#C5A059]/10 transition-all outline-none font-bold text-[#112922] appearance-none cursor-pointer"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#C5A059]">
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm flex justify-end gap-3 shrink-0">
                            <button
                                onClick={() => setIsFormOpen(false)}
                                className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-200/50 rounded-xl transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-8 py-3 bg-[#112922] text-white font-bold rounded-xl hover:bg-[#1a3a30] transition-colors shadow-lg shadow-[#112922]/20 text-sm flex items-center gap-2"
                            >
                                <span>Save Member</span>
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamModule;
