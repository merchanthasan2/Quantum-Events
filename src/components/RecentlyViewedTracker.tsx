'use client';

import { useEffect } from 'react';
import { trackEventView } from './RecentlyViewed';
import { Event } from '@/lib/types';

export function RecentlyViewedTracker({ event }: { event: Event }) {
    useEffect(() => {
        if (event) {
            trackEventView(event);
        }
    }, [event]);

    return null;
}
