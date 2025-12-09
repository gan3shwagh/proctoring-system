import React, { useState, useEffect } from 'react';
import { InstructorSidebar } from '../components/InstructorSidebar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Loader2, Building2, Plus, Trash2, MapPin, Hash, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

interface Institute {
    id: string;
    name: string;
    code: string;
    address: string;
}

interface Branch {
    id: string;
    institute_id: string;
    name: string;
}

export const InstituteManagement: React.FC = () => {
    const { user } = useAuth();
    const [institutes, setInstitutes] = useState<Institute[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [showAddInstitute, setShowAddInstitute] = useState(false);
    const [showAddBranch, setShowAddBranch] = useState<string | null>(null); // institute_id or null

    // Form states
    const [newInstitute, setNewInstitute] = useState({ name: '', code: '', address: '' });
    const [newBranch, setNewBranch] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch institutes
            const { data: instData, error: instError } = await supabase
                .from('institutes')
                .select('*')
                .order('name');

            if (instError) throw instError;
            setInstitutes(instData || []);

            // Fetch branches
            const { data: branchData, error: branchError } = await supabase
                .from('branches')
                .select('*')
                .order('name');

            if (branchError) throw branchError;
            setBranches(branchData || []);

        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load institutes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateInstitute = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/admin/institutes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newInstitute),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create institute');
            }

            setShowAddInstitute(false);
            setNewInstitute({ name: '', code: '', address: '' });
            fetchData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleCreateBranch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showAddBranch) return;

        try {
            const response = await fetch(`${API_BASE_URL}/admin/institutes/${showAddBranch}/branches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newBranch }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create branch');
            }

            setShowAddBranch(null);
            setNewBranch('');
            fetchData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDeleteInstitute = async (id: string) => {
        if (!confirm('Are you sure? This will delete all associated branches and users.')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/admin/institutes/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete institute');
            fetchData();
        } catch (err: any) {
            alert(err.message);
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
                const { data } = await supabase.from('user_profiles').select('role').eq('user_id', user.id).single();
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
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Institute Management</h1>
                            <p className="text-gray-500 mt-1">Manage educational institutes and their branches</p>
                        </div>
                        <button
                            onClick={() => setShowAddInstitute(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            Add Institute
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            <span className="ml-3 text-gray-600">Loading data...</span>
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {institutes.map((inst) => (
                                <div key={inst.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                <Building2 className="w-5 h-5 text-blue-600" />
                                                {inst.name}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Hash className="w-4 h-4" />
                                                    Code: {inst.code}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {inst.address}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteInstitute(inst.id)}
                                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                            title="Delete Institute"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="border-t border-gray-100 pt-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-sm font-semibold text-gray-700">Branches</h4>
                                            <button
                                                onClick={() => setShowAddBranch(inst.id)}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Branch
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {branches.filter(b => b.institute_id === inst.id).map(branch => (
                                                <span key={branch.id} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                                    {branch.name}
                                                </span>
                                            ))}
                                            {branches.filter(b => b.institute_id === inst.id).length === 0 && (
                                                <span className="text-sm text-gray-400 italic">No branches added</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Institute Modal */}
            {showAddInstitute && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Add New Institute</h2>
                        <form onSubmit={handleCreateInstitute} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Institute Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newInstitute.name}
                                    onChange={e => setNewInstitute({ ...newInstitute, name: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Institute Code</label>
                                <input
                                    type="text"
                                    required
                                    value={newInstitute.code}
                                    onChange={e => setNewInstitute({ ...newInstitute, code: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    required
                                    value={newInstitute.address}
                                    onChange={e => setNewInstitute({ ...newInstitute, address: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddInstitute(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Create Institute
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Branch Modal */}
            {showAddBranch && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
                        <h2 className="text-xl font-bold mb-4">Add Branch</h2>
                        <form onSubmit={handleCreateBranch} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newBranch}
                                    onChange={e => setNewBranch(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Computer Science"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddBranch(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Add Branch
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
