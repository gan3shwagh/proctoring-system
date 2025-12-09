import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CheckCircle, AlertCircle, Loader2, LogOut, Shield, Target, Award, TrendingUp, Clock, Megaphone, Laptop, Monitor, Mic, Wifi } from 'lucide-react';
import { examApi, type Exam, API_BASE_URL } from '../services/api';
import { Sidebar } from '../components/Sidebar';
import { StatCard } from '../components/StatCard';
import { ThemeToggle } from '../components/ThemeToggle';

type StudentExam = Exam & {
    scheduled_for?: string; // optional field if backend supports it
    subject?: string;
    status?: 'upcoming' | 'completed' | 'flagged' | 'in_progress';
};

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [userProfile, setUserProfile] = useState<{ name: string; face_photo: string | null; role?: string } | null>(null);
    const [exams, setExams] = useState<StudentExam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<{ totalExams: number; averageScore: number; totalViolations: number } | null>(null);
    const [announcements] = useState([
        { id: '1', title: 'Complete your system check before exam day', time: 'Today' },
        { id: '2', title: 'Use Chrome/Edge for the best experience', time: 'This week' }
    ]);

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

                    // Fetch user stats
                    const statsResponse = await fetch(`${API_BASE_URL}/profile/${user.id}/stats`);
                    const statsData = await statsResponse.json();
                    setStats(statsData);
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

    const now = new Date();

    const decorateExam = (exam: StudentExam) => {
        const scheduledFor = exam.scheduled_for || exam.created_at;
        const startTime = new Date(scheduledFor);
        const isUpcoming = startTime.getTime() >= now.getTime();
        const status: StudentExam['status'] = isUpcoming ? 'upcoming' : 'completed';
        return { ...exam, scheduled_for: scheduledFor, status, startTime };
    };

    const decorated = exams.map(decorateExam);
    const upcomingExams = decorated
        .filter((e) => e.status === 'upcoming')
        .sort((a, b) => new Date(a.scheduled_for || a.created_at).getTime() - new Date(b.scheduled_for || b.created_at).getTime());
    const pastExams = decorated
        .filter((e) => e.status === 'completed')
        .sort((a, b) => new Date(b.scheduled_for || b.created_at).getTime() - new Date(a.scheduled_for || a.created_at).getTime());

    const nextExam = upcomingExams[0];

    const getCountdown = (dateString?: string) => {
        if (!dateString) return null;
        const target = new Date(dateString).getTime();
        const diffMs = target - now.getTime();
        if (diffMs <= 0) return 'Starting soon';
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const canStart = (exam: StudentExam) => {
        const startTime = new Date(exam.scheduled_for || exam.created_at).getTime();
        const minutesUntil = (startTime - now.getTime()) / (1000 * 60);
        return minutesUntil <= 30; // active 30 mins before
    };

    const systemChecks = [
        { id: 'cam', label: 'Webcam', icon: Laptop, status: 'ok' },
        { id: 'mic', label: 'Microphone', icon: Mic, status: 'ok' },
        { id: 'net', label: 'Internet', icon: Wifi, status: 'ok' },
        { id: 'screen', label: 'Screen Recording', icon: Monitor, status: 'ok' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                {/* Header */}
                <nav className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Shield className="w-8 h-8 text-blue-600" />
                            <span className="text-xl font-bold text-gray-900">ProctorAI</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <ThemeToggle />
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
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                            {nextExam && (
                                <div className="flex items-center gap-3 bg-blue-50 text-blue-800 px-4 py-3 rounded-xl border border-blue-100">
                                    <Clock className="w-5 h-5" />
                                    <div>
                                        <p className="text-sm font-semibold">Next exam</p>
                                        <p className="text-sm">
                                            {nextExam.title} • {getCountdown(nextExam.scheduled_for) || 'Starting soon'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Stats Cards */}
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <StatCard
                                    title="Total Exams"
                                    value={stats.totalExams}
                                    icon={Target}
                                    iconColor="text-blue-600"
                                    iconBgColor="bg-blue-100"
                                />
                                <StatCard
                                    title="Average Score"
                                    value={`${stats.averageScore}%`}
                                    icon={Award}
                                    iconColor="text-green-600"
                                    iconBgColor="bg-green-100"
                                />
                                <StatCard
                                    title="Credibility"
                                    value="High"
                                    icon={TrendingUp}
                                    iconColor="text-purple-600"
                                    iconBgColor="bg-purple-100"
                                />
                            </div>
                        )}

                        {/* System Check & Announcements */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                                <div className="flex items-center gap-3 mb-4">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">System Check</h2>
                                    <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">All good</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {systemChecks.map((check) => {
                                        const Icon = check.icon;
                                        return (
                                            <div key={check.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                                                <Icon className="w-4 h-4 text-green-600" />
                                                <span className="text-sm text-gray-700">{check.label}</span>
                                                <span className="ml-auto text-xs text-green-600 font-semibold">✓</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <Megaphone className="w-5 h-5 text-blue-600" />
                                    <h2 className="text-lg font-semibold text-gray-900">Announcements</h2>
                                </div>
                                <div className="space-y-3">
                                    {announcements.map((note) => (
                                        <div key={note.id} className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                                            <p className="text-sm font-semibold text-gray-900">{note.title}</p>
                                            <p className="text-xs text-blue-700 mt-1">{note.time}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
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

                        {/* Upcoming Exams */}
                        <div className="mb-10">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Upcoming Exams</h2>
                                {nextExam && (
                                    <span className="text-sm text-gray-500">
                                        Starts {new Date(nextExam.scheduled_for || nextExam.created_at).toLocaleString()}
                                    </span>
                                )}
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
                            ) : upcomingExams.length === 0 ? (
                                <div className="bg-gray-50 text-gray-600 p-8 rounded-lg text-center">
                                    <p>No scheduled exams. Check back soon.</p>
                                </div>
                            ) : (
                                <div className="grid gap-6 md:grid-cols-2">
                                    {upcomingExams.map((exam) => {
                                        const countdown = getCountdown(exam.scheduled_for);
                                        const startable = canStart(exam);
                                        return (
                                            <div key={exam.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">{exam.title}</h3>
                                                        <p className="text-gray-500 text-sm">
                                                            {exam.subject || 'Exam'} • {exam.duration_minutes} mins
                                                        </p>
                                                    </div>
                                                    <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-0.5 rounded">
                                                        Upcoming
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 text-sm mb-4">
                                                    {exam.questions.length} questions • {countdown || 'Starting soon'}
                                                </p>
                                                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                                    <span>
                                                        Starts: {new Date(exam.scheduled_for || exam.created_at).toLocaleString()}
                                                    </span>
                                                    <span className="text-blue-600 font-semibold">
                                                        {countdown || 'Ready'}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => navigate(`/exam/${exam.id}/precheck`)}
                                                    disabled={!startable}
                                                    className={`w-full py-2 rounded-lg font-medium transition-colors ${
                                                        startable
                                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                >
                                                    {startable ? 'Start Exam' : 'Available 30 mins before start'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Past / Completed Exams */}
                        <div className="mb-12">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">Past & Completed</h2>
                                <button
                                    onClick={() => navigate('/history')}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    View full history
                                </button>
                            </div>
                            {pastExams.length === 0 ? (
                                <div className="bg-gray-50 text-gray-600 p-6 rounded-lg text-center">
                                    <p>No completed exams yet.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {pastExams.slice(0, 4).map((exam) => (
                                        <div key={exam.id} className="bg-white p-4 rounded-lg border border-gray-100 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{exam.title}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(exam.scheduled_for || exam.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-50 text-green-700">
                                                Completed
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
