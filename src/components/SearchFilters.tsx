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
            <div className="bg-white p-2 rounded-[2rem] shadow-xl shadow-blue-900/5 flex items-center border border-gray-100 mb-4">
                <form onSubmit={handleSearch} className="flex-grow relative group flex items-center">
                    <Search className="absolute left-6 w-6 h-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search events, categories, or venues..."
                        className="w-full pl-16 pr-4 py-4 rounded-[1.5rem] bg-transparent border-none focus:ring-0 focus:outline-none text-lg font-bold text-gray-900 placeholder:text-gray-300"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </form>
                <button
                    type="submit"
                    onClick={handleSearch}
                    className="m-2 px-8 py-4 rounded-[1.5rem] bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-[1.02] active:scale-95 text-white font-black text-base transition-all shadow-lg shadow-blue-200"
                >
                    Search
                </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2 bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-gray-200/50 shadow-sm">
                    {['Today', 'Tomorrow', 'Weekend'].map((date) => (
                        <button
                            key={date}
                            onClick={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                const value = date.toLowerCase();
                                if (searchParams.get('date') === value) {
                                    params.delete('date');
                                } else {
                                    params.set('date', value);
                                }
                                router.push(`/?${params.toString()}`);
                            }}
                            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${searchParams.get('date') === date.toLowerCase()
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {date}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setIsFilterModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-gray-700 font-bold border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all shadow-sm"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Advanced Filters</span>
                </button>
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
