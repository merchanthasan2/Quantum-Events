import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { DataSyncService } from './services/data-sync';

async function run() {
    console.log('--- Quantum Events Data Sync Runner ---');
    const sync = new DataSyncService();
    await sync.syncAll();
}

run().catch(console.error);
