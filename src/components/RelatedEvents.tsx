'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Event } from '@/lib/types';
import { EventCard } from './EventCard';
import { Sparkles } from 'lucide-react';

interface RelatedEventsProps {
    currentEventId: string;
    categoryId?: string;
    citySlug?: string;
}

export function RelatedEvents({ currentEventId, categoryId, citySlug }: RelatedEventsProps) {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                let query = supabase
                    .from('events')
                    .select('*, category:categories(*), city:cities(*)')
                    .eq('is_approved', true)
                    .neq('id', currentEventId) // Exclude current event
                    .gte('event_date', new Date().toISOString().split('T')[0]) // Future events only
                    .limit(4);

                // Prioritize same category
                if (categoryId) {
                    query = query.eq('category_id', categoryId);
                }

                // If massive scaling needed, we'd add city filter too, but for now 
                // keeping it broader ensures we always have recommendations.
                // You could uncomment this to be strict about city:
                // if (citySlug) {
                //    query = query.eq('city.slug', citySlug);
                // }

                const { data, error } = await query;

                if (!error && data) {
                    // shuffle slightly so it's not static? For now just take latest.
                    setEvents(data as Event[]);
                }
            } catch (err) {
                console.error('Error fetching related events:', err);
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchRelated();
        } else {
            setLoading(false);
        }
    }, [currentEventId, categoryId, citySlug]);

    if (loading || events.length === 0) return null;

    return (
        <div className="mt-16 border-t border-gray-100 pt-12">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">You Might Also Like</h2>
                    <p className="text-gray-500 font-bold">Similar events you shouldn't miss</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
}
