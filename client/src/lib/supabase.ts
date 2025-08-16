import { createClient } from "@supabase/supabase-js";

// Supabase configuration using environment variables
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://oaejlnrzfefawcwncrsd.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hZWpsbnJ6ZmVmYXdjd25jcnNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MjQ5NjcsImV4cCI6MjA3MDMwMDk2N30.qZwtI_UmCPEOsmK4vxUpHzR0I2FBFxfDwJ7QvJYFpW8";

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
  import.meta.env.VITE_API_URL || "http://localhost:3001";

export default supabase;
