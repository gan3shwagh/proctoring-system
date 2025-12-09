import express from 'express';
import { supabase } from '../lib/supabase';

const router = express.Router();

// Get all institutes
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('institutes')
            .select('*')
            .order('name');

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get institute by ID
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('institutes')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(404).json({ error: 'Institute not found' });
    }
});

// Get branches for an institute
router.get('/:id/branches', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('branches')
            .select('*')
            .eq('institute_id', req.params.id)
            .order('name');

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get users (students/teachers) for an institute
router.get('/:id/users', async (req, res) => {
    try {
        const { role } = req.query;
        let query = supabase
            .from('user_profiles')
            .select('*')
            .eq('institute_id', req.params.id);

        if (role) {
            query = query.eq('role', role);
        }

        const { data, error } = await query;

        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
