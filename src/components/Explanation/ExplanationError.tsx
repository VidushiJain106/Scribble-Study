
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ExplanationErrorProps {
  noteId?: string;
  errorType?: "not-found" | "not-ready" | "generic";
  onRetry?: () => void;
}

export function ExplanationError({ 
  noteId, 
  errorType = "generic",
  onRetry
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
    <div className="container max-w-3xl mx-auto py-12 px-4 text-center">
      <h1 className="text-2xl font-bold mb-2">{getErrorMessage()}</h1>
      <p className="text-muted-foreground mb-6">{getErrorDescription()}</p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button 
          onClick={() => navigate(noteId ? `/note/${noteId}` : '/')} 
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          {noteId ? "Return to note" : "Return to notes"}
        </Button>
        
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline" 
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
