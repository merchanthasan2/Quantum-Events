'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { AnalyticsService } from '@/lib/analytics';

export function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Track page view on path or search param change
        const url = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
        AnalyticsService.trackPageView(url);
    }, [pathname, searchParams]);

    return null; // This component doesn't render anything
}
