import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Target, Zap, Trophy } from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';

const Home: React.FC = () => {
  const { tasks, stats } = useTaskStore();
  
  const features = [
    {
      icon: Target,
      title: 'Smart Goals',
      description: 'Set and track meaningful objectives with intelligent reminders',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Zap,
      title: 'XP System',
      description: 'Earn experience points and level up as you complete tasks',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Trophy,
      title: 'Achievements',
      description: 'Unlock badges and celebrate your productivity milestones',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  const completionRate = tasks.length > 0 
    ? Math.round((stats.tasksCompleted / tasks.length) * 100) 
    : 0;
  
  const pendingTasks = tasks.filter(task => !task.completed).length;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center space-y-8 mb-16"
        >
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl"
              >
                <CheckSquare className="w-12 h-12 text-white" />
              </motion.div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to TidyTask
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform your productivity with gamified task management. 
              Level up your life, one task at a time.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              Get Started
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 glass border border-white/20 dark:border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Learn More
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          className="grid md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass rounded-2xl p-8 border border-white/20 dark:border-white/10 hover:border-white/30 dark:hover:border-white/20 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} p-3 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          variants={itemVariants}
          className="mt-16 glass rounded-2xl p-8 border border-white/20 dark:border-white/10 relative overflow-hidden"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-5">
            <motion.div
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className="w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
              style={{ backgroundSize: '400% 400%' }}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                {stats.tasksCompleted.toLocaleString()}
              </motion.div>
              <div className="text-sm text-muted-foreground">Tasks Completed</div>
            </div>
            <div className="space-y-2">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
              >
                {completionRate}%
              </motion.div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="space-y-2">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
                className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent"
              >
                Level {stats.currentLevel}
              </motion.div>
              <div className="text-sm text-muted-foreground">Current Level</div>
            </div>
            <div className="space-y-2">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: 'spring' }}
                className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                {stats.currentStreak}
              </motion.div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-8 flex justify-center space-x-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
            >
              Add Quick Task
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 glass border border-white/20 dark:border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              View Progress
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;