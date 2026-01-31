'use client';

import { useState, useEffect } from 'react';
import { Share2, Calendar, ExternalLink, Lock } from 'lucide-react';
import { generateCalendarLink } from '@/lib/calendar';
import { ShareModal } from '@/components/ShareModal';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function EventActions({ event, validRegistrationUrl }: { event: any, validRegistrationUrl: string | null }) {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        checkUser();
    }, []);

    const handleLoginRedirect = () => {
        // Redirect to login with return URL
        const returnUrl = encodeURIComponent(window.location.pathname);
        router.push(`/auth?next=${returnUrl}`);
    };

    if (loading) {
        return <div className="pt-4 space-y-3 animate-pulse">
            <div className="h-14 bg-gray-200 rounded-2xl w-full"></div>
            <div className="h-14 bg-gray-200 rounded-2xl w-full"></div>
        </div>;
    }

    return (
        <div className="pt-4 space-y-3">
            {/* Gated Booking / View Button */}
            {!user ? (
                <button
                    onClick={handleLoginRedirect}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                    <Lock className="w-5 h-5" />
                    Login to Book & View Details
                </button>
            ) : (
                validRegistrationUrl && (() => {
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
                })()
            )}

            <button
                onClick={() => setIsShareModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
            >
                <Share2 className="w-5 h-5" />
                Share Event
            </button>

            {/* Gated Calendar */}
            {user ? (
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
            ) : (
                <button
                    onClick={handleLoginRedirect}
                    className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-100 text-gray-400 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                >
                    <Lock className="w-4 h-4" />
                    Login to Add to Calendar
                </button>
            )}

            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                eventTitle={event.title}
                eventId={event.id}
            />
        </div>
    );
}
