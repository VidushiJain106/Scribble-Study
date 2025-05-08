
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { withSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";
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
      return null;
    }

    setLoading(true);
    setError(null);
    
    try {
      if (!isSupabaseConfigured()) {
        toast({
          title: "Connection Error",
          description: "Cannot connect to Supabase. Please try again later.",
          variant: "destructive",
        });
        setLoading(false);
        setError("Connection error");
        return null;
      }
      
      console.log("Fetching explanation for note:", noteId);
      
      // Use withSupabase helper to safely fetch or generate explanation
      const explanation = await withSupabase(
        async (supabase) => {
          try {
            // First check if we have a stored explanation
            const { data: existingExplanation, error: fetchError } = await supabase
              .from('explanations')
              .select('*')
              .eq('note_id', noteId)
              .single();
            
            if (fetchError && fetchError.code !== 'PGRST116') {
              console.error("Error fetching existing explanation:", fetchError);
              throw new Error(fetchError.message);
            }
            
            if (existingExplanation) {
              console.log("Found existing explanation");
              // Ensure we properly type the response from Supabase
              return {
                id: existingExplanation.id as string,
                noteId: existingExplanation.note_id as string,
                topic: existingExplanation.topic as string,
                title: existingExplanation.title as string,
                content: existingExplanation.content as Explanation['content'],
                createdAt: new Date(existingExplanation.created_at as string)
              };
            } else {
              console.log("Generating new explanation");
              // Generate a new explanation
              const { data, error: fnError } = await supabase.functions.invoke('generate-explanation', {
                body: {
                  noteId,
                  topic: note.analysis.mainTopic,
                  concepts: note.analysis.concepts,
                  noteContent: note.content
                },
              });
              
              if (fnError) {
                console.error("Error invoking generate-explanation function:", fnError);
                throw new Error(fnError.message || "Failed to generate explanation");
              }
              
              if (!data) {
                throw new Error("No data returned from explanation function");
              }
              
              return {
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
            }
          } catch (error) {
            console.error("Error in withSupabase callback:", error);
            throw error;
          }
        },
        null
      );
      
      if (explanation) {
        // Explicitly cast to Explanation type to ensure type safety
        setExplanation(explanation as Explanation);
        setError(null);
        return explanation as Explanation;
      } else {
        toast({
          title: "Error",
          description: "Failed to get explanation. Please try again later.",
          variant: "destructive",
        });
        setError("Failed to get explanation");
      }
    } catch (error) {
      console.error("Error fetching explanation:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching the explanation.",
        variant: "destructive",
      });
      setError("Error fetching explanation");
    } finally {
      setLoading(false);
    }
    
    return null;
  };

  /**
   * Generate or fetch quiz based on explanation
   */
  const generateQuiz = async () => {
    if (!noteId || !explanation) return;
    
    setLoading(true);
    
    try {
      if (!isSupabaseConfigured()) {
        toast({
          title: "Connection Error",
          description: "Cannot connect to Supabase. Please try again later.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Use withSupabase helper to safely fetch or generate quiz
      const quiz = await withSupabase(
        async (supabase) => {
          try {
            // Check if we have a stored quiz
            const { data: existingQuiz, error: fetchError } = await supabase
              .from('quizzes')
              .select('*')
              .eq('note_id', noteId)
              .single();
            
            if (fetchError && fetchError.code !== 'PGRST116') {
              console.error("Error fetching existing quiz:", fetchError);
              throw new Error(fetchError.message);
            }
            
            if (existingQuiz) {
              // Ensure we properly type the response from Supabase
              return {
                id: existingQuiz.id as string,
                noteId: existingQuiz.note_id as string,
                topic: existingQuiz.topic as string,
                introduction: existingQuiz.introduction as string,
                questions: existingQuiz.questions as Quiz['questions'],
                createdAt: new Date(existingQuiz.created_at as string)
              };
            } else {
              // Generate a new quiz
              const { data, error: fnError } = await supabase.functions.invoke('generate-quiz', {
                body: {
                  noteId,
                  topic: explanation.topic,
                  explanation: JSON.stringify(explanation.content)
                },
              });
              
              if (fnError) {
                console.error("Error invoking generate-quiz function:", fnError);
                throw new Error(fnError.message || "Failed to generate quiz");
              }
              
              if (!data) {
                throw new Error("No data returned from quiz function");
              }
              
              return {
                noteId,
                topic: explanation.topic,
                introduction: data.introduction,
                questions: data.questions,
                createdAt: new Date()
              };
            }
          } catch (error) {
            console.error("Error in quiz generation:", error);
            throw error;
          }
        },
        null
      );
      
      if (quiz) {
        // Explicitly cast to Quiz type to ensure type safety
        setQuiz(quiz as Quiz);
        return quiz as Quiz;
      } else {
        toast({
          title: "Error",
          description: "Failed to generate quiz. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast({
        title: "Error",
        description: "An error occurred while generating the quiz.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
    
    return null;
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
