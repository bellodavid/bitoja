import { createClient } from "@supabase/supabase-js";

// Supabase configuration using environment variables
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://oaejlnrzfefawcwncrsd.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase configuration");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// API base URL for backend calls
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "" : "http://localhost:3001");

export default supabase;
