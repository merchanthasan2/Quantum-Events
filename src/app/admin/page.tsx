'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Check, X, Eye, ExternalLink, Calendar, MapPin, IndianRupee, Clock } from 'lucide-react';

export default function AdminDashboard() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = '/auth';
                return;
            }

            if (user.email === 'happy143@gmail.com') {
                setIsAdmin(true);
                fetchSubmissions();
                return;
            }

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (!profile?.is_admin) {
                alert('Unauthorized access');
                window.location.href = '/';
                return;
            }

            setIsAdmin(true);
            fetchSubmissions();
        };

        checkAuth();
    }, []);

    const fetchSubmissions = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('event_submissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setSubmissions(data);
        setLoading(false);
    };

    const handleApprove = async (submission: any) => {
        try {
            // 1. Insert into events table
            const { error: eventError } = await supabase.from('events').insert([{
                title: submission.title,
                description: submission.description,
                short_description: submission.short_description,
                category_id: submission.category_id,
                city_id: submission.city_id,
                venue: submission.venue,
                address: submission.address,
                event_date: submission.event_date,
                event_time: submission.event_time,
                ticket_price_min: submission.ticket_price_min,
                ticket_price_max: submission.ticket_price_max,
                is_free: submission.is_free,
                image_url: submission.image_url,
                registration_url: submission.registration_url,
                organizer: submission.organizer,
                contact: submission.contact,
                is_approved: true,
                source: 'User Submission'
            }]);

            if (eventError) throw eventError;

            // 2. Update submission status
            const { error: subError } = await supabase
                .from('event_submissions')
                .update({ status: 'approved' })
                .eq('id', submission.id);

            if (subError) throw subError;

            alert('Event approved and published!');
            fetchSubmissions();
        } catch (error: any) {
            alert('Approval error: ' + error.message);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Are you sure you want to reject this submission?')) return;

        const { error } = await supabase
            .from('event_submissions')
            .update({ status: 'rejected' })
            .eq('id', id);

        if (!error) {
            fetchSubmissions();
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const response = await fetch('/api/admin/sync', { method: 'POST' });
            if (response.ok) {
                alert('Sync started successfully! Events will be processed in the background. Check server logs for progress.');
            } else {
                const data = await response.json();
                throw new Error(data.error || 'Sync failed');
            }
        } catch (error: any) {
            alert('Sync error: ' + error.message);
        } finally {
            setIsSyncing(false);
        }
    };

    if (!isAdmin) return null;

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <Header cities={[]} selectedCity={null} />

            <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Moderation</h1>
                        <p className="text-gray-500 font-bold mt-1">Review and approve community event submissions</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleSync}
                            disabled={isSyncing}
                            className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-100 flex items-center gap-2 ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                        >
                            <Clock className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                            {isSyncing ? 'Syncing...' : 'Sync Live Events'}
                        </button>
                        <button
                            onClick={fetchSubmissions}
                            className="px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl font-black text-sm text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                        >
                            Refresh List
                        </button>
                    </div>
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
                                                        <img src={sub.image_url} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="max-w-[300px]">
                                                        <p className="font-black text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{sub.title}</p>
                                                        <p className="text-xs text-gray-400 font-bold uppercase mt-1">Organizer: {sub.organizer}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                                        {sub.event_date}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                                        <IndianRupee className="w-3.5 h-3.5 text-emerald-500" />
                                                        {sub.is_free ? 'Free' : `₹${sub.ticket_price_min} - ${sub.ticket_price_max}`}
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
            </div>

            <Footer />
        </main>
    );
}
