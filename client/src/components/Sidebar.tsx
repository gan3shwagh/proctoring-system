import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    Home, History, BarChart3, User, Calendar, Bell, 
    Settings, type LucideIcon 
} from 'lucide-react';

interface NavItem {
    name: string;
    path: string;
    icon: LucideIcon;
    badge?: number;
}

const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Upcoming Exams', path: '/upcoming', icon: Calendar },
    { name: 'Exam History', path: '/history', icon: History },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: 3 },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Profile', path: '/profile', icon: User },
];

export const Sidebar: React.FC = () => {
    const location = useLocation();

    return (
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4 shadow-sm">
            <div className="mb-6 px-4">
                <h2 className="text-lg font-bold text-gray-900">Student Portal</h2>
                <p className="text-xs text-gray-500 mt-1">Your exam dashboard</p>
            </div>
            <nav className="space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group ${
                                isActive
                                    ? 'bg-blue-600 text-white font-semibold shadow-md'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </div>
                            {item.badge && item.badge > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                    isActive 
                                        ? 'bg-white text-blue-600' 
                                        : 'bg-blue-600 text-white'
                                }`}>
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
};
