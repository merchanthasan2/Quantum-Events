const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function setAdmin() {
    console.log('🚀 Attempting to set admin roles...');

    // Fetch all profiles
    const { data: profiles, error } = await supabase.from('profiles').select('*');

    if (error) {
        console.error('Error fetching profiles:', error);
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.log('⚠️ No profiles found in the database. Please sign up on the site first!');
        return;
    }

    console.log(`Found ${profiles.length} profiles. Granting admin access to all for development...`);

    for (const profile of profiles) {
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', profile.id);

        if (updateError) {
            console.error(`Failed to update ${profile.email}:`, updateError);
        } else {
            console.log(`✅ ${profile.email} is now an Admin.`);
        }
    }
}

setAdmin();
