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

    const getCTA = () => {
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
        <a
            href={`/events/${event.id}`}
            onClick={(e) => {
                if (onClick) {
                    e.preventDefault();
                    onClick();
                }
            }}
            className="group flex bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 hover:-translate-y-1 h-full"
        >
            {/* Image Side - Fixed width */}
            <div className="relative w-48 sm:w-64 shrink-0 overflow-hidden min-h-[250px]">
                {(() => {
                    const isPlaceholder = ImageProcessor.isPlaceholder(event.image_url);
                    const displayImage = isPlaceholder
                        ? ImageProcessor.getFallbackImage(event.category?.name)
                        : event.image_url;

                    return displayImage ? (
                        <Image
                            src={displayImage}
                            alt={event.title}
                            fill
                            className="object-cover object-top h-full group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 640px) 100vw, 300px"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center min-h-[250px]">
                            <Calendar className="w-12 h-12 text-blue-300" />
                        </div>
                    );
                })()}

                {/* Badges on Image */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {isJustAdded() && (
                        <div className="bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                            New
                        </div>
                    )}
                    {event.is_featured && (
                        <div className="bg-amber-400/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                            Featured
                        </div>
                    )}
                </div>
            </div>

            {/* Content Side */}
            <div className="flex flex-col p-5 grow min-w-0">
                <div className="flex justify-between items-start mb-2">
                    {event.category && (
                        <span className="text-[11px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                            {event.category.name}
                        </span>
                    )}

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
                        className={`p-2 -mr-2 -mt-2 rounded-full hover:bg-gray-50 transition-colors ${isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-300 hover:text-red-400'}`}
                    >
                        <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                    {event.title}
                </h3>

                <div className="space-y-1.5 mb-4">
                    <div className="flex items-center text-sm font-medium text-gray-500">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                        <span className="truncate">{formatDate(event.event_date)}</span>
                        {event.event_time && (
                            <>
                                <span className="mx-1.5 text-gray-300">•</span>
                                <span className="truncate">{event.event_time}</span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-500">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                    <div>
                        <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Starting from</div>
                        <div className="text-lg font-black text-gray-900">
                            {event.is_free ? 'Free' : (
                                event.ticket_price_min ? `₹${event.ticket_price_min}` : 'Free'
                            )}
                        </div>
                    </div>

                    <span className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl group-hover:bg-blue-600 transition-colors shadow-sm flex items-center gap-2">
                        {getCTA()}
                        {/* <ExternalLink className="w-3.5 h-3.5" /> */}
                    </span>
                </div>
            </div>
        </a>
    );
}
