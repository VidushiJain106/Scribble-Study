
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Note, NoteCategory, NoteColor, Attachment, DrawPath } from '@/types';
import { useDrawingStore } from './drawingStore';
import { useCategoryStore } from './categoryStore';
import { useToast } from '@/hooks/use-toast';
import * as noteService from '@/services/noteService';

interface NoteState {
  notes: Note[];
  activeNoteId: string | null;
  isLoading: boolean;
  
  // Actions
  fetchNotes: () => Promise<void>;
  createNote: (category?: NoteCategory, color?: NoteColor) => string;
  updateNote: (id: string, data: Partial<Omit<Note, 'id'>>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  addDrawingToNote: (noteId: string, paths: DrawPath[]) => void;
  addAttachmentToNote: (noteId: string, attachment: Omit<Attachment, "id" | "createdAt">) => void;
  removeAttachmentFromNote: (noteId: string, attachmentId: string) => void;
}

export const useNoteStore = create<NoteState>((set, get) => ({
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
  
  fetchNotes: async () => {
    set({ isLoading: true });
    
    try {
      const { data, error } = await noteService.getNotes();
      
      if (error) {
        console.error("Error fetching notes:", error);
        // Toast notification would be added here
        set({ isLoading: false });
        return;
      }
      
      if (data) {
        // Transform the data from Supabase format to app format
        const transformedNotes = data.map(dbNote => ({
          id: dbNote.id,
          title: dbNote.title,
          content: dbNote.content || "",
          createdAt: new Date(dbNote.created_at),
          updatedAt: new Date(dbNote.updated_at),
          category: dbNote.category as NoteCategory,
          color: dbNote.color as NoteColor,
          hasAttachments: dbNote.has_attachments,
          hasDrawings: dbNote.has_drawings,
        }));
        
        set({ notes: transformedNotes });
      }
    } catch (error) {
      console.error("Error in fetchNotes:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  
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
    
    // Save to Supabase in background
    noteService.createNote(category, color).then(({ data, error }) => {
      if (error) {
        console.error("Error saving note to Supabase:", error);
        // Toast notification would be added here
      }
      
      if (data) {
        // Update the local note with the Supabase ID
        set(state => ({
          notes: state.notes.map(note => 
            note.id === id 
              ? { 
                  ...note, 
                  id: data.id, 
                  createdAt: new Date(data.created_at),
                  updatedAt: new Date(data.updated_at)
                } 
              : note
          ),
          activeNoteId: data.id
        }));
      }
    });
    
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
    
    // Save to Supabase in background
    noteService.updateNote(id, {
      ...data,
      updatedAt: new Date()
    }).then(({ error }) => {
      if (error) {
        console.error("Error updating note in Supabase:", error);
        // Toast notification would be added here
      }
    });
  },
  
  deleteNote: (id) => {
    set(state => ({
      notes: state.notes.filter(note => note.id !== id),
      activeNoteId: state.activeNoteId === id ? null : state.activeNoteId
    }));
    
    // Delete from Supabase in background
    noteService.deleteNote(id).then(({ error }) => {
      if (error) {
        console.error("Error deleting note from Supabase:", error);
        // Toast notification would be added here
      }
    });
  },
  
  setActiveNote: (id) => {
    set({ activeNoteId: id });
  },
  
  addDrawingToNote: (noteId, paths) => {
    set(state => {
      const noteIndex = state.notes.findIndex(note => note.id === noteId);
      if (noteIndex === -1) return state;
      
      const updatedNote = { ...state.notes[noteIndex] };
      const newDrawing = {
        id: uuidv4(),
        paths,
        createdAt: new Date()
      };
      
      updatedNote.drawings = updatedNote.drawings ? [...updatedNote.drawings, newDrawing] : [newDrawing];
      updatedNote.hasDrawings = true;
      updatedNote.updatedAt = new Date();
      
      const updatedNotes = [...state.notes];
      updatedNotes[noteIndex] = updatedNote;
      
      return { notes: updatedNotes };
    });
    
    // Save drawing to Supabase in background
    noteService.addDrawingToNote(noteId, paths).then(({ error }) => {
      if (error) {
        console.error("Error saving drawing to Supabase:", error);
        // Toast notification would be added here
      }
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
    
    // Save attachment to Supabase in background
    noteService.addAttachmentToNote(noteId, attachmentData).then(({ error }) => {
      if (error) {
        console.error("Error saving attachment to Supabase:", error);
        // Toast notification would be added here
      }
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
    
    // Remove attachment from Supabase in background
    noteService.removeAttachmentFromNote(noteId, attachmentId).then(({ error }) => {
      if (error) {
        console.error("Error removing attachment from Supabase:", error);
        // Toast notification would be added here
      }
    });
  }
}));

// Re-export stores for backward compatibility
export { useDrawingStore } from './drawingStore';
export { useCategoryStore } from './categoryStore';
