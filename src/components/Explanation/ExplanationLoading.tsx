
import { Loader2 } from "lucide-react";

interface ExplanationLoadingProps {
  isGeneratingQuiz: boolean;
}

export function ExplanationLoading({ isGeneratingQuiz }: ExplanationLoadingProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">
          {isGeneratingQuiz ? "Generating quiz questions..." : "Creating your explanation..."}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {isGeneratingQuiz 
            ? "We're crafting challenging questions to test your knowledge." 
            : "We're analyzing your notes and preparing a detailed explanation."}
        </p>
      </div>
    </div>
  );
}
