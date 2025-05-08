
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, RefreshCw } from "lucide-react";
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
        return "Unable to generate explanation";
    }
  };
  
  const getErrorDescription = () => {
    switch (errorType) {
      case "not-found":
        return "We couldn't find the note you're looking for.";
      case "not-ready":
        return "Try adding more content to your note so it can be analyzed properly.";
      default:
        return "There was a problem generating the explanation. Please try again.";
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate(noteId ? `/note/${noteId}` : '/')} 
            className="flex items-center gap-2"
            size="lg"
            variant="outline"
          >
            <ArrowLeft className="h-5 w-5" />
            {noteId ? "Return to note" : "Return to notes"}
          </Button>
          
          {onRetry && (
            <Button 
              onClick={onRetry} 
              className="flex items-center gap-2"
              size="lg"
            >
              <RefreshCw className="h-5 w-5" />
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
