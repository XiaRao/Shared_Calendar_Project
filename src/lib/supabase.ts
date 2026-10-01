import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl.includes('your-project')) {
  console.error(
    '[Supabase] VITE_SUPABASE_URL\n' +
    'please set real project URL in .env.\n' +
    'current value:', supabaseUrl
  );
}

if (!supabaseAnonKey || supabaseAnonKey.includes('your-anon-key')) {
  console.error(
    '[Supabase] VITE_SUPABASE_ANON_KEY!\n' +
    'please set real anon key in .env.\n' +
    'current value:', supabaseAnonKey
  );
}

 //create a single supabase client for interacting with the database
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
