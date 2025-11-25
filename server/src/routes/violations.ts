import express from 'express';
import { supabase } from '../lib/supabase';

const router = express.Router();

// Log a violation
router.post('/', async (req, res) => {
    try {
        const violation = req.body;

        // Try to insert into database, but don't fail if it doesn't work
        try {
            const { data, error } = await supabase
                .from('violations')
                .insert(violation)
                .select()
                .single();

            if (error) {
                console.log('Violation logged (console only):', violation.type, violation.severity);
                // Return mock data so the exam continues
                return res.json({
                    id: `mock-violation-${Date.now()}`,
                    ...violation,
                    timestamp: new Date().toISOString()
                });
            }

            res.json(data);
        } catch (dbError: any) {
            console.log('Violation logged (console only):', violation.type, violation.severity);
            // Return mock data so the exam continues
            res.json({
                id: `mock-violation-${Date.now()}`,
                ...violation,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get violations for a session
router.get('/:sessionId', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('violations')
            .select('*')
            .eq('session_id', req.params.sessionId)
            .order('timestamp', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
