
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
      navigate('/');
      return;
    }
    
    if (!note) {
      // Note not found - no need to show a toast, just let the UI handle it
      return;
    }
    
    if (!note.analysis || !note.analysis.readyForExplanation) {
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
      try {
        await fetchExplanation();
      } catch (err) {
        console.error("Failed to load explanation:", err);
        toast({
          title: "Explanation Error",
          description: "There was a problem loading the explanation. Please try again later.",
          variant: "destructive"
        });
      }
    };
    
    loadExplanation();
  }, [noteId, note, navigate, fetchExplanation, toast]);
  
  const handleTakeQuiz = async () => {
    try {
      const quizData = await generateQuiz();
      if (quizData) {
        setShowQuiz(true);
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
    toast({
      title: "Retrying",
      description: "Attempting to generate explanation again...",
    });
    
    try {
      await fetchExplanation();
    } catch (err) {
      console.error("Retry failed:", err);
      toast({
        title: "Retry Failed",
        description: "Still unable to generate explanation. Please try again later.",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return <ExplanationLoading isGeneratingQuiz={showQuiz && !quiz} />;
  }
  
  if (!note) {
    return <ExplanationError errorType="not-found" />;
  }
  
  if (error) {
    return <ExplanationError errorType="generic" noteId={noteId} onRetry={handleRetry} />;
  }
  
  if (!explanation) {
    return <ExplanationError errorType="not-ready" noteId={noteId} onRetry={handleRetry} />;
  }
  
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
