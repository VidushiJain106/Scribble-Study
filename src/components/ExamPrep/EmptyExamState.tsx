
import { GraduationCap } from "lucide-react";

export function EmptyExamState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      <GraduationCap className="h-12 w-12 mb-2 opacity-30" />
      <p>No exams scheduled yet.</p>
      <p className="text-sm">Click "Add Exam" to schedule your first exam.</p>
    </div>
  );
}
