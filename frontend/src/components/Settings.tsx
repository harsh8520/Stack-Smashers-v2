import { useState, useEffect } from 'react';
import {
    FileText,
    History,
    Settings as SettingsIcon,
    User,
    Zap,
    LogOut
} from 'lucide-react';
import { getCurrentUser, signOut as authSignOut } from '../services/authService';

type SettingsProps = {
    onNavigate: (screen: 'landing' | 'login' | 'signup' | 'dashboard' | 'processing' | 'results' | 'history' | 'settings') => void;
};

export default function Settings({ onNavigate }: SettingsProps) {
    const [activeNav, setActiveNav] = useState('settings');
    const [userEmail, setUserEmail] = useState<string>('');
    const [userName, setUserName] = useState<string>('');

    useEffect(() => {
        // Get current user from auth service
        const user = getCurrentUser();
        if (user) {
            setUserEmail(user.email);
            // Extract name from email (before @) as fallback
            const emailName = user.email.split('@')[0];
            setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
        }
    }, []);

    const handleLogout = () => {
        if (confirm('Are you sure you want to log out?')) {
            authSignOut();
            onNavigate('landing');
        }
    };

    const navItems = [
        { id: 'review', icon: FileText, label: 'Review Content' },
        { id: 'history', icon: History, label: 'History' },
        { id: 'settings', icon: SettingsIcon, label: 'Settings' },
    ];

    const handleNavClick = (id: string) => {
        setActiveNav(id);
        if (id === 'review') {
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
                        </div>
                        <div className="text-xs text-gray-600 mb-2">2 of 5 reviews used</div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#2563EB] w-[40%]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-[#F8FAFC]">
                {/* Content */}
                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="max-w-md w-full">
                        <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 text-center">
                            {/* User Avatar */}
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <User className="w-10 h-10 text-white" />
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-2">{userName}</h2>
                                <p className="text-sm text-gray-600">{userEmail}</p>
                            </div>

                            {/* Simple Logout Text Link */}
                            <button
                                onClick={handleLogout}
                                className="text-red-600 hover:text-red-700 font-medium text-sm underline"
                            >
                                Logout
                            </button>

                            {/* Additional Info */}
                            <p className="text-xs text-gray-500 mt-6">
                                Need to update your settings? Contact support.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}