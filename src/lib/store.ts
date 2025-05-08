import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Note, NoteCategory, NoteColor, Attachment, DrawPath, Explanation, Quiz } from '@/types';
import { useDrawingStore } from './drawingStore';
import { useCategoryStore } from './categoryStore';

interface NoteState {
  notes: Note[];
  activeNoteId: string | null;
  isLoading: boolean;
  
  // Actions
  createNote: (category?: NoteCategory, color?: NoteColor) => string;
  updateNote: (id: string, data: Partial<Omit<Note, 'id'>>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  addDrawingToNote: (noteId: string, paths: DrawPath[]) => void;
  addAttachmentToNote: (noteId: string, attachment: Omit<Attachment, 'id' | 'createdAt'>) => void;
  removeAttachmentFromNote: (noteId: string, attachmentId: string) => void;
  saveExplanationToNote: (noteId: string, explanation: Explanation) => void;
  saveQuizToNote: (noteId: string, quiz: Quiz) => void;
  removeSavedExplanation: (noteId: string, explanationId: string) => void;
  removeSavedQuiz: (noteId: string, quizId: string) => void;
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
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
  isLoading: false,
  
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
  
  addDrawingToNote: (noteId, paths) => {
    set(state => {
      const noteIndex = state.notes.findIndex(note => note.id === noteId);
      if (noteIndex === -1) return state;
      
          const updatedNote = { ...state.notes[noteIndex] } as any;
      const newDrawing = {
        id: uuidv4(),
        paths,
        createdAt: new Date()
          } as any;
      
      updatedNote.drawings = updatedNote.drawings ? [...updatedNote.drawings, newDrawing] : [newDrawing];
      updatedNote.hasDrawings = true;
      updatedNote.updatedAt = new Date();
      
      const updatedNotes = [...state.notes];
      updatedNotes[noteIndex] = updatedNote;
      
      // Get the drawingStore state
      const drawingState = useDrawingStore.getState();
      
      return { 
        notes: updatedNotes
          } as any;
    });
  },
  
  addAttachmentToNote: (noteId, attachmentData) => {
    set(state => {
      const noteIndex = state.notes.findIndex(note => note.id === noteId);
      if (noteIndex === -1) return state;
      
          const updatedNote = { ...state.notes[noteIndex] } as any;
      const newAttachment: Attachment = {
        id: uuidv4(),
        ...attachmentData,
        createdAt: new Date()
          } as any;
      
      updatedNote.attachments = updatedNote.attachments 
        ? [...updatedNote.attachments, newAttachment] 
        : [newAttachment];
      updatedNote.hasAttachments = true;
      updatedNote.updatedAt = new Date();
      
      const updatedNotes = [...state.notes];
      updatedNotes[noteIndex] = updatedNote;
      
          return { notes: updatedNotes } as any;
    });
  },
  
  removeAttachmentFromNote: (noteId, attachmentId) => {
    set(state => {
      const noteIndex = state.notes.findIndex(note => note.id === noteId);
      if (noteIndex === -1) return state;
      
          const updatedNote = { ...state.notes[noteIndex] } as any;
      if (!updatedNote.attachments) return state;
      
      updatedNote.attachments = updatedNote.attachments.filter(
            (attachment: any) => attachment.id !== attachmentId
      );
      updatedNote.hasAttachments = updatedNote.attachments.length > 0;
          updatedNote.updatedAt = new Date();
          
          const updatedNotes = [...state.notes];
          updatedNotes[noteIndex] = updatedNote;
          
          return { notes: updatedNotes } as any;
        });
      },
      
      saveExplanationToNote: (noteId, explanation) => {
        set(state => {
          const noteIndex = state.notes.findIndex(note => note.id === noteId);
          if (noteIndex === -1) return state;
          
          const updatedNote = { ...state.notes[noteIndex] };
          
          // Ensure the explanation has an ID if it doesn't already have one
          const explanationToSave = {
            ...explanation,
            id: explanation.id || uuidv4()
          };
          
          // Add the explanation to the note's savedExplanations array
          updatedNote.savedExplanations = updatedNote.savedExplanations 
            ? [...updatedNote.savedExplanations.filter(e => e.id !== explanationToSave.id), explanationToSave]
            : [explanationToSave];
          
          updatedNote.updatedAt = new Date();
          
          const updatedNotes = [...state.notes];
          updatedNotes[noteIndex] = updatedNote;
          
          return { notes: updatedNotes };
        });
      },
      
      saveQuizToNote: (noteId, quiz) => {
        set(state => {
          const noteIndex = state.notes.findIndex(note => note.id === noteId);
          if (noteIndex === -1) return state;
          
          const updatedNote = { ...state.notes[noteIndex] };
          
          // Ensure the quiz has an ID if it doesn't already have one
          const quizToSave = {
            ...quiz,
            id: quiz.id || uuidv4()
          };
          
          // Add the quiz to the note's savedQuizzes array
          updatedNote.savedQuizzes = updatedNote.savedQuizzes 
            ? [...updatedNote.savedQuizzes.filter(q => q.id !== quizToSave.id), quizToSave]
            : [quizToSave];
          
          updatedNote.updatedAt = new Date();
          
          const updatedNotes = [...state.notes];
          updatedNotes[noteIndex] = updatedNote;
          
          return { notes: updatedNotes };
        });
      },
      
      removeSavedExplanation: (noteId, explanationId) => {
        set(state => {
          const noteIndex = state.notes.findIndex(note => note.id === noteId);
          if (noteIndex === -1) return state;
          
          const updatedNote = { ...state.notes[noteIndex] };
          if (!updatedNote.savedExplanations) return state;
          
          updatedNote.savedExplanations = updatedNote.savedExplanations.filter(
            explanation => explanation.id !== explanationId
          );
          
          updatedNote.updatedAt = new Date();
          
          const updatedNotes = [...state.notes];
          updatedNotes[noteIndex] = updatedNote;
          
          return { notes: updatedNotes };
        });
      },
      
      removeSavedQuiz: (noteId, quizId) => {
        set(state => {
          const noteIndex = state.notes.findIndex(note => note.id === noteId);
          if (noteIndex === -1) return state;
          
          const updatedNote = { ...state.notes[noteIndex] };
          if (!updatedNote.savedQuizzes) return state;
          
          updatedNote.savedQuizzes = updatedNote.savedQuizzes.filter(
            quiz => quiz.id !== quizId
          );
          
      updatedNote.updatedAt = new Date();
      
      const updatedNotes = [...state.notes];
      updatedNotes[noteIndex] = updatedNote;
      
      return { notes: updatedNotes };
    });
  }
    }),
    {
      name: 'scribblesnap-notes',
      partialize: (state) => ({ notes: state.notes }),
    }
  )
);

// Re-export stores for backward compatibility
export { useDrawingStore } from './drawingStore';
export { useCategoryStore } from './categoryStore';
