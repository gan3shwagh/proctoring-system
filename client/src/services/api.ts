import { supabase } from '../lib/supabase';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface Exam {
    id: string;
    title: string;
    description: string;
    duration_minutes: number;
    questions: any[];
    created_at: string;
}

export interface ExamSession {
    id: string;
    exam_id: string;
    user_id: string;
    started_at: string;
    submitted_at?: string;
    status: 'in_progress' | 'completed';
}

export interface Violation {
    id: string;
    session_id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: string;
    snapshot?: string;
    metadata?: any;
}

// Exam APIs
export const examApi = {
    // Get all exams
    async getAll(): Promise<Exam[]> {
        const response = await fetch(`${API_BASE_URL}/exams`);
        if (!response.ok) {
            throw new Error('Failed to fetch exams');
        }
        return response.json();
    },

    // Get exam by ID
    async getById(id: string): Promise<Exam> {
        const response = await fetch(`${API_BASE_URL}/exams/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch exam');
        }
        return response.json();
    },

    // Start exam session
    async startSession(examId: string, userId: string): Promise<ExamSession> {
        const response = await fetch(`${API_BASE_URL}/exams/${examId}/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId }),
        });
        if (!response.ok) {
            throw new Error('Failed to start exam session');
        }
        return response.json();
    },

    // Submit exam session
    async submitSession(examId: string, sessionId: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/exams/${examId}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ session_id: sessionId }),
        });
        if (!response.ok) {
            throw new Error('Failed to submit exam');
        }
    },
};

// Violation APIs
export const violationApi = {
    // Log a violation
    async log(violation: Omit<Violation, 'id' | 'timestamp'>): Promise<Violation> {
        const response = await fetch(`${API_BASE_URL}/violations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(violation),
        });
        if (!response.ok) {
            throw new Error('Failed to log violation');
        }
        return response.json();
    },

    // Get violations for a session
    async getBySession(sessionId: string): Promise<Violation[]> {
        const response = await fetch(`${API_BASE_URL}/violations/${sessionId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch violations');
        }
        return response.json();
    },
};

// User Profile APIs (using Supabase directly)
export const userApi = {
    // Save user face photo
    async saveFacePhoto(userId: string, photoBase64: string): Promise<void> {
        const { error } = await supabase
            .from('user_profiles')
            .upsert({
                user_id: userId,
                face_photo: photoBase64,
                updated_at: new Date().toISOString(),
            });

        if (error) {
            throw new Error('Failed to save face photo');
        }
    },

    // Get user face photo
    async getFacePhoto(userId: string): Promise<string | null> {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('face_photo')
            .eq('user_id', userId)
            .single();

        if (error) {
            return null;
        }

        return data?.face_photo || null;
    },
};

// Session interfaces for Instructor Dashboard
export interface Session {
    id: string;
    exam_id: string;
    user_id: string;
    exam_title: string;
    duration_minutes: number;
    started_at: string;
    submitted_at?: string;
    status: 'in_progress' | 'completed';
    violation_count: number;
    credibility_score: number;
    latest_violation?: {
        type: string;
        severity: string;
        timestamp: string;
    } | null;
}

export interface SessionDetail {
    session: {
        id: string;
        exam_id: string;
        user_id: string;
        exam_title: string;
        duration_minutes: number;
        started_at: string;
        submitted_at?: string;
        status: 'in_progress' | 'completed';
    };
    violations: Violation[];
    credibility_score: number;
    violations_by_severity: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    total_violations: number;
}

export interface CredibilityScore {
    score: number;
    base_score: number;
    total_violations: number;
    breakdown: Record<string, number>;
}

// Session APIs for Instructor Dashboard
export const sessionApi = {
    // Get all sessions
    async getAll(filters?: { exam_id?: string; status?: string }): Promise<Session[]> {
        const params = new URLSearchParams();
        if (filters?.exam_id) params.append('exam_id', filters.exam_id);
        if (filters?.status) params.append('status', filters.status);

        const url = `${API_BASE_URL}/sessions${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch sessions');
        }
        return response.json();
    },

    // Get session detail
    async getById(id: string): Promise<SessionDetail> {
        const response = await fetch(`${API_BASE_URL}/sessions/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch session detail');
        }
        return response.json();
    },

    // Get credibility score
    async getCredibility(id: string): Promise<CredibilityScore> {
        const response = await fetch(`${API_BASE_URL}/sessions/${id}/credibility`);
        if (!response.ok) {
            throw new Error('Failed to fetch credibility score');
        }
        return response.json();
    },
};

// Add this to the end of /home/ganesh/Desktop/proctoring-system/client/src/services/api.ts

// Exam Management APIs (for instructors)
export const examManagementApi = {
    // Create new exam
    async create(examData: { title: string; duration_minutes: number; questions: any[] }): Promise<Exam> {
        const response = await fetch(`${API_BASE_URL}/exam-management`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(examData),
        });
        if (!response.ok) {
            throw new Error('Failed to create exam');
        }
        return response.json();
    },

    // Update exam
    async update(id: string, examData: Partial<{ title: string; duration_minutes: number; questions: any[] }>): Promise<Exam> {
        const response = await fetch(`${API_BASE_URL}/exam-management/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(examData),
        });
        if (!response.ok) {
            throw new Error('Failed to update exam');
        }
        return response.json();
    },

    // Delete exam
    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/exam-management/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error('Failed to delete exam');
        }
    },
};

// Submit exam answers
export const submitExam = async (sessionId: string, answers: number[]): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
    });
    if (!response.ok) {
        throw new Error('Failed to submit exam');
    }
    return response.json();
};

// Get student exam history
export const getMyExamHistory = async (userId: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/sessions/my-history?user_id=${userId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch exam history');
    }
    return response.json();
};
