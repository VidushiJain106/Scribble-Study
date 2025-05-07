
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNoteStore } from "@/lib/store";
import { ExplanationContent } from "@/components/Explanation/ExplanationContent";
import { QuizContent } from "@/components/Quiz/QuizContent";
import { Explanation, Quiz } from "@/types";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ExplanationPage = () => {
  const { id: noteId } = useParams<{ id: string }>();
  const notes = useNoteStore(state => state.notes);
  const navigate = useNavigate();
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const note = noteId ? notes.find(n => n.id === noteId) : null;
  
  useEffect(() => {
    if (!note || !note.analysis || !note.analysis.readyForExplanation) {
      navigate(`/note/${noteId}`);
      return;
    }
    
    const fetchExplanation = async () => {
      setLoading(true);
      
      try {
        // First check if we have a stored explanation
        const { data: existingExplanation } = await supabase
          .from('explanations')
          .select('*')
          .eq('note_id', noteId)
          .single();
        
        if (existingExplanation) {
          setExplanation({
            id: existingExplanation.id,
            noteId: existingExplanation.note_id,
            topic: existingExplanation.topic,
            title: existingExplanation.title,
            content: existingExplanation.content,
            createdAt: new Date(existingExplanation.created_at)
          });
        } else {
          // Generate a new explanation
          const { data, error } = await supabase.functions.invoke('generate-explanation', {
            body: {
              noteId,
              topic: note.analysis.mainTopic,
              concepts: note.analysis.concepts,
              noteContent: note.content
            },
          });
          
          if (error) {
            throw new Error(error.message);
          }
          
          setExplanation({
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
          });
        }
      } catch (error) {
        console.error("Error fetching explanation:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchExplanation();
  }, [noteId, note, navigate]);
  
  const handleTakeQuiz = async () => {
    setLoading(true);
    
    try {
      // Check if we have a stored quiz
      const { data: existingQuiz } = await supabase
        .from('quizzes')
        .select('*')
        .eq('note_id', noteId)
        .single();
      
      if (existingQuiz) {
        setQuiz({
          id: existingQuiz.id,
          noteId: existingQuiz.note_id,
          topic: existingQuiz.topic,
          introduction: existingQuiz.introduction,
          questions: existingQuiz.questions,
          createdAt: new Date(existingQuiz.created_at)
        });
      } else if (explanation) {
        // Generate a new quiz
        const { data, error } = await supabase.functions.invoke('generate-quiz', {
          body: {
            noteId,
            topic: explanation.topic,
            explanation: JSON.stringify(explanation.content)
          },
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        setQuiz({
          noteId,
          topic: explanation.topic,
          introduction: data.introduction,
          questions: data.questions,
          createdAt: new Date()
        });
      }
      
      setShowQuiz(true);
    } catch (error) {
      console.error("Error fetching quiz:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCompleteQuiz = () => {
    setShowQuiz(false);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">
            {explanation ? "Generating quiz questions..." : "Creating your explanation..."}
          </p>
        </div>
      </div>
    );
  }
  
  if (!note || !explanation) {
    return (
      <div className="container max-w-3xl mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Note not found or not ready for explanation</h1>
        <Button onClick={() => navigate('/')} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Return to notes
        </Button>
      </div>
    );
  }
  
  return showQuiz && quiz ? (
    <QuizContent 
      quiz={quiz}
      onComplete={handleCompleteQuiz} 
      onBackToExplanation={() => setShowQuiz(false)}
    />
  ) : (
    <ExplanationContent explanation={explanation} onTakeQuiz={handleTakeQuiz} />
  );
};

export default ExplanationPage;
