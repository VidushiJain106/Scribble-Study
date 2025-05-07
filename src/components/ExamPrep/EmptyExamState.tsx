
import { Book, GraduationCap, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function EmptyExamState() {
  const navigate = useNavigate();
  
  return (
    <Card className="flex flex-col items-center justify-center py-12 px-6 border-dashed border-2">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <GraduationCap className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-xl font-medium mb-1">No exams scheduled yet</h3>
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        Schedule your upcoming exams to start preparing effectively. Track your study progress and get AI-powered assistance.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={() => navigate("/exam-prep/new")} 
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Exam</span>
        </Button>
        <Button 
          variant="outline" 
          onClick={() => navigate("/note/new-exam-note")} 
          className="flex items-center gap-2"
        >
          <Book className="h-4 w-4" />
          <span>Create Study Note</span>
        </Button>
      </div>
    </Card>
  );
}
