'use client';

import { MapPin, Navigation, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { City } from '@/lib/types';
import { detectUserCity } from '@/lib/geolocation';
import { useRouter, useSearchParams } from 'next/navigation';

interface CitySelectorProps {
    cities: City[];
    selectedCity: City | null;
}

export function CitySelector({ cities, selectedCity }: CitySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [detectingLocation, setDetectingLocation] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const onCitySelect = (city: City) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('city', city.slug);
        router.push(`/?${params.toString()}`);
    };

    useEffect(() => {
        const autoDetectCity = async () => {
            if (!selectedCity && cities.length > 0) {
                setDetectingLocation(true);
                const detectedCity = await detectUserCity(cities);
                setDetectingLocation(false);

                if (detectedCity) {
                    onCitySelect(detectedCity);
                }
            }
        };

        autoDetectCity();
    }, [cities, selectedCity, onCitySelect]);

    const handleDetectLocation = async () => {
        setDetectingLocation(true);
        const detectedCity = await detectUserCity(cities);
        setDetectingLocation(false);

        if (detectedCity) {
            onCitySelect(detectedCity);
            setIsOpen(false);
        } else {
            alert('Could not detect your location. Please select a city manually.');
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-blue-500 hover:bg-blue-50 rounded-xl transition-all shadow-sm min-w-[170px] justify-between group"
            >
                <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold text-gray-900">
                        {selectedCity ? selectedCity.name : 'Select City'}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 z-50 max-h-[70vh] overflow-y-auto animate-scale-in">
                        <div className="p-3 border-b border-gray-100">
                            <button
                                onClick={handleDetectLocation}
                                disabled={detectingLocation}
                                className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:shadow-lg text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Navigation className={`w-4 h-4 ${detectingLocation ? 'animate-spin' : ''}`} />
                                <span className="text-sm font-bold">
                                    {detectingLocation ? 'Detecting...' : 'Use My Location'}
                                </span>
                            </button>
                        </div>

                        <div className="py-2">
                            <p className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                All Cities
                            </p>
                            {cities.map(city => (
                                <button
                                    key={city.id}
                                    onClick={() => {
                                        onCitySelect(city);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 hover:bg-blue-50/50 transition-colors ${selectedCity?.id === city.id ? 'bg-blue-50 text-blue-600 font-bold' : 'text-gray-700'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold">{city.name}</p>
                                            <p className="text-xs text-gray-400">{city.state}</p>
                                        </div>
                                        {selectedCity?.id === city.id && (
                                            <MapPin className="w-4 h-4 text-blue-600" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
