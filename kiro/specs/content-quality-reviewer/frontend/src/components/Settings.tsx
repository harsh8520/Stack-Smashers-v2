import { useState } from 'react';
import {
    LayoutDashboard,
    FileText,
    History,
    BarChart3,
    Settings as SettingsIcon,
    Search,
    Bell,
    User,
    Zap,
    ChevronDown,
    Sparkles,
    Shield,
    Moon,
    Sun,
    Mail,
    Lock,
    CreditCard,
    Database,
    Trash2
} from 'lucide-react';

type SettingsProps = {
    onNavigate: (screen: 'landing' | 'login' | 'signup' | 'dashboard' | 'processing' | 'results' | 'history' | 'settings') => void;
};

export default function Settings({ onNavigate }: SettingsProps) {
    const [activeNav, setActiveNav] = useState('settings');
    const [darkMode, setDarkMode] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [dataSharing, setDataSharing] = useState(false);

    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'review', icon: FileText, label: 'Review Content' },
        { id: 'history', icon: History, label: 'History' },
        { id: 'analytics', icon: BarChart3, label: 'Analytics' },
        { id: 'settings', icon: SettingsIcon, label: 'Settings' },
    ];

    const handleNavClick = (id: string) => {
        setActiveNav(id);
        if (id === 'review' || id === 'dashboard') {
            onNavigate('dashboard');
        } else if (id === 'history') {
            onNavigate('history');
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex">
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col">
                <div className="p-6 border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold">ContentLens AI</span>
                    </div>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.id}>
                                <button
                                    onClick={() => handleNavClick(item.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activeNav === item.id
                                            ? 'bg-blue-50 text-[#2563EB]'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="text-sm font-medium">{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-[#E5E7EB]">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-700">Free Plan</span>
                            <Sparkles className="w-4 h-4 text-[#2563EB]" />
                        </div>
                        <div className="text-xs text-gray-600 mb-2">2 of 5 reviews used</div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#2563EB] w-[40%]"></div>
                        </div>
                        <button className="text-xs text-[#2563EB] font-medium mt-3 hover:underline">
                            Upgrade to Pro
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Bar */}
                <div className="bg-white border-b border-[#E5E7EB] px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative">
                                <Bell className="w-5 h-5 text-gray-600" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-600" />
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-8">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold mb-1">Settings</h1>
                        <p className="text-sm text-gray-600">Manage your account and preferences</p>
                    </div>

                    <div className="max-w-4xl space-y-6">
                        {/* Profile Information */}
                        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold">Profile Information</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            defaultValue="John Doe"
                                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email</label>
                                        <input
                                            type="email"
                                            defaultValue="john@example.com"
                                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Bio</label>
                                    <textarea
                                        rows={3}
                                        defaultValue="Student creator passionate about tech and education."
                                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-sm resize-none"
                                    />
                                </div>
                                <button className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#1d4ed8] transition-colors">
                                    Save Changes
                                </button>
                            </div>
                        </div>

                        {/* Appearance */}
                        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                {darkMode ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-gray-600" />}
                                <h3 className="font-semibold">Appearance</h3>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium mb-1">Dark Mode</div>
                                    <div className="text-xs text-gray-600">Use dark theme across the application</div>
                                </div>
                                <button
                                    onClick={() => setDarkMode(!darkMode)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-[#2563EB]' : 'bg-gray-300'
                                        }`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'
                                        }`}></div>
                                </button>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Bell className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold">Notifications</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium mb-1">Email Notifications</div>
                                        <div className="text-xs text-gray-600">Receive analysis results via email</div>
                                    </div>
                                    <button
                                        onClick={() => setEmailNotifications(!emailNotifications)}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${emailNotifications ? 'bg-[#2563EB]' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                                            }`}></div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Lock className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold">Security</h3>
                            </div>
                            <div className="space-y-4">
                                <button
                                    onClick={() => alert('Password change form would appear here')}
                                    className="flex items-center justify-between w-full p-4 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="text-left">
                                        <div className="text-sm font-medium mb-1">Change Password</div>
                                        <div className="text-xs text-gray-600">Update your password regularly for security</div>
                                    </div>
                                    <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
                                </button>
                                <button
                                    onClick={() => alert('Two-factor authentication setup would appear here')}
                                    className="flex items-center justify-between w-full p-4 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="text-left">
                                        <div className="text-sm font-medium mb-1">Two-Factor Authentication</div>
                                        <div className="text-xs text-gray-600">Add an extra layer of security</div>
                                    </div>
                                    <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
                                </button>
                            </div>
                        </div>

                        {/* Billing */}
                        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold">Billing & Plan</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-sm font-medium">Current Plan: Free</div>
                                        <Sparkles className="w-4 h-4 text-[#2563EB]" />
                                    </div>
                                    <div className="text-xs text-gray-600 mb-3">2 of 5 reviews used this month</div>
                                    <button className="px-4 py-2 bg-[#2563EB] text-white text-sm rounded-lg hover:bg-[#1d4ed8] transition-colors">
                                        Upgrade to Pro
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Privacy & Data */}
                        <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold">Privacy & Data</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium mb-1">Data Sharing</div>
                                        <div className="text-xs text-gray-600">Allow anonymous data for improving AI models</div>
                                    </div>
                                    <button
                                        onClick={() => setDataSharing(!dataSharing)}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${dataSharing ? 'bg-[#2563EB]' : 'bg-gray-300'
                                            }`}
                                    >
                                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${dataSharing ? 'translate-x-6' : 'translate-x-0.5'
                                            }`}></div>
                                    </button>
                                </div>
                                <div className="pt-4 border-t border-[#E5E7EB]">
                                    <button
                                        onClick={() => alert('Your data download would start here')}
                                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
                                    >
                                        <Database className="w-4 h-4" />
                                        Download My Data
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-white border border-red-200 rounded-lg p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Trash2 className="w-5 h-5 text-red-600" />
                                <h3 className="font-semibold text-red-600">Danger Zone</h3>
                            </div>
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600">
                                    Once you delete your account, there is no going back. All your content reviews and data will be permanently deleted.
                                </p>
                                <button className="px-4 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}