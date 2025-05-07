
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

interface FloatingExplainButtonProps {
  onClick: () => void;
  show: boolean;
}

export function FloatingExplainButton({ onClick, show }: FloatingExplainButtonProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-20 right-6 z-40">
      <Button onClick={onClick} className="flex items-center gap-2 shadow-lg animate-bounce" size="lg">
        <GraduationCap className="h-5 w-5" />
        <span>Explain This Topic!</span>
      </Button>
    </div>
  );
}
