
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Note, NoteCategory, NoteColor, Tool, PenSize, Drawing, Attachment, DrawPath } from '@/types';

interface NoteState {
  notes: Note[];
  activeNoteId: string | null;
  activeTool: Tool;
  penColor: string;
  penSize: PenSize;
  isDrawing: boolean;
  currentPaths: DrawPath[];
  
  // Actions
  createNote: (category?: NoteCategory, color?: NoteColor) => string;
  updateNote: (id: string, data: Partial<Omit<Note, 'id'>>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  setActiveTool: (tool: Tool) => void;
  setPenColor: (color: string) => void;
  setPenSize: (size: PenSize) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  addDrawingToNote: (noteId: string, paths: DrawPath[]) => void;
  addAttachmentToNote: (noteId: string, attachment: Omit<Attachment, 'id' | 'createdAt'>) => void;
  removeAttachmentFromNote: (noteId: string, attachmentId: string) => void;
}

export const useNoteStore = create<NoteState>((set) => ({
  notes: [
    {
      id: '1',
      title: 'Welcome to ScribbleSnap!',
      content: 'This is your first note. Try editing it, add some drawings, or upload an image!',
      createdAt: new Date(),
      updatedAt: new Date(),
      category: 'personal',
      color: 'purple',
      hasAttachments: false,
      hasDrawings: false,
    },
    {
      id: '2',
      title: 'Meeting Notes',
      content: 'Discuss project timeline\n- Start development next week\n- Launch in 2 months',
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
      category: 'work',
      color: 'blue',
      hasAttachments: false,
      hasDrawings: false,
    },
    {
      id: '3',
      title: 'Shopping List',
      content: '- Milk\n- Eggs\n- Bread\n- Apples',
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 172800000),
      category: 'personal',
      color: 'green',
      hasAttachments: false,
      hasDrawings: false,
    }
  ],
  activeNoteId: null,
  activeTool: 'pen',
  penColor: '#9b87f5',
  penSize: 'medium',
  isDrawing: false,
  currentPaths: [],

  createNote: (category = 'uncategorized' as NoteCategory, color = 'purple' as NoteColor) => {
    const id = uuidv4();
    const newNote: Note = {
      id,
      title: 'Untitled Note',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      category,
      color,
      hasAttachments: false,
      hasDrawings: false,
    };
    
    set(state => ({
      notes: [newNote, ...state.notes],
      activeNoteId: id
    }));
    
    return id;
  },
  
  updateNote: (id, data) => {
    set(state => ({
      notes: state.notes.map(note => 
        note.id === id 
          ? { ...note, ...data, updatedAt: new Date() } 
          : note
      )
    }));
  },
  
  deleteNote: (id) => {
    set(state => ({
      notes: state.notes.filter(note => note.id !== id),
      activeNoteId: state.activeNoteId === id ? null : state.activeNoteId
    }));
  },
  
  setActiveNote: (id) => {
    set({ activeNoteId: id });
  },
  
  setActiveTool: (tool) => {
    set({ activeTool: tool });
  },
  
  setPenColor: (color) => {
    set({ penColor: color });
  },
  
  setPenSize: (size) => {
    set({ penSize: size });
  },
  
  setIsDrawing: (isDrawing) => {
    set({ isDrawing });
  },
  
  addDrawingToNote: (noteId, paths) => {
    set(state => {
      const noteIndex = state.notes.findIndex(note => note.id === noteId);
      if (noteIndex === -1) return state;
      
      const updatedNote = { ...state.notes[noteIndex] };
      const newDrawing: Drawing = {
        id: uuidv4(),
        paths,
        createdAt: new Date()
      };
      
      updatedNote.drawings = updatedNote.drawings ? [...updatedNote.drawings, newDrawing] : [newDrawing];
      updatedNote.hasDrawings = true;
      updatedNote.updatedAt = new Date();
      
      const updatedNotes = [...state.notes];
      updatedNotes[noteIndex] = updatedNote;
      
      return { notes: updatedNotes, currentPaths: [] };
    });
  },
  
  addAttachmentToNote: (noteId, attachmentData) => {
    set(state => {
      const noteIndex = state.notes.findIndex(note => note.id === noteId);
      if (noteIndex === -1) return state;
      
      const updatedNote = { ...state.notes[noteIndex] };
      const newAttachment: Attachment = {
        id: uuidv4(),
        ...attachmentData,
        createdAt: new Date()
      };
      
      updatedNote.attachments = updatedNote.attachments 
        ? [...updatedNote.attachments, newAttachment] 
        : [newAttachment];
      updatedNote.hasAttachments = true;
      updatedNote.updatedAt = new Date();
      
      const updatedNotes = [...state.notes];
      updatedNotes[noteIndex] = updatedNote;
      
      return { notes: updatedNotes };
    });
  },
  
  removeAttachmentFromNote: (noteId, attachmentId) => {
    set(state => {
      const noteIndex = state.notes.findIndex(note => note.id === noteId);
      if (noteIndex === -1) return state;
      
      const updatedNote = { ...state.notes[noteIndex] };
      if (!updatedNote.attachments) return state;
      
      updatedNote.attachments = updatedNote.attachments.filter(
        attachment => attachment.id !== attachmentId
      );
      updatedNote.hasAttachments = updatedNote.attachments.length > 0;
      updatedNote.updatedAt = new Date();
      
      const updatedNotes = [...state.notes];
      updatedNotes[noteIndex] = updatedNote;
      
      return { notes: updatedNotes };
    });
  }
}));
