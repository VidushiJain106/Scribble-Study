
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { withSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Explanation, Quiz } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for managing explanation and quiz data
 */
export function useExplanationData(noteId: string | undefined, note: any) {
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const requestInProgressRef = useRef(false);

  /**
   * Check for an existing explanation in the database first,
   * if not found, generate a new one
   */
  const fetchExplanation = async () => {
    if (!noteId || !note || !note.analysis || !note.analysis.readyForExplanation) {
      return null;
    }

    // Prevent multiple concurrent requests
    if (requestInProgressRef.current) {
      console.log("Explanation request already in progress, skipping duplicate call");
      return null;
    }

    setLoading(true);
    setError(null);
    requestInProgressRef.current = true;
    
    try {
      if (!isSupabaseConfigured()) {
        toast({
          title: "Connection Error",
          description: "Cannot connect to Supabase. Please try again later.",
          variant: "destructive",
        });
        setError("Connection error");
        return null;
      }
      
      // First, check if an explanation already exists for this note
      const { data: existingExplanation, error: fetchError } = await supabase
        .from("explanations")
        .select("*")
        .eq("note_id", noteId)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error("Error fetching existing explanation:", fetchError);
      }
      
      // If an explanation exists, use it
      if (existingExplanation) {
        console.log("Found existing explanation for note:", noteId);
        
        const formattedExplanation: Explanation = {
          id: existingExplanation.id,
          noteId,
          topic: existingExplanation.topic,
          title: existingExplanation.title,
          content: existingExplanation.content,
          createdAt: new Date(existingExplanation.created_at)
        };
        
        setExplanation(formattedExplanation);
        setError(null);
        return formattedExplanation;
      }
      
      // No existing explanation found, generate a new one
      console.log("Generating new explanation for note:", noteId);
      
      // Use withSupabase helper to generate explanation
      const explanationData = await withSupabase(
        async (supabase) => {
          try {
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

            // Check for error property in the data
            if (data.error) {
              console.error("Error in explanation data:", data.error);
              throw new Error(data.error);
            }
            
            // Prepare data for database insertion
            const explanationRecord = {
              note_id: noteId,
              topic: note.analysis.mainTopic,
              title: data.title,
              content: {
                title: data.title,
                sections: data.sections || [],
                summary: data.summary || "No summary available",
                furtherResources: data.furtherResources || []
              }
            };
            
            // Store the explanation in the database
            const { data: insertedExplanation, error: insertError } = await supabase
              .from('explanations')
              .insert(explanationRecord)
              .select('*')
              .single();
              
            if (insertError) {
              console.error("Error storing explanation in database:", insertError);
              throw new Error("Failed to store explanation");
            }
            
            return {
              id: insertedExplanation.id,
              noteId,
              topic: insertedExplanation.topic,
              title: insertedExplanation.title,
              content: insertedExplanation.content,
              createdAt: new Date(insertedExplanation.created_at)
            };
          } catch (error) {
            console.error("Error in withSupabase callback:", error);
            throw error;
          }
        },
        null
      );
      
      if (explanationData) {
        setExplanation(explanationData as Explanation);
        setError(null);
        return explanationData as Explanation;
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
        description: "An error occurred while generating the explanation.",
        variant: "destructive",
      });
      setError(`Error generating explanation: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
      requestInProgressRef.current = false;
    }
    
    return null;
  };

  /**
   * Check for an existing quiz in the database first,
   * if not found, generate a new one
   */
  const generateQuiz = async () => {
    if (!noteId || !explanation) return null;
    
    setLoading(true);
    
    try {
      if (!isSupabaseConfigured()) {
        toast({
          title: "Connection Error",
          description: "Cannot connect to Supabase. Please try again later.",
          variant: "destructive",
        });
        return null;
      }
      
      // First, check if a quiz already exists for this note
      const { data: existingQuiz, error: fetchError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("note_id", noteId)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error("Error fetching existing quiz:", fetchError);
      }
      
      // If a quiz exists, use it
      if (existingQuiz) {
        console.log("Found existing quiz for note:", noteId);
        
        const formattedQuiz: Quiz = {
          id: existingQuiz.id,
          noteId,
          topic: existingQuiz.topic,
          introduction: existingQuiz.introduction,
          questions: existingQuiz.questions,
          createdAt: new Date(existingQuiz.created_at)
        };
        
        setQuiz(formattedQuiz);
        return formattedQuiz;
      }
      
      // No existing quiz found, generate a new one
      console.log("Generating new quiz for note:", noteId);
      
      // Use withSupabase helper to generate quiz
      const quizData = await withSupabase(
        async (supabase) => {
          try {
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

            // Check for error property in the data
            if (data.error) {
              console.error("Error in quiz data:", data.error);
              throw new Error(data.error);
            }
            
            // Prepare data for database insertion
            const quizRecord = {
              note_id: noteId,
              topic: explanation.topic,
              introduction: data.introduction || `Quiz on ${explanation.topic}`,
              questions: data.questions || []
            };
            
            // Store the quiz in the database
            const { data: insertedQuiz, error: insertError } = await supabase
              .from('quizzes')
              .insert(quizRecord)
              .select('*')
              .single();
              
            if (insertError) {
              console.error("Error storing quiz in database:", insertError);
              throw new Error("Failed to store quiz");
            }
            
            return {
              id: insertedQuiz.id,
              noteId,
              topic: insertedQuiz.topic,
              introduction: insertedQuiz.introduction,
              questions: insertedQuiz.questions,
              createdAt: new Date(insertedQuiz.created_at)
            };
          } catch (error) {
            console.error("Error in quiz generation:", error);
            throw error;
          }
        },
        null
      );
      
      if (quizData) {
        setQuiz(quizData as Quiz);
        return quizData as Quiz;
      } else {
        toast({
          title: "Error",
          description: "Failed to generate quiz. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
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
