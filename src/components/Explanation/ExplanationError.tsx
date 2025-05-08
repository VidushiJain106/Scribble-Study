
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
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-8">
      <div className="container max-w-lg mx-auto p-8 text-center bg-card/50 backdrop-blur-sm rounded-lg shadow-lg">
        <div className="bg-destructive/10 p-6 rounded-full w-20 h-20 mx-auto mb-8 flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold mb-4">{getErrorMessage()}</h1>
        <p className="text-muted-foreground mb-8 text-lg">{getErrorDescription()}</p>
        <Button 
          onClick={() => navigate(noteId ? `/note/${noteId}` : '/')} 
          className="flex items-center gap-2 mx-auto px-6 py-5"
          size="lg"
        >
          <ArrowLeft className="h-5 w-5" />
          {noteId ? "Return to note" : "Return to notes"}
        </Button>
      </div>
    </div>
  );
}
