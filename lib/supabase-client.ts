import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://eqspupqyjapdnrrbswqg.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxc3B1cHF5amFwZG5ycmJzd3FnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NTkxMjAsImV4cCI6MjA2MTAzNTEyMH0.aLMp_Qi2tnCx3UvcbuRUcLJzcfunw-bN3Cn4MHWsxgE"

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
