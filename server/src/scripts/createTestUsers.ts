import { supabase } from '../lib/supabase';
import { randomUUID } from 'crypto';

async function createTestUsers() {
    try {
        console.log('Creating test users in auth.users table...\n');

        // Note: We can't directly insert into auth.users without Supabase Auth
        // Instead, we'll modify exam_sessions to not require the foreign key
        // Or we can use the user_profiles table

        // For now, let's just create user_profiles entries
        const testUsers = [
            {
                user_id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
                face_photo: null,
            },
            {
                user_id: 'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e',
                face_photo: null,
            },
            {
                user_id: 'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f',
                face_photo: null,
            },
        ];

        const { data, error } = await supabase
            .from('user_profiles')
            .upsert(testUsers)
            .select();

        if (error) throw error;

        console.log(`✅ Created ${data.length} user profiles`);
        console.log('User IDs:', data.map(u => u.user_id).join(', '));

        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

createTestUsers();
