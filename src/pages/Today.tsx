import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Target, Zap, CheckCircle, Clock, Star } from 'lucide-react';
import TaskList from '@/components/TaskList';
import AddTaskModal from '@/components/AddTaskModal';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { Task } from '@/stores/taskStore';

const motivationalMessages = [
  "Every small step counts towards your big goals! 🌟",
  "Today is a fresh start - make it count! 💪",
  "You're capable of amazing things! ✨",
  "Progress, not perfection. Keep going! 🚀",
  "Your future self will thank you for today's efforts! 🙏",
  "Small wins lead to big victories! 🏆",
  "Believe in yourself - you've got this! 💫",
  "Every task completed is a step closer to your dreams! 🌈",
  "Today's productivity is tomorrow's success! ⭐",
  "You're building something amazing, one task at a time! 🏗️"
];

const Today: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [dailyMessage] = useState(() => {
    const today = new Date().toDateString();
    const savedMessage = localStorage.getItem(`dailyMessage-${today}`);
    if (savedMessage) return savedMessage;
    
    const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
    localStorage.setItem(`dailyMessage-${today}`, message);
    return message;
  });
  
  const { user } = useAuthStore();
  const { 
    tasks, 
    stats,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    toggleTaskFavorite,
    loading,
    syncing,
    syncWithServer
  } = useTaskStore();

  // Load tasks on component mount
  useEffect(() => {
    if (user) {
      syncWithServer();
    }
  }, [user, syncWithServer]);

  // Redirect to sign in if not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="glass rounded-2xl p-8 border border-white/20 dark:border-white/10">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Authentication Required</h3>
            <p className="text-muted-foreground">
              Please sign in to access your tasks and start your productivity journey!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Filter tasks for today and overdue
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate).toISOString().split('T')[0];
    return taskDate === todayStr;
  });

  const overdueTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    return taskDate < today && !task.completed;
  });

  const upcomingTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    return taskDate > today && !task.completed;
  }).slice(0, 5);

  const completedToday = todayTasks.filter(task => task.completed).length;
  const totalToday = todayTasks.length;
  const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  const handleToggleComplete = (id: string) => {
    toggleTaskComplete(id);
  };

  const handleToggleFavorite = (id: string) => {
    toggleTaskFavorite(id);
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(id);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleAddTask = (newTaskData: {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    category: string;
    dueDate: string;
    xpReward: number;
    tags?: string[];
  }) => {
    if (editingTask) {
      updateTask(editingTask.id, newTaskData);
      setEditingTask(null);
    } else {
      addTask(newTaskData);
    }
  };

  const currentLevelXP = (stats.currentLevel - 1) * 1000;
  const nextLevelXP = stats.currentLevel * 1000;
  const progressXP = stats.totalXP - currentLevelXP;
  const xpPercentage = (progressXP / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      {loading && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
          <div className="glass rounded-xl p-4 border border-white/20 dark:border-white/10 flex items-center space-x-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
            />
            <span className="text-sm text-foreground">Loading tasks...</span>
          </div>
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header with Daily Message */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6 border border-white/20 dark:border-white/10 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20"
          >
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl border border-yellow-200 dark:border-yellow-800"
            >
              <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                {dailyMessage}
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-4 border border-white/20 dark:border-white/10"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{totalToday}</div>
                <div className="text-sm text-muted-foreground">Today's Tasks</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-4 border border-white/20 dark:border-white/10"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{completedToday}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-4 border border-white/20 dark:border-white/10"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{completionRate}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl p-4 border border-white/20 dark:border-white/10"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Zap className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.currentStreak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 border border-white/20 dark:border-white/10"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Level Progress</h2>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-bold text-foreground">Level {stats.currentLevel}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{progressXP} XP</span>
              <span>{nextLevelXP - currentLevelXP} XP</span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.7 }}
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
              />
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {nextLevelXP - stats.totalXP} XP until Level {stats.currentLevel + 1}
            </div>
          </div>
        </motion.div>

        {/* Add Task Button */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={syncing}
            onClick={() => setIsModalOpen(true)}
            className={`px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow flex items-center space-x-3 ${
              syncing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
            } text-white`}
          >
            {syncing ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <Plus className="w-6 h-6" />
            )}
            <span className="text-lg">Add New Task</span>
          </motion.button>
        </div>

        {/* Overdue Tasks */}
        {overdueTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">
                Overdue Tasks ({overdueTasks.length})
              </h2>
            </div>
            <TaskList 
              tasks={overdueTasks} 
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onToggleFavorite={handleToggleFavorite}
            />
          </motion.div>
        )}

        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="space-y-4"
        >
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-foreground">
              Today's Tasks ({todayTasks.length})
            </h2>
          </div>
          <TaskList 
            tasks={todayTasks} 
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onToggleFavorite={handleToggleFavorite}
          />
        </motion.div>

        {/* Upcoming Tasks Preview */}
        {upcomingTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-foreground">
              Upcoming Tasks
            </h2>
            <div className="glass rounded-xl p-4 border border-white/20 dark:border-white/10">
              <div className="space-y-2">
                {upcomingTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-foreground">{task.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      +{task.xpReward} XP
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onAddTask={handleAddTask}
        editingTask={editingTask}
      />
    </div>
  );
};

export default Today;