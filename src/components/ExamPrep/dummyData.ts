
import { addDays, addMonths } from "date-fns";
import { Exam } from "./types";

// Generate dummy exam data
export const generateDummyExams = (): Exam[] => {
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
