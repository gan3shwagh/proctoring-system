import express from 'express';
import { supabase } from '../lib/supabase';

const router = express.Router();

// Get all users with optional filters
router.get('/', async (req, res) => {
    try {
        const { role, institute_id, branch_id, search } = req.query;

        let query = supabase
            .from('user_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        // Apply filters
        if (role) {
            query = query.eq('role', role);
        }
        if (institute_id) {
            query = query.eq('institute_id', institute_id);
        }
        if (branch_id) {
            query = query.eq('branch_id', branch_id);
        }
        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
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
            .eq('user_id', id)
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        res.status(404).json({ error: 'User not found' });
    }
});

// Update user role (admin only)
router.put('/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Validate role
        const validRoles = ['student', 'teacher', 'instructor', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const { data, error } = await supabase
            .from('user_profiles')
            .update({ role })
            .eq('user_id', id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get user statistics
router.get('/stats/overview', async (req, res) => {
    try {
        // Get total users
        const { data: allUsers, error: usersError } = await supabase
            .from('user_profiles')
            .select('user_id, role');

        if (usersError) throw usersError;

        const totalUsers = allUsers?.length || 0;
        const students = allUsers?.filter(u => u.role === 'student' || !u.role).length || 0;
        const teachers = allUsers?.filter(u => u.role === 'teacher' || u.role === 'instructor').length || 0;
        const admins = allUsers?.filter(u => u.role === 'admin').length || 0;

        res.json({
            totalUsers,
            students,
            teachers,
            admins,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
