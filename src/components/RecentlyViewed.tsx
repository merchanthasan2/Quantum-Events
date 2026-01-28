'use client';

import { useState, useEffect } from 'react';
import { Event } from '@/lib/types';
import { EventCard } from './EventCard';
import { Clock } from 'lucide-react';

const STORAGE_KEY = 'quantum_recently_viewed';

export function RecentlyViewed() {
    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setEvents(parsed.slice(0, 4)); // Show top 4
            } catch (e) {
                console.error('Failed to parse recently viewed', e);
            }
        }
    }, []);

    if (events.length === 0) return null;

    return (
        <div className="mt-20 border-t border-gray-100 pt-12">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-gray-100 rounded-2xl">
                    <Clock className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Recently Viewed</h2>
                    <p className="text-gray-500 font-bold">Pick up where you left off</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 opacity-80 hover:opacity-100 transition-opacity">
                {events.map((event) => (
                    <div key={event.id} className="scale-95 hover:scale-100 transition-transform h-full">
                        <EventCard event={event} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Helper to track views
export function trackEventView(event: Event) {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(STORAGE_KEY);
    let events: Event[] = stored ? JSON.parse(stored) : [];

    // Remove if already exists to move to front
    events = events.filter(e => e.id !== event.id);
    events.unshift(event);

    // Keep only last 10
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(0, 10)));
}
