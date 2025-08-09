import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Palette,
  Download,
  Upload,
  Shield,
  HelpCircle,
  Sun,
  Moon,
  Monitor,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
} from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('appearance');
  const [settings, setSettings] = useState({
    // Appearance
    theme: 'system' as 'light' | 'dark' | 'system',
    accentColor: 'blue',
    animations: true,
    compactMode: false,
    
    // Notifications
    taskReminders: true,
    achievementNotifications: true,
    dailyGoalReminders: true,
    soundEnabled: true,
    
    // Privacy
    dataCollection: true,
    analyticsEnabled: false,
    shareProgress: false,
    
    // Profile
    username: 'TaskMaster',
    email: 'user@example.com',
    timezone: 'UTC',
    language: 'en',
  });

  const [hasChanges, setHasChanges] = useState(false);

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'data', label: 'Data', icon: Download },
    { id: 'help', label: 'Help', icon: HelpCircle },
  ];

  const accentColors = [
    { name: 'blue', color: 'from-blue-500 to-blue-600', label: 'Ocean Blue' },
    { name: 'purple', color: 'from-purple-500 to-purple-600', label: 'Royal Purple' },
    { name: 'green', color: 'from-green-500 to-green-600', label: 'Forest Green' },
    { name: 'orange', color: 'from-orange-500 to-orange-600', label: 'Sunset Orange' },
    { name: 'pink', color: 'from-pink-500 to-pink-600', label: 'Cherry Blossom' },
    { name: 'teal', color: 'from-teal-500 to-teal-600', label: 'Ocean Teal' },
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save settings to localStorage or API
    localStorage.setItem('tidytask-settings', JSON.stringify(settings));
    setHasChanges(false);
    
    // Apply theme changes
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleReset = () => {
    setSettings({
      theme: 'system',
      accentColor: 'blue',
      animations: true,
      compactMode: false,
      taskReminders: true,
      achievementNotifications: true,
      dailyGoalReminders: true,
      soundEnabled: true,
      dataCollection: true,
      analyticsEnabled: false,
      shareProgress: false,
      username: 'TaskMaster',
      email: 'user@example.com',
      timezone: 'UTC',
      language: 'en',
    });
    setHasChanges(true);
  };

  const exportData = () => {
    const data = {
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tidytask-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Theme</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor },
          ].map(({ value, label, icon: Icon }) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSettingChange('theme', value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                settings.theme === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-sm font-medium text-foreground">{label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Accent Color</h3>
        <div className="grid grid-cols-3 gap-3">
          {accentColors.map((color) => (
            <motion.button
              key={color.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSettingChange('accentColor', color.name)}
              className={`p-3 rounded-xl border-2 transition-all ${
                settings.accentColor === color.name
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${color.color} mx-auto mb-2`} />
              <div className="text-xs font-medium text-foreground">{color.label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Display Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Display Options</h3>
        
        <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/20 dark:border-white/10">
          <div>
            <div className="font-medium text-foreground">Animations</div>
            <div className="text-sm text-muted-foreground">Enable smooth transitions and animations</div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSettingChange('animations', !settings.animations)}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.animations ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <motion.div
              animate={{ x: settings.animations ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-6 h-6 bg-white rounded-full shadow-md"
            />
          </motion.button>
        </div>

        <div className="flex items-center justify-between p-4 glass rounded-xl border border-white/20 dark:border-white/10">
          <div>
            <div className="font-medium text-foreground">Compact Mode</div>
            <div className="text-sm text-muted-foreground">Reduce spacing for more content</div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSettingChange('compactMode', !settings.compactMode)}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings.compactMode ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <motion.div
              animate={{ x: settings.compactMode ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-6 h-6 bg-white rounded-full shadow-md"
            />
          </motion.button>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
      
      {[
        {
          key: 'taskReminders',
          title: 'Task Reminders',
          description: 'Get notified about upcoming task deadlines',
          icon: Bell,
        },
        {
          key: 'achievementNotifications',
          title: 'Achievement Notifications',
          description: 'Celebrate when you unlock new achievements',
          icon: Bell,
        },
        {
          key: 'dailyGoalReminders',
          title: 'Daily Goal Reminders',
          description: 'Daily motivation to keep your streak going',
          icon: Bell,
        },
        {
          key: 'soundEnabled',
          title: 'Sound Effects',
          description: 'Play sounds for notifications and interactions',
          icon: settings.soundEnabled ? Volume2 : VolumeX,
        },
      ].map(({ key, title, description, icon: Icon }) => (
        <div
          key={key}
          className="flex items-center justify-between p-4 glass rounded-xl border border-white/20 dark:border-white/10"
        >
          <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="font-medium text-foreground">{title}</div>
              <div className="text-sm text-muted-foreground">{description}</div>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSettingChange(key, !settings[key as keyof typeof settings])}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings[key as keyof typeof settings] ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <motion.div
              animate={{ x: settings[key as keyof typeof settings] ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-6 h-6 bg-white rounded-full shadow-md"
            />
          </motion.button>
        </div>
      ))}
    </div>
  );

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Profile Information</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Username</label>
          <input
            type="text"
            value={settings.username}
            onChange={(e) => handleSettingChange('username', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Email</label>
          <input
            type="email"
            value={settings.email}
            onChange={(e) => handleSettingChange('email', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => handleSettingChange('timezone', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Chicago">Central Time</option>
            <option value="America/Denver">Mountain Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Language</label>
          <select
            value={settings.language}
            onChange={(e) => handleSettingChange('language', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Privacy & Security</h3>
      
      {[
        {
          key: 'dataCollection',
          title: 'Data Collection',
          description: 'Allow collection of usage data to improve the app',
          icon: Eye,
        },
        {
          key: 'analyticsEnabled',
          title: 'Analytics',
          description: 'Share anonymous analytics to help us improve',
          icon: settings.analyticsEnabled ? Eye : EyeOff,
        },
        {
          key: 'shareProgress',
          title: 'Share Progress',
          description: 'Allow sharing of achievements and progress',
          icon: Shield,
        },
      ].map(({ key, title, description, icon: Icon }) => (
        <div
          key={key}
          className="flex items-center justify-between p-4 glass rounded-xl border border-white/20 dark:border-white/10"
        >
          <div className="flex items-center space-x-3">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="font-medium text-foreground">{title}</div>
              <div className="text-sm text-muted-foreground">{description}</div>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSettingChange(key, !settings[key as keyof typeof settings])}
            className={`w-12 h-6 rounded-full transition-colors ${
              settings[key as keyof typeof settings] ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <motion.div
              animate={{ x: settings[key as keyof typeof settings] ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-6 h-6 bg-white rounded-full shadow-md"
            />
          </motion.button>
        </div>
      ))}
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Data Management</h3>
      
      <div className="space-y-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportData}
          className="w-full p-4 glass rounded-xl border border-white/20 dark:border-white/10 hover:bg-white/10 transition-colors flex items-center space-x-3"
        >
          <Download className="w-5 h-5 text-blue-500" />
          <div className="text-left">
            <div className="font-medium text-foreground">Export Data</div>
            <div className="text-sm text-muted-foreground">Download your settings and data</div>
          </div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full p-4 glass rounded-xl border border-white/20 dark:border-white/10 hover:bg-white/10 transition-colors flex items-center space-x-3"
        >
          <Upload className="w-5 h-5 text-green-500" />
          <div className="text-left">
            <div className="font-medium text-foreground">Import Data</div>
            <div className="text-sm text-muted-foreground">Restore from a backup file</div>
          </div>
        </motion.button>

        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
          <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Danger Zone</h4>
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            These actions cannot be undone. Please be careful.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Clear All Data
          </motion.button>
        </div>
      </div>
    </div>
  );

  const renderHelpSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Help & Support</h3>
      
      <div className="space-y-4">
        {[
          { title: 'Getting Started Guide', description: 'Learn the basics of TidyTask' },
          { title: 'Keyboard Shortcuts', description: 'Speed up your workflow' },
          { title: 'FAQ', description: 'Frequently asked questions' },
          { title: 'Contact Support', description: 'Get help from our team' },
          { title: 'Report a Bug', description: 'Help us improve the app' },
          { title: 'Feature Request', description: 'Suggest new features' },
        ].map((item, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 glass rounded-xl border border-white/20 dark:border-white/10 hover:bg-white/10 transition-colors text-left"
          >
            <div className="font-medium text-foreground">{item.title}</div>
            <div className="text-sm text-muted-foreground">{item.description}</div>
          </motion.button>
        ))}
      </div>

      <div className="p-4 glass rounded-xl border border-white/20 dark:border-white/10">
        <h4 className="font-medium text-foreground mb-2">App Information</h4>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div>Version: 1.0.0</div>
          <div>Build: 2024.01.15</div>
          <div>Last Updated: January 15, 2024</div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'appearance':
        return renderAppearanceSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'profile':
        return renderProfileSettings();
      case 'privacy':
        return renderPrivacySettings();
      case 'data':
        return renderDataSettings();
      case 'help':
        return renderHelpSettings();
      default:
        return renderAppearanceSettings();
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl shadow-lg">
                <SettingsIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-muted-foreground">Customize your TidyTask experience</p>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="glass rounded-2xl p-6 border border-white/20 dark:border-white/10 sticky top-8">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </motion.button>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <div className="glass rounded-2xl p-6 border border-white/20 dark:border-white/10">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderTabContent()}
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="fixed bottom-8 right-8 flex space-x-3"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="px-6 py-3 glass border border-white/20 dark:border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-colors flex items-center space-x-2"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;