import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from './authStore';
import type { DatabaseTask, DatabaseProfile } from '@/lib/supabase';

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

interface TaskStore {
  tasks: Task[];
  stats: {
    totalXP: number;
    currentLevel: number;
    currentStreak: number;
    longestStreak: number;
    tasksCompleted: number;
    lastCompletionDate: string | null;
  };
  loading: boolean;
  syncing: boolean;
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'achievement' | 'info';
    timestamp: number;
  }>;
  
  // Task actions
  loadTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  toggleTaskFavorite: (id: string) => Promise<void>;
  
  // Stats actions
  loadUserStats: () => Promise<void>;
  updateUserStats: () => Promise<void>;
  
  // Notification actions
  addNotification: (message: string, type?: 'success' | 'achievement' | 'info') => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Repeat task actions
  processRepeatingTasks: () => Promise<void>;
  
  // Sync actions
  syncWithServer: () => Promise<void>;
  
  // Utility actions
  clearAllTasks: () => Promise<void>;
}

const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 1000) + 1;
};

const calculateXPForLevel = (level: number): number => {
  return (level - 1) * 1000;
};

const calculateStreak = (tasks: Task[]): { current: number; longest: number } => {
  const completedTasks = tasks
    .filter(task => task.completed && task.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  if (completedTasks.length === 0) return { current: 0, longest: 0 };

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Group tasks by date
  const tasksByDate = new Map<string, Task[]>();
  completedTasks.forEach(task => {
    const date = new Date(task.completedAt!);
    date.setHours(0, 0, 0, 0);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!tasksByDate.has(dateKey)) {
      tasksByDate.set(dateKey, []);
    }
    tasksByDate.get(dateKey)!.push(task);
  });

  // Calculate current streak
  let checkDate = new Date(today);
  let hasTaskToday = tasksByDate.has(checkDate.toISOString().split('T')[0]);
  
  if (!hasTaskToday) {
    checkDate = new Date(yesterday);
  }

  while (tasksByDate.has(checkDate.toISOString().split('T')[0])) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Calculate longest streak
  const sortedDates = Array.from(tasksByDate.keys()).sort();
  tempStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const daysDiff = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
  return { current: currentStreak, longest: longestStreak };
};

const transformDatabaseTask = (dbTask: DatabaseTask): Task => ({
  id: dbTask.id,
  title: dbTask.title,
  description: dbTask.description,
  completed: dbTask.completed,
  priority: dbTask.priority,
  category: dbTask.category,
  dueDate: dbTask.due_date,
  xpReward: dbTask.xp_reward,
  createdAt: dbTask.created_at,
  completedAt: dbTask.completed_at,
  favorite: dbTask.favorite,
  tags: dbTask.tags,
  repeat: 'none', // Default for now, can be extended
  repeatUntil: undefined,
});

