
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNoteStore } from "@/lib/store";
import { ExplanationContent } from "@/components/Explanation/ExplanationContent";
import { QuizContent } from "@/components/Quiz/QuizContent";
import { ExplanationLoading } from "@/components/Explanation/ExplanationLoading"; 
import { ExplanationError } from "@/components/Explanation/ExplanationError";
import { useExplanationData } from "@/hooks/useExplanationData";

/**
 * Page component for displaying explanations and quizzes
 */
const ExplanationPage = () => {
  const { id: noteId } = useParams<{ id: string }>();
  const notes = useNoteStore(state => state.notes);
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);
  
  const note = noteId ? notes.find(n => n.id === noteId) : null;
  const { 
    explanation, 
    quiz, 
    loading,
    fetchExplanation, 
    generateQuiz 
  } = useExplanationData(noteId, note);
  
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
    
    fetchExplanation();
  }, [noteId, note, navigate, fetchExplanation]);
  
  const handleTakeQuiz = async () => {
    const quizData = await generateQuiz();
    if (quizData) {
      setShowQuiz(true);
    }
  };
  
  const handleCompleteQuiz = () => {
    setShowQuiz(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      {loading ? (
        <ExplanationLoading isGeneratingQuiz={showQuiz && !quiz} />
      ) : !note || !explanation ? (
        <ExplanationError noteId={noteId} errorType={!note ? "not-found" : "generic"} />
      ) : (
        showQuiz && quiz ? (
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
        )
      )}
    </div>
  );
};

export default ExplanationPage;
