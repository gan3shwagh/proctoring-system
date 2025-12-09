import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

interface RoleProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: string[];
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, loading: authLoading } = useAuth();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            // Check if this is a demo user
            const demoUser = localStorage.getItem('demo_user');
            if (demoUser) {
                const parsedDemoUser = JSON.parse(demoUser);
                setUserRole(parsedDemoUser.role || 'admin');
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('role')
                    .eq('user_id', user.id)
                    .single();

                if (error) {
                    console.error('Error fetching user role:', error);
                    setUserRole('student'); // Default to student
                } else {
                    setUserRole(data?.role || 'student');
                }
            } catch (err) {
                console.error('Unexpected error:', err);
                setUserRole('student');
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, [user]);

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!userRole || !allowedRoles.includes(userRole)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-6">
                        You don't have permission to access this page. This area is restricted to instructors only.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
