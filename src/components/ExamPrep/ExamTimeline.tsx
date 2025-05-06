
import { format, addDays, differenceInDays, addWeeks, startOfDay } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Exam, getCategoryColor } from "./types";

interface ExamTimelineProps {
  exams: Exam[];
}

export function ExamTimeline({ exams }: ExamTimelineProps) {
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
    : addWeeks(today, 12);

  // Add buffer to start and end dates
  const timelineStartDate = addDays(earliestStudyDate, -7);
  const timelineEndDate = addDays(latestExamDate, 14);
  
  // Calculate total days for timeline width
  const dayWidth = 20; // pixels per day
  const totalDays = differenceInDays(timelineEndDate, timelineStartDate) + 1;
  const timelineWidth = totalDays * dayWidth;
  
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

  return (
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
  );
}
