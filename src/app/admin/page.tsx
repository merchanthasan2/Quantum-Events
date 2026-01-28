'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
    LayoutDashboard,
    ShieldAlert,
    Clock,
    Check,
    X,
    ExternalLink,
    Calendar,
    IndianRupee,
    Loader2
} from 'lucide-react';

export default function AdminDashboard() {
    const router = useRouter();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [activeTab, setActiveTab] = useState<'moderation' | 'analytics'>('moderation');

    useEffect(() => {
        checkAdmin();
    }, []);

    useEffect(() => {
        if (isAdmin && activeTab === 'moderation') {
            fetchSubmissions();
        }
    }, [isAdmin, activeTab]);

    const checkAdmin = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/');
                return;
            }

            // Hardcoded admin check
            if (user.email === 'happy143@gmail.com') {
                setIsAdmin(true);
                return;
            }

            // Database admin check
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (profile?.is_admin) {
                setIsAdmin(true);
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            router.push('/');
        }
    };

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            // Fetch pending events (scraped but not approved, or user submitted)
            // For this system, we show 'pending' events.
            // If the sync adds them as 'approved', we might want to also show 'all' or filter.
            // Let's fetch everything for now that is NOT deleted.
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50); // Limit to 50 for performance

            if (error) throw error;

            // Artificial status for UI if not present in DB
            const formatted = data?.map(event => ({
                ...event,
                status: event.is_approved ? 'approved' : 'pending'
            })) || [];

            setSubmissions(formatted);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const response = await fetch('/api/admin/sync', { method: 'POST' });
            if (!response.ok) throw new Error('Sync failed');

            alert('Sync started! Events will appear shortly.');
            // Refresh after a delay
            setTimeout(fetchSubmissions, 5000);
        } catch (error) {
            console.error('Sync failed:', error);
            alert('Failed to start sync. Check console.');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleApprove = async (event: any) => {
        try {
            const { error } = await supabase
                .from('events')
                .update({ is_approved: true })
                .eq('id', event.id);

            if (error) throw error;

            // Update local state
            setSubmissions(prev => prev.map(sub =>
                sub.id === event.id ? { ...sub, status: 'approved' } : sub
            ));
        } catch (error) {
            console.error('Approve failed:', error);
            alert('Failed to approve event');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Remove from local state
            setSubmissions(prev => prev.filter(sub => sub.id !== id));
        } catch (error) {
            console.error('Reject failed:', error);
            alert('Failed to delete event');
        }
    };

    if (!isAdmin) return null;

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <Header cities={[]} selectedCity={null} />

            <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Portal</h1>
                        <p className="text-gray-500 font-bold mt-1">Manage events and monitor performance</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                        <button
                            onClick={() => setActiveTab('moderation')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'moderation'
                                ? 'bg-gray-900 text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <ShieldAlert className="w-4 h-4" />
                            Moderation Queue
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'analytics'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-500 hover:bg-gray-50'
                                }`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Traffic Analytics
                        </button>
                    </div>
                </div>

                {activeTab === 'moderation' ? (
                    <>
                        <div className="flex justify-end mb-6 gap-3">
                            <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-100 flex items-center gap-2 ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                            >
                                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                                {isSyncing ? 'Syncing...' : 'Sync Live Events'}
                            </button>
                            <button
                                onClick={fetchSubmissions}
                                className="px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl font-black text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                            >
                                Refresh List
                            </button>
                        </div>
                        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
                            {loading ? (
                                <div className="py-20 flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Loading Submissions...</p>
                                </div>
                            ) : submissions.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="text-6xl mb-4">🏜️</div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">No Submissions Found</h3>
                                    <p className="text-gray-500 font-bold">Everything looks clear for now!</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Event Info</th>
                                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Pricing & Logistics</th>
                                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                                <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {submissions.map((sub) => (
                                                <tr key={sub.id} className="hover:bg-blue-50/30 transition-colors group">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                                                                <img src={sub.image_url} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30')} />
                                                            </div>
                                                            <div className="max-w-[300px]">
                                                                <p className="font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{sub.title}</p>
                                                                <p className="text-xs text-gray-400 font-bold uppercase mt-1 line-clamp-1">Organizer: {sub.organizer || 'Unknown'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                                                {new Date(sub.event_date).toLocaleDateString()}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                                                <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                                                                {sub.is_free ? 'Free' : `₹${sub.ticket_price_min}`}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sub.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                            sub.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                                'bg-orange-100 text-orange-700'
                                                            }`}>
                                                            {sub.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {sub.status === 'pending' && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleApprove(sub)}
                                                                        className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                                                        title="Approve"
                                                                    >
                                                                        <Check className="w-5 h-5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleReject(sub.id)}
                                                                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                                        title="Reject"
                                                                    >
                                                                        <X className="w-5 h-5" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            <a
                                                                href={sub.registration_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                                title="View Link"
                                                            >
                                                                <ExternalLink className="w-5 h-5" />
                                                            </a>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <AnalyticsDashboard />
                )}
            </div>

            <Footer />
        </main >
    );
}
