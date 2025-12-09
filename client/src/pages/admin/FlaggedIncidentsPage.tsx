import React, { useState, useEffect } from 'react';
import { InstructorSidebar } from '../../components/InstructorSidebar';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, Eye, Loader2 } from 'lucide-react';

export const FlaggedIncidentsPage: React.FC = () => {
    const { user } = useAuth();
    const [violations, setViolations] = useState<any[]>([]);
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
        fetchViolations();
    }, []);

    const fetchViolations = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('violations')
                .select(`
                    *,
                    exam_sessions(
                        id,
                        user_id,
                        exams(title)
                    ),
                    user_profiles(name)
                `)
                .order('timestamp', { ascending: false })
                .limit(100);

            if (error) throw error;
            setViolations(data || []);
        } catch (err) {
            console.error('Error fetching violations:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <InstructorSidebar userRole={userRole} />
            <div className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Flagged Incidents & Violations</h1>
                    
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900">All Violations</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Student</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Exam</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Violation Type</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Severity</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Timestamp</th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {violations.map((violation) => (
                                            <tr key={violation.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {violation.user_profiles?.name || 'Unknown'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-700">
                                                        {violation.exam_sessions?.exams?.title || 'Unknown Exam'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-700">{violation.type}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                                                        violation.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                                        violation.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                                        violation.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {violation.severity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(violation.timestamp).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

