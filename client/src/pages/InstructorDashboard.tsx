import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionApi, type Session } from '../services/api';
import { CredibilityBadge } from '../components/CredibilityBadge';
import { SessionDetailModal } from '../components/SessionDetailModal';
import { Loader2, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';

export const InstructorDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<keyof Session>('started_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                setLoading(true);
                const data = await sessionApi.getAll();
                setSessions(data);
            } catch (err) {
                console.error('Error fetching sessions:', err);
                setError('Failed to load exam sessions. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    const sortedSessions = [...sessions].sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];

        if (typeof aVal === 'string' && typeof bVal === 'string') {
            return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }

        if (typeof aVal === 'number' && typeof bVal === 'number') {
            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        }

        return 0;
    });

    const handleSort = (column: keyof Session) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('desc');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getStatusIcon = (status: string) => {
        if (status === 'completed') {
            return <CheckCircle className="w-4 h-4 text-green-600" />;
        }
        return <Clock className="w-4 h-4 text-blue-600" />;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
                            <p className="text-gray-500 mt-1">Monitor exam sessions and student integrity</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/exam-management')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                            >
                                Manage Exams
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                            >
                                ← Back to Student View
                            </button>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Total Sessions</div>
                        <div className="text-3xl font-bold text-gray-900">{sessions.length}</div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Completed</div>
                        <div className="text-3xl font-bold text-green-600">
                            {sessions.filter(s => s.status === 'completed').length}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">In Progress</div>
                        <div className="text-3xl font-bold text-blue-600">
                            {sessions.filter(s => s.status === 'in_progress').length}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">Avg. Credibility</div>
                        <div className="text-3xl font-bold text-gray-900">
                            {sessions.length > 0
                                ? Math.round(sessions.reduce((sum, s) => sum + s.credibility_score, 0) / sessions.length)
                                : 0}%
                        </div>
                    </div>
                </div>

                {/* Sessions Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900">Exam Sessions</h2>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <span className="ml-3 text-gray-600">Loading sessions...</span>
                        </div>
                    ) : error ? (
                        <div className="p-6">
                            <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 mt-0.5" />
                                <div>
                                    <p className="font-medium">Error Loading Sessions</p>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <XCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No exam sessions found.</p>
                            <p className="text-sm mt-1">Sessions will appear here once students start taking exams.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('user_id')}
                                        >
                                            Student ID {sortBy === 'user_id' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('exam_title')}
                                        >
                                            Exam {sortBy === 'exam_title' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('started_at')}
                                        >
                                            Started {sortBy === 'started_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('violation_count')}
                                        >
                                            Violations {sortBy === 'violation_count' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('credibility_score')}
                                        >
                                            Credibility {sortBy === 'credibility_score' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedSessions.map((session) => (
                                        <tr
                                            key={session.id}
                                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => setSelectedSessionId(session.id)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {session.user_id.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {session.exam_title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(session.started_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(session.status)}
                                                    <span className="text-sm text-gray-700 capitalize">{session.status.replace('_', ' ')}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`text-sm font-medium ${session.violation_count > 5 ? 'text-red-600' :
                                                    session.violation_count > 2 ? 'text-yellow-600' :
                                                        'text-green-600'
                                                    }`}>
                                                    {session.violation_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <CredibilityBadge score={session.credibility_score} size="small" showLabel={false} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Session Detail Modal */}
            {selectedSessionId && (
                <SessionDetailModal
                    sessionId={selectedSessionId}
                    onClose={() => setSelectedSessionId(null)}
                />
            )}
        </div>
    );
};
