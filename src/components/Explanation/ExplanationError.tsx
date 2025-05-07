
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

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
  const [isRetrying, setIsRetrying] = useState(false);
  
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
        return "There was a problem loading the explanation. Please try again.";
    }
  };
  
  const getErrorTips = () => {
    switch (errorType) {
      case "not-found":
        return "Make sure you're using the correct URL and that the note hasn't been deleted.";
      case "not-ready":
        return "Notes need enough content (at least a paragraph) to generate an explanation. Add more details to your note.";
      default:
        return "This could be due to a temporary issue with our explanation service. You can try again or return to your note and come back later.";
    }
  };
  
  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };
  
  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 text-center">
      <h1 className="text-2xl font-bold mb-2">{getErrorMessage()}</h1>
      <p className="text-muted-foreground mb-3">{getErrorDescription()}</p>
      
      <div className="bg-secondary/30 p-4 rounded-lg mb-6 text-left">
        <p className="text-sm text-muted-foreground mb-2"><strong>Tip:</strong></p>
        <p className="text-sm">{getErrorTips()}</p>
      </div>
      
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
            onClick={handleRetry}
            variant="outline" 
            className="flex items-center gap-1"
            disabled={isRetrying}
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Retry'}
          </Button>
        )}
      </div>
    </div>
  );
}
