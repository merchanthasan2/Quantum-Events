import dns from 'node:dns';
import dotenv from 'dotenv';
import path from 'path';

if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

// Load env before anything else
const envPath = path.resolve(process.cwd(), '.env.local');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

async function run() {
    console.log('🚀 Manual Sync Started');

    // Dynamic import to ensure env vars are loaded first
    const { DataSyncService } = await import('./services/data-sync');

    const syncService = new DataSyncService();
    try {
        await syncService.syncAll();
        console.log('✅ Manual Sync Finished');
    } catch (err) {
        console.error('❌ Manual Sync Failed during execution:', err);
    }
}

run().catch(err => {
    console.error('❌ Manual Sync Failed to start:', err);
    process.exit(1);
});
