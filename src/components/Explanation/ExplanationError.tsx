
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ExplanationError() {
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 text-center">
      <h1 className="text-2xl font-bold mb-4">Note not found or not ready for explanation</h1>
      <Button onClick={() => navigate('/')} className="flex items-center gap-1">
        <ArrowLeft className="h-4 w-4" />
        Return to notes
      </Button>
    </div>
  );
}
