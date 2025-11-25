import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// Create new exam
router.post('/', async (req, res) => {
    try {
        const { title, duration_minutes, questions } = req.body;

        if (!title || !duration_minutes || !questions || !Array.isArray(questions)) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('exams')
            .insert({
                title,
                duration_minutes,
                questions,
            })
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ error: 'Failed to create exam' });
    }
});

// Update exam
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, duration_minutes, questions } = req.body;

        const updateData: any = {};
        if (title) updateData.title = title;
        if (duration_minutes) updateData.duration_minutes = duration_minutes;
        if (questions) updateData.questions = questions;

        const { data, error } = await supabase
            .from('exams')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error updating exam:', error);
        res.status(500).json({ error: 'Failed to update exam' });
    }
});

// Delete exam
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('exams')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
        console.error('Error deleting exam:', error);
        res.status(500).json({ error: 'Failed to delete exam' });
    }
});

export default router;
