import React from 'react';
import { InstructorSidebar } from '../../components/InstructorSidebar';
import { CreditCard } from 'lucide-react';

export const BillingPage: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <InstructorSidebar userRole="admin" />
            <div className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing & License Management</h1>
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">License Management</h2>
                        <p className="text-gray-600">Usage tracking, plan management, and invoices coming soon...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};



