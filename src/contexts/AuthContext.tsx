
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { create } from 'zustand';

// Add auth state to zustand for global access
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  // Auth methods
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, userData?: { full_name?: string }) => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

// Create the store without accessing useToast at the module level
export const useAuth = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
  
  // Implement authentication methods directly in the store
  signIn: async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // We'll handle toast notifications in the UI components
        return { error };
      }
      return { error: null };
    } catch (error) {
      console.error("Unexpected error during sign in:", error);
      return { error: error as Error };
    }
  },
  
  signUp: async (email: string, password: string, userData?: { full_name?: string }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData?.full_name || '',
          },
        },
      });
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error("Unexpected error during sign up:", error);
      return { error: error as Error };
    }
  },
  
  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  },
  
  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error("Unexpected error during password reset:", error);
      return { error: error as Error };
    }
  }
}));

// Toast wrapper component to use toast notifications with the auth store
export const ToastAuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const { signIn: authSignIn, signUp: authSignUp, signOut: authSignOut, resetPassword: authResetPassword } = useAuth();
  
  // Override methods to include toast notifications
  const signIn = async (email: string, password: string) => {
    const result = await authSignIn(email, password);
    if (result.error) {
      toast({
        title: "Sign In Failed",
        description: result.error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in"
      });
    }
    return result;
  };
  
  const signUp = async (email: string, password: string, userData?: { full_name?: string }) => {
    const result = await authSignUp(email, password, userData);
    if (result.error) {
      toast({
        title: "Sign Up Failed",
        description: result.error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account Created",
        description: "Welcome to our platform!"
      });
    }
    return result;
  };
  
  const signOut = async () => {
    await authSignOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out"
    });
  };
  
  const resetPassword = async (email: string) => {
    const result = await authResetPassword(email);
    if (result.error) {
      toast({
        title: "Password Reset Failed",
        description: result.error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link"
      });
    }
    return result;
  };
  
  // Create a context with toast-enhanced methods
  const authContext = {
    ...useAuth(),
    signIn,
    signUp,
    signOut,
    resetPassword
  };
  
  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a context for components that need toast-enhanced auth methods
const AuthContext = createContext<ReturnType<typeof useAuth> & {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, userData?: { full_name?: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}>(null as any);

export const useAuthWithToast = () => useContext(AuthContext);

// Separate provider component to initialize auth
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setUser, setSession, setLoading } = useAuth();

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state change:", event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Defer additional operations to prevent recursion
        if (currentSession?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            console.log("User signed in:", currentSession.user.id);
          }, 0);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          console.log("Initial session loaded for user:", initialSession.user.id);
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <ToastAuthWrapper>
      {children}
    </ToastAuthWrapper>
  );
};
