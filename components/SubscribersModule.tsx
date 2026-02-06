import React, { useEffect, useState } from 'react';
import { Mail, Trash2, Search, Loader2 } from 'lucide-react';
import { getNewsletterSubscribers, deleteNewsletterSubscriber } from '../api';

const SubscribersModule: React.FC = () => {
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSubscribers = async () => {
        try {
            const response = await getNewsletterSubscribers();
            if (response.status === 'success') {
                setSubscribers(response.data);
            }
        } catch (error) {
            console.error('Error fetching subscribers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscribers();
    }, []);

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to remove this subscriber?')) return;
        try {
            await deleteNewsletterSubscriber(id);
            setSubscribers(subscribers.filter(s => s.id !== id));
        } catch (error) {
            alert('Failed to delete subscriber');
        }
    };

    const filteredSubscribers = subscribers.filter(s =>
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#112922]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-[#112922]">Newsletter Subscribers</h2>
                    <p className="text-gray-500 text-sm">Manage people who joined "Market Insights"</p>
                </div>
                <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search emails..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#112922]/10 transition-all w-64"
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 font-left text-left">
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">Email Address</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">Subscribed Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-left">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-left text-left">
                        {filteredSubscribers.length > 0 ? (
                            filteredSubscribers.map((subscriber) => (
                                <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-left text-left">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#112922]/5 flex items-center justify-center">
                                                <Mail className="w-4 h-4 text-[#112922]" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{subscriber.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-left text-left">
                                        {new Date(subscriber.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className="px-6 py-4 font-left text-left">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${subscriber.status === 'active'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {subscriber.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(subscriber.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    No subscribers found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SubscribersModule;
