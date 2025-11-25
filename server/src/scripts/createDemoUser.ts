import { supabase } from '../lib/supabase';

async function createDemoUser() {
    try {
        console.log('Creating demo user for testing...\n');

        const demoUserId = '00000000-0000-0000-0000-000000000001';

        // Try to insert into user_profiles (if that table exists and accepts this)
        // If user_profiles doesn't work, we may need to modify the schema
        const { data, error } = await supabase
            .from('user_profiles')
            .upsert({
                id: demoUserId,
                face_photo: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .select();

        if (error) {
            console.log('Note: Could not insert into user_profiles:', error.message);
            console.log('This is expected if the table structure is different.');
            console.log('\nThe real fix is to modify the database schema to remove');
            console.log('the foreign key constraint on exam_sessions.user_id\n');
        } else {
            console.log('✅ Created demo user:', demoUserId);
            console.log('Data:', data);
        }

        console.log('\n📝 Update ExamPage.tsx to use this user ID:');
        console.log(`   Change line 40 from 'user-123' to '${demoUserId}'`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

createDemoUser();
