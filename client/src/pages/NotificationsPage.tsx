import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Bell, CheckCircle, AlertCircle, Info, X, Loader2 } from 'lucide-react';

interface Notification {
    id: string;
    type: 'success' | 'warning' | 'info' | 'error';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    actionUrl?: string;
}

export const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        // Mock notifications - in real app, fetch from API
        setTimeout(() => {
            setNotifications([
                {
                    id: '1',
                    type: 'success',
                    title: 'Exam Completed',
                    message: 'Your Data Structures & Algorithms exam has been submitted successfully.',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    read: false,
                    actionUrl: '/history'
                },
                {
                    id: '2',
                    type: 'warning',
                    title: 'Upcoming Exam',
                    message: 'You have an exam scheduled for tomorrow at 10:00 AM. Please prepare accordingly.',
                    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
                    read: false,
                    actionUrl: '/upcoming'
                },
                {
                    id: '3',
                    type: 'info',
                    title: 'New Exam Available',
                    message: 'A new exam "Database Systems" is now available for you to take.',
                    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    read: true,
                    actionUrl: '/'
                },
                {
                    id: '4',
                    type: 'error',
                    title: 'Violation Warning',
                    message: 'You received a warning during your last exam. Please review the exam guidelines.',
                    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    read: false,
                    actionUrl: '/history'
                }
            ]);
            setLoading(false);
        }, 500);
    };

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return CheckCircle;
            case 'warning': return AlertCircle;
            case 'error': return AlertCircle;
            default: return Info;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-100 text-green-700 border-green-200';
            case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'error': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Bell className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                                    <p className="text-gray-500 mt-1">
                                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                                    </p>
                                </div>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h3>
                                <p className="text-gray-500">You're all caught up! No new notifications.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {notifications.map((notification) => {
                                    const Icon = getIcon(notification.type);
                                    const isUnread = !notification.read;

                                    return (
                                        <div
                                            key={notification.id}
                                            className={`bg-white rounded-xl shadow-sm border p-6 transition-all ${
                                                isUnread 
                                                    ? `${getColor(notification.type)} border-l-4` 
                                                    : 'border-gray-200'
                                            }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`p-2 rounded-lg ${
                                                    notification.type === 'success' ? 'bg-green-100' :
                                                    notification.type === 'warning' ? 'bg-yellow-100' :
                                                    notification.type === 'error' ? 'bg-red-100' :
                                                    'bg-blue-100'
                                                }`}>
                                                    <Icon className={`w-5 h-5 ${
                                                        notification.type === 'success' ? 'text-green-600' :
                                                        notification.type === 'warning' ? 'text-yellow-600' :
                                                        notification.type === 'error' ? 'text-red-600' :
                                                        'text-blue-600'
                                                    }`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 mb-1">
                                                                {notification.title}
                                                                {isUnread && (
                                                                    <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full inline-block" />
                                                                )}
                                                            </h3>
                                                            <p className="text-sm text-gray-600">{notification.message}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isUnread && (
                                                                <button
                                                                    onClick={() => markAsRead(notification.id)}
                                                                    className="text-xs text-gray-500 hover:text-gray-700"
                                                                >
                                                                    Mark read
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => deleteNotification(notification.id)}
                                                                className="text-gray-400 hover:text-gray-600"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-2">
                                                        {new Date(notification.timestamp).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};



