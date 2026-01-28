'use client';

import { useState } from 'react';
import { Share2, Calendar, ExternalLink } from 'lucide-react';
import { generateCalendarLink } from '@/lib/calendar';
import { ShareModal } from '@/components/ShareModal';

export function EventActions({ event, validRegistrationUrl }: { event: any, validRegistrationUrl: string | null }) {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    return (
        <div className="pt-4 space-y-3">
            {validRegistrationUrl && (() => {
                const needsBooking = event.ticket_price_min > 0 &&
                    !['Shopping', 'Exhibition'].includes(event.category?.name || '');
                const ctaText = needsBooking ? 'Book Tickets' : 'View Original Event';

                return (
                    <a
                        href={validRegistrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
                    >
                        {ctaText}
                        <ExternalLink className="w-5 h-5" />
                    </a>
                );
            })()}

            <button
                onClick={() => setIsShareModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
            >
                <Share2 className="w-5 h-5" />
                Share Event
            </button>

            <a
                href={generateCalendarLink({
                    title: event.title,
                    description: event.short_description || event.description,
                    location: `${event.venue}, ${event.address}`,
                    startDate: event.event_date,
                    startTime: event.event_time
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
            >
                <Calendar className="w-5 h-5" />
                Add to Calendar
            </a>

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                eventTitle={event.title}
                eventId={event.id}
            />
        </div>
    );
}
