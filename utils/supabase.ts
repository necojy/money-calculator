// utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

// 讀取你在 .env.local 設定的金鑰
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 建立 Supabase 客戶端實例
export const supabase = createClient(supabaseUrl, supabaseAnonKey);