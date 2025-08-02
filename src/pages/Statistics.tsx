import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, Calendar, Award, Zap, Trophy, Flame, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTaskStore } from '../stores/taskStore';

const Statistics: React.FC = () => {
  const { tasks, stats, loading } = useTaskStore();

  // Calculate comprehensive statistics
  const completedTasks = tasks.filter(task => task.completed);
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;
  const overdueTasks = tasks.filter(task => !task.completed && new Date(task.dueDate) < new Date()).length;
  const todayTasks = tasks.filter(task => {
    const today = new Date().toISOString().split('T')[0];
    const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
    return taskDate === today;
  });

  const currentLevel = stats.currentLevel;
  const currentLevelXP = (currentLevel - 1) * 1000;
  const nextLevelXP = currentLevel * 1000;
  const progressXP = stats.totalXP - currentLevelXP;
  const xpPercentage = (progressXP / (nextLevelXP - currentLevelXP)) * 100;

  // Generate XP progress data for the last 7 days
  const generateXPData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTasks = completedTasks.filter(task => {
        if (!task.completedAt) return false;
        const taskDate = new Date(task.completedAt).toISOString().split('T')[0];
        return taskDate === dateStr;
      });
      
      const dayXP = dayTasks.reduce((sum, task) => sum + task.xpReward, 0);
      
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        xp: dayXP,
        tasks: dayTasks.length,
      });
    }
    
    return data;
  };

  // Generate category distribution data
  const generateCategoryData = () => {
    const categoryCount: Record<string, number> = {};
    tasks.forEach(task => {
      categoryCount[task.category] = (categoryCount[task.category] || 0) + 1;
    });
    
    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
      completed: tasks.filter(t => t.category === category && t.completed).length,
    }));
  };

  const xpData = generateXPData();
  const categoryData = generateCategoryData();

  const statisticsData = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Completed',
      value: completedTasks.length,
      icon: Award,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Current Streak',
      value: stats.currentStreak,
      icon: Calendar,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      title: 'Today\'s Tasks',
      value: todayTasks.length,
      icon: Calendar,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10'
    },
    {
      title: 'Current Level',
      value: currentLevel,
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    }
  ];

  const achievements = [
    {
      title: 'First Task',
      description: 'Complete your first task',
      unlocked: stats.tasksCompleted >= 1,
      icon: Target,
    },
    {
      title: 'Getting Started',
      description: 'Complete 10 tasks',
      unlocked: stats.tasksCompleted >= 10,
      icon: Award,
    },
    {
      title: 'Streak Master',
      description: 'Maintain a 7-day streak',
      unlocked: stats.longestStreak >= 7,
      icon: Flame,
    },
    {
      title: 'Level Up',
      description: 'Reach level 5',
      unlocked: stats.currentLevel >= 5,
      icon: Star,
    },
    {
      title: 'Productivity Pro',
      description: 'Complete 100 tasks',
      unlocked: stats.tasksCompleted >= 100,
      icon: Trophy,
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Statistics
              </h1>
              <p className="text-muted-foreground">Track your productivity and progress</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statisticsData.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass rounded-2xl p-6 border border-white/20 dark:border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.title}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* XP Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 border border-white/20 dark:border-white/10"
        >
          <h2 className="text-xl font-semibold text-foreground mb-6">XP Progress (Last 7 Days)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={xpData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid rgba(75, 85, 99, 0.3)',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'xp' ? `${value} XP` : `${value} tasks`,
                    name === 'xp' ? 'XP Earned' : 'Tasks Completed'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="xp" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-6 border border-white/20 dark:border-white/10"
        >
          <h2 className="text-xl font-semibold text-foreground mb-6">Tasks by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="category" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: '1px solid rgba(75, 85, 99, 0.3)',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" name="Total Tasks" />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass rounded-2xl p-6 border border-white/20 dark:border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Level Progress</h2>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-bold text-foreground">Level {currentLevel}</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{progressXP} XP</span>
              <span>{nextLevelXP - currentLevelXP} XP</span>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.8 }}
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {nextLevelXP - stats.totalXP} XP until Level {currentLevel + 1}
            </div>
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass rounded-2xl p-6 border border-white/20 dark:border-white/10"
        >
          <h2 className="text-xl font-semibold text-foreground mb-6">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className={`p-4 rounded-xl border transition-all ${
                  achievement.unlocked
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800'
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    achievement.unlocked
                      ? 'bg-yellow-100 dark:bg-yellow-900'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <achievement.icon className={`w-5 h-5 ${
                      achievement.unlocked
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-gray-400'
                    }`} />
                  </div>
                  <div>
                    <div className={`font-medium ${
                      achievement.unlocked
                        ? 'text-yellow-800 dark:text-yellow-200'
                        : 'text-gray-500'
                    }`}>
                      {achievement.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {achievement.description}
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <div className="ml-auto">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Statistics;