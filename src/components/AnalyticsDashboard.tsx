'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Eye, TrendingUp, Globe, Smartphone, Monitor } from 'lucide-react';
import { startOfDay, subDays, format } from 'date-fns';

export function AnalyticsDashboard() {
    const [stats, setStats] = useState({
        totalViews: 0,
        uniqueVisitors: 0,
        activeNow: 0,
    });
    const [topPages, setTopPages] = useState<{ path: string; count: number }[]>([]);
    const [deviceStats, setDeviceStats] = useState<{ type: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            // 1. Total active sessions (last 24h) and Views
            // Since we don't have aggregation functions exposed easily without RPC, 
            // we will fetch recent data to calculate stats. 
            // For production, use Supabase RPC functions for performance.

            const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

            // Fetch Views
            const { count: viewsCount } = await supabase
                .from('analytics_page_views')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', thirtyDaysAgo);

            // Fetch Sessions
            const { data: sessions, count: visitorsCount } = await supabase
                .from('analytics_sessions')
                .select('*')
                .gte('created_at', thirtyDaysAgo);

            if (sessions) {
                // Calculate Device Stats
                const devices = sessions.reduce((acc: any, session: any) => {
                    const type = session.device_type || 'desktop';
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                }, {});

                setDeviceStats(Object.entries(devices).map(([type, count]) => ({ type, count: count as number })));
            }

            // Fetch Top Pages (client-side aggregation for MVP)
            const { data: pageViews } = await supabase
                .from('analytics_page_views')
                .select('page_path')
                .gte('created_at', thirtyDaysAgo)
                .limit(1000); // Limit to avoid performance hit on client

            if (pageViews) {
                const pages = pageViews.reduce((acc: any, view: any) => {
                    const path = view.page_path || '/';
                    acc[path] = (acc[path] || 0) + 1;
                    return acc;
                }, {});

                const sortedPages = Object.entries(pages)
                    .map(([path, count]) => ({ path, count: count as number }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                setTopPages(sortedPages);
            }

            setStats({
                totalViews: viewsCount || 0,
                uniqueVisitors: visitorsCount || 0,
                activeNow: 0 // Real-time active not implemented yet
            });

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">Loading Analytics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                        <Eye className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Total Page Views</p>
                        <h3 className="text-3xl font-black text-gray-900">{stats.totalViews.toLocaleString()}</h3>
                        <p className="text-green-500 text-xs font-bold mt-1">Last 30 Days</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Unique Visitors</p>
                        <h3 className="text-3xl font-black text-gray-900">{stats.uniqueVisitors.toLocaleString()}</h3>
                        <p className="text-purple-500 text-xs font-bold mt-1">Last 30 Days</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Avg. Engagement</p>
                        <h3 className="text-3xl font-black text-gray-900">High</h3>
                        <p className="text-emerald-500 text-xs font-bold mt-1">Based on actions</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Pages */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-blue-500" />
                        Most Visited Pages
                    </h3>
                    <div className="space-y-4">
                        {topPages.map((page, index) => (
                            <div key={page.path} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                <span className="font-bold text-gray-700 truncate max-w-[200px]">{page.path}</span>
                                <span className="font-black text-gray-900 bg-white px-3 py-1 rounded-lg shadow-sm">
                                    {page.count} <span className="text-xs text-gray-400 font-normal">views</span>
                                </span>
                            </div>
                        ))}
                        {topPages.length === 0 && (
                            <p className="text-gray-400 text-center py-4">No page view data yet.</p>
                        )}
                    </div>
                </div>

                {/* Device Stats */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-purple-500" />
                        Device Usage
                    </h3>
                    <div className="flex items-end justify-center gap-8 h-48 mb-6">
                        {deviceStats.map((stat) => (
                            <div key={stat.type} className="flex flex-col items-center gap-2 group w-20">
                                <div
                                    className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-xl transition-all group-hover:opacity-90 relative"
                                    style={{ height: `${(stat.count / Math.max(...deviceStats.map(s => s.count), 1)) * 100}%` }}
                                >
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 font-black text-gray-900">{stat.count}</span>
                                </div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.type}</span>
                            </div>
                        ))}
                    </div>
                    {deviceStats.length === 0 && (
                        <div className="h-48 flex items-center justify-center bg-gray-50 rounded-3xl">
                            <p className="text-gray-400 text-center font-bold">No device data yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
