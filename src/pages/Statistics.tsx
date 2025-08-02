import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Target, Calendar, Award, Zap } from 'lucide-react';
import { useTaskStore } from '../stores/taskStore';

const Statistics: React.FC = () => {
  const { tasks, stats } = useTaskStore();

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const overdueTasks = tasks.filter(task => 
    !task.completed && task.dueDate && new Date(task.dueDate) < new Date()
  ).length;

  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
  const currentLevel = stats.currentLevel;
  const xpForNextLevel = (currentLevel * 1000) - stats.totalXP;

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
      value: completedTasks,
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
      title: 'Current Level',
      value: currentLevel,
      icon: Zap,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      title: 'Overdue Tasks',
      value: overdueTasks,
      icon: BarChart3,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Statistics</h1>
        <p className="text-muted-foreground mb-8">Track your productivity and progress</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statisticsData.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 hover:bg-card/70 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.title}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">Level Progress</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Level {currentLevel}</span>
              <span className="text-sm text-muted-foreground">{stats.totalXP} XP</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${((stats.totalXP % 1000) / 1000) * 100}%` }}
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {xpForNextLevel} XP until Level {currentLevel + 1}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Statistics;