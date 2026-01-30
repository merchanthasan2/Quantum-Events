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
        const geo = await this.getGeoInfo();

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
                city: geo?.city || null,
                country: geo?.country_name || null
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

    private static async getGeoInfo() {
        try {
            const res = await fetch('https://ipapi.co/json/');
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            return null; // Silently fail for ad-blockers/network issues
        }
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
        if (ua.includes('iPhone')) return 'iPhone (iOS)';
        if (ua.includes('iPad')) return 'iPad (iOS)';
        if (ua.includes('Macintosh')) return 'Mac OS';
        if (ua.includes('Windows NT 10.0')) return 'Windows 10/11';
        if (ua.includes('Windows NT 6.1')) return 'Windows 7';
        if (ua.includes('Android')) {
            const match = ua.match(/Android\s([0-9\.]+)/);
            return match ? `Android ${match[1]}` : 'Android';
        }
        if (ua.includes('Linux')) return 'Linux';
        return 'Other';
    }
}
