import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { CredibilityBadge } from '../components/CredibilityBadge';
import { Calendar, Clock, Award, AlertTriangle, Loader2, Search } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

interface ExamSession {
    id: string;
    exam_title: string;
    started_at: string;
    score: number;
    total_questions: number;
    violations_count: number;
    credibility_score: number;
}

export const ExamHistory: React.FC = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<ExamSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchHistory();
    }, [user]);

    const fetchHistory = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/sessions/my-history?user_id=${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch history');
            const data = await response.json();
            setSessions(data);
        } catch (error) {
            console.error('Error fetching exam history:', error);
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredSessions = sessions.filter(session =>
        session.exam_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Exam History</h1>

                        {/* Search */}
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search exams..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Exam List */}
                        {filteredSessions.length === 0 ? (
                            <div className="bg-white p-12 rounded-xl shadow-sm text-center">
                                <p className="text-gray-600">
                                    {searchTerm ? 'No exams found matching your search.' : 'No exam history yet.'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredSessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {session.exam_title}
                                                </h3>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">
                                                            {new Date(session.started_at).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Clock className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">
                                                            {new Date(session.started_at).toLocaleTimeString()}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Award className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">
                                                            Score: {session.score}%
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm">
                                                        <AlertTriangle className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">
                                                            {session.violations_count} violations
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-600">Credibility:</span>
                                                        <CredibilityBadge score={session.credibility_score} />
                                                    </div>

                                                    <div className="h-4 w-px bg-gray-300"></div>

                                                    <div className="text-sm">
                                                        <span className="text-gray-600">
                                                            {session.total_questions} questions
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Score Badge */}
                                            <div className="ml-4">
                                                <div className={`text-center p-4 rounded-lg ${session.score >= 80 ? 'bg-green-50' :
                                                        session.score >= 60 ? 'bg-yellow-50' :
                                                            'bg-red-50'
                                                    }`}>
                                                    <div className={`text-3xl font-bold ${session.score >= 80 ? 'text-green-600' :
                                                            session.score >= 60 ? 'text-yellow-600' :
                                                                'text-red-600'
                                                        }`}>
                                                        {session.score}%
                                                    </div>
                                                    <div className="text-xs text-gray-600 mt-1">Score</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
