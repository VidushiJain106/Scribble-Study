import { createClient } from '@supabase/supabase-js';

// Get environment variables for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tekrltwmyybjfxqeeylz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRla3Jpd215eWdiamZ4cWVleWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NTkzOTAsImV4cCI6MjA2MjMzNTM5MH0.iqGkzFcEvBprhK9s5671lzN2D4kURA_xta6jrH-cRNU';

// Create a typed supabase client
let supabaseClient: ReturnType<typeof createClient> | null = null;

try {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
    }
  });
  console.log("Supabase client initialized in utility file");
} catch (error) {
  console.error("Failed to initialize Supabase client in utility:", error);
  supabaseClient = null;
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

/**
 * Helper to upload a file to Supabase storage
 * @param userId The user ID to use as the folder name
 * @param file The file to upload
 * @param path Optional path within the user's folder
 * @returns Object with the upload result
 */
export async function uploadNoteAttachment(userId: string, file: File, noteId: string) {
  if (!supabaseClient) return { error: "Supabase client not available" };
  
  const filePath = `${userId}/${noteId}/${file.name}`;
  
  try {
    const { data, error } = await supabaseClient.storage
      .from('note_attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
      
    if (error) throw error;
    
    // Get the public URL for the file
    const { data: { publicUrl } } = supabaseClient.storage
      .from('note_attachments')
      .getPublicUrl(filePath);
      
    return { data: { ...data, publicUrl }, error: null };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { error };
  }
}

/**
 * Helper to save user data like categories to Supabase storage
 * @param userId The user ID to use as the folder name
 * @param dataType The type of data (e.g., 'categories')
 * @param data The data to save
 * @returns Object with the operation result
 */
export async function saveUserData(userId: string, dataType: string, data: any) {
  if (!supabaseClient) return { error: "Supabase client not available" };
  
  const filePath = `${userId}/${dataType}.json`;
  
  try {
    const { data: uploadData, error } = await supabaseClient.storage
      .from('user_data')
      .upload(filePath, JSON.stringify(data), {
        cacheControl: '3600',
        contentType: 'application/json',
        upsert: true,
      });
      
    if (error) throw error;
    
    return { data: uploadData, error: null };
  } catch (error) {
    console.error(`Error saving ${dataType}:`, error);
    return { error };
  }
}

/**
 * Helper to load user data like categories from Supabase storage
 * @param userId The user ID to use as the folder name
 * @param dataType The type of data (e.g., 'categories')
 * @returns Object with the operation result
 */
export async function loadUserData(userId: string, dataType: string) {
  if (!supabaseClient) return { error: "Supabase client not available" };
  
  const filePath = `${userId}/${dataType}.json`;
  
  try {
    const { data, error } = await supabaseClient.storage
      .from('user_data')
      .download(filePath);
      
    if (error) throw error;
    
    const text = await data.text();
    const jsonData = JSON.parse(text);
    
    return { data: jsonData, error: null };
  } catch (error) {
    // If the file doesn't exist yet, that's not really an error
    if (error.message?.includes('The resource was not found')) {
      return { data: null, error: null };
    }
    
    console.error(`Error loading ${dataType}:`, error);
    return { error };
  }
}

export default supabaseClient;
