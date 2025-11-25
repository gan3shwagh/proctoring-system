import { supabase } from '../lib/supabase';

async function insertTestData() {
    try {
        console.log('Creating test exam sessions and violations...\n');

        // Get the existing exam ID
        const { data: exams, error: examError } = await supabase
            .from('exams')
            .select('id')
            .limit(1)
            .single();

        if (examError || !exams) {
            console.error('No exam found. Please run insertSampleData.ts first.');
            process.exit(1);
        }

        const examId = exams.id;
        console.log(`Using exam ID: ${examId}\n`);

        // Create 3 test sessions with different violation patterns
        // Using UUIDs for user_id (database expects UUID type)
        const testUserIds = [
            'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', // user-123 equivalent
            'b2c3d4e5-f6a7-4b5c-9d0e-1f2a3b4c5d6e', // user-456 equivalent
            'c3d4e5f6-a7b8-4c5d-0e1f-2a3b4c5d6e7f', // user-789 equivalent
        ];

        const sessions = [
            {
                exam_id: examId,
                user_id: testUserIds[0],
                started_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                status: 'completed',
            },
            {
                exam_id: examId,
                user_id: testUserIds[1],
                started_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
                status: 'completed',
            },
            {
                exam_id: examId,
                user_id: testUserIds[2],
                started_at: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
                status: 'in_progress',
            },
        ];

        const { data: insertedSessions, error: sessionError } = await supabase
            .from('exam_sessions')
            .insert(sessions)
            .select();

        if (sessionError) throw sessionError;

        console.log(`✅ Created ${insertedSessions.length} exam sessions\n`);

        // Create violations for each session
        const violations = [
            // Student 1: Good student (few violations, high credibility ~87)
            {
                session_id: insertedSessions[0].id,
                type: 'LOOKING_AWAY',
                severity: 'medium',
                timestamp: new Date(Date.now() - 3000000).toISOString(),
            },
            {
                session_id: insertedSessions[0].id,
                type: 'LOOKING_AWAY',
                severity: 'medium',
                timestamp: new Date(Date.now() - 2500000).toISOString(),
            },
            {
                session_id: insertedSessions[0].id,
                type: 'AUDIO_DETECTED',
                severity: 'high',
                timestamp: new Date(Date.now() - 2000000).toISOString(),
            },

            // Student 2: Suspicious activity (many violations, low credibility ~43)
            {
                session_id: insertedSessions[1].id,
                type: 'TAB_SWITCH',
                severity: 'critical',
                timestamp: new Date(Date.now() - 6500000).toISOString(),
            },
            {
                session_id: insertedSessions[1].id,
                type: 'FULLSCREEN_EXIT',
                severity: 'critical',
                timestamp: new Date(Date.now() - 6400000).toISOString(),
            },
            {
                session_id: insertedSessions[1].id,
                type: 'USER_MISMATCH',
                severity: 'critical',
                timestamp: new Date(Date.now() - 6000000).toISOString(),
            },
            {
                session_id: insertedSessions[1].id,
                type: 'MULTIPLE_FACES',
                severity: 'critical',
                timestamp: new Date(Date.now() - 5500000).toISOString(),
            },
            {
                session_id: insertedSessions[1].id,
                type: 'NO_FACE',
                severity: 'critical',
                timestamp: new Date(Date.now() - 5000000).toISOString(),
            },
            {
                session_id: insertedSessions[1].id,
                type: 'AUDIO_DETECTED',
                severity: 'high',
                timestamp: new Date(Date.now() - 4500000).toISOString(),
            },
            {
                session_id: insertedSessions[1].id,
                type: 'LOOKING_AWAY',
                severity: 'medium',
                timestamp: new Date(Date.now() - 4000000).toISOString(),
            },

            // Student 3: Moderate violations (medium credibility ~73)
            {
                session_id: insertedSessions[2].id,
                type: 'LOOKING_AWAY',
                severity: 'medium',
                timestamp: new Date(Date.now() - 1500000).toISOString(),
            },
            {
                session_id: insertedSessions[2].id,
                type: 'LOOKING_AWAY',
                severity: 'medium',
                timestamp: new Date(Date.now() - 1200000).toISOString(),
            },
            {
                session_id: insertedSessions[2].id,
                type: 'AUDIO_DETECTED',
                severity: 'high',
                timestamp: new Date(Date.now() - 900000).toISOString(),
            },
            {
                session_id: insertedSessions[2].id,
                type: 'TAB_SWITCH',
                severity: 'critical',
                timestamp: new Date(Date.now() - 600000).toISOString(),
            },
        ];

        const { data: insertedViolations, error: violationError } = await supabase
            .from('violations')
            .insert(violations)
            .select();

        if (violationError) throw violationError;

        console.log(`✅ Created ${insertedViolations.length} violations\n`);

        // Display summary
        console.log('📊 Test Data Summary:');
        console.log('─────────────────────────────────────');
        console.log(`Session 1 (user-123): 3 violations  → Expected credibility: ~87`);
        console.log(`Session 2 (user-456): 7 violations  → Expected credibility: ~43`);
        console.log(`Session 3 (user-789): 4 violations  → Expected credibility: ~73`);
        console.log('─────────────────────────────────────\n');

        console.log('✅ Test data inserted successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error inserting test data:', err);
        process.exit(1);
    }
}

insertTestData();
