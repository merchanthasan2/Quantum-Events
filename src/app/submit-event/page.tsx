'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Calendar, MapPin, IndianRupee, Globe, Phone, Mail, Image as ImageIcon, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function SubmitEvent() {
    const router = useRouter();
    const [cities, setCities] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        short_description: '',
        category_id: '',
        city_id: '',
        venue: '',
        address: '',
        event_date: '',
        event_time: '',
        ticket_price_min: 0,
        ticket_price_max: 0,
        is_free: false,
        image_url: '',
        registration_url: '',
        organizer: '',
        contact: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            const [cit, cat] = await Promise.all([
                supabase.from('cities').select('*').order('name'),
                supabase.from('categories').select('*').order('name')
            ]);
            setCities(cit.data || []);
            setCategories(cat.data || []);
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('event_submissions')
                .insert([{
                    ...formData,
                    status: 'pending'
                }]);

            if (error) throw error;

            alert('Thank you! Your event has been submitted for review.');
            router.push('/');
        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            <Header cities={cities} selectedCity={null} />

            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                <div className="text-center mb-12 animate-slide-up">
                    <div className="inline-flex items-center bg-blue-50 px-4 py-2 rounded-full text-blue-600 font-bold text-sm mb-4">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Grow Your Audience
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
                        Submit Your Event
                    </h1>
                    <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
                        Our platform helps 10,000+ people discover amazing activities every day. Submit yours and get featured across India.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in shadow-2xl rounded-[2.5rem] bg-white p-8 md:p-12 border border-blue-50">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-sm font-black text-gray-600 uppercase tracking-widest">Event Title</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. Mumbai Jazz Night 2026"
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold placeholder:text-gray-300"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-600 uppercase tracking-widest leading-relaxed">Category</label>
                            <select
                                required
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-600 uppercase tracking-widest leading-relaxed">City</label>
                            <select
                                required
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                                value={formData.city_id}
                                onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
                            >
                                <option value="">Select City</option>
                                {cities.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-black text-gray-600 uppercase tracking-widest leading-relaxed">Full Description</label>
                        <textarea
                            required
                            rows={5}
                            placeholder="Tell us everything about the event..."
                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold placeholder:text-gray-300"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    {/* Logistics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-600 uppercase tracking-widest leading-relaxed">Event Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    required
                                    type="date"
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                                    value={formData.event_date}
                                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-600 uppercase tracking-widest leading-relaxed">Start Time</label>
                            <input
                                required
                                type="time"
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                                value={formData.event_time}
                                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-600 uppercase tracking-widest leading-relaxed">Venue Name</label>
                            <div className="relative">
                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. NMACC, BKC"
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold placeholder:text-gray-300"
                                    value={formData.venue}
                                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-600 uppercase tracking-widest leading-relaxed">Booking Link</label>
                            <div className="relative">
                                <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    required
                                    type="url"
                                    placeholder="https://yourwebsite.com/tickets"
                                    className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold placeholder:text-gray-300"
                                    value={formData.registration_url}
                                    onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4 p-8 bg-gray-50 rounded-3xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <IndianRupee className="w-5 h-5 text-blue-600" />
                            <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Tickets & Pricing</h3>
                        </div>

                        <div className="flex items-center gap-3 py-2">
                            <input
                                id="isFree"
                                type="checkbox"
                                className="w-5 h-5 rounded-lg border-2 border-blue-500 text-blue-600 focus:ring-blue-500"
                                checked={formData.is_free}
                                onChange={(e) => setFormData({ ...formData, is_free: e.target.checked })}
                            />
                            <label htmlFor="isFree" className="font-bold text-gray-700">This is a Free Event</label>
                        </div>

                        {!formData.is_free && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Min Price (₹)</span>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 rounded-xl bg-white border-2 border-transparent focus:border-blue-500 transition-all outline-none font-bold"
                                        value={formData.ticket_price_min}
                                        onChange={(e) => setFormData({ ...formData, ticket_price_min: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Max Price (₹)</span>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 rounded-xl bg-white border-2 border-transparent focus:border-blue-500 transition-all outline-none font-bold"
                                        value={formData.ticket_price_max}
                                        onChange={(e) => setFormData({ ...formData, ticket_price_max: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Media */}
                    <div className="space-y-2">
                        <label className="text-sm font-black text-gray-600 uppercase tracking-widest leading-relaxed">Event Cover Link (High Quality)</label>
                        <div className="relative">
                            <ImageIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                required
                                type="url"
                                placeholder="https://image-host.com/your-event-poster.jpg"
                                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all outline-none font-bold placeholder:text-gray-300"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full py-5 rounded-[1.5rem] bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black text-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 shadow-blue-100 shadow-xl"
                    >
                        {loading ? (
                            <>
                                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                Submitting...
                            </>
                        ) : (
                            'Submit Event Now'
                        )}
                    </button>
                </form>
            </div>

            <Footer />
        </main>
    );
}
