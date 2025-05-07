import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface ExplanationErrorProps {
  noteId?: string;
  errorType?: "not-found" | "not-ready" | "generic" | "network";
  onRetry?: () => void;
  lastAttemptTime?: number | null;
}

export function ExplanationError({ 
  noteId, 
  errorType = "generic",
  onRetry,
  lastAttemptTime
}: ExplanationErrorProps) {
  const navigate = useNavigate();
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Calculate how long ago the last attempt was
  const getTimeAgo = () => {
    if (!lastAttemptTime) return "";
    
    const seconds = Math.floor((Date.now() - lastAttemptTime) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  };
  
  const getErrorIcon = () => {
    if (errorType === "network") return <Wifi className="w-12 h-12 text-muted-foreground mb-4" />;
    return null;
  };
  
  const getErrorMessage = () => {
    switch (errorType) {
      case "not-found":
        return "Note not found";
      case "not-ready":
        return "This note isn't ready for explanation yet";
      case "network":
        return "Connection issue detected";
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
      case "network":
        return "We're having trouble connecting to our servers. This could be due to your internet connection or our servers might be experiencing issues.";
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
      case "network":
        return "Check your internet connection and try again. If the problem persists, our servers might be experiencing issues.";
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
      // Keep the retry state for a short while to provide feedback
      setTimeout(() => {
        setIsRetrying(false);
      }, 1500);
    }
  };
  
  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 text-center">
      {getErrorIcon()}
      
      <h1 className="text-2xl font-bold mb-2">{getErrorMessage()}</h1>
      <p className="text-muted-foreground mb-3">{getErrorDescription()}</p>
      
      {lastAttemptTime && (
        <p className="text-sm text-muted-foreground mb-3">
          Last attempt: {getTimeAgo()}
        </p>
      )}
      
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
