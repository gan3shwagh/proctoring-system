import React from 'react';
import { InstructorSidebar } from '../../components/InstructorSidebar';
import { Settings } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <InstructorSidebar userRole="admin" />
            <div className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">System Settings</h1>
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Global Settings</h2>
                        <p className="text-gray-600">Proctoring rules, data retention, GDPR compliance, and email templates coming soon...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

