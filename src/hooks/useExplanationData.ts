
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Explanation, Quiz } from "@/types";

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
    if (!noteId || !note || !note.analysis || !note.analysis.readyForExplanation) {
      console.log("Cannot fetch explanation - note is not ready:", { noteId, hasNote: !!note, hasAnalysis: note?.analysis ? 'yes' : 'no', isReady: note?.analysis?.readyForExplanation ? 'yes' : 'no' });
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log("Checking if Supabase client is available");
      if (!supabase) {
        console.error("Supabase client not initialized");
        throw new Error("Supabase client not initialized");
      }
      
      console.log("Checking for existing explanation in database");
      // First check if we have a stored explanation
      const { data: existingExplanation, error: fetchError } = await supabase
        .from('explanations')
        .select('*')
        .eq('note_id', noteId)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Error fetching explanation from database:", fetchError);
        throw new Error(`Failed to fetch existing explanation: ${fetchError.message}`);
      }
      
      if (existingExplanation) {
        console.log("Using existing explanation from database");
        // Ensure we properly type the response from Supabase
        const formattedExplanation: Explanation = {
          id: existingExplanation.id as string,
          noteId: existingExplanation.note_id as string,
          topic: existingExplanation.topic as string,
          title: existingExplanation.title as string,
          content: existingExplanation.content as Explanation['content'],
          createdAt: new Date(existingExplanation.created_at as string)
        };
        
        setExplanation(formattedExplanation);
        return formattedExplanation;
      } else {
        // Generate a new explanation
        console.log("Generating new explanation for note:", noteId);
        try {
          const { data, error } = await supabase.functions.invoke('generate-explanation', {
            body: {
              noteId,
              topic: note.analysis.mainTopic,
              concepts: note.analysis.concepts,
              noteContent: note.content
            },
          });
          
          if (error) {
            console.error("Error invoking generate-explanation function:", error);
            throw new Error(`Failed to generate explanation: ${error.message}`);
          }
          
          if (!data) {
            console.error("No data returned from explanation generation");
            throw new Error("No data returned from explanation generation");
          }
          
          console.log("Successfully generated explanation:", data);
          
          const newExplanation: Explanation = {
            noteId,
            topic: note.analysis.mainTopic,
            title: data.title,
            content: {
              title: data.title,
              sections: data.sections,
              summary: data.summary,
              furtherResources: data.furtherResources
            },
            createdAt: new Date()
          };
          
          setExplanation(newExplanation);
          return newExplanation;
        } catch (fnError: any) {
          console.error("Function invocation error:", fnError);
          throw new Error(`Failed to generate explanation: ${fnError.message || "Unknown error"}`);
        }
      }
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
      console.log("Checking if Supabase client is available");
      if (!supabase) {
        console.error("Supabase client not initialized");
        throw new Error("Supabase client not initialized");
      }
      
      console.log("Checking for existing quiz in database");
      // Check if we have a stored quiz
      const { data: existingQuiz, error: fetchError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('note_id', noteId)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Error fetching quiz from database:", fetchError);
        throw new Error(`Failed to fetch existing quiz: ${fetchError.message}`);
      }
      
      if (existingQuiz) {
        console.log("Using existing quiz from database");
        // Ensure we properly type the response from Supabase
        const formattedQuiz: Quiz = {
          id: existingQuiz.id as string,
          noteId: existingQuiz.note_id as string,
          topic: existingQuiz.topic as string,
          introduction: existingQuiz.introduction as string,
          questions: existingQuiz.questions as Quiz['questions'],
          createdAt: new Date(existingQuiz.created_at as string)
        };
        
        setQuiz(formattedQuiz);
        return formattedQuiz;
      } else {
        // Generate a new quiz
        console.log("Generating new quiz for note:", noteId);
        try {
          const { data, error } = await supabase.functions.invoke('generate-quiz', {
            body: {
              noteId,
              topic: explanation.topic,
              explanation: JSON.stringify(explanation.content)
            },
          });
          
          if (error) {
            console.error("Error invoking generate-quiz function:", error);
            throw new Error(`Failed to generate quiz: ${error.message}`);
          }
          
          if (!data) {
            console.error("No data returned from quiz generation");
            throw new Error("No data returned from quiz generation");
          }
          
          console.log("Successfully generated quiz:", data);
          
          const newQuiz: Quiz = {
            noteId,
            topic: explanation.topic,
            introduction: data.introduction,
            questions: data.questions,
            createdAt: new Date()
          };
          
          setQuiz(newQuiz);
          return newQuiz;
        } catch (fnError: any) {
          console.error("Function invocation error:", fnError);
          throw new Error(`Failed to generate quiz: ${fnError.message || "Unknown error"}`);
        }
      }
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
