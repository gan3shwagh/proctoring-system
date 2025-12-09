import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Settings, Bell, Lock, Eye, EyeOff, Save, Loader2, MessageCircle, Mail, Phone, FileText, ChevronDown, ChevronUp } from 'lucide-react';


interface FAQ {
    id: string;
    question: string;
    answer: string;
    category: string;
}

export const SettingsPage: React.FC = () => {
    // const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'settings' | 'help'>('settings');
    const [openFAQ, setOpenFAQ] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const [settings, setSettings] = useState({
        emailNotifications: true,
        examReminders: true,
        violationAlerts: true,
        showProfilePhoto: true,
        darkMode: false
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);

    const faqs: FAQ[] = [
        {
            id: '1',
            question: 'How do I start an exam?',
            answer: 'Navigate to the Dashboard, find your exam, and click "Start Exam". Make sure you have a stable internet connection and your webcam/microphone are working.',
            category: 'Exams'
        },
        {
            id: '2',
            question: 'What happens if I lose internet connection during an exam?',
            answer: 'Your progress is saved automatically. If you lose connection, try to reconnect as soon as possible. Contact support if you experience prolonged connectivity issues.',
            category: 'Technical'
        },
        {
            id: '3',
            question: 'Can I review my exam results?',
            answer: 'Yes! Go to Exam History to view all your completed exams, scores, and detailed feedback.',
            category: 'Results'
        },
        {
            id: '4',
            question: 'How is my credibility score calculated?',
            answer: 'Your credibility score is based on various factors including eye movement, face detection, audio monitoring, and tab switching. Maintaining focus and following guidelines helps maintain a high score.',
            category: 'Proctoring'
        },
        {
            id: '5',
            question: 'What should I do if I receive a violation warning?',
            answer: 'Review the violation details in your exam history. If you believe it was a false positive, contact support with your session ID for review.',
            category: 'Violations'
        },
        {
            id: '6',
            question: 'How do I update my profile information?',
            answer: 'Go to Profile section and click Edit. You can update your name and other details. Note that your face photo cannot be changed after registration.',
            category: 'Profile'
        }
    ];

    const categories = ['all', 'Exams', 'Technical', 'Results', 'Proctoring', 'Violations', 'Profile'];

    const filteredFAQs = faqs.filter(faq =>
        selectedCategory === 'all' || faq.category === selectedCategory
    );

    const toggleFAQ = (id: string) => {
        setOpenFAQ(openFAQ === id ? null : id);
    };

    const handleSaveSettings = async () => {
        setLoading(true);
        // In real app, save to backend
        setTimeout(() => {
            alert('Settings saved successfully!');
            setLoading(false);
        }, 500);
    };

    const handleChangePassword = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        // In real app, change password via API
        setTimeout(() => {
            alert('Password changed successfully!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setLoading(false);
        }, 500);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-gray-100 rounded-lg">
                                <Settings className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Settings & Help</h1>
                                <p className="text-gray-500 mt-1">Manage your account preferences, security, and get support</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-6 border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('settings')}
                                className={`px-6 py-3 font-semibold border-b-2 transition-colors ${activeTab === 'settings'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Settings
                            </button>
                            <button
                                onClick={() => setActiveTab('help')}
                                className={`px-6 py-3 font-semibold border-b-2 transition-colors ${activeTab === 'help'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Help & Support
                            </button>
                        </div>

                        {activeTab === 'settings' ? (
                            <div className="space-y-6">

                                {/* Notification Settings */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Bell className="w-5 h-5 text-blue-600" />
                                        <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <div>
                                                <div className="font-medium text-gray-900">Email Notifications</div>
                                                <div className="text-sm text-gray-500">Receive email updates about your exams</div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.emailNotifications}
                                                onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <div>
                                                <div className="font-medium text-gray-900">Exam Reminders</div>
                                                <div className="text-sm text-gray-500">Get notified before upcoming exams</div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.examReminders}
                                                onChange={(e) => setSettings({ ...settings, examReminders: e.target.checked })}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <div>
                                                <div className="font-medium text-gray-900">Violation Alerts</div>
                                                <div className="text-sm text-gray-500">Get notified about exam violations</div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.violationAlerts}
                                                onChange={(e) => setSettings({ ...settings, violationAlerts: e.target.checked })}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Privacy Settings */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                                    <div className="flex items-center gap-2 mb-6">
                                        <Eye className="w-5 h-5 text-purple-600" />
                                        <h2 className="text-xl font-bold text-gray-900">Privacy Settings</h2>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <div>
                                                <div className="font-medium text-gray-900">Show Profile Photo</div>
                                                <div className="text-sm text-gray-500">Display your profile photo to instructors</div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={settings.showProfilePhoto}
                                                onChange={(e) => setSettings({ ...settings, showProfilePhoto: e.target.checked })}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                        </label>
                                    </div>
                                </div>

                        {/* Change Password (collapsible) */}
                        <details className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 group">
                            <summary className="flex items-center justify-between cursor-pointer list-none">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-red-600" />
                                    <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                                </div>
                                <span className="text-sm text-gray-500 group-open:hidden">Show</span>
                                <span className="text-sm text-gray-500 hidden group-open:block">Hide</span>
                            </summary>
                            <div className="space-y-4 mt-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <button
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                    Change Password
                                </button>
                            </div>
                        </details>

                                {/* Save Button */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSaveSettings}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Settings
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Contact Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                                        <div className="p-3 bg-blue-100 rounded-lg w-fit mx-auto mb-4">
                                            <MessageCircle className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                                        <p className="text-sm text-gray-600 mb-4">Chat with our support team</p>
                                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                                            Start Chat
                                        </button>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                                        <div className="p-3 bg-green-100 rounded-lg w-fit mx-auto mb-4">
                                            <Mail className="w-6 h-6 text-green-600" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                                        <p className="text-sm text-gray-600 mb-4">support@proctorai.com</p>
                                        <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
                                            Send Email
                                        </button>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
                                        <div className="p-3 bg-purple-100 rounded-lg w-fit mx-auto mb-4">
                                            <Phone className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-2">Phone Support</h3>
                                        <p className="text-sm text-gray-600 mb-4">+1 (555) 123-4567</p>
                                        <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors">
                                            Call Now
                                        </button>
                                    </div>
                                </div>

                                {/* FAQ Section */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-blue-600" />
                                            Frequently Asked Questions
                                        </h2>
                                        <select
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>
                                                    {cat === 'all' ? 'All Categories' : cat}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-4">
                                        {filteredFAQs.map((faq) => (
                                            <div
                                                key={faq.id}
                                                className="border border-gray-200 rounded-lg overflow-hidden"
                                            >
                                                <button
                                                    onClick={() => toggleFAQ(faq.id)}
                                                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 mb-1">{faq.question}</h3>
                                                        <span className="text-xs text-gray-500">{faq.category}</span>
                                                    </div>
                                                    {openFAQ === faq.id ? (
                                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </button>
                                                {openFAQ === faq.id && (
                                                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                                                        <p className="text-gray-700">{faq.answer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

