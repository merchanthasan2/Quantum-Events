const dotenv = require('dotenv');
const path = require('path');

// Load env before anything else
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const { DataSyncService } = require('./services/data-sync');

async function run() {
    console.log('🚀 Manual Sync Started');
    const syncService = new DataSyncService();
    try {
        // To save time, we can modify DataSyncService to only sync one city if we wanted,
        // but let's run the whole thing to see the API in action.
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
