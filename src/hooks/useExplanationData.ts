
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Explanation, Quiz } from "@/types";
import { fetchExplanationData, isNoteReadyForExplanation } from "@/services/explanationService";
import { fetchQuizData } from "@/services/quizService";

/**
 * Hook for managing explanation and quiz data
 */
export function useExplanationData(noteId: string | undefined, note: any) {
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Fetch explanation data from Supabase or generate new one
   */
  const fetchExplanation = async () => {
    if (!noteId || !isNoteReadyForExplanation(note)) {
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      const explanationData = await fetchExplanationData(noteId, note);
      setExplanation(explanationData);
      return explanationData;
    } catch (error: any) {
      console.error("Error in fetchExplanation:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      toast({
        title: "Error generating explanation",
        description: error instanceof Error ? error.message : "Unknown error occurred",
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
      setError(error instanceof Error ? error.message : "Unknown error occurred");
      toast({
        title: "Error generating quiz",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
      // Re-throw the error to be handled by the caller
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    explanation,
    quiz,
    loading,
    error,
    fetchExplanation,
    generateQuiz,
  };
}
