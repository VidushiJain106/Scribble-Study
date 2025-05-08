
import { useState, useEffect } from "react";
import { Note } from "@/types";
import { useChatStore } from "@/lib/chatStore";
import { useToast } from "@/hooks/use-toast";

export function useNoteAnalysis(note: Note | null, content: string) {
  const analyzeNote = useChatStore(state => state.analyzeNote);
  const [analysisTimer, setAnalysisTimer] = useState<NodeJS.Timeout | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Auto-analyze note content when it changes
  useEffect(() => {
    if (!note) return;

    // Clear previous timer
    if (analysisTimer) {
      clearTimeout(analysisTimer);
    }

    // Only analyze if there's significant content
    if (content.length > 50) {
      setAnalysisTimer(setTimeout(() => {
        setIsAnalyzing(true);
        const updatedNote = {
          ...note,
          content
        };
        
        // Perform analysis with async/await
        const performAnalysis = async () => {
          try {
            await analyzeNote(updatedNote);
            setIsAnalyzing(false);
          } catch (error) {
            console.error("Analysis error:", error);
            setIsAnalyzing(false);
          }
        };
        
        performAnalysis();
      }, 5000)); // Wait 5 seconds after typing stops
    }

    return () => {
      if (analysisTimer) {
        clearTimeout(analysisTimer);
      }
    };
  }, [content, note, analyzeNote]);

  // Force an immediate analysis
  const forceAnalysis = () => {
    if (!note) return;
    setIsAnalyzing(true);
    const updatedNote = {
      ...note,
      content
    };
    
    // Perform analysis with async/await
    const performAnalysis = async () => {
      try {
        await analyzeNote(updatedNote);
        setIsAnalyzing(false);
        toast({
          title: "Analysis complete",
          description: "Your note has been analyzed"
        });
      } catch (error) {
        console.error("Error during analysis:", error);
        toast({
          title: "Analysis failed",
          description: "There was a problem analyzing your note",
          variant: "destructive"
        });
        setIsAnalyzing(false);
      }
    };
    
    performAnalysis();
    
    toast({
      title: "Analysis requested",
      description: "Your note is being analyzed..."
    });
  };

  return {
    isAnalyzing,
    forceAnalysis
  };
}
