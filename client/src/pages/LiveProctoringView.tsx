import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StudentFeedCard } from '../components/StudentFeedCard';
import { sessionApi, type Session } from '../services/api';
import { InstructorSidebar } from '../components/InstructorSidebar';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useWebRTC } from '../hooks/useWebRTC';

export const LiveProctoringView: React.FC = () => {
    const { examId } = useParams();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<'alerts' | 'details'>('alerts');

    // WebRTC Viewing
    const { user } = useAuth();
    const { remoteStreams } = useWebRTC({
        roomId: examId || 'default-room',
        userId: user?.id || 'instructor',
        isBroadcaster: false
    });

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                // In a real app, we'd filter by examId
                const data = await sessionApi.getAll();
                setSessions(data);
            } catch (error) {
                console.error('Failed to fetch sessions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
        // Poll every 5 seconds
        const interval = setInterval(fetchSessions, 5000);
        return () => clearInterval(interval);
    }, [examId]);

    // Map sessions to display students
    const displayStudents = sessions.map(session => {
        let status: 'ok' | 'warning' | 'alert' = 'ok';
        if (session.credibility_score < 50) status = 'alert';
        else if (session.credibility_score < 80) status = 'warning';

        return {
            id: session.user_id,
            name: `Student ${session.user_id.slice(0, 8)}`,
            status: status,
            imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user_id}`,
            // We'll use a placeholder for screen share for now, as we need to list files to get the actual one
            screenUrl: `https://placehold.co/600x400?text=Screen+Monitor`,
            stream: remoteStreams[session.user_id], // Pass the WebRTC stream
            hasAudio: true,
            isScreenSharing: true,
            alertMessage: session.latest_violation ? `${session.latest_violation.type.replace('_', ' ')}` : undefined
        };
    });

    const filteredStudents = displayStudents.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.includes(searchQuery)
    );

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
                setCurrentUserRole('instructor');
            }
        };
        checkRole();
    }, [user]);

    return (
        <div className="flex h-screen w-full bg-gray-50">
            <InstructorSidebar userRole={currentUserRole} />

            {/* Main Content */}
            <main className="flex flex-1 flex-col overflow-y-auto">
                <div className="p-6">
                    {/* PageHeading */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold text-gray-900">Live Proctoring: Mid-Term Exam CS101</h1>
                            <p className="text-gray-600 text-base">Real-time monitoring dashboard for the ongoing examination.</p>
                        </div>
                        <button className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors">
                            <span className="text-lg">⚡</span>
                            <span className="truncate">End Exam for All</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-6">
                        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-gray-200 bg-white">
                            <p className="text-gray-600 text-base font-medium">Active Students</p>
                            <p className="text-2xl font-bold text-gray-900">{displayStudents.length}/50</p>
                        </div>
                        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-gray-200 bg-white">
                            <p className="text-gray-600 text-base font-medium">Open Alerts</p>
                            <p className="text-red-600 text-2xl font-bold">
                                {displayStudents.filter(s => s.status === 'alert').length}
                            </p>
                        </div>
                        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-gray-200 bg-white">
                            <p className="text-gray-600 text-base font-medium">Time Remaining</p>
                            <p className="text-2xl font-bold text-gray-900">01:25:30</p>
                        </div>
                    </div>

                    {/* Main dashboard area */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Student Feeds Section */}
                        <div className="flex-[3] w-full">
                            {/* SearchBar */}
                            <div className="py-3">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-400 text-xl">🔍</span>
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                                        placeholder="Search for a student by name or ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* SectionHeader */}
                            <h2 className="text-xl font-bold text-gray-900 pt-5 pb-3">Student Feeds</h2>

                            {/* Student Grid */}
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                </div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No students found matching your search.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {filteredStudents.map((student) => (
                                        <StudentFeedCard
                                            key={student.id}
                                            studentName={student.name}
                                            studentId={student.id}
                                            status={student.status}
                                            imageUrl={student.imageUrl}
                                            hasAudio={student.hasAudio}
                                            isScreenSharing={student.isScreenSharing}
                                            screenUrl={student.screenUrl}
                                            stream={student.stream}
                                            alertMessage={student.alertMessage}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Alerts and Details Panel */}
                        <aside className="flex-[1.5] w-full lg:w-96 rounded-lg bg-white border border-gray-200 p-4 flex flex-col gap-4 self-start sticky top-6 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900">Alerts & Details</h3>

                            {/* Tabs */}
                            <div className="flex border-b border-gray-200">
                                <button
                                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${selectedTab === 'alerts' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                                    onClick={() => setSelectedTab('alerts')}
                                >
                                    Alerts ({displayStudents.filter(s => s.status !== 'ok').length})
                                </button>
                                <button
                                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${selectedTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
                                    onClick={() => setSelectedTab('details')}
                                >
                                    Selected Student
                                </button>
                            </div>

                            {/* Alerts Feed */}
                            {selectedTab === 'alerts' && (
                                <div className="flex flex-col gap-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                                    {displayStudents.filter(s => s.status !== 'ok').length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 text-sm">
                                            <p>No alerts at this time</p>
                                        </div>
                                    ) : (
                                        displayStudents.filter(s => s.status !== 'ok').map((student) => (
                                            <div key={student.id} className={`flex items-start gap-3 p-3 rounded-lg ${student.status === 'alert' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                                                <span className={`text-xl mt-1 ${student.status === 'alert' ? 'text-red-600' : 'text-yellow-600'}`}>
                                                    {student.status === 'alert' ? '⚠️' : '⚠️'}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm text-gray-900">{student.alertMessage || 'Suspicious Activity'}</p>
                                                    <p className="text-xs text-gray-600">{student.name} • Just now</p>
                                                </div>
                                                <button className="text-xs font-bold text-blue-600 hover:underline">View</button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {selectedTab === 'details' && (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-500 text-sm text-center">
                                    <span className="text-4xl mb-2 opacity-50">👆</span>
                                    <p>Select a student from the grid to view details</p>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
};
