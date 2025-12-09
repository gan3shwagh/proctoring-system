import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { examApi, type Exam } from '../services/api';
import { Calendar, Clock, Users, BookOpen, Loader2, AlertCircle } from 'lucide-react';

export const UpcomingExams: React.FC = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const data = await examApi.getAll();
            setExams(data);
        } catch (err) {
            console.error('Error fetching exams:', err);
            setError('Failed to load upcoming exams');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDaysUntil = (dateString: string) => {
        const examDate = new Date(dateString);
        const today = new Date();
        const diffTime = examDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Upcoming Exams</h1>
                                <p className="text-gray-500 mt-1">View and prepare for your scheduled examinations</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                <span className="ml-3 text-gray-600">Loading exams...</span>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 mt-0.5" />
                                <div>
                                    <p className="font-medium">Error Loading Exams</p>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        ) : exams.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Exams</h3>
                                <p className="text-gray-500">You don't have any scheduled exams at the moment.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {exams.map((exam) => {
                                    const daysUntil = getDaysUntil(exam.created_at);
                                    const isSoon = daysUntil <= 7 && daysUntil >= 0;

                                    return (
                                        <div
                                            key={exam.id}
                                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-bold text-gray-900">{exam.title}</h3>
                                                        {isSoon && (
                                                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded">
                                                                Soon
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-600 mb-4">{exam.description || 'Comprehensive assessment'}</p>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            <span>{formatDate(exam.created_at)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Clock className="w-4 h-4 text-gray-400" />
                                                            <span>{exam.duration_minutes} minutes</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <BookOpen className="w-4 h-4 text-gray-400" />
                                                            <span>{exam.questions.length} questions</span>
                                                        </div>
                                                    </div>

                                                    {daysUntil >= 0 && (
                                                        <div className="mb-4">
                                                            <div className="text-sm text-gray-600 mb-1">
                                                                {daysUntil === 0 
                                                                    ? 'Exam is today!' 
                                                                    : daysUntil === 1 
                                                                    ? 'Exam is tomorrow'
                                                                    : `${daysUntil} days remaining`
                                                                }
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all ${
                                                                        daysUntil <= 3 ? 'bg-red-500' :
                                                                        daysUntil <= 7 ? 'bg-orange-500' :
                                                                        'bg-blue-500'
                                                                    }`}
                                                                    style={{ width: `${Math.min(100, (30 - daysUntil) / 30 * 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Users className="w-4 h-4" />
                                                    <span>Multiple choice format</span>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/exam/${exam.id}`)}
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                                >
                                                    Start Exam
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};