const transformTaskToDatabase = (task: Omit<Task, 'id' | 'createdAt'>, userId: string): Omit<DatabaseTask, 'id' | 'created_at'> => ({
  title: task.title,
  description: task.description,
  completed: task.completed,
  priority: task.priority,
  category: task.category,
  due_date: task.dueDate,
  xp_reward: task.xpReward,
  completed_at: task.completedAt,
  favorite: task.favorite,
  tags: task.tags,
  user_id: userId,
});

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      stats: {
        totalXP: 0,
        currentLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
        tasksCompleted: 0,
        lastCompletionDate: null,
      },
      loading: false,
      syncing: false,
      notifications: [],

      loadTasks: async () => {
        const { user } = useAuthStore.getState();
        if (!user || !supabase) return;

        try {
          set({ loading: true });
          
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const tasks = data.map(transformDatabaseTask);
          set({ tasks });
          
          // Update stats after loading tasks
          get().updateUserStats();
        } catch (error) {
          console.error('Error loading tasks:', error);
          get().addNotification('Failed to load tasks', 'info');
        } finally {
          set({ loading: false });
        }
      },

      addTask: async (taskData) => {
        const { user } = useAuthStore.getState();
        if (!user || !supabase) return;

        try {
          set({ syncing: true });
          
          const dbTask = transformTaskToDatabase(taskData, user.id);
          
          const { data, error } = await supabase
            .from('tasks')
            .insert(dbTask)
            .select()
            .single();

          if (error) throw error;

          const newTask = transformDatabaseTask(data);
          set(state => ({ tasks: [newTask, ...state.tasks] }));
          
          get().updateUserStats();
          get().addNotification('Task created successfully!', 'success');
        } catch (error) {
          console.error('Error adding task:', error);
          get().addNotification('Failed to create task', 'info');
        } finally {
          set({ syncing: false });
        }
      },

      updateTask: async (id, updates) => {
        const { user } = useAuthStore.getState();
        if (!user || !supabase) return;

        try {
          set({ syncing: true });
          
          const dbUpdates: Partial<DatabaseTask> = {};
          if (updates.title) dbUpdates.title = updates.title;
          if (updates.description) dbUpdates.description = updates.description;
          if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
          if (updates.priority) dbUpdates.priority = updates.priority;
          if (updates.category) dbUpdates.category = updates.category;
          if (updates.dueDate) dbUpdates.due_date = updates.dueDate;
          if (updates.xpReward) dbUpdates.xp_reward = updates.xpReward;
          if (updates.completedAt) dbUpdates.completed_at = updates.completedAt;
          if (updates.favorite !== undefined) dbUpdates.favorite = updates.favorite;
          if (updates.tags) dbUpdates.tags = updates.tags;

          const { error } = await supabase
            .from('tasks')
            .update(dbUpdates)
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

          set(state => ({
            tasks: state.tasks.map(task =>
              task.id === id ? { ...task, ...updates } : task
            ),
          }));
          
          get().updateUserStats();
        } catch (error) {
          console.error('Error updating task:', error);
          get().addNotification('Failed to update task', 'info');
        } finally {
          set({ syncing: false });
        }
      },

      deleteTask: async (id) => {
        const { user } = useAuthStore.getState();
        if (!user || !supabase) return;

        try {
          set({ syncing: true });
          
          const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id);

          if (error) throw error;

          set(state => ({
            tasks: state.tasks.filter(task => task.id !== id),
          }));
          
          get().updateUserStats();
          get().addNotification('Task deleted', 'info');
        } catch (error) {
          console.error('Error deleting task:', error);
          get().addNotification('Failed to delete task', 'info');
        } finally {
          set({ syncing: false });
        }
      },

      toggleTaskComplete: async (id) => {
        const { tasks, stats } = get();
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const now = new Date().toISOString();
        const wasCompleted = task.completed;
        const updates: Partial<Task> = {
          completed: !task.completed,
          completedAt: !task.completed ? now : undefined,
        };

        await get().updateTask(id, updates);

        // Show completion effects
        if (!wasCompleted) {
          const oldLevel = stats.currentLevel;
          
          // Add XP notification
          get().addNotification(`+${task.xpReward} XP earned!`, 'success');
          
          // Check for level up after stats update
          setTimeout(() => {
            const newStats = get().stats;
            if (newStats.currentLevel > oldLevel) {
              get().addNotification(`🎉 Level Up! You're now level ${newStats.currentLevel}!`, 'achievement');
            }
          }, 100);

          // Trigger confetti effect
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('taskCompleted', { 
              detail: { task, xp: task.xpReward } 
            }));
          }
        }
      },

      toggleTaskFavorite: async (id) => {
        const { tasks } = get();
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        await get().updateTask(id, { favorite: !task.favorite });
      },

      loadUserStats: async () => {
        const { user } = useAuthStore.getState();
        if (!user || !supabase) return;

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (error) throw error;

          set({
            stats: {
              totalXP: data.total_xp,
              currentLevel: data.current_level,
              currentStreak: data.current_streak,
              longestStreak: data.longest_streak,
              tasksCompleted: data.tasks_completed,
              lastCompletionDate: data.last_completion_date,
            },
          });
        } catch (error) {
          console.error('Error loading user stats:', error);
        }
      },

      updateUserStats: async () => {
        const { user } = useAuthStore.getState();
        const { tasks } = get();
        if (!user || !supabase) return;

        try {
          const completedTasks = tasks.filter(t => t.completed);
          const totalXP = completedTasks.reduce((sum, task) => sum + task.xpReward, 0);
          const streaks = calculateStreak(tasks);
          const currentLevel = calculateLevel(totalXP);
          const lastCompletionDate = completedTasks.length > 0 
            ? completedTasks.sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0].completedAt!
            : null;

          const newStats = {
            totalXP,
            currentLevel,
            currentStreak: streaks.current,
            longestStreak: streaks.longest,
            tasksCompleted: completedTasks.length,
            lastCompletionDate,
          };

          // Update local state
          set({ stats: newStats });

          // Update database
          const { error } = await supabase
            .from('profiles')
            .update({
              total_xp: totalXP,
              current_level: currentLevel,
              current_streak: streaks.current,
              longest_streak: streaks.longest,
              tasks_completed: completedTasks.length,
              last_completion_date: lastCompletionDate,
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

          if (error) throw error;
        } catch (error) {
          console.error('Error updating user stats:', error);
        }
      },

      addNotification: (message, type = 'info') => {
        const notification = {
          id: Date.now().toString(),
          message,
          type,
          timestamp: Date.now(),
        };
        
        set(state => ({
          notifications: [notification, ...state.notifications.slice(0, 4)] // Keep max 5 notifications
        }));

        // Auto-remove after 5 seconds
        setTimeout(() => {
          get().removeNotification(notification.id);
        }, 5000);
      },

      removeNotification: (id) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      processRepeatingTasks: async () => {
        const { tasks } = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const task of tasks) {
          if (task.repeat === 'none' || !task.completed) continue;

          const completedDate = new Date(task.completedAt!);
          completedDate.setHours(0, 0, 0, 0);

          let shouldRepeat = false;
          let nextDueDate = new Date(task.dueDate);

          switch (task.repeat) {
            case 'daily':
              shouldRepeat = completedDate < today;
              nextDueDate.setDate(nextDueDate.getDate() + 1);
              break;
            case 'weekly':
              const weeksDiff = Math.floor((today.getTime() - completedDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
              shouldRepeat = weeksDiff >= 1;
              nextDueDate.setDate(nextDueDate.getDate() + 7);
              break;
            case 'monthly':
              shouldRepeat = today.getMonth() !== completedDate.getMonth() || today.getFullYear() !== completedDate.getFullYear();
              nextDueDate.setMonth(nextDueDate.getMonth() + 1);
              break;
          }

          if (shouldRepeat && (!task.repeatUntil || new Date(task.repeatUntil) >= today)) {
            // Create new task instance
            const newTask = {
              ...task,
              completed: false,
              completedAt: undefined,
              dueDate: nextDueDate.toISOString(),
            };
            delete (newTask as any).id;
            delete (newTask as any).createdAt;

            await get().addTask(newTask);
          }
        }
      },

      syncWithServer: async () => {
        await get().loadTasks();
        await get().loadUserStats();
        await get().processRepeatingTasks();
      },

      clearAllTasks: async () => {
        const { user } = useAuthStore.getState();
        if (!user || !supabase) return;

        try {
          set({ syncing: true });
          
          const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('user_id', user.id);

          if (error) throw error;

          set({ tasks: [] });
          get().updateUserStats();
          get().addNotification('All tasks cleared', 'info');
        } catch (error) {
          console.error('Error clearing tasks:', error);
          get().addNotification('Failed to clear tasks', 'info');
        } finally {
          set({ syncing: false });
        }
      },
    }),
    {
      name: 'task-storage',
      partialize: (state) => ({ 
        tasks: state.tasks,
        stats: state.stats,
      }),
    }
  )
);