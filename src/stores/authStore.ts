import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  
  // Auth actions
  signUp: (email: string, password: string, username: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  
  // Internal actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,

      signUp: async (email: string, password: string, username: string) => {
        try {
          set({ loading: true });
          
          if (!supabase) {
            return { error: 'Supabase not configured. Please set up your environment variables.' };
          }

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username,
              },
            },
          });

          if (error) {
            return { error: error.message };
          }

          // Create user profile
          if (data.user) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                username,
                total_xp: 0,
                current_level: 1,
                current_streak: 0,
                longest_streak: 0,
                tasks_completed: 0,
              });

            if (profileError) {
              console.error('Error creating user profile:', profileError);
            }
          }

          return {};
        } catch (error) {
          return { error: 'An unexpected error occurred' };
        } finally {
          set({ loading: false });
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true });
          
          if (!supabase) {
            return { error: 'Supabase not configured. Please set up your environment variables.' };
          }

          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            return { error: error.message };
          }

          set({ user: data.user, session: data.session });
          return {};
        } catch (error) {
          return { error: 'An unexpected error occurred' };
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        try {
          set({ loading: true });
          if (!supabase) return;
          await supabase.auth.signOut();
          set({ user: null, session: null });
        } catch (error) {
          console.error('Error signing out:', error);
        } finally {
          set({ loading: false });
        }
      },

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        session: state.session 
      }),
    }
  )
);

// Initialize auth state
if (supabase) {
  supabase.auth.onAuthStateChange((event, session) => {
    const { setUser, setSession, setLoading } = useAuthStore.getState();
    
    setUser(session?.user ?? null);
    setSession(session);
    setLoading(false);
  });
} else {
  // Set loading to false if no supabase connection
  useAuthStore.getState().setLoading(false);
}