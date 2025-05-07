
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNoteStore } from "@/lib/store";
import { ExplanationContent } from "@/components/Explanation/ExplanationContent";
import { QuizContent } from "@/components/Quiz/QuizContent";
import { ExplanationLoading } from "@/components/Explanation/ExplanationLoading"; 
import { ExplanationError } from "@/components/Explanation/ExplanationError";
import { useExplanationData } from "@/hooks/useExplanationData";
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
  
  const note = noteId ? notes.find(n => n.id === noteId) : null;
  const { 
    explanation, 
    quiz, 
    loading,
    error,
    fetchExplanation, 
    generateQuiz 
  } = useExplanationData(noteId, note);
  
  useEffect(() => {
    if (!noteId) {
      console.log("No noteId provided, redirecting to home");
      navigate('/');
      return;
    }
    
    if (!note) {
      console.log("Note not found:", noteId);
      // Note not found - no need to show a toast, just let the UI handle it
      return;
    }
    
    console.log("Note check:", { 
      id: noteId, 
      hasAnalysis: note.analysis ? 'yes' : 'no', 
      isReady: note.analysis?.readyForExplanation ? 'yes' : 'no'
    });
    
    if (!note.analysis || !note.analysis.readyForExplanation) {
      console.log("Note not ready for explanation");
      toast({
        title: "Note not ready",
        description: "This note needs more content before it can be explained",
        variant: "destructive"
      });
      navigate(`/note/${noteId}`);
      return;
    }
    
    // Fetch explanation with error handling
    const loadExplanation = async () => {
      console.log("Loading explanation for note:", noteId);
      try {
        await fetchExplanation();
        console.log("Explanation loaded successfully");
      } catch (err) {
        console.error("Failed to load explanation:", err);
        toast({
          title: "Explanation Error",
          description: "There was a problem loading the explanation. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    loadExplanation();
  }, [noteId, note, navigate, fetchExplanation, toast, retryCount]);
  
  const handleTakeQuiz = async () => {
    try {
      console.log("Generating quiz");
      const quizData = await generateQuiz();
      if (quizData) {
        setShowQuiz(true);
        console.log("Quiz generated successfully, showing quiz");
      }
    } catch (err) {
      console.error("Quiz generation error:", err);
      toast({
        title: "Quiz Error",
        description: "Failed to generate quiz. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  const handleCompleteQuiz = () => {
    setShowQuiz(false);
  };

  const handleRetry = async () => {
    console.log("Retrying explanation generation");
    toast({
      title: "Retrying",
      description: "Attempting to generate explanation again...",
    });
    
    // Increment retry count to trigger the useEffect
    setRetryCount(prev => prev + 1);
  };
  
  // Show loading state when we're fetching an explanation
  if (loading) {
    return <ExplanationLoading isGeneratingQuiz={showQuiz && !quiz} />;
  }
  
  // Show not found error if note doesn't exist
  if (!note) {
    return <ExplanationError errorType="not-found" />;
  }
  
  // Show general error if there was a problem loading the explanation
  if (error) {
    console.log("Showing error UI due to error:", error);
    return <ExplanationError errorType="generic" noteId={noteId} onRetry={handleRetry} />;
  }
  
  // Show not ready error if explanation couldn't be generated
  if (!explanation) {
    console.log("Showing not ready UI due to missing explanation");
    return <ExplanationError errorType="not-ready" noteId={noteId} onRetry={handleRetry} />;
  }
  
  // Show either the quiz or explanation content
  return showQuiz && quiz ? (
    <QuizContent 
      quiz={quiz}
      onComplete={handleCompleteQuiz} 
      onBackToExplanation={() => setShowQuiz(false)}
    />
  ) : (
    <ExplanationContent 
      explanation={explanation} 
      onTakeQuiz={handleTakeQuiz} 
    />
  );
};

export default ExplanationPage;
