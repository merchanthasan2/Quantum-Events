export class ImageProcessor {
    private static PLACEHOLDER_DOMAINS = [
        'placeholder.com',
        'via.placeholder.com',
        'dummyimage.com',
        'lorempixel.com',
        'unsplash.it'
    ];

    private static GENERIC_IMAGE_URLS = [
        'default-event.jpg',
        'placeholder.png',
        'no-poster.jpg',
        'event-default.png'
    ];

    /**
     * Checks if an image URL is likely a placeholder or generic image.
     */
    static isPlaceholder(url: string): boolean {
        if (!url) return true;

        const lowerUrl = url.toLowerCase();

        // Check for common placeholder domains
        if (this.PLACEHOLDER_DOMAINS.some(domain => lowerUrl.includes(domain))) {
            return true;
        }

        // Check for generic filenames
        if (this.GENERIC_IMAGE_URLS.some(gen => lowerUrl.endsWith(gen))) {
            return true;
        }

        // Specific service patterns for empty/loading images
        if (lowerUrl.includes('images.pexels.com/photos/lazy') ||
            lowerUrl.includes('loading.gif') ||
            lowerUrl.includes('bms-placeholder') ||
            lowerUrl.includes('insider-placeholder') ||
            lowerUrl.includes('static/images/event-placeholder')) {
            return true;
        }

        return false;
    }

    /**
     * Returns a high-quality category-specific default image if the provided one is invalid.
     */
    static getFallbackImage(categoryName: string = 'Events'): string {
        const fallbacks: Record<string, string> = {
            'Music': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200',
            'Comedy': 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&q=80&w=1200',
            'Workshops': 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=1200',
            'Adventure': 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&q=80&w=1200',
            'Food & Drinks': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200',
            'Spirituality': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200',
            'Exhibitions': 'https://images.unsplash.com/photo-1531050171651-71fb4b025b04?auto=format&fit=crop&q=80&w=1200',
            'Kids': 'https://images.unsplash.com/photo-1472162014730-68d2174c2b4b?auto=format&fit=crop&q=80&w=1200',
            'Shopping': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200',
            'Events': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1200'
        };

        return fallbacks[categoryName] || fallbacks['Events'];
    }
}
