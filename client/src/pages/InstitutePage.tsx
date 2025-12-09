import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Building2, MapPin, Users, GraduationCap, GitBranch, ArrowLeft } from 'lucide-react';

interface Institute {
    id: string;
    name: string;
    address: string;
    code: string;
}

interface Branch {
    id: string;
    name: string;
}

interface UserProfile {
    user_id: string;
    name: string;
    role: string;
    face_photo?: string;
}

export const InstitutePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [institute, setInstitute] = useState<Institute | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchInstituteDetails();
        }
    }, [id]);

    const fetchInstituteDetails = async () => {
        try {
            setLoading(true);

            // Fetch Institute
            const { data: instData, error: instError } = await supabase
                .from('institutes')
                .select('*')
                .eq('id', id)
                .single();

            if (instError) throw instError;
            setInstitute(instData);

            // Fetch Branches
            const { data: branchData, error: branchError } = await supabase
                .from('branches')
                .select('*')
                .eq('institute_id', id)
                .order('name');

            if (branchError) throw branchError;
            setBranches(branchData || []);

            // Fetch Users
            const { data: userData, error: userError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('institute_id', id);

            if (userError) throw userError;
            setUsers(userData || []);

        } catch (err: any) {
            console.error('Error fetching institute details:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !institute) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600">{error || 'Institute not found'}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const teachers = users.filter(u => u.role === 'teacher' || u.role === 'instructor');
    const students = users.filter(u => u.role === 'student' || !u.role);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </button>

                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Building2 className="w-8 h-8 text-blue-600" />
                                {institute.name}
                            </h1>
                            <div className="mt-4 flex items-center gap-6 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    {institute.address}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                                        Code: {institute.code}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Branches */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 h-full">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <GitBranch className="w-5 h-5 text-purple-600" />
                                Branches
                            </h2>
                            <div className="space-y-3">
                                {branches.length > 0 ? (
                                    branches.map(branch => (
                                        <div key={branch.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <span className="font-medium text-gray-700">{branch.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">No branches listed</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* People */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Teachers */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Users className="w-5 h-5 text-green-600" />
                                Instructors ({teachers.length})
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {teachers.length > 0 ? (
                                    teachers.map(teacher => (
                                        <div key={teacher.user_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                                                {teacher.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{teacher.name}</p>
                                                <p className="text-xs text-gray-500 uppercase">{teacher.role}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">No instructors listed</p>
                                )}
                            </div>
                        </div>

                        {/* Students */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-blue-600" />
                                Students ({students.length})
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {students.length > 0 ? (
                                    students.map(student => (
                                        <div key={student.user_id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{student.name}</p>
                                                <p className="text-xs text-gray-500">Student</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">No students listed</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
