import express from 'express';
import { supabase } from '../lib/supabase';

const router = express.Router();

// Credibility scoring weights
const SEVERITY_WEIGHTS = {
    critical: -10,
    high: -7,
    medium: -3,
    low: -1,
};

const BASE_SCORE = 100;

// Calculate credibility score based on violations
function calculateCredibilityScore(violations: any[]): number {
    let score = BASE_SCORE;

    violations.forEach(violation => {
        const weight = SEVERITY_WEIGHTS[violation.severity as keyof typeof SEVERITY_WEIGHTS] || 0;
        score += weight;
    });

    // Clamp score between 0 and 100
    return Math.max(0, Math.min(100, score));
}

// Get all exam sessions with aggregated data
router.get('/', async (req, res) => {
    try {
        const { exam_id, status } = req.query;

        let query = supabase
            .from('exam_sessions')
            .select(`
                *,
                exams (
                    title,
                    duration_minutes
                )
            `)
            .order('started_at', { ascending: false });

        // Apply filters if provided
        if (exam_id) {
            query = query.eq('exam_id', exam_id);
        }
        if (status) {
            query = query.eq('status', status);
        }

        const { data: sessions, error: sessionsError } = await query;

        if (sessionsError) throw sessionsError;

        // For each session, get violation count and calculate credibility
        const sessionsWithStats = await Promise.all(
            sessions.map(async (session) => {
                const { data: violations, error: violationsError } = await supabase
                    .from('violations')
                    .select('type, severity, timestamp')
                    .eq('session_id', session.id)
                    .order('timestamp', { ascending: false });

                if (violationsError) {
                    console.error('Error fetching violations:', violationsError);
                    return {
                        ...session,
                        violation_count: 0,
                        credibility_score: BASE_SCORE,
                        exam_title: session.exams?.title || 'Unknown Exam',
                        latest_violation: null,
                    };
                }

                const credibilityScore = calculateCredibilityScore(violations || []);
                const latestViolation = violations && violations.length > 0 ? violations[0] : null;

                return {
                    id: session.id,
                    exam_id: session.exam_id,
                    user_id: session.user_id,
                    exam_title: session.exams?.title || 'Unknown Exam',
                    duration_minutes: session.exams?.duration_minutes || 0,
                    started_at: session.started_at,
                    submitted_at: session.submitted_at,
                    status: session.status,
                    violation_count: violations?.length || 0,
                    credibility_score: credibilityScore,
                    latest_violation: latestViolation,
                };
            })
        );

        res.json(sessionsWithStats);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get detailed session information
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get session with exam details
        const { data: session, error: sessionError } = await supabase
            .from('exam_sessions')
            .select(`
                *,
                exams (
                    title,
                    duration_minutes,
                    questions
                )
            `)
            .eq('id', id)
            .single();

        if (sessionError) throw sessionError;

        // Get all violations for this session
        const { data: violations, error: violationsError } = await supabase
            .from('violations')
            .select('*')
            .eq('session_id', id)
            .order('timestamp', { ascending: true });

        if (violationsError) throw violationsError;

        // Calculate credibility score
        const credibilityScore = calculateCredibilityScore(violations || []);

        // Group violations by severity
        const violationsBySeverity = {
            critical: violations?.filter(v => v.severity === 'critical').length || 0,
            high: violations?.filter(v => v.severity === 'high').length || 0,
            medium: violations?.filter(v => v.severity === 'medium').length || 0,
            low: violations?.filter(v => v.severity === 'low').length || 0,
        };

        res.json({
            session: {
                id: session.id,
                exam_id: session.exam_id,
                user_id: session.user_id,
                exam_title: session.exams?.title || 'Unknown Exam',
                duration_minutes: session.exams?.duration_minutes || 0,
                started_at: session.started_at,
                submitted_at: session.submitted_at,
                status: session.status,
            },
            violations: violations || [],
            credibility_score: credibilityScore,
            violations_by_severity: violationsBySeverity,
            total_violations: violations?.length || 0,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get credibility score for a session
router.get('/:id/credibility', async (req, res) => {
    try {
        const { id } = req.params;

        // Get all violations for this session
        const { data: violations, error } = await supabase
            .from('violations')
            .select('severity, type')
            .eq('session_id', id);

        if (error) throw error;

        const credibilityScore = calculateCredibilityScore(violations || []);

        // Calculate breakdown
        const breakdown = violations?.reduce((acc, v) => {
            const weight = SEVERITY_WEIGHTS[v.severity as keyof typeof SEVERITY_WEIGHTS] || 0;
            acc[v.severity] = (acc[v.severity] || 0) + weight;
            return acc;
        }, {} as Record<string, number>);

        res.json({
            score: credibilityScore,
            base_score: BASE_SCORE,
            total_violations: violations?.length || 0,
            breakdown,
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Submit exam answers and calculate score
router.post('/:id/submit', async (req, res) => {
    try {
        const { id } = req.params;
        const { answers } = req.body;

        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'Invalid answers format' });
        }

        // Get the exam session with exam details
        const { data: session, error: sessionError } = await supabase
            .from('exam_sessions')
            .select('*, exams(*)')
            .eq('id', id)
            .single();

        if (sessionError || !session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Calculate score
        const exam = session.exams;
        const questions = exam.questions;
        let correctAnswers = 0;

        answers.forEach((answer: number, index: number) => {
            if (questions[index] && questions[index].correctAnswer === answer) {
                correctAnswers++;
            }
        });

        const score = Math.round((correctAnswers / questions.length) * 100);

        // Update session with answers and score
        const { data: updatedSession, error: updateError } = await supabase
            .from('exam_sessions')
            .update({
                answers,
                score,
                total_questions: questions.length,
                status: 'completed',
                ended_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) throw updateError;

        res.json({
            ...updatedSession,
            correctAnswers,
            totalQuestions: questions.length,
        });
    } catch (error) {
        console.error('Error submitting exam:', error);
        res.status(500).json({ error: 'Failed to submit exam' });
    }
});

// Get student's exam history
router.get('/my-history', async (req, res) => {
    try {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({ error: 'user_id is required' });
        }

        const { data: sessions, error } = await supabase
            .from('exam_sessions')
            .select(`
                *,
                exams (
                    title,
                    duration_minutes
                )
            `)
            .eq('user_id', user_id)
            .eq('status', 'completed')
            .order('started_at', { ascending: false });

        if (error) throw error;

        // Get violations count for each session
        const sessionsWithViolations = await Promise.all(
            sessions.map(async (session) => {
                const { data: violations } = await supabase
                    .from('violations')
                    .select('severity')
                    .eq('session_id', session.id);

                const credibilityScore = calculateCredibilityScore(violations || []);

                return {
                    ...session,
                    violations_count: violations?.length || 0,
                    credibility_score: credibilityScore,
                };
            })
        );

        res.json(sessionsWithViolations);
    } catch (error) {
        console.error('Error fetching exam history:', error);
        res.status(500).json({ error: 'Failed to fetch exam history' });
    }
});

export default router;
