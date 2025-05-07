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
export const isSupabaseConfigured = () => !!supabaseIntegrationClient;

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

/**
 * Helper to upload a file to Supabase storage
 */
export const uploadNoteAttachment = async (userId: string, file: File, noteId: string) => {
  return supabaseIntegrationClient.storage
    .from('note_attachments')
    .upload(`${userId}/${noteId}/${file.name}`, file, {
      cacheControl: '3600',
      upsert: false,
    });
};

/**
 * Helper to save user data like categories to Supabase storage
 */
export const saveUserData = async (userId: string, dataType: string, data: any) => {
  return supabaseIntegrationClient.storage
    .from('user_data')
    .upload(`${userId}/${dataType}.json`, JSON.stringify(data), {
      cacheControl: '3600',
      contentType: 'application/json',
      upsert: true,
    });
};

/**
 * Helper to load user data like categories from Supabase storage
 */
export const loadUserData = async (userId: string, dataType: string) => {
  try {
    const { data, error } = await supabaseIntegrationClient.storage
      .from('user_data')
      .download(`${userId}/${dataType}.json`);
      
    if (error) throw error;
    
    const text = await data.text();
    const jsonData = JSON.parse(text);
    
    return { data: jsonData, error: null };
  } catch (error: any) {
    // If the file doesn't exist yet, that's not really an error
    if (error.message?.includes('The resource was not found')) {
      return { data: null, error: null };
    }
    
    console.error(`Error loading ${dataType}:`, error);
    return { error };
  }
};

// Default export for backward compatibility
export default supabaseIntegrationClient;
