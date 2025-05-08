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
  const { notes, saveExplanationToNote, saveQuizToNote } = useNoteStore();
  const navigate = useNavigate();
  const [showQuiz, setShowQuiz] = useState(false);
  const [isGeneratingMoreQuestions, setIsGeneratingMoreQuestions] = useState(false);
  const { toast } = useToast();
  
  const note = noteId ? notes.find(n => n.id === noteId) : null;
  const { 
    explanation, 
    quiz, 
    loading,
    fetchExplanation, 
    generateQuiz 
  } = useExplanationData(noteId, note);
  
  useEffect(() => {
    if (!note || !note.analysis || !note.analysis.readyForExplanation) {
      navigate(`/note/${noteId}`);
      return;
    }
    
    fetchExplanation();
  }, [noteId, note, navigate]);
  
  const handleTakeQuiz = async () => {
    const quizData = await generateQuiz();
    if (quizData) {
      setShowQuiz(true);
    }
  };
  
  const handleCompleteQuiz = () => {
    setShowQuiz(false);
  };

  const handleGenerateMoreQuestions = async (difficulty?: string) => {
    if (!quiz) return;
    
    setIsGeneratingMoreQuestions(true);
    try {
      console.log("Generating more questions...");
      console.log("Current question count:", quiz.questions.length);
      console.log("Selected difficulty:", difficulty || "mixed");
      
      // Force generate new questions and add them to existing ones
      const updatedQuiz = await generateQuiz(true, difficulty);
      
      if (updatedQuiz) {
        console.log("Questions generated successfully");
        console.log("New question count:", updatedQuiz.questions.length);
      } else {
        console.warn("Failed to update quiz with new questions");
      }
    } catch (error) {
      console.error("Error generating more questions:", error);
    } finally {
      setIsGeneratingMoreQuestions(false);
    }
  };
  
  const handleSaveExplanation = () => {
    if (!noteId || !explanation) return;
    
    try {
      // Save the explanation to the note
      saveExplanationToNote(noteId, explanation);
      
      toast({
        title: "Success",
        description: "Explanation saved to note",
      });
      
      // Redirect to the resources page
      navigate(`/note/${noteId}/resources`);
    } catch (error) {
      console.error("Error saving explanation:", error);
      toast({
        title: "Error",
        description: "Failed to save explanation",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveQuiz = () => {
    if (!noteId || !quiz) return;
    
    try {
      // Save the quiz to the note
      saveQuizToNote(noteId, quiz);
      
      toast({
        title: "Success",
        description: "Question bank saved to note",
      });
      
      // Redirect to the resources page
      navigate(`/note/${noteId}/resources`);
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast({
        title: "Error",
        description: "Failed to save question bank",
        variant: "destructive",
      });
    }
  };
  
  if (loading && !isGeneratingMoreQuestions) {
    return <ExplanationLoading isGeneratingQuiz={showQuiz && !quiz} />;
  }
  
  if (!note || !explanation) {
    return <ExplanationError />;
  }
  
  return showQuiz && quiz ? (
    <QuizContent 
      quiz={quiz}
      onComplete={handleCompleteQuiz} 
      onBackToExplanation={() => setShowQuiz(false)}
      onGenerateMoreQuestions={handleGenerateMoreQuestions}
      onSaveQuiz={handleSaveQuiz}
    />
  ) : (
    <ExplanationContent 
      explanation={explanation} 
      onTakeQuiz={handleTakeQuiz} 
      onSaveExplanation={handleSaveExplanation}
    />
  );
};

export default ExplanationPage;
