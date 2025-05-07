
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Lightbulb, Save, Trash } from "lucide-react";
import { FC } from "react";
import { FileUploader } from "./FileUploader";
import { Note } from "@/types";
import { useNavigate } from "react-router-dom";

interface NoteActionsProps {
  noteId: string;
  title: string;
  setTitle: (title: string) => void;
  note: Note;
  isAnalyzing: boolean;
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
  handleSave,
  deleteNote,
  handleFileUpload,
  handleExplainClick,
  forceAnalysis
}) => {
  const navigate = useNavigate();
  
  // Check if the note has analysis data and is ready for explanation
  const showExplainButton = note.analysis && note.analysis.readyForExplanation;
  
  // Also check if we have enough content but no analysis yet
  const showAnalyzeButton = note.content && note.content.length > 50 && (!note.analysis || !note.analysis.readyForExplanation);

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
          
          {showExplainButton && (
            <Badge 
              variant="outline" 
              className="flex items-center gap-1 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors animate-pulse" 
              onClick={handleExplainClick}
            >
              <Lightbulb className="h-3 w-3" />
              <span>Explain!</span>
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
          
          {isAnalyzing && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Analyzing...</span>
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <FileUploader onFileUpload={handleFileUpload} />
          
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
      
      {/* Add a prominent explain button at the top of the note content if available */}
      {showExplainButton && (
        <div className="px-4 py-3 bg-muted/50 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span>This note has been analyzed and is ready for explanation!</span>
          </div>
          <Button 
            onClick={handleExplainClick} 
            variant="default" 
            size="sm" 
            className="flex items-center gap-2"
          >
            <GraduationCap className="h-4 w-4" />
            <span>Explain This Topic</span>
          </Button>
        </div>
      )}
    </>
  );
};
