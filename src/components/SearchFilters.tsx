'use client';

import { Search, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { FilterModal } from './FilterModal';
import { Category } from '@/lib/types';

interface SearchFiltersProps {
    categories: Category[];
}

export function SearchFilters({ categories }: SearchFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        submitSearch(query);
    };

    const submitSearch = (q: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (q) {
            params.set('q', q);
        } else {
            params.delete('q');
        }
        router.push(`/?${params.toString()}`);
    };

    const suggestedQueries = [
        "Music this weekend",
        "Comedy in Mumbai",
        "Workshops in Bangalore",
        "Free events today"
    ];

    return (
        <div className="max-w-4xl mx-auto -mt-10 px-4 relative z-20">
            <div className="glass-effect p-3 rounded-[2rem] shadow-2xl flex flex-col md:flex-row gap-2 border border-blue-100">
                <form onSubmit={handleSearch} className="flex-grow relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Try 'Music in Pune this weekend'..."
                        className="w-full pl-14 pr-24 py-5 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold placeholder:text-gray-300"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                        <span className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-600 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border border-blue-200/50 flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-3 h-3" />
                            AI Powered
                        </span>
                    </div>
                </form>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIsFilterModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-8 py-5 rounded-[1.5rem] bg-gray-50 hover:bg-white border-2 border-gray-100 hover:border-blue-500 text-gray-600 font-black text-sm transition-all"
                    >
                        <SlidersHorizontal className="w-5 h-5" />
                        <span>Filters</span>
                    </button>
                    <button
                        type="submit"
                        onClick={handleSearch}
                        className="px-10 py-5 rounded-[1.5rem] bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-[1.02] active:scale-95 text-white font-black text-sm transition-all shadow-xl shadow-blue-200"
                    >
                        Search
                    </button>
                </div>
            </div>

            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                categories={categories}
            />

            {/* Suggested Queries */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-2">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mr-2">Try:</span>
                {suggestedQueries.map((q) => (
                    <button
                        key={q}
                        onClick={() => {
                            setQuery(q);
                            submitSearch(q);
                        }}
                        className="text-xs font-bold text-gray-500 hover:text-blue-600 bg-white/50 hover:bg-white px-4 py-2 rounded-full border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 cursor-pointer"
                    >
                        {q}
                    </button>
                ))}
            </div>
        </div>
    );
}
