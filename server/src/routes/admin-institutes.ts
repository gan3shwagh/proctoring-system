import express from 'express';
import { supabase } from '../lib/supabase';

const router = express.Router();

// Create new institute
router.post('/institutes', async (req, res) => {
    try {
        const { name, address, code } = req.body;

        if (!name || !code) {
            return res.status(400).json({ error: 'Name and code are required' });
        }

        const { data, error } = await supabase
            .from('institutes')
            .insert({ name, address, code })
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique violation
                return res.status(400).json({ error: 'Institute code already exists' });
            }
            throw error;
        }

        res.status(201).json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Update institute
router.put('/institutes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, code } = req.body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (address !== undefined) updateData.address = address;
        if (code !== undefined) updateData.code = code;

        const { data, error } = await supabase
            .from('institutes')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete institute
router.delete('/institutes/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('institutes')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Institute deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Add branch to institute
router.post('/institutes/:id/branches', async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Branch name is required' });
        }

        const { data, error } = await supabase
            .from('branches')
            .insert({ institute_id: id, name })
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Delete branch
router.delete('/branches/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('branches')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Branch deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get institute statistics
router.get('/stats', async (req, res) => {
    try {
        // Get total institutes
        const { data: institutes, error: institutesError } = await supabase
            .from('institutes')
            .select('id');

        if (institutesError) throw institutesError;

        // Get total branches
        const { data: branches, error: branchesError } = await supabase
            .from('branches')
            .select('id');

        if (branchesError) throw branchesError;

        res.json({
            totalInstitutes: institutes?.length || 0,
            totalBranches: branches?.length || 0,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
