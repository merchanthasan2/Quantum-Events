require('dotenv').config({ path: '.env.local' });
const { DataSyncService } = require('./dist/services/data-sync');

// Note: This script assumes you have compiled your TS to JS 
// or you use ts-node to run directly.
// For the environment context, I'll provide a command to run it.

async function run() {
    console.log('--- Quantum Events Data Sync Runner ---');
    const sync = new DataSyncService();
    await sync.syncAll();
}

run().catch(console.error);
