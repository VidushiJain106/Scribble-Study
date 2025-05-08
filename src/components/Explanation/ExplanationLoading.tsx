
import { Loader2 } from "lucide-react";

interface ExplanationLoadingProps {
  isGeneratingQuiz: boolean;
}

export function ExplanationLoading({ isGeneratingQuiz }: ExplanationLoadingProps) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] p-8">
      <div className="flex flex-col items-center max-w-md mx-auto text-center bg-card/50 backdrop-blur-sm p-8 rounded-lg shadow-lg">
        <div className="bg-primary/10 p-6 rounded-full mb-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-3">
          {isGeneratingQuiz ? "Generating quiz questions..." : "Creating your explanation..."}
        </h2>
        <p className="text-muted-foreground mb-6">
          {isGeneratingQuiz 
            ? "We're crafting challenging questions to test your knowledge." 
            : "We're analyzing your notes and preparing a detailed explanation."}
        </p>
        <div className="mt-4 w-full bg-muted rounded-full h-2 overflow-hidden">
          <div className="bg-primary h-full animate-pulse" style={{ width: "70%" }}></div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">This may take a moment</p>
      </div>
    </div>
  );
}
