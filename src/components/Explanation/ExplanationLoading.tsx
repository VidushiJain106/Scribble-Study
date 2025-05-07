
import { Loader2 } from "lucide-react";

interface ExplanationLoadingProps {
  isGeneratingQuiz: boolean;
}

export function ExplanationLoading({ isGeneratingQuiz }: ExplanationLoadingProps) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">
          {isGeneratingQuiz ? "Generating quiz questions..." : "Creating your explanation..."}
        </p>
      </div>
    </div>
  );
}
