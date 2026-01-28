export default function Loading() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 animate-pulse uppercase tracking-widest">
                Quantum Events
            </h2>
            <p className="text-gray-500 font-bold">Discovering the best of India for you...</p>
        </div>
    );
}
