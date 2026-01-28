'use server';

import { supabase } from '@/lib/supabase';

export async function aiSearchEvents(query: string) {
    // This is where we would call Claude or another LLM to parse the query
    // For now, we perform a smart keyword expansion search

    console.log(`AI Search processing query: ${query}`);

    // Example of how we'd use an LLM:
    // const parsed = await gemini.parse(query); 
    // queries = { city: 'Mumbai', category: 'Music', keywords: ['jazz'] }

    const { data, error } = await supabase
        .from('events')
        .select('*, category:categories(*), city:cities(*)')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,venue.ilike.%${query}%`)
        .eq('is_approved', true)
        .limit(20);

    if (error) throw error;
    return data;
}
