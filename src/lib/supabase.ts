import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl.includes('your-project')) {
  console.error(
    '[Supabase] VITE_SUPABASE_URL 未配置或为占位符！\n' +
    '请在 .env 文件中设置真实的 Supabase 项目 URL。\n' +
    '当前值:', supabaseUrl
  );
}

if (!supabaseAnonKey || supabaseAnonKey.includes('your-anon-key')) {
  console.error(
    '[Supabase] VITE_SUPABASE_ANON_KEY 未配置或为占位符！\n' +
    '请在 .env 文件中设置真实的 anon key。\n' +
    '当前值:', supabaseAnonKey
  );
}

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
