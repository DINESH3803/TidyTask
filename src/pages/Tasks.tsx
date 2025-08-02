import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Sparkles } from 'lucide-react';
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
}

const Tasks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created' | 'title'>('dueDate');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const { user } = useAuthStore();
  const { 
    tasks, 
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    toggleTaskFavorite,
    loading,
    syncing
  } = useTaskStore();

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
      // Update existing task
      updateTask(editingTask.id, { ...newTaskData, dueDate: newTaskData.dueDate, xpReward: newTaskData.xpReward });
      setEditingTask(null);
    } else {
      // Add new task
      addTask(newTaskData);
    }
  };

  const filteredAndSortedTasks = tasks
    .filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filterStatus === 'all' ? true :
      filterStatus === 'completed' ? task.completed :
      !task.completed;
    const matchesPriority = filterPriority === 'all' ? true : task.priority === filterPriority;
    return matchesSearch && matchesFilter && matchesPriority;
  })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length,
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
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={syncing}
              onClick={() => setIsModalOpen(true)}
              className={`px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow flex items-center space-x-2 ${
                syncing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              } text-white`}
            >
              {syncing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
              <Plus className="w-5 h-5" />
              )}
              <span>Add Task</span>
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4 border border-white/20 dark:border-white/10">
            <div className="text-2xl font-bold text-blue-600">{taskStats.total}</div>
            <div className="text-sm text-muted-foreground">Total Tasks</div>
          </div>
          <div className="glass rounded-xl p-4 border border-white/20 dark:border-white/10">
            <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="glass rounded-xl p-4 border border-white/20 dark:border-white/10">
            <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </div>
          <div className="glass rounded-xl p-4 border border-white/20 dark:border-white/10">
            <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid md:grid-cols-4 gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 glass border border-white/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground placeholder-muted-foreground"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'completed')}
            className="px-4 py-3 glass border border-white/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as 'all' | 'low' | 'medium' | 'high')}
            className="px-4 py-3 glass border border-white/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority' | 'created' | 'title')}
            className="px-4 py-3 glass border border-white/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="created">Sort by Created</option>
            <option value="title">Sort by Title</option>
          </select>
        </div>

        <TaskList 
          tasks={filteredAndSortedTasks} 
          onToggleComplete={handleToggleComplete}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onToggleFavorite={handleToggleFavorite}
        />
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