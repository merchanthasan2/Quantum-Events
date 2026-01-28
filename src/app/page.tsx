import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { EventCard } from '@/components/EventCard';
import { City, Category } from '@/lib/types';
import { Footer } from '@/components/Footer';
import { SearchFilters } from '@/components/SearchFilters';
import { AIProcessingService } from '@/services/ai-processing';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, addDays, format } from 'date-fns';
import { RecentlyViewed } from '@/components/RecentlyViewed';

async function getInitialData(filters: { city?: string; category?: string; q?: string; date?: string; price?: string }) {
  // 1. Fetch cities and categories first for mapping
  const [citiesRes, categoriesRes] = await Promise.all([
    supabase.from('cities').select('*').order('display_order'),
    supabase.from('categories').select('*').order('display_order'),
  ]);

  const cities = (citiesRes.data as City[]) || [];
  const categories = (categoriesRes.data as Category[]) || [];

  // 2. Parse Semantic Search
  let activeCitySlug = filters.city;
  let activeCategoryId = filters.category;
  let timeFilter = null;
  let searchTerms = filters.q;

  if (filters.q) {
    const aiResult = AIProcessingService.parseQuery(filters.q);

    // Map semantic city to slug if not already filtered
    if (!activeCitySlug && aiResult.city) {
      activeCitySlug = aiResult.city;
    }

    // Map semantic category to ID if not already filtered
    if (!activeCategoryId && aiResult.category) {
      const cat = categories.find(c => c.name === aiResult.category);
      if (cat) activeCategoryId = cat.id;
    }

    timeFilter = aiResult.timeRange;
  }

  // Override timeFilter/activeCategoryId if explicit filters are provided from the modal
  if (filters.date) timeFilter = filters.date;
  const activePriceFilter = filters.price;

  // 3. Build Query
  let query = supabase
    .from('events')
    .select(`
      *,
      category:categories(*),
      city:cities${activeCitySlug ? '!inner' : ''}(*)
    `)
    .eq('is_approved', true);

  if (activeCitySlug) {
    query = query.eq('city.slug', activeCitySlug.toLowerCase());
  }
  if (activeCategoryId) {
    query = query.eq('category_id', activeCategoryId);
  }

  if (searchTerms) {
    query = query.or(`title.ilike.%${searchTerms}%,description.ilike.%${searchTerms}%,venue.ilike.%${searchTerms}%`);
  }

  // Date Filtering
  const now = new Date();

  if (timeFilter === 'today') {
    // Events active today (starts today OR starts before today and ends after today)
    const todayStr = format(now, 'yyyy-MM-dd');
    query = query.or(`event_date.eq.${todayStr},and(event_date.lte.${todayStr},end_date.gte.${todayStr})`);
  } else if (timeFilter === 'tomorrow') {
    const tomorrow = addDays(now, 1);
    const tomStr = format(tomorrow, 'yyyy-MM-dd');
    query = query.eq('event_date', tomStr);
  } else if (timeFilter === 'weekend') {
    // Logic: If today is Saturday/Sunday, show today + remaining weekend. 
    // Else show next Friday-Sunday.
    const day = now.getDay(); // 0 is Sunday, 6 is Saturday
    let start, end;

    if (day === 0) { // Sunday, show today
      start = now;
      end = now;
    } else if (day === 6) { // Saturday, show today + tomorrow
      start = now;
      end = addDays(now, 1);
    } else {
      // Next Friday
      const dist = (5 + 7 - day) % 7;
      start = addDays(now, dist);
      end = addDays(start, 2); // Sunday
    }

    query = query.gte('event_date', format(start, 'yyyy-MM-dd'))
      .lte('event_date', format(end, 'yyyy-MM-dd'));
  } else if (timeFilter === 'week') {
    // This week (Mon-Sun)
    const start = startOfWeek(now, { weekStartsOn: 1 });
    const end = endOfWeek(now, { weekStartsOn: 1 });
    query = query.gte('event_date', format(start, 'yyyy-MM-dd'))
      .lte('event_date', format(end, 'yyyy-MM-dd'));
  } else {
    // Default: upcoming events
    // query = query.gte('event_date', format(startOfDay(now), 'yyyy-MM-dd'));
    // Removed default restriction to allow seeing featured events or recently added
  }

  // Price Filter logic
  if (activePriceFilter === 'free') {
    query = query.eq('is_free', true);
  } else if (activePriceFilter === 'paid') {
    query = query.eq('is_free', false).gt('ticket_price_min', 0);
  }

  try {
    const eventsRes = await query.order('event_date', { ascending: true }).limit(40);

    if (eventsRes.error) {
      console.error('Error fetching events:', eventsRes.error);
    }

    return {
      cities,
      categories,
      events: (eventsRes.data as any[]) || []
    };
  } catch (error) {
    console.error('Initial data fetch failed:', error);
    return { cities: [], categories: [], events: [] };
  }
}

export default async function Home({
  searchParams
}: {
  searchParams: Promise<{ city?: string; category?: string; q?: string; date?: string; price?: string }>
}) {
  const sp = await searchParams;
  const { cities, categories, events } = await getInitialData(sp);
  const selectedCity = cities.find(c => c.slug === sp.city) || null;

  return (
    <main className="min-h-screen">
      <Header
        cities={cities}
        selectedCity={selectedCity}
      />
      <Hero />
      <SearchFilters categories={categories} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {sp.city ? `Events in ${selectedCity?.name}` : 'Recommended Events'}
            </h2>
            <p className="text-gray-500 font-bold">Handpicked activities for you</p>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            <a
              href={`/${sp.city ? `?city=${sp.city}` : ''}`}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl border-2 font-black text-sm transition-all ${!sp.category
                ? 'bg-gray-900 border-gray-900 text-white shadow-lg scale-105'
                : 'bg-white border-gray-100 text-gray-500 hover:border-gray-900 hover:text-gray-900'
                }`}
            >
              All Categories
            </a>
            {categories.map((category) => (
              <a
                key={category.id}
                href={`/?category=${category.id}${sp.city ? `&city=${sp.city}` : ''}`}
                className={`whitespace-nowrap px-6 py-3 rounded-2xl border-2 font-black text-sm transition-all ${sp.category === category.id.toString()
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100 scale-105'
                  : 'bg-white border-gray-100 text-gray-500 hover:border-blue-200 hover:text-blue-600'
                  }`}
              >
                {category.name}
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <RecentlyViewed />

        {events.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <div className="mb-4 inline-flex p-4 bg-gray-50 rounded-full">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500 max-w-sm mx-auto font-medium">
              We couldn't find any events right now. Try switching your city or checking back later!
            </p>
          </div>
        )}
      </div>

      {/* City Specific Sections Could Go Here */}
      <Footer />
    </main>
  );
}
