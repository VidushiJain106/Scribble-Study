
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotePage from "./pages/NotePage";
import NotFound from "./pages/NotFound";
import { Chatbot } from "./components/Chat/Chatbot";
import FocusMode from "./pages/FocusMode";
import DocumentsPage from "./pages/DocumentsPage";
import ExamPrepPage from "./pages/ExamPrepPage";
import ExplanationPage from "./pages/ExplanationPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AuthPage from "./pages/AuthPage";
import { isSupabaseConfigured } from "./lib/supabaseClient";
import { useAuth } from "./contexts/AuthContext";

// Add console logging for debugging Supabase configuration
console.log("Supabase Configuration Check:", {
  isConfigured: isSupabaseConfigured() ? "Yes" : "No"
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for easier debugging
      refetchOnWindowFocus: false, // Disable refetch on window focus
    },
  },
});

// Log for debugging
console.log('App component initialized');

// Wrap each major section in error boundaries
const App = () => {
  const { user, loading } = useAuth();

  // Configure error handling for uncaught promises
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      event.preventDefault();
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  // Check Supabase configuration
  useEffect(() => {
    console.log("Supabase configuration check:", {
      isConfigured: isSupabaseConfigured() ? "Yes" : "No"
    });
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <ErrorBoundary>
                <Routes>
                  {/* Landing page becomes the root route */}
                  <Route path="/" element={
                    <ErrorBoundary>
                      <LandingPage />
                    </ErrorBoundary>
                  } />
                  
                  {/* Auth page */}
                  <Route path="/auth" element={
                    <ErrorBoundary>
                      <AuthPage />
                    </ErrorBoundary>
                  } />
                  
                  {/* App routes */}
                  <Route path="/app" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/category/:category" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/note/:id" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <NotePage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/note/:id/explanation" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <ExplanationPage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/focus" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <FocusMode />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/documents" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <DocumentsPage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/exam-prep" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <ExamPrepPage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="*" element={
                    <ErrorBoundary>
                      <NotFound />
                    </ErrorBoundary>
                  } />
                </Routes>
                <ErrorBoundary>
                  <Chatbot />
                </ErrorBoundary>
                <Toaster />
                <Sonner />
              </ErrorBoundary>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
