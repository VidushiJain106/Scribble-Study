
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, differenceInDays, addWeeks, differenceInWeeks, startOfToday, addMonths, startOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Exam = {
  id: string;
  title: string;
  date: Date;
  category: string;
  studyStartDate: Date;
};

// Generate dummy exam data
const generateDummyExams = (): Exam[] => {
  const today = new Date();
  
  return [
    {
      id: "1",
      title: "Calculus Midterm",
      date: addDays(today, 14),
      category: "math",
      studyStartDate: addDays(today, 0)
    },
    {
      id: "2",
      title: "Physics Final",
      date: addDays(today, 45),
      category: "physics",
      studyStartDate: addDays(today, 15)
    },
    {
      id: "3",
      title: "Chemistry Lab Exam",
      date: addDays(today, 7),
      category: "chemistry",
      studyStartDate: addDays(today, -7)
    },
    {
      id: "4",
      title: "English Literature Essay",
      date: addDays(today, 30),
      category: "english",
      studyStartDate: addDays(today, 16)
    },
    {
      id: "5",
      title: "History Final",
      date: addMonths(today, 2),
      category: "history",
      studyStartDate: addDays(today, 30)
    },
  ];
};

export function ExamCalendar() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [newExamOpen, setNewExamOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [examTitle, setExamTitle] = useState("");
  const [examCategory, setExamCategory] = useState("");
  const [studyLeadTime, setStudyLeadTime] = useState("2");
  const { toast } = useToast();
  
  // Initialize with dummy data
  useEffect(() => {
    setExams(generateDummyExams());
  }, []);

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
  
  // Calculate timeline parameters
  const today = startOfDay(new Date());
  const earliestStudyDate = sortedExams.length > 0 
    ? sortedExams.reduce((earliest, exam) => 
      exam.studyStartDate < earliest ? exam.studyStartDate : earliest, 
      sortedExams[0].studyStartDate)
    : today;
    
  const latestExamDate = sortedExams.length > 0
    ? sortedExams.reduce((latest, exam) => 
      exam.date > latest ? exam.date : latest, 
      sortedExams[0].date)
    : addMonths(today, 3);

  // Add buffer to start and end dates
  const timelineStartDate = addDays(earliestStudyDate, -7);
  const timelineEndDate = addDays(latestExamDate, 14);
  
  // Calculate total weeks for timeline width
  const totalWeeks = differenceInWeeks(timelineEndDate, timelineStartDate) + 1;
  const dayWidth = 20; // pixels per day
  const timelineWidth = totalWeeks * 7 * dayWidth;
  
  // Generate week markers
  const weekMarkers = [];
  let currentDate = new Date(timelineStartDate);
  
  while (currentDate <= timelineEndDate) {
    const daysSinceStart = differenceInDays(currentDate, timelineStartDate);
    const position = daysSinceStart * dayWidth;
    
    weekMarkers.push({
      date: new Date(currentDate),
      position
    });
    
    // Move to next week
    currentDate = addDays(currentDate, 7);
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "math": 
        return "bg-blue-500";
      case "physics": 
        return "bg-orange-500";
      case "chemistry": 
        return "bg-green-500";
      case "english": 
        return "bg-purple-500";
      case "history": 
        return "bg-red-500";
      default: 
        return "bg-primary";
    }
  };

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
          <div className="relative py-6 overflow-hidden">
            <ScrollArea className="w-full h-[180px]">
              <div 
                className="relative" 
                style={{ 
                  width: `${timelineWidth}px`,
                  minWidth: "100%",
                  height: "180px"
                }}
              >
                {/* Timeline base line */}
                <div className="absolute left-0 right-0 top-[80px] h-1 bg-primary/20 rounded-full" />
                
                {/* Week interval markers */}
                {weekMarkers.map((marker, index) => (
                  <div 
                    key={index} 
                    className="absolute h-3 w-0.5 bg-primary/30 -translate-x-px"
                    style={{ 
                      left: `${marker.position}px`,
                      top: "74px" 
                    }}
                  >
                    <div className="absolute -top-7 -translate-x-1/2 text-xs font-medium text-muted-foreground">
                      {format(marker.date, "MMM d")}
                    </div>
                  </div>
                ))}
                
                {/* Today marker */}
                <div 
                  className="absolute h-4 w-1 bg-primary z-10 -translate-x-px"
                  style={{ 
                    left: `${differenceInDays(today, timelineStartDate) * dayWidth}px`,
                    top: "72px" 
                  }}
                >
                  <div className="absolute -top-7 -translate-x-1/2 text-xs font-semibold text-primary">
                    Today
                  </div>
                </div>
                
                {/* Exams on timeline */}
                {sortedExams.map((exam) => {
                  const examDaysFromStart = differenceInDays(exam.date, timelineStartDate);
                  const studyStartDaysFromStart = differenceInDays(exam.studyStartDate, timelineStartDate);
                  const studyDuration = differenceInDays(exam.date, exam.studyStartDate);
                  const examPosition = examDaysFromStart * dayWidth;
                  const studyStartPosition = studyStartDaysFromStart * dayWidth;
                  
                  return (
                    <div key={exam.id} className="absolute" style={{ left: `${examPosition}px`, top: "65px" }}>
                      {/* Study period bar */}
                      <div 
                        className={`absolute h-3 rounded-full bg-opacity-30 ${getCategoryColor(exam.category).replace('bg-', 'bg-opacity-30 bg-')}`}
                        style={{
                          width: `${studyDuration * dayWidth}px`,
                          right: '0px',
                          top: '15px'
                        }}
                      />
                      
                      {/* Exam dot */}
                      <div 
                        className={`w-3 h-3 rounded-full ${getCategoryColor(exam.category)} border-2 border-background z-10`}
                      />
                      
                      {/* Exam info */}
                      <div className="absolute -translate-x-1/2 mt-2 w-[120px] text-center">
                        <div className="text-xs font-medium">
                          {format(exam.date, "MMM d, yyyy")}
                        </div>
                        <div className="text-xs font-semibold line-clamp-2 mt-1 text-foreground">
                          {exam.title}
                        </div>
                        <div className={`mt-1 px-1.5 py-0.5 text-[0.65rem] inline-block rounded-full
                          ${getCategoryColor(exam.category).replace('bg-', 'text-')} bg-background/80`}>
                          {exam.category}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
