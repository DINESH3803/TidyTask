import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that we have real Supabase credentials (not placeholders)
const isValidSupabaseUrl = (url: string) => {
  if (!url) return false;
  if (url.includes('your_supabase_project_url_here')) return false;
  try {
    new URL(url);
    return url.includes('.supabase.co');
  } catch {
    return false;
  }
};

const isValidSupabaseKey = (key: string) => {
  if (!key) return false;
  if (key.includes('your_supabase_anon_key_here')) return false;
  return key.length > 100; // Supabase keys are long
};

const hasValidCredentials = isValidSupabaseUrl(supabaseUrl) && isValidSupabaseKey(supabaseAnonKey);

// Only throw error in production if credentials are completely missing
if (!hasValidCredentials && import.meta.env.PROD) {
  throw new Error('Missing or invalid Supabase environment variables');
}

// Create client with fallback for development
export const supabase = hasValidCredentials
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export interface DatabaseProfile {
  id: string;
  username: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  tasks_completed: number;
  last_completion_date?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  due_date: string;
  xp_reward: number;
  created_at: string;
  completed_at?: string;
  favorite?: boolean;
  tags?: string[];
  user_id: string;
}
