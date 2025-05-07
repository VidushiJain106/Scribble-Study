
export type NoteCategory = 
  | "personal"
  | "work"
  | "study"
  | "ideas"
  | "tasks"
  | "uncategorized"
  | string; // Adding string to allow custom categories;

export interface CategoryItem {
  name: string;
  parent?: string;
  subCategories?: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  category: NoteCategory;
  color: NoteColor;
  hasAttachments: boolean;
  hasDrawings: boolean;
  attachments?: Attachment[];
  drawings?: Drawing[];
  analysis?: NoteAnalysis;
}

export type NoteColor = 
  | "purple"
  | "yellow"
  | "green"
  | "orange"
  | "blue"
  | "pink";

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "pdf";
  url: string;
  size: number; // Ensuring size is a required property of number type
  thumbnailUrl?: string;
  createdAt: Date;
}

export interface Drawing {
  id: string;
  paths: DrawPath[];
  createdAt: Date;
}

export interface DrawPath {
  points: Point[];
  color: string;
  width: number;
  opacity?: number;
  tool?: Tool | string; // Changed to allow string for shape types
}

// Ensuring Point interface is defined
export interface Point {
  x: number;
  y: number;
  pressure?: number;
}

export type Tool = 
  | "select"
  | "pen"
  | "highlighter"
  | "eraser"
  | "text"
  | "marker"
  | "pencil"
  | "brush"
  | "shape";

export type PenSize = 
  | "small"
  | "medium"
  | "large"
  | "xlarge";

export type Shape = 
  | "rectangle" 
  | "circle" 
  | "line" 
  | "arrow";

// Focus Mode Types
export interface FocusMode {
  id: string;
  name: string;
  icon?: string;
  muteNotifications: boolean;
  muteCalls: boolean;
  blockEntertainmentApps: boolean;
  blockAllApps: boolean;
  duration: number; // in minutes
  isActive: boolean;
  color: string;
}

// Document Types
export type DocumentType = 
  | "handwritten"
  | "coursework"
  | "textbook";

export interface Document {
  id: string;
  name: string;
  file: File;
  url: string;
  uploadDate: Date;
  type?: DocumentType;
  category?: NoteCategory;
  tags?: string[];
  questionnaireDone: boolean;
}

export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  content: string;
  role: ChatMessageRole;
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  hasNewMessage: boolean;
  isLoading: boolean;
  
  addMessage: (content: string, role: ChatMessageRole) => void;
  toggleChat: () => void;
  markAsRead: () => void;
  setLoading: (loading: boolean) => void;
  analyzeNote: (note: Note) => void;
}

// New types for LLM-powered features
export interface NoteAnalysis {
  id?: string;
  noteId: string;
  mainTopic: string;
  concepts: string[];
  readyForExplanation: boolean;
  createdAt: Date;
}

export interface Explanation {
  id?: string;
  noteId: string;
  topic: string;
  title: string;
  content: ExplanationContent;
  createdAt: Date;
}

export interface ExplanationContent {
  title: string;
  sections: ExplanationSection[];
  summary: string;
  furtherResources?: string[];
}

export interface ExplanationSection {
  title: string;
  content: string;
}

export interface Quiz {
  id?: string;
  noteId: string;
  topic: string;
  introduction: string;
  questions: QuizQuestion[];
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  difficulty: "easy" | "moderate" | "hard";
  hint?: string;
  explanation?: string;
}

export interface QuizAnswer {
  id?: string;
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  feedback?: string;
  createdAt?: Date;
}

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
