import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, FileText, Users, Building2, Calendar, Eye, 
    BarChart3, AlertTriangle, UserCheck, Settings, CreditCard, Lock, 
    Zap, Shield, type LucideIcon
} from 'lucide-react';

interface NavItem {
    name: string;
    path: string;
    icon: LucideIcon;
    adminOnly?: boolean;
}

const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Institution Management', path: '/admin/institutes', icon: Building2 },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Exam Management', path: '/admin/exams', icon: FileText },
    { name: 'Scheduling', path: '/admin/scheduling', icon: Calendar },
    { name: 'Live Monitoring', path: '/admin/monitoring', icon: Eye },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { name: 'Flagged Incidents', path: '/admin/violations', icon: AlertTriangle },
    { name: 'Proctor Management', path: '/admin/proctors', icon: UserCheck },
    { name: 'Integrations', path: '/admin/integrations', icon: Zap },
    { name: 'White Labeling', path: '/admin/branding', icon: Shield },
    { name: 'Billing & Licenses', path: '/admin/billing', icon: CreditCard },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
    { name: 'Security & Audit', path: '/admin/audit', icon: Lock },
];

interface InstructorSidebarProps {
    userRole?: string;
}

export const InstructorSidebar: React.FC<InstructorSidebarProps> = ({ userRole }) => {
    const location = useLocation();
    const isAdmin = userRole === 'admin';

    // Filter items based on role (for now, show all to admin)
    const filteredItems = isAdmin ? navItems : navItems.filter(item => !item.adminOnly);

    return (
        <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-700 min-h-screen p-4 shadow-xl">
            <div className="mb-8 pt-4">
                <div className="flex items-center gap-3 px-4 mb-2">
                    <div className="p-2 bg-blue-600 rounded-lg">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Admin Panel</h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {isAdmin ? 'Administrator' : 'Instructor'}
                        </p>
                    </div>
                </div>
            </div>
            <nav className="space-y-2">
                {filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                                isActive
                                    ? 'bg-blue-600 text-white font-semibold shadow-lg transform scale-105'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
