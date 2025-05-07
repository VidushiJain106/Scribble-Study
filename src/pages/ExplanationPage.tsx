
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNoteStore } from "@/lib/store";
import { ExplanationContent } from "@/components/Explanation/ExplanationContent";
import { QuizContent } from "@/components/Quiz/QuizContent";
import { Explanation, Quiz } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { withSupabase, getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

const ExplanationPage = () => {
  const { id: noteId } = useParams<{ id: string }>();
  const notes = useNoteStore(state => state.notes);
  const navigate = useNavigate();
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const note = noteId ? notes.find(n => n.id === noteId) : null;
  
  useEffect(() => {
    if (!note || !note.analysis || !note.analysis.readyForExplanation) {
      navigate(`/note/${noteId}`);
      return;
    }
    
    const fetchExplanation = async () => {
      setLoading(true);
      
      try {
        if (!isSupabaseConfigured()) {
          toast({
            title: "Connection Error",
            description: "Cannot connect to Supabase. Please try again later.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        // Use withSupabase helper to safely fetch or generate explanation
        const explanation = await withSupabase(
          async (supabase) => {
            // First check if we have a stored explanation
            const { data: existingExplanation } = await supabase
              .from('explanations')
              .select('*')
              .eq('note_id', noteId)
              .single();
            
            if (existingExplanation) {
              return {
                id: existingExplanation.id,
                noteId: existingExplanation.note_id,
                topic: existingExplanation.topic,
                title: existingExplanation.title,
                content: existingExplanation.content,
                createdAt: new Date(existingExplanation.created_at)
              };
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
              
              return {
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
            }
          },
          null
        );
        
        if (explanation) {
          setExplanation(explanation);
        } else {
          toast({
            title: "Error",
            description: "Failed to get explanation. Please try again later.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching explanation:", error);
        toast({
          title: "Error",
          description: "An error occurred while fetching the explanation.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchExplanation();
  }, [noteId, note, navigate, toast]);
  
  const handleTakeQuiz = async () => {
    setLoading(true);
    
    try {
      if (!isSupabaseConfigured()) {
        toast({
          title: "Connection Error",
          description: "Cannot connect to Supabase. Please try again later.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Use withSupabase helper to safely fetch or generate quiz
      const quiz = await withSupabase(
        async (supabase) => {
          // Check if we have a stored quiz
          const { data: existingQuiz } = await supabase
            .from('quizzes')
            .select('*')
            .eq('note_id', noteId)
            .single();
          
          if (existingQuiz) {
            return {
              id: existingQuiz.id,
              noteId: existingQuiz.note_id,
              topic: existingQuiz.topic,
              introduction: existingQuiz.introduction,
              questions: existingQuiz.questions,
              createdAt: new Date(existingQuiz.created_at)
            };
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
            
            return {
              noteId,
              topic: explanation.topic,
              introduction: data.introduction,
              questions: data.questions,
              createdAt: new Date()
            };
          }
          
          return null;
        },
        null
      );
      
      if (quiz) {
        setQuiz(quiz);
        setShowQuiz(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to generate quiz. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast({
        title: "Error",
        description: "An error occurred while generating the quiz.",
        variant: "destructive",
      });
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

