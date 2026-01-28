export interface CityTheme {
    primaryColor: string;
    secondaryColor: string;
    monument: string;
    monumentImage: string;
    tagline: string;
}

export interface City {
    id: string;
    name: string;
    slug: string;
    state: string;
    is_active: boolean;
    display_order: number;
    city_theme?: CityTheme | null;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    color: string;
    is_active: boolean;
    display_order: number;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    short_description: string;
    category_id: string | null;
    city_id: string | null;
    venue: string;
    address: string;
    latitude?: number | null;
    longitude?: number | null;
    event_date: string;
    event_time?: string | null;
    end_date?: string | null;
    duration?: string;
    image_url: string;
    gallery_urls?: string[];
    registration_url: string;
    ticket_price_min: number;
    ticket_price_max: number;
    is_free: boolean;
    source?: string;
    source_id?: string;
    organizer: string;
    contact?: string;
    tags: string[];
    is_featured: boolean;
    is_approved: boolean;
    view_count?: number;
    click_count?: number;
    created_at?: string;
    updated_at?: string;
    first_seen_at?: string;
    priority_weight?: number;
    category?: Category;
    city?: City;
}

export interface EventFilters {
    cityId: string | null;
    categories: string[];
    dateRange: 'today' | 'weekend' | 'week' | 'month' | 'all';
    priceRange: 'all' | 'free' | '0-500' | '500-1000' | '1000+';
    searchQuery: string;
}

export interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    is_admin: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface AnalyticsSession {
    id: string;
    user_id?: string | null;
    start_time: string;
    last_activity: string;
    device_type: string | null;
    os: string | null;
    browser: string | null;
    screen_resolution: string | null;
    city: string | null;
    country: string | null;
    referral_source: string | null;
    utm_params?: Record<string, any> | null;
}

export interface AnalyticsPageView {
    id: string;
    session_id: string;
    page_path: string;
    category?: string | null;
    timestamp: string;
}

export interface AnalyticsEvent {
    id: string;
    session_id: string;
    event_name: string;
    event_data?: Record<string, any> | null;
    timestamp: string;
}

export interface Favorite {
    id: string;
    user_id: string;
    event_id: string;
    created_at: string;
    event?: Event;
}
