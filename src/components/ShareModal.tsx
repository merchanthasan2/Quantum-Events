'use client';

import { useState } from 'react';
import { Share2, MessageCircle, Twitter, Linkedin, Link2, Check, X } from 'lucide-react';
import { AnalyticsService } from '@/lib/analytics';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    eventTitle: string;
    eventId: string;
}

export function ShareModal({ isOpen, onClose, eventTitle, eventId }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/events/${eventId}` : '';
    const encodedTitle = encodeURIComponent(`Check out this event: ${eventTitle}`);
    const encodedUrl = encodeURIComponent(shareUrl);

    const shareOptions = [
        {
            name: 'WhatsApp',
            icon: <MessageCircle className="w-5 h-5" />,
            color: 'bg-[#25D366]',
            url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
            platform: 'whatsapp'
        },
        {
            name: 'Twitter',
            icon: <Twitter className="w-5 h-5" />,
            color: 'bg-[#1DA1F2]',
            url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            platform: 'twitter'
        },
        {
            name: 'LinkedIn',
            icon: <Linkedin className="w-5 h-5" />,
            color: 'bg-[#0077B5]',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            platform: 'linkedin'
        }
    ];

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            AnalyticsService.trackEvent('share_click', { platform: 'copy_link', event_id: eventId });
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in border border-white/20">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Share Event</h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {shareOptions.map((option) => (
                            <a
                                key={option.name}
                                href={option.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => AnalyticsService.trackEvent('share_click', { platform: option.platform, event_id: eventId })}
                                className="flex flex-col items-center gap-2 group"
                            >
                                <div className={`${option.color} text-white p-4 rounded-2xl shadow-lg transition-transform group-hover:scale-110 group-hover:-translate-y-1`}>
                                    {option.icon}
                                </div>
                                <span className="text-xs font-bold text-gray-500">{option.name}</span>
                            </a>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Copy Link</p>
                        <div className="relative">
                            <input
                                readOnly
                                type="text"
                                value={shareUrl}
                                className="w-full pl-4 pr-16 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 font-bold text-sm text-gray-600 outline-none"
                            />
                            <button
                                onClick={copyToClipboard}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            >
                                {copied ? <Check className="w-4 h-4" /> : 'Copy'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
