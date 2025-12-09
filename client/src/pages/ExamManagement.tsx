import React, { useState, useEffect } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { examApi, examManagementApi, type Exam } from '../services/api';
import { Plus, Edit, Trash2, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { CreateExamModal } from '../components/CreateExamModal';
import { EditExamModal } from '../components/EditExamModal';
import { InstructorSidebar } from '../components/InstructorSidebar';

export const ExamManagement: React.FC = () => {

    const { user } = useAuth();
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingExam, setEditingExam] = useState<Exam | null>(null);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const data = await examApi.getAll();
            setExams(data);
        } catch (err) {
            console.error('Error fetching exams:', err);
            setError('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
            return;
        }

        try {
            await examManagementApi.delete(id);
            setExams(exams.filter(e => e.id !== id));
        } catch (err) {
            console.error('Error deleting exam:', err);
            alert('Failed to delete exam');
        }
    };



    // Get user role for sidebar
    const [currentUserRole, setCurrentUserRole] = useState<string>('');
    useEffect(() => {
        const checkRole = async () => {
            const demoUser = localStorage.getItem('demo_user');
            if (demoUser) {
                const parsed = JSON.parse(demoUser);
                setCurrentUserRole(parsed.role);
                return;
            }
            if (user) {
                // Fetch role logic here or assume instructor
                setCurrentUserRole('instructor');
            }
        };
        checkRole();
    }, [user]);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <InstructorSidebar userRole={currentUserRole} />

            <div className="flex-1 p-8 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <BookOpen className="w-8 h-8 text-blue-600" />
                                Exam Management
                            </h1>
                            <p className="text-gray-500 mt-1">Create and manage exams for your students</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Create New Exam
                        </button>
                    </div>

                    {/* Exams List */}
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
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No exams yet</h3>
                            <p className="text-gray-500 mb-6">Get started by creating your first exam</p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                Create Exam
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {exams.map((exam) => (
                                <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">{exam.title}</h3>
                                            <p className="text-sm text-gray-500">{exam.duration_minutes} minutes</p>
                                        </div>
                                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                            Active
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4">
                                        {exam.questions.length} question{exam.questions.length !== 1 ? 's' : ''}
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingExam(exam)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(exam.id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showCreateModal && (
                <CreateExamModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        fetchExams();
                    }}
                />
            )}

            {editingExam && (
                <EditExamModal
                    exam={editingExam}
                    onClose={() => setEditingExam(null)}
                    onSuccess={() => {
                        setEditingExam(null);
                        fetchExams();
                    }}
                />
            )}
        </div>
    );
};
