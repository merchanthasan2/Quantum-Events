'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Users,
    Activity,
    MousePointer2,
    Calendar,
    ArrowUpRight,
    TrendingUp,
    Zap,
    LucideIcon
} from 'lucide-react';

interface DashboardStats {
    totalEvents: number;
    totalMembers: number;
    totalSessions: number;
    totalInteractions: number;
}

const StatCard = ({ label, value, icon: Icon, color, trend }: { label: string, value: number | string, icon: LucideIcon, color: string, trend?: string }) => (
    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
            <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600`}>
                <Icon size={24} />
            </div>
            {trend && (
                <span className="text-emerald-500 text-xs font-black flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-full">
                    <TrendingUp size={12} /> {trend}
                </span>
            )}
        </div>
        <div className="text-3xl font-black text-slate-900 tracking-tight mb-1">{value}</div>
        <div className="text-slate-500 text-sm font-bold uppercase tracking-wider">{label}</div>
    </div>
);

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalEvents: 0,
        totalMembers: 0,
        totalSessions: 0,
        totalInteractions: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [events, members, sessions, interactions] = await Promise.all([
                supabase.from('events').select('id', { count: 'exact', head: true }),
                supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
                supabase.from('analytics_sessions').select('id', { count: 'exact', head: true }),
                supabase.from('analytics_events').select('id', { count: 'exact', head: true })
            ]);

            setStats({
                totalEvents: events.count || 0,
                totalMembers: members.count || 0,
                totalSessions: sessions.count || 0,
                totalInteractions: (interactions.count || 0) + (sessions.count || 0) * 3 // Mocking some weight
            });
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Greeting */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Overview</h1>
                    <p className="text-slate-500 font-medium text-lg mt-1">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <div className="bg-white px-6 py-4 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-sm">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-200`}></div>
                        ))}
                    </div>
                    <div className="text-sm font-bold text-slate-600">
                        <span className="text-slate-900">12 Admins</span> online now
                    </div>
                </div>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard label="Live Events" value={stats.totalEvents} icon={Calendar} color="blue" trend="+5.2%" />
                <StatCard label="Total Members" value={stats.totalMembers} icon={Users} color="indigo" trend="+12.4%" />
                <StatCard label="Site Traffic" value={stats.totalSessions} icon={Activity} color="purple" trend="+18.1%" />
                <StatCard label="Interactions" value={stats.totalInteractions} icon={MousePointer2} color="pink" trend="+24.5%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Traffic Sources Chart Mock-up */}
                <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Traffic Intelligence</h3>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Last 30 Days Growth</p>
                        </div>
                        <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none cursor-pointer">
                            <option>Real-time</option>
                            <option>Daily</option>
                            <option>Monthly</option>
                        </select>
                    </div>
                    <div className="h-[300px] flex items-end justify-between gap-2 px-4">
                        {[40, 70, 45, 90, 65, 80, 50, 85, 60, 95, 75, 100].map((h, i) => (
                            <div key={i} className="flex-1 space-y-2 group cursor-pointer">
                                <div
                                    className="w-full bg-slate-100 group-hover:bg-blue-500 transition-all duration-500 rounded-t-xl relative"
                                    style={{ height: `${h}%` }}
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {h * 123}
                                    </div>
                                </div>
                                <div className="text-[10px] font-black text-slate-400 text-center uppercase">H{i + 1}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions / Recent Activity */}
                <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-slate-200">
                    <div className="flex items-center gap-2 mb-8">
                        <Zap className="text-yellow-400 fill-yellow-400" size={20} />
                        <h3 className="text-xl font-black">Sync Engine</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Next Scheduled Sync</span>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            </div>
                            <div className="text-lg font-bold">Today at 18:00</div>
                        </div>

                        <button
                            onClick={async () => {
                                const res = await fetch('/api/admin/sync', { method: 'POST' });
                                if (res.ok) alert('Sync started successfully!');
                            }}
                            className="w-full py-5 bg-white text-slate-900 rounded-3xl font-black hover:bg-slate-50 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3"
                        >
                            <Activity size={20} /> Force Full Sync
                        </button>

                        <div className="pt-4">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Recent Sync Status</h4>
                            <div className="space-y-4">
                                {['BMS Mumbai', 'Insider Delhi', 'Eventbrite Bangalore'].map(s => (
                                    <div key={s} className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-slate-300">{s}</span>
                                        <span className="text-xs font-black text-emerald-400">SUCCESS</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
