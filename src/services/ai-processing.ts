export class AIProcessingService {
    /**
     * Heuristic-based quality assurance to detect placeholder or low-quality content.
     * In production, this would call Anthropic Claude Haiku.
     */
    static async validateEvent(event: any): Promise<{ isValid: boolean; reason?: string }> {
        // 1. Check for suspicious keywords
        const suspiciousKeywords = ['test', 'dummy', 'placeholder', 'asdf'];
        const content = `${event.title} ${event.description}`.toLowerCase();

        if (suspiciousKeywords.some(kw => content.includes(kw))) {
            return { isValid: false, reason: 'Contains suspicious/dummy keywords' };
        }

        // 1b. Strict Re-Release Filter for Movies
        // If it's a movie, check for re-release markers
        if (event.category === 'Movies' || content.includes('movie') || content.includes('cinema')) {
            const reReleaseKeywords = [
                're-release', 'rerelease',
                'anniversary screening',
                'special screening',
                'classic',
                'old movie',
                'reliving the magic',
                'back in cinemas'
            ];

            if (reReleaseKeywords.some(kw => content.includes(kw))) {
                // Double check: acceptable if it's a "Premiere" or "Festival"
                if (!content.includes('premiere') && !content.includes('festival')) {
                    return { isValid: false, reason: 'Detected as a re-release or old movie screening' };
                }
            }
        }

        // 2. Minimum length requirements
        if (event.title.length < 5) {
            return { isValid: false, reason: 'Title too short' };
        }

        if ((event.description || '').length < 20) {
            return { isValid: false, reason: 'Description too short' };
        }

        // 3. Price validation
        if (event.price_min < 0 || event.price_max < 0) {
            return { isValid: false, reason: 'Invalid pricing' };
        }

        // 4. Image check
        if (!event.image_url || event.image_url.includes('spacer.gif')) {
            return { isValid: false, reason: 'Missing or invalid image' };
        }

        return { isValid: true };
    }

    /**
     * Normalized category mapping.
     */
    static normalizeCategory(rawCategory: string, title: string = '', description: string = ''): string {
        const mapping: Record<string, string> = {
            'concerts': 'Music',
            'music': 'Music',
            'comedy': 'Comedy',
            'standup': 'Comedy',
            'workshops': 'Workshops',
            'education': 'Workshops',
            'food': 'Food & Drinks',
            'drinks': 'Food & Drinks',
            'adventure': 'Adventure',
            'spiritual': 'Spirituality',
            'yoga': 'Spirituality',
            'movies': 'Movies',
            'cinema': 'Movies',
            'film': 'Movies'
        };

        const normalized = mapping[rawCategory.toLowerCase()];
        if (normalized) return normalized;

        // If generic 'Events', try keyword matching on title/desc
        const content = `${title} ${description}`.toLowerCase();

        if (content.includes('music') || content.includes('concert') || content.includes('dj') || content.includes('festival')) return 'Music';
        if (content.includes('comedy') || content.includes('standup') || content.includes('stand-up')) return 'Comedy';
        if (content.includes('workshop') || content.includes('class') || content.includes('learn')) return 'Workshops';
        if (content.includes('food') || content.includes('drink') || content.includes('dining')) return 'Food & Drinks';
        if (content.includes('trek') || content.includes('adventure') || content.includes('camping')) return 'Adventure';
        if (content.includes('yoga') || content.includes('spiritual') || content.includes('meditation')) return 'Spirituality';
        if (content.includes('circus') || content.includes('kids') || content.includes('children')) return 'Kids';
        if (content.includes('exhibition') || content.includes('art') || content.includes('gallery')) return 'Exhibitions';
        if (content.includes('movie') || content.includes('cinema') || content.includes('film') || content.includes('now showing')) return 'Movies';

        return 'Events';
    }

    /**
     * Semantic Query Parser
     * Extracts intent, city, and category from a natural language string.
     * Example: "Music events in Mumbai this weekend" 
     * -> { category: 'Music', city: 'mumbai', timeRange: 'weekend' }
     */
    static parseQuery(query: string): {
        city?: string;
        category?: string;
        intent?: string;
        timeRange?: 'today' | 'weekend' | 'this_week' | 'all'
    } {
        const q = query.toLowerCase();
        const result: any = { intent: 'discovery' };

        // 1. City Detection
        const cities = ['mumbai', 'pune', 'bangalore', 'bengaluru', 'delhi', 'ncr', 'hyderabad', 'chennai', 'kolkata', 'gurugram', 'noida'];
        for (const city of cities) {
            if (q.includes(city)) {
                result.city = city === 'bengaluru' ? 'bangalore' :
                    (city === 'ncr' || city === 'gurugram' || city === 'noida' ? 'delhi' : city);
                break;
            }
        }

        // 2. Category Detection
        const categoryKeywords: Record<string, string[]> = {
            'Music': ['music', 'concert', 'gig', 'dj', 'band', 'singer', 'festival', 'live music', 'jazz', 'rock', 'pop', 'techno', 'edm'],
            'Comedy': ['comedy', 'standup', 'stand-up', 'laugh', 'funny', 'comic', 'joke'],
            'Workshops': ['workshop', 'class', 'learn', 'course', 'training', 'masterclass', 'skill', 'pottery', 'painting', 'dance'],
            'Food & Drinks': ['food', 'drink', 'dining', 'wine', 'beer', 'brunch', 'dinner', 'tasting', 'culinary', 'restaurant', 'cafe', 'pub'],
            'Adventure': ['adventure', 'trek', 'trekking', 'camping', 'hiking', 'outdoor', 'travel', 'trip', 'expedition', 'cycling'],
            'Spirituality': ['spiritual', 'yoga', 'meditation', 'retreat', 'temple', 'holistic', 'wellness', 'healing'],
            'Exhibitions': ['exhibition', 'art', 'gallery', 'museum', 'trade', 'fair', 'expo', 'fashion', 'clothing', 'jewelry'],
            'Kids': ['kids', 'children', 'family', 'parents', 'baby', 'toddler', 'school', 'fun for kids'],
            'Shopping': ['shopping', 'market', 'flea', 'sale', 'pop-up', 'popup', 'store', 'boutique'],
            'Movies': ['movie', 'cinema', 'film', 'release', 'showing', 'theatre', 'theater']
        };

        for (const [cat, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(kw => q.includes(kw))) {
                result.category = cat;
                break;
            }
        }

        // 3. Time Detection
        if (q.includes('today') || q.includes('tonight')) {
            result.timeRange = 'today';
        } else if (q.includes('weekend') || q.includes('saturday') || q.includes('sunday')) {
            result.timeRange = 'weekend';
        } else if (q.includes('week') || q.includes('coming days')) {
            result.timeRange = 'this_week';
        }

        return result;
    }
}
