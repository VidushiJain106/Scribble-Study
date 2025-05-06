import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, BookOpen, FileText, Award, TestTube, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [isOpen, setIsOpen] = useState(false);
  
  const handleAction = (action: string, e: React.MouseEvent) => {
    // Prevent default to keep the dropdown open
    e.preventDefault();
    e.stopPropagation();
    
    // In a real app, these would navigate to the respective features
    console.log(`Navigate to ${action} for ${name}`);
    
    // Navigate to the action page, but do this with a slight delay
    // so the dropdown animation can complete
    setTimeout(() => {
      navigate(`/exam-prep/${id}/${action}`);
    }, 300);
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
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="justify-start h-auto py-3 w-full"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <div className="font-medium">Lesson Plan</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-popover" align="start">
              <DropdownMenuItem onClick={(e) => handleAction('lesson-plan', e as React.MouseEvent)}>
                View Lesson Plan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction('create-plan', e as React.MouseEvent)}>
                Create New Plan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction('edit-plan', e as React.MouseEvent)}>
                Edit Existing Plan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="justify-start h-auto py-3 w-full"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-primary" />
                  <div className="font-medium">Flashcards</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-popover" align="start">
              <DropdownMenuItem onClick={(e) => handleAction('flashcards', e as React.MouseEvent)}>
                View Flashcards
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction('create-flashcards', e as React.MouseEvent)}>
                Create Flashcards
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction('practice', e as React.MouseEvent)}>
                Practice Mode
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="justify-start h-auto py-3 w-full"
              >
                <div className="flex items-center gap-3">
                  <TestTube className="h-4 w-4 text-primary" />
                  <div className="font-medium">Mock Exam</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-popover" align="start">
              <DropdownMenuItem onClick={(e) => handleAction('mock-exam', e as React.MouseEvent)}>
                Take Mock Exam
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction('create-exam', e as React.MouseEvent)}>
                Create Mock Exam
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction('past-exams', e as React.MouseEvent)}>
                Past Exams
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="justify-start h-auto py-3 w-full"
              >
                <div className="flex items-center gap-3">
                  <Award className="h-4 w-4 text-primary" />
                  <div className="font-medium">Results</div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-popover" align="start">
              <DropdownMenuItem onClick={(e) => handleAction('results', e as React.MouseEvent)}>
                View Results
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction('analytics', e as React.MouseEvent)}>
                Performance Analytics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction('improvement', e as React.MouseEvent)}>
                Improvement Areas
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
