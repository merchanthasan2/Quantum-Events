import { supabase } from './supabase';
import { AnalyticsSession, AnalyticsPageView, AnalyticsEvent } from './types';

export class AnalyticsService {
    private static sessionId: string | null = null;

    static async initializeSession() {
        if (this.sessionId) return this.sessionId;

        const userAgent = typeof window !== 'undefined' ? navigator.userAgent : 'Server';
        const screenRes = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : null;

        // Get basic device/browser info
        const browser = this.getBrowserInfo(userAgent);
        const os = this.getOSInfo(userAgent);

        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
            .from('analytics_sessions')
            .insert({
                user_id: user?.id || null,
                device_type: this.getDeviceType(userAgent),
                os,
                browser,
                screen_resolution: screenRes,
                referral_source: typeof document !== 'undefined' ? document.referrer : null,
            })
            .select('id')
            .single();

        if (error) {
            console.error('Failed to init session:', error);
            return null;
        }

        this.sessionId = data.id;
        return data.id;
    }

    static async trackPageView(path: string, category?: string) {
        const sId = await this.initializeSession();
        if (!sId) return;

        await supabase.from('analytics_page_views').insert({
            session_id: sId,
            page_path: path,
            category,
        });

        // Update session last activity
        await supabase
            .from('analytics_sessions')
            .update({ last_activity: new Date().toISOString() })
            .eq('id', sId);
    }

    static async trackEvent(name: string, data?: Record<string, any>) {
        const sId = await this.initializeSession();
        if (!sId) return;

        await supabase.from('analytics_events').insert({
            session_id: sId,
            event_name: name,
            event_data: data,
        });
    }

    private static getDeviceType(ua: string) {
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
        if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) return 'mobile';
        return 'desktop';
    }

    private static getBrowserInfo(ua: string) {
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Chrome')) return 'Chrome';
        if (ua.includes('Safari')) return 'Safari';
        if (ua.includes('Edge')) return 'Edge';
        return 'Other';
    }

    private static getOSInfo(ua: string) {
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac OS')) return 'Mac OS';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS')) return 'iOS';
        if (ua.includes('Linux')) return 'Linux';
        return 'Other';
    }
}
