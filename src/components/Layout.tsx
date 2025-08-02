import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, Sun, Moon, Zap, Home, ListTodo, BarChart3, Settings, User, LogOut } from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import AuthModal from './AuthModal';
import ConfettiEffect from './ConfettiEffect';
import { useTaskScheduler } from '@/hooks/useTaskScheduler';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const location = useLocation();
  const { stats, syncing, notifications, removeNotification } = useTaskStore();
  const { user, signOut, loading: authLoading } = useAuthStore();

  // Initialize task scheduler
  useTaskScheduler();

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Load user data when authenticated
  useEffect(() => {
    if (user) {
      const { loadTasks, loadUserStats } = useTaskStore.getState();
      loadTasks();
      loadUserStats();
    }
  }, [user]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (!isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    // Clear tasks when signing out
    useTaskStore.setState({ tasks: [], stats: {
      totalXP: 0,
      currentLevel: 1,
      currentStreak: 0,
      longestStreak: 0,
      tasksCompleted: 0,
      lastCompletionDate: null,
    }});
  };

  const currentLevelXP = (stats.currentLevel - 1) * 1000;
  const nextLevelXP = stats.currentLevel * 1000;
  const progressXP = stats.totalXP - currentLevelXP;
  const xpPercentage = (progressXP / (nextLevelXP - currentLevelXP)) * 100;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/today', label: 'Today', icon: ListTodo },
    { path: '/statistics', label: 'Statistics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const NotificationToast = ({ notification }: { notification: any }) => (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      onClick={() => removeNotification(notification.id)}
      className={`p-4 rounded-xl shadow-lg border backdrop-blur-lg ${
        notification.type === 'success' 
          ? 'bg-green-50/90 dark:bg-green-900/90 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
          : notification.type === 'achievement'
          ? 'bg-yellow-50/90 dark:bg-yellow-900/90 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
          : 'bg-blue-50/90 dark:bg-blue-900/90 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
      }`}
    >
      <div className="flex items-center space-x-2">
        <Zap className="w-4 h-4" />
        <span className="text-sm font-medium">{notification.message}</span>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Top Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="sticky top-0 z-50 glass border-b border-white/20 dark:border-white/10 backdrop-blur-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-3"
            >
              <Link to="/" className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TidyTask
                </h1>
              </Link>
            </motion.div>

            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'text-muted-foreground hover:text-foreground hover:bg-white/10'
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* XP Progress Bar */}
            {user && (
              <div className="flex-1 max-w-md mx-8 hidden lg:block">
              <div className="flex items-center space-x-3">
                {syncing && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"
                  />
                )}
                <Zap className="w-4 h-4 text-yellow-500" />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span>Level {stats.currentLevel}</span>
                    <span>{progressXP}/{nextLevelXP - currentLevelXP} XP</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPercentage}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-sm"
                    />
                  </div>
                </div>
              </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              {/* User Menu */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block text-right">
                    <div className="text-sm font-medium text-foreground">
                      {user.user_metadata?.username || user.email}
                    </div>
                    <div className="text-xs text-muted-foreground">Level {stats.currentLevel}</div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSignOut}
                    className="p-2 rounded-xl glass border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-muted-foreground" />
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </motion.button>
              )}

              {/* Theme Toggle */}
              <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-xl glass border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
            >
              <AnimatePresence mode="wait">
                {isDark ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sun className="w-5 h-5 text-yellow-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon className="w-5 h-5 text-blue-600" />
                  </motion.div>
                )}
              </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      {/* Notification Toasts */}
      <div className="fixed top-20 right-4 z-40 space-y-2">
        <AnimatePresence>
          {notifications.slice(0, 5).map((notification) => (
            <NotificationToast 
              key={notification.id} 
              notification={notification} 
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Confetti Effect */}
      <ConfettiEffect />

      {/* Main Content */}
      <main className="relative">
        {authLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
            />
          </div>
        ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={location?.pathname || 'default'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.2,
                  },
                },
              }}
            >
              {children || <Outlet />}
            </motion.div>
          </motion.div>
        </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default Layout;