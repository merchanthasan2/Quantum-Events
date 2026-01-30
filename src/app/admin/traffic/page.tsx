'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Smartphone,
    Monitor,
    Laptop,
    Tablet,
    Globe,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    Download
} from 'lucide-react';

interface SessionData {
    id: string;
    start_time: string;
    device_type: string;
    os: string;
    browser: string;
    screen_resolution: string;
    referral_source: string;
    city?: string;
    country?: string;
}

export default function TrafficIntelligence() {
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalSessions: 0,
        desktopCount: 0,
        mobileCount: 0,
        uniqueUsers: 0
    });

    useEffect(() => {
        fetchTrafficData();
    }, []);

    const fetchTrafficData = async () => {
        try {
            const { data, error } = await supabase
                .from('analytics_sessions')
                .select('*')
                .order('start_time', { ascending: false })
                .limit(100);

            if (error) throw error;

            setSessions(data);

            // Calculate stats
            const desktop = data.filter(s => s.device_type === 'desktop').length;
            const mobile = data.filter(s => s.device_type === 'mobile').length;
            const unique = new Set(data.map(s => s.user_id)).size;

            setStats({
                totalSessions: data.length,
                desktopCount: desktop,
                mobileCount: mobile,
                uniqueUsers: unique
            });
        } catch (err) {
            console.error('Error fetching traffic:', err);
        } finally {
            setLoading(false);
        }
    };

    const getDeviceIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'mobile': return <Smartphone size={18} />;
            case 'desktop': return <Laptop size={18} />;
            case 'tablet': return <Tablet size={18} />;
            default: return <Monitor size={18} />;
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Traffic Intelligence</h1>
                <p className="text-slate-500 font-medium">Real-time visitor behavior and device demographics</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Sessions', value: stats.totalSessions, icon: Globe, color: 'blue' },
                    { label: 'Desktop Users', value: stats.desktopCount, icon: Monitor, color: 'indigo' },
                    { label: 'Mobile Users', value: stats.mobileCount, icon: Smartphone, color: 'purple' },
                    { label: 'Unique Visitors', value: stats.uniqueUsers, icon: Laptop, color: 'pink' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-emerald-500 text-sm font-bold flex items-center gap-1">
                                <ArrowUpRight size={16} /> +12%
                            </span>
                        </div>
                        <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                        <div className="text-slate-500 text-sm font-semibold">{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Filter sessions..."
                                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none w-64"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">
                            <Filter size={16} /> Filters
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
                        <Download size={16} /> Export CSV
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Device</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">OS / Platform</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Browser</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Resolution</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Source</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm font-medium">
                            {sessions.map((session) => (
                                <tr key={session.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                                                {getDeviceIcon(session.device_type || '')}
                                            </div>
                                            <span className="capitalize text-slate-900">{session.device_type || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-slate-900 font-bold">{session.city || 'Unknown'}</span>
                                            <span className="text-slate-500 text-xs">{session.country || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 w-fit ${session.os?.includes('Windows') ? 'bg-blue-50 text-blue-600' :
                                            session.os?.includes('Mac') ? 'bg-slate-900 text-white' :
                                                session.os?.includes('iPhone') || session.os?.includes('iPad') ? 'bg-slate-900 text-white' :
                                                    session.os?.includes('Android') ? 'bg-emerald-50 text-emerald-600' :
                                                        'bg-slate-100 text-slate-600'
                                            }`}>
                                            {session.os?.includes('Mac') || session.os?.includes('iPhone') ? <Globe size={12} /> : null}
                                            {session.os || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">{session.browser || 'Other'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 tabular-nums">{session.screen_resolution || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="max-w-[150px] truncate text-slate-500 hover:text-blue-600 cursor-default" title={session.referral_source}>
                                            {session.referral_source || 'Direct'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-bold tabular-nums">
                                        {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {loading && (
                    <div className="p-12 text-center text-slate-400 font-medium">
                        Loading intelligence data...
                    </div>
                )}
            </div>
        </div>
    );
}
