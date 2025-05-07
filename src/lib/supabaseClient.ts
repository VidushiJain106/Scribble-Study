
import { createClient } from '@supabase/supabase-js';

// Get environment variables for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a typed supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null;

// Only initialize if we have valid credentials
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase client initialized in utility file");
  } catch (error) {
    console.error("Failed to initialize Supabase client in utility:", error);
    supabaseClient = null;
  }
} else {
  console.warn("Supabase environment variables missing. Some functionality will be limited.");
}

/**
 * Get the Supabase client instance if available
 * @returns The Supabase client or null if not initialized
 */
export const getSupabaseClient = () => supabaseClient;

/**
 * Check if Supabase is properly configured
 * @returns boolean indicating if Supabase is ready to use
 */
export const isSupabaseConfigured = () => !!supabaseClient;

/**
 * Helper to safely call Supabase functions
 * @param callback Function that uses the Supabase client
 * @param fallback Value to return if Supabase is not available
 * @returns Result of the callback or the fallback value
 */
export async function withSupabase<T>(
  callback: (supabase: ReturnType<typeof createClient>) => Promise<T>, 
  fallback: T
): Promise<T> {
  if (!supabaseClient) {
    console.warn("Supabase client not available for operation");
    return fallback;
  }
  
  try {
    return await callback(supabaseClient);
  } catch (error) {
    console.error("Error executing Supabase operation:", error);
    return fallback;
  }
}

export default supabaseClient;
