
export type NoteCategory = 
  | "personal"
  | "work"
  | "study"
  | "ideas"
  | "tasks"
  | "uncategorized";

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
}

export interface Point {
  x: number;
  y: number;
}

export type Tool = 
  | "select"
  | "pen"
  | "highlighter"
  | "eraser"
  | "text";

export type PenSize = 
  | "small"
  | "medium"
  | "large";
