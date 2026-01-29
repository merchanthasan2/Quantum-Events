'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Calendar,
    Search,
    Filter,
    Trash2,
    Eye,
    MapPin,
    Ticket,
    CheckCircle2
} from 'lucide-react';

export default function EventsManagement() {
    const [events, setEvents] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const [evRes, catRes] = await Promise.all([
            supabase.from('events').select('*, category:categories(*), city:cities(*)').order('created_at', { ascending: false }).limit(100),
            supabase.from('categories').select('*').order('name')
        ]);

        setEvents(evRes.data || []);
        setCategories(catRes.data || []);
        setLoading(false);
    };

    const deleteEvent = async (id: string) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        const { error } = await supabase.from('events').delete().eq('id', id);
        if (!error) {
            setEvents(events.filter(e => e.id !== id));
        }
    };

    const filteredEvents = events.filter(e => {
        const matchesCat = selectedCategory === 'all' || e.category_id === selectedCategory;
        const matchesQuery = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.venue.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesQuery;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Events Management</h1>
                    <p className="text-slate-500 font-medium">Moderate and manage all system listings</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by title or venue..."
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button onClick={fetchData} className="p-2.5 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all">
                            <Activity size={18} className="text-slate-500" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Event Details</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Pricing</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm font-medium">
                            {filteredEvents.map((event) => (
                                <tr key={event.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 shadow-sm border border-slate-50">
                                                <img src={event.image_url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-slate-900 font-bold truncate max-w-[300px]" title={event.title}>{event.title}</div>
                                                <div className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                                                    <MapPin size={10} /> {event.venue}, {event.city?.name}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider`} style={{ backgroundColor: `${event.category?.color}15`, color: event.category?.color }}>
                                            {event.category?.name || 'Uncategorized'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                        <div className="flex items-center gap-1.5 font-bold tabular-nums">
                                            <Ticket size={14} className="text-slate-400" />
                                            {event.is_free ? 'FREE' : `₹${event.ticket_price_min}+`}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black">
                                            <CheckCircle2 size={12} /> Live
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-all">
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                onClick={() => deleteEvent(event.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-400 font-medium italic">
                        Accessing global archives...
                    </div>
                ) : filteredEvents.length === 0 && (
                    <div className="p-12 text-center">
                        <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
                        <div className="text-slate-900 font-bold">No events found matching your filter</div>
                    </div>
                )}
            </div>
        </div>
    );
}
import { Activity } from 'lucide-react';
