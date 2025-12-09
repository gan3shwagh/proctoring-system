import React, { useState, useEffect } from 'react';
import { InstructorSidebar } from '../components/InstructorSidebar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2, Search, User, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

interface UserProfile {
    user_id: string;
    name: string;
    email?: string; // Not always available in profile, might need to fetch from auth or just rely on name
    role: string;
    institute_id?: string;
    branch_id?: string;
    institutes?: { name: string; code: string };
    branches?: { name: string };
    created_at: string;
}

export const UserManagement: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    // Fetch users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            // Note: In a real app, we'd use the backend API /api/users
            // For now, let's try to fetch directly from Supabase if RLS allows, 
            // or fall back to the API we created in users.ts

            const response = await fetch(`${API_BASE_URL}/users`);
            if (!response.ok) throw new Error('Failed to fetch users');

            const data = await response.json();
            setUsers(data);
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please ensure you have admin privileges.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: string) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) throw new Error('Failed to update role');

            // Update local state
            setUsers(users.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            console.error('Error updating role:', err);
            alert('Failed to update user role');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.institutes?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Get user role for sidebar
    const [currentUserRole, setCurrentUserRole] = useState<string>('');
    useEffect(() => {
        const checkRole = async () => {
            // Check for demo user first
            const demoUser = localStorage.getItem('demo_user');
            if (demoUser) {
                const parsed = JSON.parse(demoUser);
                setCurrentUserRole(parsed.role);
                return;
            }

            if (user) {
                const { data } = await supabase
                    .from('user_profiles')
                    .select('role')
                    .eq('user_id', user.id)
                    .single();
                if (data) setCurrentUserRole(data.role);
            }
        };
        checkRole();
    }, [user]);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <InstructorSidebar userRole={currentUserRole} />

            <div className="flex-1 p-8 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-500 mt-1">Manage students, teachers, and administrators</p>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name or institute..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <span className="text-sm text-gray-600 whitespace-nowrap">Filter by role:</span>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Roles</option>
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="instructor">Instructor</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                <span className="ml-3 text-gray-600">Loading users...</span>
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center">
                                <div className="bg-red-50 text-red-800 p-4 rounded-lg inline-flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    {error}
                                </div>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No users found matching your criteria.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Institute</th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredUsers.map((user) => (
                                            <tr key={user.user_id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{user.name}</div>
                                                            <div className="text-xs text-gray-500">ID: {user.user_id.substring(0, 8)}...</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                            user.role === 'instructor' || user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-green-100 text-green-800'}`}>
                                                        {user.role || 'student'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {user.institutes ? (
                                                        <div>
                                                            <div className="text-sm text-gray-900">{user.institutes.name}</div>
                                                            {user.branches && (
                                                                <div className="text-xs text-gray-500">{user.branches.name}</div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400 italic">None</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={user.role || 'student'}
                                                        onChange={(e) => handleRoleChange(user.user_id, e.target.value)}
                                                        className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    >
                                                        <option value="student">Student</option>
                                                        <option value="teacher">Teacher</option>
                                                        <option value="instructor">Instructor</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
