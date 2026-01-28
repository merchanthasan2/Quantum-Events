import { Sparkles, Calendar, MapPin, Ticket } from 'lucide-react';

export function Hero() {
    return (
        <div className="relative bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 text-white py-12 md:py-16 px-4 overflow-hidden animate-gradient">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>

            <div className="relative max-w-7xl mx-auto text-center">
                <div className="flex items-center justify-center mb-4 animate-fade-in">
                    <div className="flex items-center bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 shadow-sm">
                        <Sparkles className="w-3 h-3 mr-2 animate-pulse" />
                        <span className="text-xs font-semibold uppercase tracking-wider">AI-Powered Discovery</span>
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 animate-slide-up leading-tight">
                    Experience the Best
                    <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-blue-200 bg-clip-text text-transparent ml-2">
                        Of Your City
                    </span>
                </h1>

                <p className="text-base md:text-lg text-white/90 mb-8 max-w-2xl mx-auto animate-slide-up font-light leading-relaxed">
                    Discover India's top handpicked experiences - from concerts to workshops.
                </p>

                <div className="flex flex-wrap justify-center gap-4 md:gap-8 max-w-3xl mx-auto animate-scale-in">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                        <Calendar className="w-4 h-4 text-blue-200" />
                        <span className="text-sm font-bold">10,000+ Events</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                        <MapPin className="w-4 h-4 text-emerald-200" />
                        <span className="text-sm font-bold">9 Major Cities</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                        <Ticket className="w-4 h-4 text-cyan-200" />
                        <span className="text-sm font-bold">Instant Booking</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
