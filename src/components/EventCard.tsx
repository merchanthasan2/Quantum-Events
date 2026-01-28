'use client';

import { Calendar, MapPin, IndianRupee, ExternalLink, Heart } from 'lucide-react';
import { Event } from '@/lib/types';
import { validateAndFixUrl } from '@/lib/utils';
import Image from 'next/image';
import { AnalyticsService } from '@/lib/analytics';
import { ImageProcessor } from '@/services/image-processor';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface EventCardProps {
    event: Event;
    onClick?: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
        const checkFavorite = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('favorites')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('event_id', event.id)
                    .single();
                if (data) setIsFavorited(true);
            }
        };
        checkFavorite();
    }, [event.id]);
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatPrice = () => {
        if (event.is_free) return 'Free';
        if (!event.ticket_price_min || event.ticket_price_min === 0) {
            // If we have no price info but it's not explicitly free, 
            // it's better to say 'Price on Website' or 'Register'
            return 'Register';
        }
        if (event.ticket_price_min === event.ticket_price_max) {
            return `₹${event.ticket_price_min}`;
        }
        return `₹${event.ticket_price_min} - ₹${event.ticket_price_max}`;
    };

    const getCTA = () => {
        // If it's a paid event from a known source, 'Book Now' is better
        if (event.source === 'BookMyShow' || event.source === 'District.in') return 'Book Now';

        const isInformationOnly = !event.ticket_price_min || event.ticket_price_min === 0 ||
            ['Shopping', 'Exhibition', 'Community'].includes(event.category?.name || '');
        return isInformationOnly ? 'View Details' : 'Book Now';
    };

    const isJustAdded = () => {
        if (!event.first_seen_at) return false;
        const firstSeen = new Date(event.first_seen_at);
        const now = new Date();
        const hoursDiff = (now.getTime() - firstSeen.getTime()) / (1000 * 60 * 60);
        return hoursDiff <= 48;
    };

    return (
    return (
        <a
            href={`/events/${event.id}`}
            onClick={(e) => {
                if (onClick) {
                    e.preventDefault();
                    onClick();
                }
            }}
            className="group flex flex-col sm:flex-row bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:-translate-y-1 h-full"
        >
            {/* Image Section - Full width mobile, fixed width desktop */}
            <div className="relative w-full sm:w-48 lg:w-56 xl:w-64 shrink-0 aspect-video sm:aspect-auto sm:h-full overflow-hidden">
                {(() => {
                    const isPlaceholder = ImageProcessor.isPlaceholder(event.image_url);
                    const displayImage = isPlaceholder
                        ? ImageProcessor.getFallbackImage(event.category?.name)
                        : event.image_url;

                    return displayImage ? (
                        <>
                            <Image
                                src={displayImage}
                                alt={event.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                sizes="(max-width: 640px) 100vw, 300px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 sm:opacity-0 sm:group-hover:opacity-30 transition-opacity"></div>
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 via-cyan-50 to-emerald-100 flex items-center justify-center">
                            <Calendar className="w-12 h-12 text-blue-400 animate-pulse" />
                        </div>
                    );
                })()}

                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {isJustAdded() && (
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                            New
                        </div>
                    )}
                    {event.is_featured && (
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                            ⭐ Featured
                        </div>
                    )}
                </div>

                <div className="absolute top-3 right-3 sm:hidden">
                    <button
                        onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const { data: { user } } = await supabase.auth.getUser();
                            if (!user) return alert('Please sign in to save favorites');

                            if (isFavorited) {
                                await supabase.from('favorites').delete().eq('user_id', user.id).eq('event_id', event.id);
                                setIsFavorited(false);
                            } else {
                                await supabase.from('favorites').insert({ user_id: user.id, event_id: event.id });
                                setIsFavorited(true);
                            }
                        }}
                        className={`p-1.5 rounded-full backdrop-blur-md border border-white/30 shadow-sm ${isFavorited ? 'bg-red-500 text-white' : 'bg-black/20 text-white'}`}
                    >
                        <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col p-4 grow relative">
                <div className="hidden sm:block absolute top-4 right-4 z-10">
                    <button
                        onClick={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const { data: { user } } = await supabase.auth.getUser();
                            if (!user) return alert('Please sign in to save favorites');

                            if (isFavorited) {
                                await supabase.from('favorites').delete().eq('user_id', user.id).eq('event_id', event.id);
                                setIsFavorited(false);
                            } else {
                                await supabase.from('favorites').insert({ user_id: user.id, event_id: event.id });
                                setIsFavorited(true);
                            }
                        }}
                        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-300'}`}
                    >
                        <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                </div>

                <div className="mb-1">
                    {event.category && (
                        <span
                            className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border"
                            style={{
                                color: event.category.color,
                                backgroundColor: `${event.category.color}10`,
                                borderColor: `${event.category.color}30`
                            }}
                        >
                            {event.category.name}
                        </span>
                    )}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight pr-8 group-hover:text-blue-600 transition-colors">
                    {event.title}
                </h3>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500 shrink-0" />
                        <span className="font-medium truncate">{formatDate(event.event_date)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-emerald-500 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                    </div>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-black text-lg text-gray-900">
                        {event.is_free ? 'Free' : (
                            event.ticket_price_min ? `₹${event.ticket_price_min}` : 'Register'
                        )}
                    </span>

                    <span className="text-sm font-bold text-blue-600 flex items-center group-hover:underline">
                        {getCTA()} <ExternalLink className="w-3 h-3 ml-1" />
                    </span>
                </div>
            </div>
        </a>
    );
}
