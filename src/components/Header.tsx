'use client';

import { Menu, X, Home, Settings, Plus, Bell, LogIn, LogOut, User, Search, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { City } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { CitySelector } from './CitySelector';

import { Logo } from './Logo';

interface HeaderProps {
    cities: City[];
    selectedCity: City | null;
}

export function Header({ cities, selectedCity }: HeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(profile);
            }
        };
        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                // Fetch profile
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <header className="bg-white shadow-xl shadow-blue-900/5 sticky top-0 z-50 border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/"
                            className="hover:scale-105 transition-transform duration-300"
                        >
                            <Logo />
                        </Link>
                        <CitySelector cities={cities} selectedCity={selectedCity} />
                    </div>

                    <div className="hidden md:flex items-center space-x-2">
                        <Link
                            href="/"
                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${pathname === '/'
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                                : 'text-gray-700 hover:bg-white/50'
                                }`}
                        >
                            <Home className="w-4 h-4" />
                            <span className="text-sm font-medium">Events</span>
                        </Link>

                        <Link
                            href="/submit-event"
                            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-105 hover:shadow-lg transition-all duration-300"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">Submit Event</span>
                        </Link>

                        <Link
                            href="/favorites"
                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${pathname === '/favorites'
                                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md'
                                : 'text-gray-700 hover:bg-white/50'
                                }`}
                        >
                            <Heart className="w-4 h-4" />
                            <span className="text-sm font-medium">Favorites</span>
                        </Link>

                        {user && (
                            <Link
                                href="/admin"
                                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${pathname.startsWith('/admin')
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md'
                                    : 'text-gray-700 hover:bg-white/50'
                                    }`}
                            >
                                <Settings className="w-4 h-4" />
                                <span className="text-sm font-medium">Admin</span>
                            </Link>
                        )}

                        <div className="h-6 w-px bg-gray-200 mx-2"></div>

                        {user ? (
                            <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-2 px-4 py-2 bg-white/50 rounded-xl border border-white/30">
                                    <User className="w-4 h-4 text-gray-700" />
                                    <span className="text-sm text-gray-800 font-medium">{user.email}</span>
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white hover:scale-105 hover:shadow-lg transition-all duration-300"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="text-sm font-medium">Sign Out</span>
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/auth"
                                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:scale-105 hover:shadow-lg transition-all duration-300 font-medium"
                            >
                                <LogIn className="w-4 h-4" />
                                <span className="text-sm">Sign In</span>
                            </Link>
                        )}
                    </div>

                    <div className="flex md:hidden items-center space-x-2">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200 animate-slide-up">
                        <div className="space-y-2">
                            <Link
                                href="/"
                                onClick={() => setIsMenuOpen(false)}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 ${pathname === '/' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                                    }`}
                            >
                                <Home className="w-5 h-5" />
                                <span className="font-medium">Events</span>
                            </Link>

                            <Link
                                href="/submit-event"
                                onClick={() => setIsMenuOpen(false)}
                                className="w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 text-green-600"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="font-medium">Submit Event</span>
                            </Link>

                            <Link
                                href="/favorites"
                                onClick={() => setIsMenuOpen(false)}
                                className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 ${pathname === '/favorites' ? 'bg-red-50 text-red-600' : 'text-gray-700'
                                    }`}
                            >
                                <Heart className="w-5 h-5" />
                                <span className="font-medium">Favorites</span>
                            </Link>

                            {(profile?.is_admin || user?.email === 'happy143@gmail.com' || user?.email === 'merchanthasan2@gmail.com') && (
                                <Link
                                    href="/admin"
                                    onClick={() => setIsMenuOpen(false)}
                                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 ${pathname.startsWith('/admin') ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                                        }`}
                                >
                                    <Settings className="w-5 h-5" />
                                    <span className="font-medium">Admin</span>
                                </Link>
                            )}

                            <div className="border-t border-gray-200 my-2"></div>

                            {user ? (
                                <>
                                    <div className="px-4 py-2 text-sm text-gray-600">
                                        {user.email}
                                    </div>
                                    <button
                                        onClick={() => {
                                            handleSignOut();
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 text-red-600"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span className="font-medium">Sign Out</span>
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/auth"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full text-left px-4 py-3 rounded-lg flex items-center space-x-2 bg-blue-600 text-white"
                                >
                                    <LogIn className="w-5 h-5" />
                                    <span className="font-medium">Sign In</span>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
