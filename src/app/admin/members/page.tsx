'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
    User,
    Mail,
    Calendar,
    Shield,
    ShieldAlert,
    Search,
    MoreHorizontal,
    UserPlus
} from 'lucide-react';

interface Profile {
    id: string;
    email: string;
    full_name: string;
    is_admin: boolean;
    created_at: string;
}

export default function MembersManagement() {
    const [members, setMembers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMembers(data || []);
        } catch (err) {
            console.error('Error fetching members:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = members.filter(m =>
        (m.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Members</h1>
                    <p className="text-slate-500 font-medium">Manage registered users and permissions</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                    <UserPlus size={18} /> Invite Member
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find a member..."
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-sm font-medium">
                            {filteredMembers.map((member) => (
                                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                                {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="text-slate-900 font-bold">{member.full_name || 'Anonymous User'}</div>
                                                <div className="text-slate-500 text-xs flex items-center gap-1">
                                                    <Mail size={12} /> {member.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {member.is_admin ? (
                                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black">
                                                    <Shield size={12} /> Administrator
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-xs font-black">
                                                    <User size={12} /> Member
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            {new Date(member.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-slate-400 font-medium">
                        Fetching member database...
                    </div>
                ) : filteredMembers.length === 0 && (
                    <div className="p-12 text-center">
                        <User size={48} className="mx-auto text-slate-200 mb-4" />
                        <div className="text-slate-900 font-bold">No members found</div>
                        <div className="text-slate-500 text-sm">Try adjusting your search query</div>
                    </div>
                )}
            </div>
        </div>
    );
}
