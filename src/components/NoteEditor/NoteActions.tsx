
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Lightbulb, Save, Trash, Loader2 } from "lucide-react";
import { FC } from "react";
import { FileUploader } from "./FileUploader";
import { Note } from "@/types";
import { useNavigate } from "react-router-dom";

interface NoteActionsProps {
  noteId: string;
  title: string;
  setTitle: (title: string) => void;
  note: Note | null;
  isAnalyzing: boolean;
  isSaving?: boolean;
  handleSave: () => void;
  deleteNote: (id: string) => void;
  handleFileUpload: (attachment: any) => void;
  handleExplainClick: () => void;
  forceAnalysis: () => void;
}

export const NoteActions: FC<NoteActionsProps> = ({
  noteId,
  title,
  setTitle,
  note,
  isAnalyzing,
  isSaving = false,
  handleSave,
  deleteNote,
  handleFileUpload,
  handleExplainClick,
  forceAnalysis
}) => {
  const navigate = useNavigate();
  
  // Check if the note has analysis data and is ready for explanation
  const showExplainButton = note && note.analysis && note.analysis.readyForExplanation;
  
  // Also check if we have enough content but no analysis yet
  const showAnalyzeButton = note && note.content && note.content.length > 50 && (!note.analysis || !note.analysis.readyForExplanation);

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
          <FileUploader onFileUpload={handleFileUpload} />
          
          {/* Permanent Explain button that is highlighted when ready */}
          <Button 
            variant={showExplainButton ? "default" : "outline"} 
            size="icon" 
            className={`rounded-full ${showExplainButton ? 'animate-pulse bg-primary text-primary-foreground' : ''}`}
            onClick={handleExplainClick} 
            aria-label="Explain note"
            title={showExplainButton ? "Explanation ready!" : "Not enough content for explanation"}
            disabled={!note}
          >
            <Lightbulb className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full" 
            onClick={handleSave} 
            aria-label="Save note"
            disabled={isSaving || !note}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full text-destructive hover:text-destructive" 
            onClick={() => deleteNote(noteId)} 
            aria-label="Delete note"
            disabled={!note}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
};
