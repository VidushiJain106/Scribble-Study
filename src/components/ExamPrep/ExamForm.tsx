
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addWeeks } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Exam } from "./types";
import { useToast } from "@/hooks/use-toast";

interface ExamFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExam: (exam: Exam) => void;
}

export function ExamForm({ open, onOpenChange, onAddExam }: ExamFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [examTitle, setExamTitle] = useState("");
  const [examCategory, setExamCategory] = useState("");
  const [studyLeadTime, setStudyLeadTime] = useState("2");
  const { toast } = useToast();

  const handleAddExam = () => {
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
    
    onAddExam(newExam);
    onOpenChange(false);
    setSelectedDate(undefined);
    setExamTitle("");
    setExamCategory("");
    
    toast({
      title: "Exam added",
      description: `${examTitle} exam scheduled for ${format(selectedDate, "PPP")}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                  className="p-3"
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
          <Button onClick={handleAddExam}>Add Exam</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
