
import { supabase as supabaseIntegrationClient } from "@/integrations/supabase/client";

console.warn("supabaseClient.ts is deprecated - please use src/integrations/supabase/client.ts instead");

/**
 * Get the Supabase client instance from the integration
 * @returns The Supabase client
 */
export const getSupabaseClient = () => supabaseIntegrationClient;

/**
 * Check if Supabase is properly configured
 * @returns boolean indicating if Supabase is ready to use
 */
export const isSupabaseConfigured = () => {
  const configured = !!supabaseIntegrationClient;
  console.info("Supabase Configuration Check:", { isConfigured: configured ? "Yes" : "No" });
  return configured;
};

/**
 * Helper to safely call Supabase functions
 * @param callback Function that uses the Supabase client
 * @param fallback Value to return if Supabase is not available
 * @returns Result of the callback or the fallback value
 */
export async function withSupabase<T>(
  callback: (supabase: typeof supabaseIntegrationClient) => Promise<T>, 
  fallback: T
): Promise<T> {
  if (!supabaseIntegrationClient) {
    console.warn("Supabase client not available for operation");
    return fallback;
  }
  
  try {
    return await callback(supabaseIntegrationClient);
  } catch (error) {
    console.error("Error executing Supabase operation:", error);
    return fallback;
  }
}

// Default export for backward compatibility
export default supabaseIntegrationClient;
