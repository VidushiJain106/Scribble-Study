
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Explanation, Quiz } from "@/types";
import { fetchExplanationData, isNoteReadyForExplanation } from "@/services/explanationService";
import { fetchQuizData } from "@/services/quizService";

/**
 * Hook for managing explanation and quiz data with improved error handling
 */
export function useExplanationData(noteId: string | undefined, note: any) {
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAttemptTime, setLastAttemptTime] = useState<number | null>(null);
  const { toast } = useToast();

  /**
   * Reset the error state and last attempt time
   */
  const resetErrorState = () => {
    setError(null);
    setLastAttemptTime(null);
  };

  /**
   * Fetch explanation data from Supabase or generate new one
   */
  const fetchExplanation = async () => {
    if (!noteId || !isNoteReadyForExplanation(note)) {
      return null;
    }

    setLoading(true);
    setError(null);
    setLastAttemptTime(Date.now());
    
    try {
      const explanationData = await fetchExplanationData(noteId, note);
      setExplanation(explanationData);
      return explanationData;
    } catch (error: any) {
      console.error("Error in fetchExplanation:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      // Special handling for network errors
      const isNetworkError = errorMessage.includes("Failed to fetch") || 
                            errorMessage.includes("Network connection error");
      
      setError(errorMessage);
      toast({
        title: "Error generating explanation",
        description: isNetworkError 
          ? "Network connection issue. Please check your internet and try again." 
          : errorMessage,
        variant: "destructive",
      });
      // Re-throw the error to be handled by the caller
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate or fetch quiz based on explanation
   */
  const generateQuiz = async () => {
    if (!noteId || !explanation) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      const quizData = await fetchQuizData(noteId, explanation);
      setQuiz(quizData);
      return quizData;
    } catch (error: any) {
      console.error("Error in generateQuiz:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      setError(errorMessage);
      toast({
        title: "Error generating quiz",
        description: errorMessage,
        variant: "destructive",
      });
      // Re-throw the error to be handled by the caller
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check connection status when component mounts or when noteId changes
  useEffect(() => {
    // Reset error state when note or noteId changes
    resetErrorState();
  }, [noteId, note]);

  return {
    explanation,
    quiz,
    loading,
    error,
    lastAttemptTime,
    fetchExplanation,
    generateQuiz,
    resetErrorState
  };
}
