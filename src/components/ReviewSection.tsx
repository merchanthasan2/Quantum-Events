'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Star, User, Clock, Trash2 } from 'lucide-react';

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    user_id: string;
    user_email?: string;
}

export function ReviewSection({ eventId }: { eventId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();
        fetchReviews();
    }, [eventId]);

    const fetchReviews = async () => {
        const { data, error } = await supabase
            .from('event_reviews')
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setReviews(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return alert('Please sign in to leave a review');

        setSubmitting(true);
        const { error } = await supabase
            .from('event_reviews')
            .upsert({
                event_id: eventId,
                user_id: user.id,
                rating,
                comment,
                is_approved: true
            });

        if (error) {
            alert('Error submitting review: ' + error.message);
        } else {
            setComment('');
            fetchReviews();
        }
        setSubmitting(false);
    };

    const handleDelete = async (reviewId: string) => {
        const { error } = await supabase
            .from('event_reviews')
            .delete()
            .eq('id', reviewId);

        if (!error) fetchReviews();
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    return (
        <div className="mt-12 space-y-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Community Reviews</h3>
                    <p className="text-gray-500 font-bold">What people are saying about this event</p>
                </div>
                {averageRating && (
                    <div className="flex items-center gap-3 bg-blue-50 px-5 py-3 rounded-2xl border border-blue-100 shadow-sm">
                        <span className="text-2xl font-black text-blue-600">{averageRating}</span>
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    className={`w-4 h-4 ${Number(averageRating) >= s ? 'fill-blue-600 text-blue-600' : 'text-blue-200'}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Review Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-gray-700 uppercase tracking-widest">Rate this event</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setRating(s)}
                                    className="p-1 hover:scale-125 transition-transform"
                                >
                                    <Star className={`w-6 h-6 ${rating >= s ? 'fill-blue-600 text-blue-600' : 'text-gray-300'}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell others what you think..."
                        className="w-full h-32 p-5 rounded-2xl bg-white border-2 border-transparent focus:border-blue-500 outline-none transition-all font-medium text-gray-800"
                        required
                    />
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Post Review'}
                    </button>
                </form>
            ) : (
                <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 text-center space-y-3">
                    <p className="font-bold text-blue-800">Want to share your experience?</p>
                    <a href="/auth" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-md">
                        Sign In to Review
                    </a>
                </div>
            )}

            {/* Review List */}
            <div className="space-y-4">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex gap-0.5 mb-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className={`w-3 h-3 ${review.rating >= s ? 'fill-blue-600 text-blue-600' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
                                            <span className="text-gray-900">User</span>
                                            <span>•</span>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {user?.id === review.user_id && (
                                    <button
                                        onClick={() => handleDelete(review.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <p className="text-gray-700 font-medium leading-relaxed italic">
                                "{review.comment}"
                            </p>
                        </div>
                    ))
                ) : (
                    !loading && (
                        <div className="text-center py-12 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                            <p className="text-gray-400 font-bold italic">No reviews yet. Be the first to share details!</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
