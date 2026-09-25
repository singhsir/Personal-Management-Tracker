import { createClient } from "@supabase/supabase-js";

const defaultUrl = "https://qbarsiodkklzbhzlddip.supabase.co";
const defaultKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiYXJzaW9ka2tsemJoemxkZGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNzQyMDcsImV4cCI6MjEwNTg1MDIwN30.cavD2W-3L_v9vfZM0T8z4M_uKRaj4CGFXcfryqxrqTM";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const EDGE_FUNCTION_URL = `${supabaseUrl}/functions/v1/smart-endpoint`;
