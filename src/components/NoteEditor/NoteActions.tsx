import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Lightbulb, Save, Trash, BookOpen, BrainCircuit } from "lucide-react";
import { FC } from "react";
import { FileUploader } from "./FileUploader";
import { Note } from "@/types";
import { useNavigate } from "react-router-dom";
import { withSupabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useNoteStore } from "@/lib/store";

interface NoteActionsProps {
  noteId: string;
  title: string;
  setTitle: (title: string) => void;
  note: Note;
  isAnalyzing: boolean;
  handleSave: () => void;
  deleteNote: (id: string) => void;
  handleFileUpload: (attachment: any) => void;
  handlePdfTextExtracted?: (text: string) => void;
  handleExplainClick: () => void;
  forceAnalysis: () => void;
}

export const NoteActions: FC<NoteActionsProps> = ({
  noteId,
  title,
  setTitle,
  note,
  isAnalyzing,
  handleSave,
  deleteNote,
  handleFileUpload,
  handlePdfTextExtracted,
  handleExplainClick,
  forceAnalysis
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const saveQuizToNote = useNoteStore(state => state.saveQuizToNote);
  
  // Check if the note has analysis data and is ready for explanation
  const showExplainButton = note.analysis && note.analysis.readyForExplanation;
  
  // Also check if we have enough content but no analysis yet
  const showAnalyzeButton = note.content && note.content.length > 50 && (!note.analysis || !note.analysis.readyForExplanation);

  // Check if the note has saved resources
  const hasSavedResources = 
    (note.savedExplanations && note.savedExplanations.length > 0) || 
    (note.savedQuizzes && note.savedQuizzes.length > 0);
    
  // Function to generate quiz directly from note content
  const handleGenerateQuiz = async () => {
    if (!note || !note.content || note.content.length < 30) {
      toast({
        title: "Not enough content",
        description: "Add more content to your note to generate a quiz.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Generating quiz",
      description: "Please wait while we create questions based on your note.",
    });
    
    try {
      const topic = note.title || "Note Content";
      const noteContent = note.content;
      
      const quiz = await withSupabase(
        async (supabase) => {
          const { data, error } = await supabase.functions.invoke('generate-quiz', {
            body: {
              noteId,
              topic,
              explanation: noteContent, // Use note content directly instead of explanation
            },
          });
          
          if (error) {
            throw new Error(error.message);
          }
          
          return {
            id: `quiz-${Date.now()}`,
            noteId,
            topic,
            introduction: data.introduction,
            questions: data.questions,
            createdAt: new Date()
          };
        },
        null
      );
      
      if (quiz) {
        // Save the quiz to the note's savedQuizzes
        saveQuizToNote(noteId, quiz);
        
        toast({
          title: "Quiz generated",
          description: "Quiz has been saved to your resources.",
        });
        
        // Navigate to resources page to view the quiz
        navigate(`/note/${noteId}/resources`);
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

  return (
    <>
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex-1 flex items-center gap-3">
          <input 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            className="border-none text-lg font-medium focus-visible:ring-0 p-0 h-auto w-full bg-transparent focus:outline-none"
            placeholder="Untitled Note"
          />
          
          {isAnalyzing && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Analyzing...</span>
            </Badge>
          )}
          
          {showAnalyzeButton && (
            <Badge 
              variant="outline" 
              className="flex items-center gap-1 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors" 
              onClick={forceAnalysis}
            >
              <GraduationCap className="h-3 w-3" />
              <span>Analyze Note</span>
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <FileUploader 
            onFileUpload={handleFileUpload} 
            onPdfTextExtracted={handlePdfTextExtracted}
          />
          
          {/* Generate Quiz button */}
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full" 
            onClick={handleGenerateQuiz} 
            aria-label="Generate quiz from note"
            title="Generate quiz questions from note content"
          >
            <BrainCircuit className="h-4 w-4" />
          </Button>
          
          {/* Resources button to navigate to resources page */}
          <Button 
            variant={hasSavedResources ? "default" : "outline"} 
            size="icon" 
            className={`rounded-full ${hasSavedResources ? 'bg-secondary text-secondary-foreground' : ''}`}
            onClick={() => navigate(`/note/${noteId}/resources`)} 
            aria-label="View saved resources"
            title="View saved explanations and quizzes"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          
          {/* Permanent Explain button that is highlighted when ready */}
          <Button 
            variant={showExplainButton ? "default" : "outline"} 
            size="icon" 
            className={`rounded-full ${showExplainButton ? 'animate-pulse bg-primary text-primary-foreground' : ''}`}
            onClick={handleExplainClick} 
            aria-label="Explain note"
            title={showExplainButton ? "Explanation ready!" : "Not enough content for explanation"}
          >
            <Lightbulb className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full" 
            onClick={handleSave} 
            aria-label="Save note"
          >
            <Save className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full text-destructive hover:text-destructive" 
            onClick={() => deleteNote(noteId)} 
            aria-label="Delete note"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Remove the prominent explain button section since we now have a permanent button in the header */}
    </>
  );
};
