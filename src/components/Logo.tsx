import React from 'react';

export function Logo({ className = "w-8 h-8", textClassName = "text-xl" }: { className?: string, textClassName?: string }) {
    return (
        <div className="flex items-center gap-2">
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={className}
            >
                <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#fb923c', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>
                {/* Abstract Play Button Shape mimicking the 3-part ribbon design */}
                <path
                    d="M30 20 L80 50 L30 80 Z"
                    fill="url(#grad2)"
                    stroke="url(#grad1)"
                    strokeWidth="8"
                    strokeLinejoin="round"
                    className="drop-shadow-sm"
                />
                {/* Overlay for depth */}
                <path
                    d="M30 20 L60 50 L30 80 Z"
                    fill="url(#grad1)"
                    opacity="0.8"
                />
            </svg>
            <span className={`font-black tracking-tight ${textClassName}`}>
                <span className="text-orange-500">AajKa</span>
                <span className="text-blue-600">Scene</span>
            </span>
        </div>
    );
}

// Simple text-only version for small spaces or footers if needed
export function LogoText({ className = "text-xl" }: { className?: string }) {
    return (
        <span className={`font-black tracking-tight ${className}`}>
            <span className="text-orange-500">AajKa</span>
            <span className="text-blue-600">Scene</span>
        </span>
    );
}
