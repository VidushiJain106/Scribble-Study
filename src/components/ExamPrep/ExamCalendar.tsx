
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, differenceInDays, addWeeks } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

type Exam = {
  id: string;
  title: string;
  date: Date;
  category: string;
  studyStartDate: Date;
};

export function ExamCalendar() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [newExamOpen, setNewExamOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [examTitle, setExamTitle] = useState("");
  const [examCategory, setExamCategory] = useState("");
  const [studyLeadTime, setStudyLeadTime] = useState("2");
  const { toast } = useToast();

  const addExam = () => {
    if (!selectedDate || !examTitle || !examCategory) {
      toast({
        title: "Missing information",
        description: "Please fill out all fields",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate study start date based on lead time (in weeks)
    const studyStartDate = addWeeks(selectedDate, -parseInt(studyLeadTime));
    
    const newExam: Exam = {
      id: Date.now().toString(),
      title: examTitle,
      date: selectedDate,
      category: examCategory,
      studyStartDate
    };
    
    setExams([...exams, newExam]);
    setNewExamOpen(false);
    setSelectedDate(undefined);
    setExamTitle("");
    setExamCategory("");
    
    toast({
      title: "Exam added",
      description: `${examTitle} exam scheduled for ${format(selectedDate, "PPP")}`,
    });
  };

  // Sort exams by date
  const sortedExams = [...exams].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Exam Timeline
          </CardTitle>
          <Dialog open={newExamOpen} onOpenChange={setNewExamOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                Add Exam
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Schedule New Exam</DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="exam-title">Exam Title</Label>
                  <Input 
                    id="exam-title"
                    placeholder="Midterm Algebra" 
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="exam-category">Subject</Label>
                  <Select value={examCategory} onValueChange={setExamCategory}>
                    <SelectTrigger id="exam-category">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Math</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="exam-date">Exam Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="exam-date"
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="study-lead-time">Study Lead Time (weeks)</Label>
                  <Select value={studyLeadTime} onValueChange={setStudyLeadTime}>
                    <SelectTrigger id="study-lead-time">
                      <SelectValue placeholder="Select weeks before exam" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 week</SelectItem>
                      <SelectItem value="2">2 weeks</SelectItem>
                      <SelectItem value="3">3 weeks</SelectItem>
                      <SelectItem value="4">4 weeks</SelectItem>
                      <SelectItem value="6">6 weeks</SelectItem>
                      <SelectItem value="8">8 weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button onClick={addExam}>Add Exam</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <GraduationCap className="h-12 w-12 mb-2 opacity-30" />
            <p>No exams scheduled yet.</p>
            <p className="text-sm">Click "Add Exam" to schedule your first exam.</p>
          </div>
        ) : (
          <div className="relative pt-4 pb-8">
            {/* Timeline line */}
            <div className="absolute left-0 top-8 bottom-8 w-0.5 bg-border"></div>
            
            {/* Exams on timeline */}
            <div className="space-y-8">
              {sortedExams.map((exam) => {
                const daysUntilExam = differenceInDays(exam.date, new Date());
                const studyPeriodDays = differenceInDays(exam.date, exam.studyStartDate);
                
                return (
                  <div key={exam.id} className="relative pl-8">
                    {/* Timeline dot */}
                    <div className="absolute left-[-8px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-background"></div>
                    
                    {/* Study period indicator */}
                    <div 
                      className="absolute left-[-6px] top-0 w-3 rounded-full bg-primary/20"
                      style={{ 
                        height: `${Math.max(studyPeriodDays * 4, 16)}px`,
                        top: '-4px'
                      }}
                    ></div>
                    
                    <div className="mb-1 flex items-center">
                      <h3 className="text-lg font-medium">{exam.title}</h3>
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-md bg-primary/10 text-primary">{exam.category}</span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Exam Date:</span> {format(exam.date, "PPP")} 
                        {daysUntilExam > 0 && <span className="text-xs">({daysUntilExam} days left)</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Start studying:</span> {format(exam.studyStartDate, "PPP")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
