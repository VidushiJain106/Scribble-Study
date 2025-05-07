
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Explanation } from "@/types";
import { useToast } from "@/hooks/use-toast";

/**
 * Check if a note is ready for explanation
 */
export function isNoteReadyForExplanation(note: any): boolean {
  return note && note.analysis && note.analysis.readyForExplanation;
}

/**
 * Fetch or generate an explanation for a note
 */
export async function fetchExplanationData(noteId: string, note: any) {
  if (!noteId || !isNoteReadyForExplanation(note)) {
    console.log("Cannot fetch explanation - note is not ready:", { 
      noteId, 
      hasNote: !!note, 
      hasAnalysis: note?.analysis ? 'yes' : 'no', 
      isReady: note?.analysis?.readyForExplanation ? 'yes' : 'no' 
    });
    return null;
  }

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
      
      return newExplanation;
    } catch (fnError: any) {
      console.error("Function invocation error:", fnError);
      throw new Error(`Failed to generate explanation: ${fnError.message || "Unknown error"}`);
    }
  }
}
