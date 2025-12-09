import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from '../components/Sidebar';
import { supabase } from '../lib/supabase';
import { User, Building2, GitBranch, Mail, Calendar, Loader2, Save } from 'lucide-react';
import { API_BASE_URL } from '../services/api';

interface UserProfile {
    user_id: string;
    name: string;
    face_photo: string | null;
    role: string;
    created_at: string;
    institutes?: {
        name: string;
        code: string;
        address: string;
    };
    branches?: {
        name: string;
    };
}

export const StudentProfile: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, [user]);

    const fetchProfile = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/profile/${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch profile');
            const data = await response.json();
            setProfile(data);
            setEditedName(data.name || '');
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Fallback: try to get basic info from Supabase
            const { data } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();
            if (data) {
                setProfile(data as UserProfile);
                setEditedName(data.name || '');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        try {
            setSaving(true);
            const response = await fetch(`${API_BASE_URL}/profile/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editedName }),
            });

            if (response.ok) {
                await fetchProfile();
                setEditing(false);
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

                        <div className="grid gap-6">
                            {/* Profile Picture */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
                                <div className="flex items-center gap-6">
                                    {profile?.face_photo ? (
                                        <img
                                            src={profile.face_photo}
                                            alt="Profile"
                                            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <User className="w-16 h-16 text-gray-400" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            This photo is used for identity verification during exams.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">Personal Information</h2>
                                    {!editing && (
                                        <button
                                            onClick={() => setEditing(true)}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-gray-400" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600">Name</p>
                                            {editing ? (
                                                <input
                                                    type="text"
                                                    value={editedName}
                                                    onChange={(e) => setEditedName(e.target.value)}
                                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            ) : (
                                                <p className="font-medium text-gray-900">{profile?.name}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-medium text-gray-900">{user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Member Since</p>
                                            <p className="font-medium text-gray-900">
                                                {profile?.created_at && new Date(profile.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {editing && (
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Save className="w-4 h-4" />
                                            )}
                                            Save Changes
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditing(false);
                                                setEditedName(profile?.name || '');
                                            }}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Institute Information */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-semibold mb-4">Institute Information</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Institute</p>
                                            <p className="font-medium text-gray-900">
                                                {profile?.institutes?.name || 'Not specified'}
                                            </p>
                                            {profile?.institutes?.code && (
                                                <p className="text-sm text-gray-500">Code: {profile.institutes.code}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <GitBranch className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Branch</p>
                                            <p className="font-medium text-gray-900">
                                                {profile?.branches?.name || 'Not specified'}
                                            </p>
                                        </div>
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
