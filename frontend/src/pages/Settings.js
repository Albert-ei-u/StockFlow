import React, { useState, useEffect } from 'react';
import { User, Settings, Bell, Moon, Sun, LogOut, Users, CreditCard, Globe, Shield, Palette, Database, Lock } from 'lucide-react';
import { dashboardAPI } from '../services/api';

const SettingsPage = ({ user, onLogout }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setDarkMode(settings.darkMode || false);
      setLanguage(settings.language || 'en');
      setNotifications(settings.notifications !== false);
    }
  }, []);

  const saveSettings = () => {
    const settings = {
      darkMode,
      language,
      notifications
    };
    localStorage.setItem('settings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'business', label: 'Business', icon: Globe },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'data', label: 'Data Management', icon: Database },
    { id: 'system', label: 'System', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-6">Settings</h2>
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-5 w-5 mr-3" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          <div className="p-8">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <input
                      type="text"
                      value={user?.role || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'business' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Business Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter business name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Email</label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter business email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter business phone"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Enter business address"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'employees' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Employee Management</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium">Current Employees</h4>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Add Employee
                    </button>
                  </div>
                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      {['John Doe', 'Jane Smith', 'Mike Johnson'].map((employee, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">{employee.name.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium">{employee}</p>
                              <p className="text-sm text-gray-500">Employee</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">A</span>
                            </div>
                          </div>
                          <button className="text-red-600 hover:text-red-800">
                            <LogOut className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="•••••••"
                    />
                  </div>
                  <div className="mt-4">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Change Password
                    </button>
                  </div>
                  <div className="mt-4">
                    <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Preferences</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Dark Mode</span>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        darkMode
                          ? 'bg-blue-600 text-white focus:ring-blue-500'
                          : 'bg-gray-200 text-gray-700 focus:ring-blue-500'
                      }`}
                    >
                      <span className="absolute left-3 h-6 w-6">
                        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      </span>
                      <span className="ml-3">
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                      </span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Language</span>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="rw">Kinyarwanda</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Notifications</span>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        notifications
                          ? 'bg-blue-600 text-white focus:ring-blue-500'
                          : 'bg-gray-200 text-gray-700 focus:ring-blue-500'
                      }`}
                    >
                      <span className="absolute left-3 h-6 w-6">
                        {notifications ? <Bell className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                      </span>
                      <span className="ml-3">
                        {notifications ? 'On' : 'Off'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Data Management</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-md font-medium mb-2">Backup Data</h4>
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Export Backup
                      </button>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-md font-medium mb-2">Clear Cache</h4>
                      <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Clear Application Cache
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">System Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">System Version</label>
                    <div className="px-3 py-2 bg-gray-100 rounded-lg">
                      <p className="text-lg font-medium">StockFlow v1.0.0</p>
                      <p className="text-sm text-gray-500">Last updated: Feb 20, 2026</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Database Status</label>
                    <div className="px-3 py-2 bg-gray-100 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Check for Updates
                    </button>
                    <button className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                      Repair Database
                    </button>
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

export default SettingsPage;
