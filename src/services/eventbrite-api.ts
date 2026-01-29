import axios from 'axios';

export interface EventbriteEvent {
    id: string;
    name: { text: string };
    description: { text: string };
    url: string;
    start: { utc: string };
    end: { utc: string };
    currency: string;
    online_event: boolean;
    logo?: { url: string };
    venue?: {
        name: string;
        address: {
            localized_address_display: string;
            city: string;
        };
    };
    is_free: boolean;
}

export class EventbriteApiService {
    private readonly token: string;
    private readonly affiliateId: string;
    private readonly baseUrl = 'https://www.eventbriteapi.com/v3';

    constructor() {
        this.token = process.env.EVENTBRITE_PRIVATE_TOKEN || '';
        this.affiliateId = process.env.EVENTBRITE_AFFILIATE_ID || 'aajkascene';
    }

    private get headers() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    /**
     * Appends the affiliate ID to the Eventbrite URL.
     */
    private monetizeUrl(url: string): string {
        if (!this.affiliateId) return url;
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}aff=${this.affiliateId}`;
    }

    /**
     * Search for events in a specific city.
     * Note: Eventbrite API v3 /events/search/ is legacy/restricted for many new accounts.
     * We often use the Organization's events or specific venue/category endpoints.
     */
    async fetchEvents(city: string): Promise<any[]> {
        if (!this.token) {
            console.error('Eventbrite Token missing');
            return [];
        }

        try {
            console.log(`  🔗 Fetching Eventbrite API for: ${city}`);

            // Note: Eventbrite's discovery API is complex. 
            // We use the search endpoint if available, otherwise we might need to broaden.
            const response = await axios.get(`${this.baseUrl}/events/search/`, {
                headers: this.headers,
                params: {
                    'location.address': city,
                    'location.within': '50km',
                    'expand': 'venue,category'
                }
            });

            return (response.data.events || []).map((ev: any) => ({
                title: ev.name.text,
                description: ev.description.text,
                category: ev.category?.name || 'Events',
                city: city,
                venue: ev.venue?.name || 'Various Venues',
                address: ev.venue?.address?.localized_address_display || city,
                event_date: ev.start.utc,
                image_url: ev.logo?.url || '',
                price_min: 0, // Eventbrite API needs separate call for ticket classes
                price_max: 0,
                is_free: ev.is_free,
                registration_url: this.monetizeUrl(ev.url),
                source: 'Eventbrite API',
                source_id: ev.id
            }));

        } catch (error: any) {
            console.error(`Error fetching Eventbrite API for ${city}:`, error.response?.data || error.message);

            // Fallback: If search endpoint is restricted (common), we might use other methods or return empty
            // to let the scraper handle it, but we still apply affiliate to scraped links.
            return [];
        }
    }

    /**
     * Apply affiliate ID to an existing URL
     */
    applyAffiliate(url: string): string {
        return this.monetizeUrl(url);
    }
}
