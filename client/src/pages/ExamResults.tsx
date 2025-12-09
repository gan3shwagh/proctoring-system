import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext'; // Removed unused import
import { sessionApi, examApi, violationApi } from '../services/api';
import { CheckCircle, XCircle, AlertTriangle, Trophy, Home, Loader2 } from 'lucide-react';

export const ExamResults: React.FC = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    // const { user } = useAuth(); // Removed unused user
    const [session, setSession] = useState<any>(null);
    const [exam, setExam] = useState<any>(null);
    const [violations, setViolations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            if (!sessionId) return;

            try {
                const sessionData = await sessionApi.getById(sessionId);
                setSession(sessionData);

                // Fetch exam details
                try {
                    const examData = await examApi.getById((sessionData as any).exam_id);
                    setExam(examData);
                } catch (err) {
                    console.error('Error fetching exam:', err);
                }

                // Fetch violations
                try {
                    const violationsData = await violationApi.getBySession(sessionId);
                    setViolations(violationsData);
                } catch (err) {
                    console.error('Error fetching violations:', err);
                    setViolations([]);
                }
            } catch (err) {
                console.error('Error fetching results:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [sessionId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!session || !exam) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Results not found</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const score = session.score || 0;
    const isPassing = score >= 60;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Score Card */}
                <div className={`bg-gradient-to-r ${isPassing ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-xl shadow-lg p-8 text-white mb-8`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{exam.title}</h1>
                            <p className="text-white/90">Exam Completed</p>
                        </div>
                        <div className="text-center">
                            <Trophy className="w-16 h-16 mx-auto mb-2" />
                            <div className="text-5xl font-bold">{score}%</div>
                            <p className="text-sm mt-1">{isPassing ? 'Passed' : 'Failed'}</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <div className="text-2xl font-bold text-gray-900">{session.total_questions}</div>
                        <div className="text-sm text-gray-500">Total Questions</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {Math.round((score / 100) * session.total_questions)}
                        </div>
                        <div className="text-sm text-gray-500">Correct</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{violations.length}</div>
                        <div className="text-sm text-gray-500">Violations</div>
                    </div>
                </div>

                {/* Answers Review */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Answer Review</h2>
                    <div className="space-y-4">
                        {exam.questions.map((q: any, index: number) => {
                            const userAnswer = session.answers?.[index];
                            const isCorrect = userAnswer === q.correctAnswer;

                            return (
                                <div key={index} className={`border-l-4 ${isCorrect ? 'border-green-500' : 'border-red-500'} pl-4 py-2`}>
                                    <div className="flex items-start gap-3">
                                        {isCorrect ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600 mt-1" />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 mb-2">
                                                {index + 1}. {q.question}
                                            </p>
                                            <div className="space-y-1 text-sm">
                                                <p className={userAnswer === q.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}>
                                                    Your answer: {q.options[userAnswer] || 'Not answered'}
                                                </p>
                                                {!isCorrect && (
                                                    <p className="text-green-600 font-medium">
                                                        Correct answer: {q.options[q.correctAnswer]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Violations */}
                {violations.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                            Violations Detected
                        </h2>
                        <div className="space-y-2">
                            {violations.map((v, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${v.severity === 'critical' ? 'bg-red-600 text-white' :
                                        v.severity === 'high' ? 'bg-orange-600 text-white' :
                                            'bg-yellow-600 text-white'
                                        }`}>
                                        {v.severity}
                                    </span>
                                    <span className="text-sm text-gray-700">{v.type}</span>
                                    <span className="text-xs text-gray-500 ml-auto">
                                        {new Date(v.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                        <Home className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};
