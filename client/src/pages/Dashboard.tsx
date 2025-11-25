import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Loader2, LogOut, Shield } from 'lucide-react';
import { examApi, type Exam } from '../services/api';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [userProfile, setUserProfile] = useState<{ name: string; face_photo: string | null; role?: string } | null>(null);
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch user profile and exams on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch user profile
                if (user) {
                    const { data: profile } = await supabase
                        .from('user_profiles')
                        .select('name, face_photo, role')
                        .eq('user_id', user.id)
                        .single();

                    setUserProfile(profile);
                }

                // Fetch exams
                const data = await examApi.getAll();
                setExams(data);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const isInstructor = userProfile?.role === 'instructor' || userProfile?.role === 'admin';

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <nav className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900">ProctorAI</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {isInstructor && (
                            <a
                                href="/instructor"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                            >
                                Instructor Dashboard
                            </a>
                        )}
                        <span className="text-sm text-gray-600">
                            {userProfile?.name || user?.email}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
                    </div>

                    {/* User Profile Section */}
                    {userProfile?.face_photo && (
                        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                            <h2 className="text-xl font-semibold mb-4">Identity Verification</h2>
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <img
                                        src={userProfile.face_photo}
                                        alt="Profile"
                                        className="w-32 h-32 object-cover rounded-lg border-2 border-green-500"
                                    />
                                    <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full">
                                        <CheckCircle className="w-4 h-4" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-green-600 font-semibold text-lg mb-1">Identity Verified</p>
                                    <p className="text-gray-500 text-sm">Your face is registered. You can now proceed to exams.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <h2 className="text-xl font-semibold mb-4">Available Exams</h2>

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
                        <div className="bg-gray-50 text-gray-600 p-8 rounded-lg text-center">
                            <p>No exams available at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            {exams.map((exam) => (
                                <div key={exam.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                                            <p className="text-gray-500 text-sm">Duration: {exam.duration_minutes} mins</p>
                                        </div>
                                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Active</span>
                                    </div>
                                    <p className="text-gray-600 mb-6 text-sm">
                                        {exam.questions.length} questions • Comprehensive assessment
                                    </p>
                                    <button
                                        onClick={() => navigate(`/exam/${exam.id}`)}
                                        className="w-full py-2 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        Start Exam
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
