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
        <div
            onClick={onClick}
            className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden group hover:-translate-y-2 border border-gray-100"
        >
            <div className="relative aspect-video overflow-hidden">
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
                                className="object-cover group-hover:scale-110 transition-transform duration-700 object-top"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 via-cyan-50 to-emerald-100 flex items-center justify-center">
                            <Calendar className="w-16 h-16 text-blue-400 animate-pulse" />
                        </div>
                    );
                })()}

                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {isJustAdded() && (
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
                            Just Added
                        </div>
                    )}
                    {event.is_featured && (
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                            ⭐ Featured
                        </div>
                    )}
                </div>

                <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-10">
                    <button
                        onClick={async (e) => {
                            e.stopPropagation();
                            const { data: { user } } = await supabase.auth.getUser();
                            if (!user) {
                                alert('Please sign in to save favorites');
                                return;
                            }

                            if (isFavorited) {
                                await supabase.from('favorites').delete().eq('user_id', user.id).eq('event_id', event.id);
                                setIsFavorited(false);
                            } else {
                                await supabase.from('favorites').insert({ user_id: user.id, event_id: event.id });
                                setIsFavorited(true);
                            }
                        }}
                        className={`p-2 rounded-full backdrop-blur-md border border-white/30 shadow-lg transition-all duration-300 ${isFavorited ? 'bg-red-500 text-white' : 'bg-black/20 text-white hover:bg-red-500'}`}
                    >
                        <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                    {event.category && (
                        <div
                            className="text-white text-[10px] font-bold px-3 py-1.5 rounded-full backdrop-blur-md border border-white/30 shadow-lg text-center"
                            style={{ backgroundColor: `${event.category.color}DD` }}
                        >
                            {event.category.name}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 group-hover:bg-clip-text transition-all duration-300">
                    {event.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed h-10">
                    {event.short_description || event.description}
                </p>

                <div className="space-y-2.5">
                    <div className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="font-medium">{formatDate(event.event_date)}</span>
                        {event.event_time && (
                            <span className="ml-1 text-gray-600">at {event.event_time.slice(0, 5)}</span>
                        )}
                    </div>

                    {event.venue && (
                        <div className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                            <MapPin className="w-4 h-4 mr-2 text-emerald-500 flex-shrink-0" />
                            <span className="truncate font-medium">
                                {event.venue}
                                {event.city && `, ${event.city.name}`}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center text-base font-bold text-gray-900 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-2 rounded-lg">
                            <IndianRupee className="w-4 h-4 mr-1 text-orange-500" />
                            {formatPrice()}
                        </div>

                        {event.registration_url && (() => {
                            const validUrl = validateAndFixUrl(event.registration_url);
                            return validUrl ? (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        AnalyticsService.trackEvent('registration_click', {
                                            event_id: event.id,
                                            event_title: event.title,
                                            source: event.source
                                        });
                                        window.open(validUrl, '_blank', 'noopener,noreferrer');
                                    }}
                                    className="flex items-center gap-1 text-sm bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300"
                                >
                                    {getCTA()}
                                    <ExternalLink className="w-3 h-3" />
                                </button>
                            ) : null;
                        })()}
                    </div>
                </div>

                {event.tags && event.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {event.tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="text-xs bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 px-3 py-1.5 rounded-full font-medium border border-gray-200"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
