import { Sparkles, Calendar, MapPin, Ticket } from 'lucide-react';

export function Hero() {
    return (
        <div className="relative bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 text-white py-20 md:py-32 px-4 overflow-hidden animate-gradient">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>

            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl animate-float-delayed"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-300 rounded-full blur-3xl animate-float"></div>
            </div>

            <div className="relative max-w-7xl mx-auto text-center">
                <div className="flex items-center justify-center mb-6 animate-fade-in">
                    <div className="flex items-center bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 shadow-lg">
                        <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                        <span className="text-sm font-semibold uppercase tracking-wider">AI-Powered Discovery</span>
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-slide-up leading-tight">
                    Experience the Best
                    <br />
                    <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-blue-200 bg-clip-text text-transparent">
                        Of Your City
                    </span>
                </h1>

                <p className="text-lg md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto animate-slide-up font-light leading-relaxed">
                    From electric concerts and side-splitting comedy to soulful workshops and premium exhibitions - discover India's top handpicked experiences.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 animate-scale-in">
                    <div className="glass-effect p-6 rounded-2xl hover:scale-105 transition-transform duration-300 cursor-pointer group">
                        <Calendar className="w-8 h-8 mb-3 mx-auto text-blue-600 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-gray-900 mb-1">10,000+ Events</h3>
                        <p className="text-sm text-gray-600 font-medium">Fresh events added daily</p>
                    </div>
                    <div className="glass-effect p-6 rounded-2xl hover:scale-105 transition-transform duration-300 cursor-pointer group">
                        <MapPin className="w-8 h-8 mb-3 mx-auto text-emerald-600 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-gray-900 mb-1">9 Major Cities</h3>
                        <p className="text-sm text-gray-600 font-medium">Coverage across India</p>
                    </div>
                    <div className="glass-effect p-6 rounded-2xl hover:scale-105 transition-transform duration-300 cursor-pointer group">
                        <Ticket className="w-8 h-8 mb-3 mx-auto text-cyan-600 group-hover:scale-110 transition-transform" />
                        <h3 className="font-bold text-gray-900 mb-1">Instant Booking</h3>
                        <p className="text-sm text-gray-600 font-medium">Book tickets directly</p>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-3 animate-fade-in px-4">
                    {[
                        { icon: '🎸', label: 'Music', color: 'from-blue-500 to-indigo-500' },
                        { icon: '🎭', label: 'Comedy', color: 'from-orange-500 to-red-500' },
                        { icon: '🎨', label: 'Exhibitions', color: 'from-emerald-500 to-teal-500' },
                        { icon: '⚽', label: 'Sports', color: 'from-cyan-500 to-blue-500' },
                        { icon: '👶', label: 'Kids', color: 'from-pink-500 to-rose-500' },
                        { icon: '🥘', label: 'Food & Drinks', color: 'from-amber-500 to-orange-500' },
                    ].map((category, index) => (
                        <a
                            key={index}
                            href={`/?q=${category.label}`}
                            className={`flex items-center gap-2 bg-white/10 backdrop-blur-xl hover:bg-white hover:text-gray-900 border border-white/20 px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <span className="text-xl">{category.icon}</span>
                            {category.label}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
}
