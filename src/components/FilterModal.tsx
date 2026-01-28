'use client';

import { X, Calendar, IndianRupee, Tag, Check, ArrowRight } from 'lucide-react';
import { Category } from '@/lib/types';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: Category[];
}

export function FilterModal({ isOpen, onClose, categories }: FilterModalProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
    const [selectedDate, setSelectedDate] = useState<string>(searchParams.get('date') || '');
    const [priceFilter, setPriceFilter] = useState<string>(searchParams.get('price') || 'all');

    if (!isOpen) return null;

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (selectedCategory) params.set('category', selectedCategory);
        else params.delete('category');

        if (selectedDate) params.set('date', selectedDate);
        else params.delete('date');

        if (priceFilter !== 'all') params.set('price', priceFilter);
        else params.delete('price');

        router.push(`/?${params.toString()}`);
        onClose();
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedDate('');
        setPriceFilter('all');
        router.push('/');
        onClose();
    };

    const dateOptions = [
        { label: 'Today', value: 'today' },
        { label: 'Tomorrow', value: 'tomorrow' },
        { label: 'This Weekend', value: 'weekend' },
        { label: 'Next Week', value: 'week' },
    ];

    const priceOptions = [
        { label: 'All Events', value: 'all' },
        { label: 'Free Entry', value: 'free' },
        { label: 'Paid Events', value: 'paid' },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 sm:pb-24">
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border border-gray-100">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Search Filters</h2>
                        <p className="text-gray-500 text-sm font-bold">Refine your search results</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-white hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all shadow-sm group"
                    >
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                <div className="px-8 py-8 space-y-10 max-h-[70vh] overflow-y-auto no-scrollbar">
                    {/* Date Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-400 font-black text-xs uppercase tracking-widest">
                            <Calendar className="w-4 h-4" />
                            <span>When</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {dateOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setSelectedDate(opt.value)}
                                    className={`px-4 py-3 rounded-2xl font-bold text-sm transition-all border-2 text-left flex items-center justify-between ${selectedDate === opt.value
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                                            : 'bg-gray-50 border-gray-50 text-gray-600 hover:bg-white hover:border-gray-200'
                                        }`}
                                >
                                    {opt.label}
                                    {selectedDate === opt.value && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-400 font-black text-xs uppercase tracking-widest">
                            <Tag className="w-4 h-4" />
                            <span>Category</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(prev => prev === cat.id ? '' : cat.id)}
                                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${selectedCategory === cat.id
                                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100'
                                            : 'bg-gray-50 border-gray-50 text-gray-600 hover:bg-white hover:border-gray-200'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price Filter */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-400 font-black text-xs uppercase tracking-widest">
                            <IndianRupee className="w-4 h-4" />
                            <span>Ticket Price</span>
                        </div>
                        <div className="flex gap-3">
                            {priceOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setPriceFilter(opt.value)}
                                    className={`flex-1 px-4 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${priceFilter === opt.value
                                            ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100'
                                            : 'bg-gray-50 border-gray-50 text-gray-600 hover:bg-white hover:border-gray-200'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-6 bg-gray-50 flex items-center gap-4">
                    <button
                        onClick={clearFilters}
                        className="px-6 py-4 rounded-2xl font-black text-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={applyFilters}
                        className="flex-grow flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-gray-200"
                    >
                        Apply Filters
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
