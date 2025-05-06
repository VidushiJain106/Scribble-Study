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
