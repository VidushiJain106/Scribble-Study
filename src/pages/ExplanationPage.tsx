
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { useNoteStore } from "@/lib/store";
import { ExplanationContent } from "@/components/Explanation/ExplanationContent";
import { QuizContent } from "@/components/Quiz/QuizContent";
import { ExplanationLoading } from "@/components/Explanation/ExplanationLoading"; 
import { ExplanationError } from "@/components/Explanation/ExplanationError";
import { useExplanationData } from "@/hooks/useExplanationData";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Page component for displaying explanations and quizzes
 */
const ExplanationPage = () => {
  const { id: noteId } = useParams<{ id: string }>();
  const notes = useNoteStore(state => state.notes);
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const initialFetchDoneRef = useRef(false);
  
  // Find the note in the store
  const note = noteId ? notes.find(n => n.id === noteId) : null;
  
  const { 
    explanation, 
    quiz, 
    loading,
    error,
    fetchExplanation, 
    generateQuiz 
  } = useExplanationData(noteId, note);
  
  // Memoize fetchExplanation to avoid redundant calls
  const handleFetchExplanation = useCallback(async () => {
    console.log("Triggering explanation fetch");
    try {
      await fetchExplanation();
    } catch (error) {
      console.error("Error during explanation fetch:", error);
      toast({
        title: "Error",
        description: "Failed to generate explanation. Please try again.",
        variant: "destructive",
      });
    }
  }, [fetchExplanation, toast]);
  
  // Effect to handle fetching explanation or redirecting if note isn't ready
  useEffect(() => {
    if (!note) {
      // If note isn't found, we need to wait a bit to see if it loads
      const timer = setTimeout(() => {
        if (!note) {
          navigate(`/note/${noteId}`);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
    
    if (note && (!note.analysis || !note.analysis.readyForExplanation)) {
      navigate(`/note/${noteId}`);
      return;
    }
    
    // Only fetch on initial load or explicit retry
    if (!initialFetchDoneRef.current || retryCount > 0) {
      initialFetchDoneRef.current = true;
      console.log("Initial explanation fetch");
      handleFetchExplanation();
    }
  }, [noteId, note, navigate, handleFetchExplanation, retryCount]);
  
  // Handle manual retry
  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
    console.log("Retrying explanation generation");
    handleFetchExplanation();
  };
  
  const handleTakeQuiz = async () => {
    try {
      console.log("Generating quiz");
      const quizData = await generateQuiz();
      if (quizData) {
        setShowQuiz(true);
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  const handleCompleteQuiz = () => {
    setShowQuiz(false);
  };

  // Determine what content to show
  const renderContent = () => {
    if (loading) {
      return <ExplanationLoading isGeneratingQuiz={showQuiz && !quiz} />;
    }
    
    if (!note) {
      return <ExplanationError noteId={noteId} errorType="not-found" />;
    }
    
    if (error) {
      return (
        <ExplanationError 
          noteId={noteId} 
          errorType="api-error" 
          onRetry={handleRetry}
          errorMessage={error}
        />
      );
    }
    
    if (!explanation) {
      return <ExplanationError 
               noteId={noteId} 
               errorType="generic" 
               onRetry={handleRetry} 
             />;
    }
    
    if (showQuiz && quiz) {
      return (
        <QuizContent 
          quiz={quiz}
          onComplete={handleCompleteQuiz} 
          onBackToExplanation={() => setShowQuiz(false)}
        />
      );
    }
    
    return (
      <ExplanationContent 
        explanation={explanation} 
        onTakeQuiz={handleTakeQuiz} 
      />
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      {renderContent()}
    </div>
  );
};

export default ExplanationPage;
