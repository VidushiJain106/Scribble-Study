
import { type } from "os";

export type Exam = {
  id: string;
  title: string;
  date: Date;
  category: string;
  studyStartDate: Date;
};

export function getCategoryColor(category: string): string {
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
}
