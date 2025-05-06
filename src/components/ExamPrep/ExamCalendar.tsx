
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, differenceInDays, addWeeks, isBefore, isAfter, addMonths } from "date-fns";
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

type TimeRange = "30" | "60" | "90" | "all";

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
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
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

  // Filter exams based on selected time range
  const filteredExams = exams.filter(exam => {
    if (timeRange === "all") return true;
    
    const today = new Date();
    const rangeEndDate = addDays(today, parseInt(timeRange));
    return isAfter(exam.date, today) && isBefore(exam.date, rangeEndDate);
  });

  // Sort exams by date
  const sortedExams = [...filteredExams].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Exam Timeline
          </CardTitle>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="60">60 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
                <SelectItem value="all">All Exams</SelectItem>
              </SelectContent>
            </Select>
            
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
          <div className="relative py-6">
            {/* Timeline container */}
            <div className="mt-6 mb-10">
              {/* Main horizontal timeline line */}
              <div className="h-2 bg-primary/20 relative rounded-full">
                {/* Current date marker */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-primary" 
                  style={{ left: '0%' }}
                ></div>
              </div>
              
              {/* Timeline items */}
              <div className="relative mt-6">
                <div className="flex flex-wrap gap-8 pt-4">
                  {sortedExams.map((exam, index) => {
                    const daysUntilExam = differenceInDays(exam.date, new Date());
                    const totalDays = sortedExams.length > 0 ? 
                      differenceInDays(
                        sortedExams[sortedExams.length - 1].date, 
                        new Date()
                      ) : 90;
                    
                    // Calculate position percentage (minimum 5% to ensure visibility)
                    const positionPercent = Math.max(
                      5, 
                      Math.min(95, (daysUntilExam / Math.max(totalDays, 1)) * 100)
                    );
                    
                    const colorClasses = [
                      "bg-blue-500", "bg-green-500", "bg-yellow-500", 
                      "bg-orange-500", "bg-red-500", "bg-purple-500", "bg-pink-500"
                    ];
                    const colorClass = colorClasses[index % colorClasses.length];
                    
                    return (
                      <div 
                        key={exam.id} 
                        className="flex-1 min-w-[220px] max-w-[300px] animate-fade-in"
                        style={{ 
                          animationDelay: `${index * 100}ms`
                        }}
                      >
                        {/* Connection line to timeline */}
                        <div 
                          className="absolute top-[-24px] h-6 w-0.5 bg-border"
                          style={{ left: `${positionPercent}%` }}
                        ></div>
                        
                        {/* Exam marker */}
                        <div
                          className="absolute top-[-36px] w-5 h-5 rounded-full border-4 border-background"
                          style={{ 
                            left: `${positionPercent}%`,
                            marginLeft: "-10px",
                            background: `var(--${exam.category === "math" ? "primary" : 
                              exam.category === "physics" ? "note-blue" :
                              exam.category === "chemistry" ? "note-green" :
                              exam.category === "english" ? "note-purple" :
                              "note-orange"})`
                          }}
                        ></div>
                        
                        {/* Card with exam info */}
                        <div className={`
                          border rounded-lg shadow-sm bg-card p-4 
                          ${index % 2 === 0 ? 'mt-8' : 'mt-20'}
                        `}>
                          <div className="mb-2">
                            <h3 className="text-lg font-medium">{exam.title}</h3>
                            <span className="inline-block px-2 py-0.5 text-xs rounded-md bg-primary/10 text-primary capitalize">
                              {exam.category}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm">
                            <div>
                              <span className="font-medium">Date:</span> {format(exam.date, "MMM d, yyyy")}
                            </div>
                            <div>
                              <span className="font-medium">Start studying:</span> {format(exam.studyStartDate, "MMM d")}
                            </div>
                            {daysUntilExam > 0 && (
                              <div className="text-xs text-muted-foreground">
                                {daysUntilExam} days remaining
                              </div>
                            )}
                          </div>
                          
                          {/* Progress indicator */}
                          {daysUntilExam > 0 && (
                            <div className="mt-2">
                              <div className="h-1.5 bg-primary/10 rounded-full w-full">
                                <div 
                                  className="h-full bg-primary rounded-full"
                                  style={{ 
                                    width: `${Math.max(
                                      0, 
                                      Math.min(
                                        100, 
                                        100 - (daysUntilExam / differenceInDays(exam.date, exam.studyStartDate) * 100)
                                      )
                                    )}%` 
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
