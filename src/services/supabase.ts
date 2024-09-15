import { createClient } from '@supabase/supabase-js';

// These values come from your Supabase project dashboard
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_KEY || 'your-public-anon-key';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
