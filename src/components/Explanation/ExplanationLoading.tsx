
import { Loader2 } from "lucide-react";

interface ExplanationLoadingProps {
  isGeneratingQuiz: boolean;
}

export function ExplanationLoading({ isGeneratingQuiz }: ExplanationLoadingProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-8">
      <div className="flex flex-col items-center max-w-md mx-auto text-center">
        <div className="bg-primary/10 p-4 rounded-full mb-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
        <h2 className="text-xl font-semibold mb-3">
          {isGeneratingQuiz ? "Generating quiz questions..." : "Creating your explanation..."}
        </h2>
        <p className="text-muted-foreground">
          {isGeneratingQuiz 
            ? "We're crafting challenging questions to test your knowledge." 
            : "We're analyzing your notes and preparing a detailed explanation."}
        </p>
        <div className="mt-6 w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div className="bg-primary h-full animate-pulse" style={{ width: "70%" }}></div>
        </div>
      </div>
    </div>
  );
}
