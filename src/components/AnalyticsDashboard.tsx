'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Eye, TrendingUp, Globe, Smartphone, Clock, ArrowUpRight, Activity } from 'lucide-react';
import { startOfDay, subDays, format, eachDayOfInterval } from 'date-fns';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

export function AnalyticsDashboard() {
    const [stats, setStats] = useState({
        totalViews: 0,
        uniqueVisitors: 0,
        avgEngagement: '0m',
        growth: 0
    });
    const [trafficData, setTrafficData] = useState<any[]>([]);
    const [topPages, setTopPages] = useState<{ name: string; value: number }[]>([]);
    const [deviceStats, setDeviceStats] = useState<{ name: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const thirtyDaysAgo = subDays(new Date(), 30);
            const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

            // 1. Fetch RAW data for Page Views (limit to last 2000 for client-side processing)
            const { data: pageViews } = await supabase
                .from('analytics_page_views')
                .select('created_at, page_path')
                .gte('created_at', thirtyDaysAgoIso)
                .limit(2000);

            // 2. Fetch RAW data for Sessions
            const { data: sessions } = await supabase
                .from('analytics_sessions')
                .select('created_at, device_type')
                .gte('created_at', thirtyDaysAgoIso)
                .limit(2000);

            if (pageViews && sessions) {
                // --- KPI CALCS ---
                const totalViews = pageViews.length;
                const uniqueVisitors = sessions.length;

                // --- TRAFFIC CHART DATA (Last 30 Days) ---
                const days = eachDayOfInterval({ start: thirtyDaysAgo, end: new Date() });
                const chartData = days.map(day => {
                    const dayStr = format(day, 'yyyy-MM-dd');
                    return {
                        date: format(day, 'MMM dd'),
                        visits: sessions.filter(s => s.created_at.startsWith(dayStr)).length,
                        views: pageViews.filter(v => v.created_at.startsWith(dayStr)).length
                    };
                });
                setTrafficData(chartData);

                // --- TOP PAGES ---
                const pagesMap = pageViews.reduce((acc: any, view: any) => {
                    const path = view.page_path || '/';
                    acc[path] = (acc[path] || 0) + 1;
                    return acc;
                }, {});

                const sortedPages = Object.entries(pagesMap)
                    .map(([name, value]) => ({ name, value: value as number }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5);
                setTopPages(sortedPages);

                // --- DEVICE STATS ---
                const devicesMap = sessions.reduce((acc: any, session: any) => {
                    const type = session.device_type || 'desktop';
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                }, {});

                const deviceData = Object.entries(devicesMap)
                    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value: value as number }))
                    .sort((a, b) => b.value - a.value);
                setDeviceStats(deviceData);

                // Update Stats State
                setStats({
                    totalViews,
                    uniqueVisitors,
                    avgEngagement: '2m 15s', // Placeholder until duration tracking is robust
                    growth: 12.5 // Placeholder
                });
            }

        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-32 flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                <p className="font-extrabold text-gray-400 uppercase tracking-widest text-sm animate-pulse">Loading Insights...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. Feature KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Eye className="w-24 h-24" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                            <Eye className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Page Views</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black text-gray-900">{stats.totalViews.toLocaleString()}</h3>
                        <span className="text-sm font-bold text-emerald-500 flex items-center">
                            <ArrowUpRight className="w-4 h-4" /> +12%
                        </span>
                    </div>
                    <p className="text-xs font-bold text-gray-400 mt-2">Last 30 days</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="w-24 h-24" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Unique Visitors</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black text-gray-900">{stats.uniqueVisitors.toLocaleString()}</h3>
                        <span className="text-sm font-bold text-emerald-500 flex items-center">
                            <ArrowUpRight className="w-4 h-4" /> +8.4%
                        </span>
                    </div>
                    <p className="text-xs font-bold text-gray-400 mt-2">Last 30 days</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock className="w-24 h-24" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Avg. Time</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black text-gray-900">{stats.avgEngagement}</h3>
                    </div>
                    <p className="text-xs font-bold text-gray-400 mt-2">Per session</p>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity className="w-24 h-24" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Bounce Rate</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-4xl font-black text-gray-900">42%</h3>
                        <span className="text-sm font-bold text-emerald-500 flex items-center">
                            -2.1%
                        </span>
                    </div>
                    <p className="text-xs font-bold text-gray-400 mt-2">Health score: Good</p>
                </div>
            </div>

            {/* 2. Main Traffic Chart */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-blue-500" />
                            Traffic Overview
                        </h3>
                        <p className="text-gray-500 font-bold text-sm mt-1">Sessions vs Page Views</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Views</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-purple-500"></div> Sessions</span>
                    </div>
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trafficData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                cursor={{ stroke: '#e5e7eb', strokeWidth: 2 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="views"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorViews)"
                            />
                            <Area
                                type="monotone"
                                dataKey="visits"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorVisits)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 3. Top Pages Bar Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-indigo-500" />
                        Most Visited Pages
                    </h3>
                    <div className="h-[300px] w-full">
                        {topPages.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topPages} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={100}
                                        tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 700 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f9fafb' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Bar dataKey="value" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                <Globe className="w-12 h-12 mb-2 opacity-50" />
                                <p className="font-bold">No page data yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Device Stats Pie Chart */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-pink-500" />
                        Device Usage
                    </h3>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        {deviceStats.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={deviceStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {deviceStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300">
                                <Smartphone className="w-12 h-12 mb-2 opacity-50" />
                                <p className="font-bold">No device data yet</p>
                            </div>
                        )}
                    </div>
                    {/* Check Legend */}
                    {deviceStats.length > 0 && (
                        <div className="flex justify-center gap-6 mt-4">
                            {deviceStats.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-sm font-bold text-gray-600">{entry.name}</span>
                                    <span className="text-sm text-gray-400 font-bold">({Math.round((entry.value / stats.uniqueVisitors) * 100)}%)</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
