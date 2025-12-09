import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { TrendingUp, Award, AlertTriangle, Target, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

interface ExamSession {
    id: string;
    exam_title: string;
    started_at: string;
    score: number;
    credibility_score: number;
    violations_count: number;
}

interface Stats {
    totalExams: number;
    averageScore: number;
    totalViolations: number;
    highestScore: number;
    lowestScore: number;
    averageCredibility: number;
}

export const PerformanceAnalytics: React.FC = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<ExamSession[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        if (!user) return;

        try {
            setLoading(true);

            // Fetch exam history
            const historyResponse = await fetch(`${API_BASE_URL}/sessions/my-history?user_id=${user.id}`);
            if (!historyResponse.ok) throw new Error('Failed to fetch history');
            const historyData = await historyResponse.json();
            setSessions(historyData);

            // Calculate statistics
            if (historyData.length > 0) {
                const scores = historyData.map((s: ExamSession) => s.score);
                const credibilityScores = historyData.map((s: ExamSession) => s.credibility_score);
                const totalViolations = historyData.reduce((sum: number, s: ExamSession) => sum + s.violations_count, 0);

                setStats({
                    totalExams: historyData.length,
                    averageScore: Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length),
                    totalViolations,
                    highestScore: Math.max(...scores),
                    lowestScore: Math.min(...scores),
                    averageCredibility: Math.round(credibilityScores.reduce((a: number, b: number) => a + b, 0) / credibilityScores.length),
                });
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

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

    if (!stats || sessions.length === 0) {
        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 overflow-auto">
                    <div className="p-8">
                        <div className="max-w-6xl mx-auto">
                            <h1 className="text-3xl font-bold text-gray-900 mb-8">Performance Analytics</h1>
                            <div className="bg-white p-12 rounded-xl shadow-sm text-center">
                                <p className="text-gray-600">
                                    No exam data available yet. Complete some exams to see your analytics.
                                </p>
                            </div>
                        </div>
                    </div>
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">Performance Analytics</h1>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Exams</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalExams}</p>
                                    </div>
                                    <div className="bg-blue-100 p-3 rounded-lg">
                                        <Target className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Average Score</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                                    </div>
                                    <div className="bg-green-100 p-3 rounded-lg">
                                        <Award className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Avg Credibility</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.averageCredibility}</p>
                                    </div>
                                    <div className="bg-purple-100 p-3 rounded-lg">
                                        <TrendingUp className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Total Violations</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalViolations}</p>
                                    </div>
                                    <div className="bg-red-100 p-3 rounded-lg">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Score Range */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                            <h2 className="text-xl font-semibold mb-4">Score Range</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Highest Score</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-green-600">{stats.highestScore}%</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Lowest Score</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-red-600">{stats.lowestScore}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Performance */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-semibold mb-4">Recent Performance</h2>
                            <div className="space-y-3">
                                {sessions.slice(0, 5).map((session) => (
                                    <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{session.exam_title}</p>
                                            <p className="text-sm text-gray-600">
                                                {new Date(session.started_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Score</p>
                                                <p className={`font-bold ${session.score >= 80 ? 'text-green-600' :
                                                        session.score >= 60 ? 'text-yellow-600' :
                                                            'text-red-600'
                                                    }`}>
                                                    {session.score}%
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Credibility</p>
                                                <p className="font-bold text-gray-900">{session.credibility_score}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
