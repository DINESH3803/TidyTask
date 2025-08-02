import { create } from 'zustand';
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
  
  // Sync actions
  syncWithServer: () => Promise<void>;
  
  // Utility actions
  clearAllTasks: () => Promise<void>;
}

const calculateLevel = (xp: number): number => {
  return Math.floor(xp / 1000) + 1;
};

const calculateStreak = (tasks: Task[]): { current: number; longest: number } => {
  const completedTasks = tasks
    .filter(task => task.completed && task.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

  if (completedTasks.length === 0) return { current: 0, longest: 0 };

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const task of completedTasks) {
    const taskDate = new Date(task.completedAt!);
    taskDate.setHours(0, 0, 0, 0);

    if (!lastDate) {
      const daysDiff = Math.floor((today.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff <= 1) {
        currentStreak = 1;
        tempStreak = 1;
      }
    } else {
      const daysDiff = Math.floor((lastDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        tempStreak++;
        if (lastDate.getTime() >= today.getTime() - (1000 * 60 * 60 * 24)) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    lastDate = taskDate;
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

export const useTaskStore = create<TaskStore>((set, get) => ({
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
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      set({ syncing: false });
    }
  },

  updateTask: async (id, updates) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

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
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      set({ syncing: false });
    }
  },

  toggleTaskComplete: async (id) => {
    const { tasks } = get();
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const now = new Date().toISOString();
    const updates: Partial<Task> = {
      completed: !task.completed,
      completedAt: !task.completed ? now : undefined,
    };

    await get().updateTask(id, updates);
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

  syncWithServer: async () => {
    await get().loadTasks();
    await get().loadUserStats();
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
    } catch (error) {
      console.error('Error clearing tasks:', error);
    } finally {
      set({ syncing: false });
    }
  },
}));