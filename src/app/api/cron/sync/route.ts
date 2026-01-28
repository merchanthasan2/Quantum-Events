import { NextResponse } from 'next/server';
import { DataSyncService } from '@/services/data-sync';

// Set max duration for Serverless function to avoid timeout (if platform supports it)
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');

        // simple bearer token check
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🤖 [Cron] Starting Scheduled Data Sync...');
        const syncService = new DataSyncService();

        // In Cron, we might want to wait for it or just trigger it. 
        // Vercel/Netlify functions have timeouts. 
        // Ideally we process a subset or trigger a background job.
        // For now, we attempt to run it, but catch errors safely.

        await syncService.syncAll();

        return NextResponse.json({
            message: 'Cron Sync Completed Successfully',
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ [Cron] Sync Failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
