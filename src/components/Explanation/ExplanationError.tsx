
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ExplanationErrorProps {
  noteId?: string;
  errorType?: "not-found" | "not-ready" | "generic";
}

export function ExplanationError({ 
  noteId, 
  errorType = "generic" 
}: ExplanationErrorProps) {
  const navigate = useNavigate();
  
  const getErrorMessage = () => {
    switch (errorType) {
      case "not-found":
        return "Note not found";
      case "not-ready":
        return "This note isn't ready for explanation yet";
      default:
        return "Unable to load explanation";
    }
  };
  
  const getErrorDescription = () => {
    switch (errorType) {
      case "not-found":
        return "We couldn't find the note you're looking for.";
      case "not-ready":
        return "Try adding more content to your note so it can be analyzed properly.";
      default:
        return "There was a problem loading the explanation. Please try again later.";
    }
  };
  
  return (
    <div className="container max-w-lg mx-auto py-16 px-4 text-center">
      <div className="bg-destructive/10 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold mb-3">{getErrorMessage()}</h1>
      <p className="text-muted-foreground mb-8">{getErrorDescription()}</p>
      <Button 
        onClick={() => navigate(noteId ? `/note/${noteId}` : '/')} 
        className="flex items-center gap-2 mx-auto"
      >
        <ArrowLeft className="h-4 w-4" />
        {noteId ? "Return to note" : "Return to notes"}
      </Button>
    </div>
  );
}
