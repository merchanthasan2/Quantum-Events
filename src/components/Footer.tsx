'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook, ExternalLink } from 'lucide-react';

import { LogoText } from './Logo';

export function Footer() {
    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link
                            href="/"
                            className="mb-6 inline-block"
                        >
                            <LogoText className="text-2xl" />
                        </Link>
                        <p className="text-gray-500 font-medium mb-6">
                            India's #1 AI-powered events discovery platform. We bring the best of your city to your fingertips.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-50 transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-blue-700 hover:bg-blue-50 transition-all">
                                <Facebook className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Quick Links</h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/" className="text-gray-500 font-bold hover:text-blue-600 transition-colors">
                                    Browse Events
                                </Link>
                            </li>
                            <li>
                                <Link href="/submit-event" className="text-gray-500 font-bold hover:text-blue-600 transition-colors">
                                    Submit Your Event
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin" className="text-gray-500 font-bold hover:text-blue-600 transition-colors">
                                    Admin Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-500 font-bold hover:text-blue-600 transition-colors">
                                    Our Story
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Explore Cities</h4>
                        <ul className="space-y-4">
                            {['Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Pune'].map(city => (
                                <li key={city}>
                                    <Link href={`/?city=${city.toLowerCase()}`} className="text-gray-500 font-bold hover:text-blue-600 transition-colors">
                                        Events in {city}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-gray-500 font-bold">
                                <Mail className="w-4 h-4 text-blue-600" />
                                hello@aajkascene.com
                            </li>
                            <li className="flex items-center gap-3 text-gray-500 font-bold">
                                <Phone className="w-4 h-4 text-blue-600" />
                                +91 (123) 456-7890
                            </li>
                            <li className="flex items-center gap-3 text-gray-500 font-bold">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                Cyber City, Gurugram, India
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 text-center">
                    <p className="text-gray-400 font-bold text-sm">
                        © 2026 Aaj Ka Scene. Built with ❤️ for India.
                    </p>
                </div>
            </div>
        </footer>
    );
}
