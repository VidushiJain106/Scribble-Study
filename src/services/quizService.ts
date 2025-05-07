
import { supabase } from "@/integrations/supabase/client";
import { Explanation, Quiz } from "@/types";

/**
 * Generate or fetch quiz based on explanation
 */
export async function fetchQuizData(noteId: string, explanation: Explanation) {
  if (!noteId || !explanation) return null;
  
  console.log("Checking if Supabase client is available");
  if (!supabase) {
    console.error("Supabase client not initialized");
    throw new Error("Supabase client not initialized");
  }
  
  try {
    console.log("Checking for existing quiz in database for noteId:", noteId);
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
      console.log("Using existing quiz from database", existingQuiz.id);
      // Ensure we properly type the response from Supabase
      const formattedQuiz: Quiz = {
        id: existingQuiz.id as string,
        noteId: existingQuiz.note_id as string,
        topic: existingQuiz.topic as string,
        introduction: existingQuiz.introduction as string,
        questions: existingQuiz.questions as Quiz['questions'],
        createdAt: new Date(existingQuiz.created_at as string)
      };
      
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
        
        return newQuiz;
      } catch (fnError: any) {
        console.error("Function invocation error:", fnError);
        throw new Error(`Failed to generate quiz: ${fnError.message || "Unknown error"}`);
      }
    }
  } catch (error: any) {
    // Add more detailed logging for network errors
    if (error.message && error.message.includes("Failed to fetch")) {
      console.error("Network error when connecting to Supabase:", error);
      throw new Error("Network connection error. Please check your internet connection and try again.");
    }
    throw error;
  }
}
