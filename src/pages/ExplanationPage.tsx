
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNoteStore } from "@/lib/store";
import { ExplanationContent } from "@/components/Explanation/ExplanationContent";
import { QuizContent } from "@/components/Quiz/QuizContent";
import { ExplanationLoading } from "@/components/Explanation/ExplanationLoading"; 
import { ExplanationError } from "@/components/Explanation/ExplanationError";
import { useExplanationData } from "@/hooks/useExplanationData";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

/**
 * Page component for displaying explanations and quizzes
 */
const ExplanationPage = () => {
  const { id: noteId } = useParams<{ id: string }>();
  const notes = useNoteStore(state => state.notes);
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
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
    
    if (retryCount === 0) {
      fetchExplanation();
    }
  }, [noteId, note, navigate, fetchExplanation, retryCount]);
  
  // Handle manual retry
  const handleRetry = () => {
    setRetryCount(prevCount => prevCount + 1);
    fetchExplanation();
  };
  
  const handleTakeQuiz = async () => {
    const quizData = await generateQuiz();
    if (quizData) {
      setShowQuiz(true);
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
        <div className="max-w-5xl mx-auto p-6">
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Failed to load explanation</AlertTitle>
            <AlertDescription>
              There was a problem loading the explanation data.
            </AlertDescription>
          </Alert>
          
          <Button 
            onClick={handleRetry} 
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      );
    }
    
    if (!explanation) {
      return <ExplanationError noteId={noteId} errorType="generic" />;
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
