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
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  session: null,
  loading: true,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading })
}));

// Separate provider component to initialize auth
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const { setUser, setSession, setLoading } = useAuth.getState();

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
        toast({
          title: "Authentication Error",
          description: "There was a problem loading your session",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  return <>{children}</>;
};

// Auth helper functions
export const signIn = async (email: string, password: string) => {
  const { toast } = useToast.getState();
  
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
    
    toast({
      title: "Welcome back!",
      description: "You have successfully signed in"
    });
    
    return { error: null };
  } catch (error) {
    console.error("Unexpected error during sign in:", error);
    toast({
      title: "Sign In Failed",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    return { error: error as Error };
  }
};

export const signUp = async (email: string, password: string, userData?: { full_name?: string }) => {
  const { toast } = useToast.getState();
  
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
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
    
    toast({
      title: "Account Created",
      description: "Welcome to our platform!"
    });
    
    return { error: null };
  } catch (error) {
    console.error("Unexpected error during sign up:", error);
    toast({
      title: "Sign Up Failed",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    return { error: error as Error };
  }
};

export const signOut = async () => {
  const { toast } = useToast.getState();
  
  try {
    await supabase.auth.signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out"
    });
  } catch (error) {
    console.error("Error during sign out:", error);
    toast({
      title: "Sign Out Failed",
      description: "There was a problem signing you out",
      variant: "destructive"
    });
  }
};

export const resetPassword = async (email: string) => {
  const { toast } = useToast.getState();
  
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
    
    toast({
      title: "Password Reset Email Sent",
      description: "Check your email for the password reset link"
    });
    
    return { error: null };
  } catch (error) {
    console.error("Unexpected error during password reset:", error);
    toast({
      title: "Password Reset Failed",
      description: "An unexpected error occurred",
      variant: "destructive"
    });
    return { error: error as Error };
  }
};
