import { NextResponse } from 'next/server';
import { DataSyncService } from '@/services/data-sync';
import { supabase } from '@/lib/supabase';

export async function POST() {
    try {
        // 1. Verify Admin Auth
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Hardcoded admin check matching the frontend
        if (user.email !== 'happy143@gmail.com') {
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (!profile?.is_admin) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        // 2. Trigger Sync
        console.log('API: Starting Data Sync...');
        const syncService = new DataSyncService();

        // We run this in the background to not block the response
        // In a real production app, this would be a queued job or Edge Function
        syncService.syncAll().catch(err => {
            console.error('Background Sync Error:', err);
        });

        return NextResponse.json({
            message: 'Sync started in the background. Events will appear in the dashboard shortly.',
            status: 'processing'
        });

    } catch (error: any) {
        console.error('Sync API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
