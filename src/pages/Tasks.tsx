import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Calendar, Target, Zap } from 'lucide-react';
import TaskList from '@/components/TaskList';
import AddTaskModal from '@/components/AddTaskModal';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate: string;
  xpReward: number;
  createdAt: string;
  completedAt?: string;
  favorite?: boolean;
  tags?: string[];
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly';
  repeatUntil?: string;
}

const Tasks: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  
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

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || task.category === filterCategory;
    const matchesPriority = !filterPriority || task.priority === filterPriority;
    const matchesCompleted = showCompleted || !task.completed;
    
    return matchesSearch && matchesCategory && matchesPriority && matchesCompleted;
  });

  const categories = Array.from(new Set(tasks.map(task => task.category))).filter(Boolean);

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
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                All Tasks
              </h1>
              <p className="text-muted-foreground">Manage and organize all your tasks</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-4 border border-blue-200/40 dark:border-blue-400/20"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-4 border border-emerald-200/40 dark:border-emerald-400/20"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{tasks.filter(t => t.completed).length}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-4 border border-purple-200/40 dark:border-purple-400/20"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.totalXP}</div>
                <div className="text-sm text-muted-foreground">Total XP</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl p-4 border border-amber-200/40 dark:border-amber-400/20"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">{tasks.filter(t => !t.completed).length}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="glass rounded-2xl p-6 border border-blue-200/40 dark:border-blue-400/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            {/* Show Completed Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showCompleted"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="showCompleted" className="text-sm text-foreground">
                Show Completed
              </label>
            </div>
          </div>
        </div>

        {/* Add Task Button */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={syncing}
            onClick={() => setIsModalOpen(true)}
            className={`px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-3 ${
              syncing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
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

        {/* Tasks List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Tasks ({filteredTasks.length})
            </h2>
            {filteredTasks.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {filteredTasks.filter(t => t.completed).length} completed, {filteredTasks.filter(t => !t.completed).length} pending
              </div>
            )}
          </div>
          
          <TaskList 
            tasks={filteredTasks} 
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onToggleFavorite={handleToggleFavorite}
          />
        </motion.div>
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

export default Tasks;