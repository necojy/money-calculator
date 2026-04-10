import { createClient } from '@supabase/supabase-js'

// 檢查這裡的拼字：NEXT_PUBLIC_SUPABASE_URL
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 錯誤：找不到 Supabase 環境變數，請檢查 .env.local')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

console.log('當前網址為：', process.env.NEXT_PUBLIC_SUPABASE_URL);