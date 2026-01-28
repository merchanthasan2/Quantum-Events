'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                Something went wrong!
            </h1>
            <p className="text-gray-600 mb-8 max-w-md font-medium">
                We encountered an unexpected error. Don't worry, our team of space engineers is on it!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                <button
                    onClick={() => reset()}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all hover:scale-105 shadow-lg"
                >
                    <RotateCcw className="w-5 h-5" />
                    Try Again
                </button>
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                >
                    <Home className="w-5 h-5" />
                    Go Home
                </Link>
            </div>
        </div>
    );
}
