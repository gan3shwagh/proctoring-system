import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StudentFeedCard } from '../components/StudentFeedCard';
import { sessionApi, type Session } from '../services/api';
import { Loader2 } from 'lucide-react';

export const LiveProctoringView: React.FC = () => {
    const { examId } = useParams();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<'alerts' | 'details'>('alerts');

    // Mock data for demonstration (to match UI design)
    // const mockStudents = [...]; // Removed mock data

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
            id: session.user_id, // Use user_id as student ID
            name: `Student ${session.user_id.slice(0, 8)}`, // Fallback name
            status: status,
            // Use a placeholder image based on ID to be consistent
            imageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user_id}`,
            hasAudio: true, // Default to true
            isScreenSharing: true, // Default to true
            alertMessage: session.latest_violation ? `${session.latest_violation.type.replace('_', ' ')}` : undefined
        };
    });

    const filteredStudents = displayStudents.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.id.includes(searchQuery)
    );

    return (
        <div className="flex h-screen w-full bg-background-light dark:bg-background-dark font-display text-text-light-primary dark:text-dark-primary">
            {/* SideNavBar */}
            <aside className="flex w-64 flex-col justify-between border-r border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-primary/10 flex items-center justify-center text-primary font-bold">
                            AP
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-text-light-primary dark:text-dark-primary text-base font-medium leading-normal">Admin Proctor</h1>
                            <p className="text-text-light-secondary dark:text-dark-secondary text-sm font-normal leading-normal">proctor@university.edu</p>
                        </div>
                    </div>
                    <nav className="flex flex-col gap-2">
                        <Link to="/instructor" className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-light-secondary dark:text-dark-secondary hover:bg-black/5 dark:hover:bg-white/5">
                            <span className="material-symbols-outlined text-lg">dashboard</span>
                            <p className="text-sm font-medium leading-normal">Dashboard</p>
                        </Link>
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary" href="#">
                            <span className="material-symbols-outlined text-lg">visibility</span>
                            <p className="text-sm font-medium leading-normal">Live Monitoring</p>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-light-secondary dark:text-dark-secondary hover:bg-black/5 dark:hover:bg-white/5" href="#">
                            <span className="material-symbols-outlined text-lg">group</span>
                            <p className="text-sm font-medium leading-normal">Students</p>
                        </a>
                        <a className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-light-secondary dark:text-dark-secondary hover:bg-black/5 dark:hover:bg-white/5" href="#">
                            <span className="material-symbols-outlined text-lg">settings</span>
                            <p className="text-sm font-medium leading-normal">Settings</p>
                        </a>
                    </nav>
                </div>
                <div className="flex flex-col gap-1">
                    <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-light-secondary dark:text-dark-secondary hover:bg-black/5 dark:hover:bg-white/5">
                        <span className="material-symbols-outlined text-lg">logout</span>
                        <p className="text-sm font-medium leading-normal">Exit to Student View</p>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex flex-1 flex-col overflow-y-auto">
                <div className="p-6">
                    {/* PageHeading */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <p className="text-3xl font-bold leading-tight tracking-tight">Live Proctoring: Mid-Term Exam CS101</p>
                            <p className="text-text-light-secondary dark:text-dark-secondary text-base font-normal leading-normal">Real-time monitoring dashboard for the ongoing examination.</p>
                        </div>
                        <button className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-danger text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-danger/90 transition-colors">
                            <span className="material-symbols-outlined text-lg">power_settings_new</span>
                            <span className="truncate">End Exam for All</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-6">
                        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
                            <p className="text-text-light-secondary dark:text-dark-secondary text-base font-medium leading-normal">Active Students</p>
                            <p className="tracking-light text-2xl font-bold leading-tight">{displayStudents.length}/50</p>
                        </div>
                        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
                            <p className="text-text-light-secondary dark:text-dark-secondary text-base font-medium leading-normal">Open Alerts</p>
                            <p className="text-danger tracking-light text-2xl font-bold leading-tight">
                                {displayStudents.filter(s => s.status === 'alert').length}
                            </p>
                        </div>
                        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark">
                            <p className="text-text-light-secondary dark:text-dark-secondary text-base font-medium leading-normal">Time Remaining</p>
                            <p className="tracking-light text-2xl font-bold leading-tight">01:25:30</p>
                        </div>
                    </div>

                    {/* Main dashboard area */}
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Student Feeds Section */}
                        <div className="flex-[3] w-full">
                            {/* SearchBar */}
                            <div className="py-3">
                                <label className="flex flex-col min-w-40 h-12 w-full">
                                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark focus-within:border-primary transition-colors">
                                        <div className="text-text-light-secondary dark:text-dark-secondary flex items-center justify-center pl-4">
                                            <span className="material-symbols-outlined text-xl">search</span>
                                        </div>
                                        <input
                                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden text-text-light-primary dark:text-dark-primary focus:outline-0 border-none bg-transparent h-full placeholder:text-text-light-secondary dark:placeholder:text-dark-secondary px-4 pl-2 text-base font-normal leading-normal"
                                            placeholder="Search for a student by name or ID..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </label>
                            </div>

                            {/* SectionHeader */}
                            <h2 className="text-xl font-bold leading-tight tracking-tight pt-5 pb-3">Student Feeds</h2>

                            {/* Student Grid */}
                            {loading ? (
                                <div className="flex items-center justify-center h-64">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
                                            alertMessage={student.alertMessage}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Alerts and Details Panel */}
                        <aside className="flex-[1.5] w-full lg:w-96 rounded-lg bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-4 flex flex-col gap-4 self-start sticky top-6">
                            <h3 className="text-xl font-bold">Alerts & Details</h3>

                            {/* Tabs */}
                            <div className="flex border-b border-border-light dark:border-border-dark">
                                <button
                                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${selectedTab === 'alerts' ? 'border-primary text-primary' : 'border-transparent text-text-light-secondary dark:text-dark-secondary hover:text-text-light-primary dark:hover:text-dark-primary'}`}
                                    onClick={() => setSelectedTab('alerts')}
                                >
                                    Alerts ({displayStudents.filter(s => s.status !== 'ok').length})
                                </button>
                                <button
                                    className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${selectedTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-text-light-secondary dark:text-dark-secondary hover:text-text-light-primary dark:hover:text-dark-primary'}`}
                                    onClick={() => setSelectedTab('details')}
                                >
                                    Selected Student
                                </button>
                            </div>

                            {/* Alerts Feed */}
                            {selectedTab === 'alerts' && (
                                <div className="flex flex-col gap-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                                    {displayStudents.filter(s => s.status !== 'ok').map((student) => (
                                        <div key={student.id} className={`flex items-start gap-3 p-3 rounded-lg ${student.status === 'alert' ? 'bg-danger/10' : 'bg-warning/10'}`}>
                                            <span className={`material-symbols-outlined mt-1 ${student.status === 'alert' ? 'text-danger' : 'text-warning'}`}>
                                                {student.status === 'alert' ? 'error' : 'warning'}
                                            </span>
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm">{student.alertMessage || 'Suspicious Activity'}</p>
                                                <p className="text-xs text-text-light-secondary dark:text-dark-secondary">{student.name} • Just now</p>
                                            </div>
                                            <button className="text-xs font-bold text-primary hover:underline">View</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedTab === 'details' && (
                                <div className="flex flex-col items-center justify-center h-40 text-text-light-secondary dark:text-dark-secondary text-sm text-center">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">touch_app</span>
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
