
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, BookOpen, FileText, Award, TestTube } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Example subjects - in a real app, these would come from the user's categories
const exampleSubjects = [
  { id: "math", name: "Mathematics", color: "text-note-blue" },
  { id: "physics", name: "Physics", color: "text-note-purple" },
  { id: "chemistry", name: "Chemistry", color: "text-note-blue" },
  { id: "english", name: "English Literature", color: "text-note-purple" },
];

export function SubjectCards() {
  const navigate = useNavigate();
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Study Subjects</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {exampleSubjects.map((subject) => (
          <SubjectCard 
            key={subject.id}
            id={subject.id}
            name={subject.name}
            colorClass={subject.color}
          />
        ))}
      </div>
    </div>
  );
}

interface SubjectCardProps {
  id: string;
  name: string;
  colorClass: string;
}

function SubjectCard({ id, name, colorClass }: SubjectCardProps) {
  const navigate = useNavigate();
  
  const handleAction = (action: string) => {
    // In a real app, these would navigate to the respective features
    console.log(`Navigate to ${action} for ${name}`);
    // navigate(`/exam-prep/${id}/${action}`);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 pb-4">
        <div className="flex items-center gap-2">
          <Book className={`h-5 w-5 ${colorClass}`} />
          <CardTitle>{name}</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="grid gap-4">
          <Button 
            variant="outline" 
            className="justify-start h-auto py-3"
            onClick={() => handleAction('lesson-plan')}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-primary" />
              <div className="font-medium">Lesson Plan</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start h-auto py-3"
            onClick={() => handleAction('flashcards')}
          >
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-primary" />
              <div className="font-medium">Flashcards</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start h-auto py-3"
            onClick={() => handleAction('mock-exam')}
          >
            <div className="flex items-center gap-3">
              <TestTube className="h-4 w-4 text-primary" />
              <div className="font-medium">Mock Exam</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="justify-start h-auto py-3"
            onClick={() => handleAction('results')}
          >
            <div className="flex items-center gap-3">
              <Award className="h-4 w-4 text-primary" />
              <div className="font-medium">Results</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
