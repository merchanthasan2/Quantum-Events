'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Tags,
    Plus,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    CheckCircle2,
    XCircle,
    ChevronDown,
    Layers
} from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    display_order: number;
    icon: string;
    color: string;
}

export default function CategoriesManagement() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setCategories(data || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, current: boolean) => {
        const { error } = await supabase
            .from('categories')
            .update({ is_active: !current })
            .eq('id', id);

        if (!error) {
            setCategories(categories.map(c => c.id === id ? { ...c, is_active: !current } : c));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Categories</h1>
                    <p className="text-slate-500 font-medium">Organize events and manage discovery filters</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                    <Plus size={18} /> Add Category
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-48 bg-white border border-slate-100 rounded-3xl animate-pulse"></div>
                    ))
                ) : categories.map((cat) => (
                    <div key={cat.id} className="bg-white border border-slate-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-slate-100 transition-all group">
                        <div className="flex items-start justify-between mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm`} style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                                {cat.icon || '🎯'}
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all">
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => toggleStatus(cat.id, cat.is_active)}
                                    className={`p-2 rounded-xl transition-all ${cat.is_active ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-300 hover:bg-slate-50'}`}
                                >
                                    {cat.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                                </button>
                                <button className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-500 transition-all">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-xl font-black text-slate-900">{cat.name}</h3>
                                <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${cat.is_active ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    {cat.is_active ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                    {cat.is_active ? 'Live' : 'Hidden'}
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium mb-4">/categories/{cat.slug}</p>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-slate-900 rounded-full w-[65%]"></div>
                                </div>
                                <span className="text-xs font-bold text-slate-600 italic">658 Events</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sub-categories Concept */}
            <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest">
                            <Layers size={10} /> Advanced Feature
                        </div>
                        <h2 className="text-2xl font-black tracking-tight">Managing Sub-Categories</h2>
                        <p className="text-slate-400 font-medium max-w-lg">
                            Deeper categorization allows users to find niche events like "Techno" under Music or "Pottery" under Workshops.
                        </p>
                    </div>
                    <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black hover:bg-slate-50 transition-all shrink-0">
                        View Sub-Categories
                    </button>
                </div>
                {/* Decorative gradients */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}
