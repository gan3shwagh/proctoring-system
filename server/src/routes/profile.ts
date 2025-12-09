import express from 'express';
import { supabase } from '../lib/supabase';

const router = express.Router();

// Get user profile with institute and branch details
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select(`
                *,
                institutes (
                    id,
                    name,
                    code,
                    address
                ),
                branches (
                    id,
                    name
                )
            `)
            .eq('user_id', userId)
            .single();

        if (error) throw error;

        res.json(profile);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update user profile
router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { name } = req.body;

        // Only allow updating certain fields
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;

        const { data, error } = await supabase
            .from('user_profiles')
            .update(updateData)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get user statistics
router.get('/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get total exams taken
        const { data: sessions, error: sessionsError } = await supabase
            .from('exam_sessions')
            .select('id, score, status')
            .eq('user_id', userId)
            .eq('status', 'completed');

        if (sessionsError) throw sessionsError;

        const totalExams = sessions?.length || 0;
        const scores = sessions?.map(s => s.score).filter(s => s !== null) || [];
        const averageScore = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : 0;

        // Get total violations
        const { data: violations, error: violationsError } = await supabase
            .from('violations')
            .select('id, session_id')
            .in('session_id', sessions?.map(s => s.id) || []);

        if (violationsError) throw violationsError;

        const totalViolations = violations?.length || 0;

        res.json({
            totalExams,
            averageScore,
            totalViolations,
            examsCompleted: totalExams,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
