
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Plus } from "lucide-react";
import { DialogTrigger } from "@/components/ui/dialog";
import { ExamForm } from "./ExamForm";
import { ExamTimeline } from "./ExamTimeline";
import { EmptyExamState } from "./EmptyExamState";
import { generateDummyExams } from "./dummyData";
import { Exam } from "./types";

export function ExamCalendar() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [newExamOpen, setNewExamOpen] = useState(false);
  
  // Initialize with dummy data
  useEffect(() => {
    setExams(generateDummyExams());
  }, []);

  const addExam = (exam: Exam) => {
    setExams([...exams, exam]);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Exam Timeline
          </CardTitle>
          
          <Button 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setNewExamOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Exam
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {exams.length === 0 ? (
          <EmptyExamState />
        ) : (
          <ExamTimeline exams={exams} />
        )}
      </CardContent>

      <ExamForm 
        open={newExamOpen} 
        onOpenChange={setNewExamOpen} 
        onAddExam={addExam} 
      />
    </Card>
  );
}
