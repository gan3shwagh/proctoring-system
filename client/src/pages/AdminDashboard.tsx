import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { InstructorSidebar } from '../components/InstructorSidebar';
import {
    Loader2, AlertTriangle, Clock, CheckCircle, LogOut, User,
    Activity, Shield, Users, Building2, Calendar, Bell, Server,
    Eye, FileText, BarChart3
} from 'lucide-react';
import { sessionApi, examApi } from '../services/api';

interface DashboardStats {
    totalExamsToday: number;
    totalExamsThisWeek: number;
    totalExamsThisMonth: number;
    liveExams: number;
    studentsBeingProctored: number;
    flaggedIncidentsToday: number;
    totalInstitutions: number;
    totalUsers: number;
    totalExamsConducted: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
}

interface UpcomingExam {
    id: string;
    title: string;
    scheduled_at: string;
    duration_minutes: number;
    student_count: number;
    proctoring_type: string;
}

interface FlaggedIncident {
    id: string;
    session_id: string;
    student_name: string;
    exam_title: string;
    violation_type: string;
    severity: string;
    timestamp: string;
}

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>([]);
    const [flaggedIncidents, setFlaggedIncidents] = useState<FlaggedIncident[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<string>('');

    useEffect(() => {
        const checkRole = async () => {
            const demoUser = localStorage.getItem('demo_user');
            if (demoUser) {
                const parsed = JSON.parse(demoUser);
                setUserRole(parsed.role || 'admin');
                return;
            }
            if (user) {
                const { data } = await supabase
                    .from('user_profiles')
                    .select('role')
                    .eq('user_id', user.id)
                    .single();
                if (data) setUserRole(data.role || 'admin');
            }
        };
        checkRole();
    }, [user]);

    useEffect(() => {
        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch all sessions and exams
            const [sessions, exams] = await Promise.all([
                sessionApi.getAll(),
                examApi.getAll()
            ]);

            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

            // Calculate stats
            const totalExamsToday = exams.filter(e => {
                const created = new Date(e.created_at);
                return created >= today;
            }).length;

            const totalExamsThisWeek = exams.filter(e => {
                const created = new Date(e.created_at);
                return created >= weekAgo;
            }).length;

            const totalExamsThisMonth = exams.filter(e => {
                const created = new Date(e.created_at);
                return created >= monthAgo;
            }).length;

            const liveExams = sessions.filter(s => s.status === 'in_progress').length;
            const studentsBeingProctored = liveExams;

            // Get flagged incidents (critical violations from today)
            const criticalViolations = sessions
                .filter(s => s.violation_count > 0 && s.status === 'in_progress')
                .length;

            // Fetch institutions and users count
            const { data: institutions } = await supabase
                .from('institutes')
                .select('id', { count: 'exact' });

            const { data: users } = await supabase
                .from('user_profiles')
                .select('id', { count: 'exact' });

            // Fetch violations for flagged incidents
            const { data: violations } = await supabase
                .from('violations')
                .select('*, exam_sessions(*, exams(title)), user_profiles(name)')
                .eq('severity', 'critical')
                .gte('timestamp', today.toISOString())
                .order('timestamp', { ascending: false })
                .limit(10);

            setStats({
                totalExamsToday,
                totalExamsThisWeek,
                totalExamsThisMonth,
                liveExams,
                studentsBeingProctored,
                flaggedIncidentsToday: criticalViolations,
                totalInstitutions: institutions?.length || 0,
                totalUsers: users?.length || 0,
                totalExamsConducted: sessions.filter(s => s.status === 'completed').length,
                systemHealth: 'healthy'
            });

            // Set upcoming exams (mock data for now)
            setUpcomingExams(exams.slice(0, 5).map(exam => ({
                id: exam.id,
                title: exam.title,
                scheduled_at: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
                duration_minutes: exam.duration_minutes,
                student_count: Math.floor(Math.random() * 50) + 10,
                proctoring_type: 'AI Proctoring'
            })));

            // Set flagged incidents
            if (violations) {
                setFlaggedIncidents(violations.map((v: any) => ({
                    id: v.id,
                    session_id: v.session_id,
                    student_name: v.user_profiles?.name || 'Unknown',
                    exam_title: v.exam_sessions?.exams?.title || 'Unknown Exam',
                    violation_type: v.type,
                    severity: v.severity,
                    timestamp: v.timestamp
                })));
            }

            // Mock notifications
            setNotifications([
                { id: 1, type: 'warning', message: '3 exams scheduled for tomorrow need proctor assignment', time: '5m ago' },
                { id: 2, type: 'info', message: 'System update available', time: '1h ago' },
                { id: 3, type: 'success', message: 'New institution registered', time: '2h ago' }
            ]);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <InstructorSidebar userRole={userRole} />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <InstructorSidebar userRole={userRole} />

            <div className="flex-1 overflow-auto">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Shield className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                                    <p className="text-sm text-gray-500">Comprehensive overview of your proctoring system</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Bell className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-900" />
                                    {notifications.length > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                                            {notifications.length}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                                    <User className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm text-gray-700">{user?.email || 'Admin'}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Quick Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Exams Today"
                                value={stats?.totalExamsToday || 0}
                                icon={Calendar}
                                iconColor="text-blue-600"
                                iconBg="bg-blue-100"
                                trend={`${stats?.totalExamsThisWeek || 0} this week`}
                            />
                            <StatCard
                                title="Live Exams"
                                value={stats?.liveExams || 0}
                                icon={Activity}
                                iconColor="text-green-600"
                                iconBg="bg-green-100"
                                trend={`${stats?.studentsBeingProctored || 0} students`}
                                pulse={!!(stats?.liveExams && stats.liveExams > 0)}
                            />
                            <StatCard
                                title="Flagged Today"
                                value={stats?.flaggedIncidentsToday || 0}
                                icon={AlertTriangle}
                                iconColor="text-red-600"
                                iconBg="bg-red-100"
                                trend="Critical incidents"
                            />
                            <StatCard
                                title="System Health"
                                value={stats?.systemHealth === 'healthy' ? '100%' : '75%'}
                                icon={Server}
                                iconColor={stats?.systemHealth === 'healthy' ? 'text-green-600' : 'text-yellow-600'}
                                iconBg={stats?.systemHealth === 'healthy' ? 'bg-green-100' : 'bg-yellow-100'}
                                trend="All systems operational"
                            />
                        </div>

                        {/* Main Stats Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Exams Overview */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Exams Scheduled */}
                                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-blue-600" />
                                            Exams Scheduled
                                        </h2>
                                        <button
                                            onClick={() => navigate('/admin/exams')}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            View All →
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">{stats?.totalExamsToday || 0}</div>
                                            <div className="text-xs text-gray-600 mt-1">Today</div>
                                        </div>
                                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">{stats?.totalExamsThisWeek || 0}</div>
                                            <div className="text-xs text-gray-600 mt-1">This Week</div>
                                        </div>
                                        <div className="text-center p-4 bg-indigo-50 rounded-lg">
                                            <div className="text-2xl font-bold text-indigo-600">{stats?.totalExamsThisMonth || 0}</div>
                                            <div className="text-xs text-gray-600 mt-1">This Month</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Upcoming Exams */}
                                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-orange-600" />
                                        Upcoming Exams
                                    </h2>
                                    <div className="space-y-3">
                                        {upcomingExams.length === 0 ? (
                                            <p className="text-gray-500 text-sm text-center py-4">No upcoming exams</p>
                                        ) : (
                                            upcomingExams.map((exam) => (
                                                <div
                                                    key={exam.id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                                                    onClick={() => navigate(`/admin/exams/${exam.id}`)}
                                                >
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-gray-900">{exam.title}</div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {new Date(exam.scheduled_at).toLocaleString()} • {exam.duration_minutes} mins • {exam.student_count} students
                                                        </div>
                                                    </div>
                                                    <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                                        {exam.proctoring_type}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Flagged Incidents */}
                                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-red-600" />
                                            Flagged Incidents (Today)
                                        </h2>
                                        <button
                                            onClick={() => navigate('/admin/violations')}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            View All →
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {flaggedIncidents.length === 0 ? (
                                            <div className="text-center py-8">
                                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2 opacity-50" />
                                                <p className="text-gray-500 text-sm">No flagged incidents today</p>
                                            </div>
                                        ) : (
                                            flaggedIncidents.map((incident) => (
                                                <div
                                                    key={incident.id}
                                                    className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
                                                    onClick={() => navigate(`/admin/sessions/${incident.session_id}`)}
                                                >
                                                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-gray-900">{incident.student_name}</div>
                                                        <div className="text-sm text-gray-600">{incident.exam_title}</div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {incident.violation_type} • {new Date(incident.timestamp).toLocaleTimeString()}
                                                        </div>
                                                    </div>
                                                    <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                                                        {incident.severity}
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Quick Stats & Notifications */}
                            <div className="space-y-6">
                                {/* Quick Stats */}
                                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-purple-600" />
                                        Quick Stats
                                    </h2>
                                    <div className="space-y-4">
                                        <StatRow icon={Building2} label="Institutions" value={stats?.totalInstitutions || 0} />
                                        <StatRow icon={Users} label="Total Users" value={stats?.totalUsers || 0} />
                                        <StatRow icon={FileText} label="Exams Conducted" value={stats?.totalExamsConducted || 0} />
                                        <StatRow icon={Eye} label="Live Proctoring" value={stats?.liveExams || 0} />
                                    </div>
                                </div>

                                {/* Notifications */}
                                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-yellow-600" />
                                        Notifications
                                    </h2>
                                    <div className="space-y-3">
                                        {notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className={`p-3 rounded-lg border ${notif.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                                        notif.type === 'info' ? 'bg-blue-50 border-blue-200' :
                                                            'bg-green-50 border-green-200'
                                                    }`}
                                            >
                                                <div className="text-sm text-gray-900">{notif.message}</div>
                                                <div className="text-xs text-gray-500 mt-1">{notif.time}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* System Health */}
                                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Server className="w-5 h-5 text-green-600" />
                                        System Health
                                    </h2>
                                    <div className="space-y-3">
                                        <HealthItem label="Webcam Detection" status="operational" />
                                        <HealthItem label="Microphone Detection" status="operational" />
                                        <HealthItem label="AI Models" status="operational" />
                                        <HealthItem label="Database" status="operational" />
                                        <HealthItem label="API Server" status="operational" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    trend?: string;
    pulse?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, iconColor, iconBg, trend, pulse }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 ${iconBg} rounded-lg`}>
                <Icon className={`w-6 h-6 ${iconColor} ${pulse ? 'animate-pulse' : ''}`} />
            </div>
        </div>
        <div className="text-sm text-gray-500 mb-1 font-medium">{title}</div>
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        {trend && <div className="text-xs text-gray-400">{trend}</div>}
    </div>
);

interface StatRowProps {
    icon: React.ElementType;
    label: string;
    value: number;
}

const StatRow: React.FC<StatRowProps> = ({ icon: Icon, label, value }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">{label}</span>
        </div>
        <span className="text-lg font-bold text-gray-900">{value}</span>
    </div>
);

interface HealthItemProps {
    label: string;
    status: 'operational' | 'warning' | 'critical';
}

const HealthItem: React.FC<HealthItemProps> = ({ label, status }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'operational' ? 'bg-green-500' :
                    status === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                }`} />
            <span className={`text-xs font-medium ${status === 'operational' ? 'text-green-600' :
                    status === 'warning' ? 'text-yellow-600' :
                        'text-red-600'
                }`}>
                {status === 'operational' ? 'Operational' : status}
            </span>
        </div>
    </div>
);



