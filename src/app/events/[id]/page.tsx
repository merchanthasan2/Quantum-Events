import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Calendar, MapPin, IndianRupee, Globe, Phone, Mail, Share2, ExternalLink, User } from 'lucide-react';
import { validateAndFixUrl } from '@/lib/utils';
import { Event } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import { ImageProcessor } from '@/services/image-processor';
import { generateCalendarLink } from '@/lib/calendar';
import { EventActions } from '@/components/EventActions';
import { ReviewSection } from '@/components/ReviewSection';
import { RecentlyViewedTracker } from '@/components/RecentlyViewedTracker';
import { RelatedEvents } from '@/components/RelatedEvents';

async function getEvent(id: string) {
    const { data: event } = await supabase
        .from('events')
        .select('*, category:categories(*), city:cities(*)')
        .eq('id', id)
        .single();

    return event as any;
}

export async function generateMetadata({
    params
}: {
    params: Promise<{ id: string }>
}): Promise<Metadata> {
    const p = await params;
    const event = await getEvent(p.id);
    if (!event) return { title: 'Event Not Found' };

    return {
        title: `${event.title} in ${event.city?.name || 'India'} | Quantum Events`,
        description: event.short_description || event.description?.slice(0, 160),
        openGraph: {
            title: event.title,
            description: event.short_description,
            images: [event.image_url],
        },
    };
}

export default async function EventDetail({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const p = await params;
    const event = await getEvent(p.id);

    if (!event) {
        notFound();
    }

    const validRegistrationUrl = validateAndFixUrl(event.registration_url);

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        startDate: event.event_date,
        location: {
            '@type': 'Place',
            name: event.venue,
            address: {
                '@type': 'PostalAddress',
                streetAddress: event.address,
                addressLocality: event.city?.name,
                addressRegion: event.city?.state,
                addressCountry: 'IN',
            },
        },
        image: [event.image_url],
        description: event.short_description || event.description,
        offers: {
            '@type': 'Offer',
            price: event.ticket_price_min,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
            url: validRegistrationUrl,
        },
        organizer: {
            '@type': 'Organization',
            name: event.organizer,
        },
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Header cities={[]} selectedCity={event.city} />
            <RecentlyViewedTracker event={event} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {(() => {
                            const isPlaceholder = ImageProcessor.isPlaceholder(event.image_url);
                            const displayImage = isPlaceholder
                                ? ImageProcessor.getFallbackImage(event.category?.name)
                                : event.image_url;

                            return displayImage ? (
                                <div className="relative h-[300px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
                                    <Image
                                        src={displayImage}
                                        alt={event.title}
                                        fill
                                        priority
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        sizes="(max-width: 1024px) 100vw, 66vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-8 left-8 right-8">
                                        <div className="flex gap-2 mb-4">
                                            {event.category && (
                                                <span
                                                    className="px-4 py-1.5 rounded-full text-white text-xs font-bold backdrop-blur-md"
                                                    style={{ backgroundColor: `${event.category.color}DD` }}
                                                >
                                                    {event.category.name}
                                                </span>
                                            )}
                                            {event.is_featured && (
                                                <span className="px-4 py-1.5 rounded-full bg-yellow-400 text-white text-xs font-bold">
                                                    ⭐ Featured
                                                </span>
                                            )}
                                        </div>
                                        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                                            {event.title}
                                        </h1>
                                    </div>
                                </div>
                            ) : null;
                        })()}

                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                                About this Event
                            </h2>
                            <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed font-medium">
                                {event.description?.split('\n').map((para: string, i: number) => (
                                    <p key={i} className="mb-4">{para}</p>
                                )) || <p>{event.short_description}</p>}
                            </div>

                            {event.tags && event.tags.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
                                    {event.tags.map((tag: string, i: number) => (
                                        <span key={i} className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-bold border border-gray-200">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <ReviewSection eventId={event.id} />

                            <RelatedEvents
                                currentEventId={event.id}
                                categoryId={event.category?.id}
                                citySlug={event.city?.slug}
                            />
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-8 shadow-xl border border-blue-100 sticky top-24">
                            <div className="space-y-6">
                                <div>
                                    <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Price</div>
                                    <div className="flex items-center text-3xl font-black text-gray-900">
                                        <IndianRupee className="w-6 h-6 mr-1 text-orange-500" />
                                        {event.is_free ? 'Free' : (
                                            !event.ticket_price_min || event.ticket_price_min === 0
                                                ? 'Entry Free'
                                                : (event.ticket_price_min === event.ticket_price_max
                                                    ? `₹${event.ticket_price_min}`
                                                    : `₹${event.ticket_price_min} - ₹${event.ticket_price_max}`)
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-2xl">
                                    <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-bold text-gray-900">
                                            {new Date(event.event_date).toLocaleDateString('en-IN', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        <div className="text-sm text-blue-700 font-bold">
                                            {(() => {
                                                if (!event.event_time) return '';
                                                try {
                                                    // Parse time string (e.g., "19:00:00")
                                                    const [hours, minutes] = event.event_time.split(':');
                                                    const date = new Date();
                                                    date.setHours(parseInt(hours), parseInt(minutes));
                                                    return date.toLocaleTimeString('en-IN', {
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    });
                                                } catch (e) {
                                                    return event.event_time;
                                                }
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-4 bg-emerald-50 rounded-2xl">
                                    <MapPin className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <div className="font-bold text-gray-900">{event.venue}</div>
                                        <div className="text-sm text-emerald-700 font-bold">{event.address}</div>
                                    </div>
                                </div>

                                <EventActions event={event} validRegistrationUrl={validRegistrationUrl} />

                                <div className="pt-6 border-t border-gray-100">
                                    <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Organizer Details</div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <User className="w-4 h-4" />
                                            </div>
                                            {event.organizer}
                                        </div>
                                        {event.contact && (
                                            <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                {event.contact}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
