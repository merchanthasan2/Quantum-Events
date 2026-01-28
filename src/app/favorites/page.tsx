'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { EventCard } from '@/components/EventCard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('favorites')
                .select('*, event:events(*, category:categories(*), city:cities(*))')
                .eq('user_id', user.id);

            if (data) {
                setFavorites(data.map(f => f.event).filter(Boolean));
            }
            setLoading(false);
        };

        fetchFavorites();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <Header cities={[]} selectedCity={null} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <Heart className="w-10 h-10 text-red-500 fill-red-500" />
                        My Favorites
                    </h1>
                    <p className="text-gray-500 font-bold mt-1">Events you've saved for later</p>
                </div>

                {!user ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 font-bold mb-4">Please sign in to view your favorites</p>
                        <a href="/auth" className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 transition-all hover:scale-105">
                            Sign In Now
                        </a>
                    </div>
                ) : favorites.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 font-bold mb-4">You haven't saved any events yet.</p>
                        <a href="/" className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 transition-all hover:scale-105">
                            Explore Events
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {favorites.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}
