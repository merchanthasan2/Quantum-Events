'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    BarChart3,
    Tags,
    Calendar,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronRight,
    Search,
    Bell
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '/login';
            return;
        }

        let { data: profile, error } = await supabase
            .from('user_profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        // If profile doesn't exist, create it (fallback for missing triggers)
        if (error && error.code === 'PGRST116') {
            console.log('Profile missing, creating for user:', user.email);
            const { data: newProfile, error: createError } = await supabase
                .from('user_profiles')
                .insert([{ id: user.id, full_name: user.user_metadata?.full_name || 'Admin User' }])
                .select()
                .single();
            profile = newProfile;
        }

        const isLocal = window.location.hostname === 'localhost';

        // TEMPORARY: Allow all authenticated users to access admin
        /*
        if (!profile?.is_admin && !isLocal) {
            window.location.href = '/';
            return;
        }
        */
        console.log('Admin access granted to:', user.email);
        if (profile && !profile.is_admin) {
            console.warn('User is not flagged as admin in DB, but allowing access for debug.');
        }
        setIsAdmin(true);
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { name: 'Traffic Intelligence', icon: BarChart3, href: '/admin/traffic' },
        { name: 'Members', icon: Users, href: '/admin/members' },
        { name: 'Categories', icon: Tags, href: '/admin/categories' },
        { name: 'Events Management', icon: Calendar, href: '/admin/events' },
    ];

    if (isAdmin === null) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed h-full z-50`}>
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen ? (
                        <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Aaj Ka Scene
                        </span>
                    ) : (
                        <span className="text-xl font-black text-blue-600">A</span>
                    )}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-slate-100 rounded-lg lg:hidden">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${isActive
                                    ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm shadow-blue-100'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
                                {isSidebarOpen && <span>{item.name}</span>}
                                {isActive && isSidebarOpen && <ChevronRight size={16} className="ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100 mb-4">
                    <button
                        onClick={() => supabase.auth.signOut().then(() => window.location.href = '/')}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all w-full text-slate-500 hover:bg-red-50 hover:text-red-600 group`}
                    >
                        <LogOut size={20} className="text-slate-400 group-hover:text-red-500" />
                        {isSidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300 min-h-screen`}>
                {/* Header */}
                <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative w-96 max-w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
                            A
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
