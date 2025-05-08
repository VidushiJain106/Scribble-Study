
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Note, NoteCategory, NoteColor, Attachment, DrawPath } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NoteState {
  notes: Note[];
  activeNoteId: string | null;
  isLoading: boolean;
  
  // Actions
  fetchNotes: () => Promise<void>;
  createNote: (category?: NoteCategory, color?: NoteColor) => Promise<string>;
  updateNote: (id: string, data: Partial<Omit<Note, 'id'>>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setActiveNote: (id: string | null) => void;
  addDrawingToNote: (noteId: string, paths: DrawPath[]) => Promise<void>;
  addAttachmentToNote: (noteId: string, attachment: Omit<Attachment, "id" | "createdAt">) => Promise<void>;
  removeAttachmentFromNote: (noteId: string, attachmentId: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>()((set, get) => ({
  notes: [],
  activeNoteId: null,
  isLoading: false,
  
  fetchNotes: async () => {
    const { user } = useAuth.getState();
    if (!user) return;
    
    set({ isLoading: true });
    
    try {
      // Fetch notes
      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching notes:', error);
        throw error;
      }
      
      // Process the notes to match our Note type
      const formattedNotes = notes.map(note => ({
        ...note,
        createdAt: new Date(note.created_at),
        updatedAt: new Date(note.updated_at),
      })) as Note[];
      
      set({ notes: formattedNotes, isLoading: false });
    } catch (error) {
      console.error('Error in fetchNotes:', error);
      set({ isLoading: false });
    }
  },
  
  createNote: async (category = 'uncategorized' as NoteCategory, color = 'purple' as NoteColor) => {
    const { user } = useAuth.getState();
    if (!user) throw new Error('User not authenticated');
    
    const id = uuidv4();
    const now = new Date();
    
    const newNote = {
      id,
      title: 'Untitled Note',
      content: '',
      category,
      color,
      has_attachments: false,
      has_drawings: false,
      user_id: user.id
    };
    
    try {
      // Insert into Supabase
      const { error } = await supabase
        .from('notes')
        .insert([newNote]);
      
      if (error) {
        console.error('Error creating note:', error);
        throw error;
      }
      
      // Add to local state with proper date objects
      const formattedNote = {
        ...newNote,
        hasAttachments: false,
        hasDrawings: false,
        createdAt: now,
        updatedAt: now,
      } as Note;
      
      set(state => ({
        notes: [formattedNote, ...state.notes],
        activeNoteId: id
      }));
      
      return id;
    } catch (error) {
      console.error('Error in createNote:', error);
      throw error;
    }
  },
  
  updateNote: async (id, data) => {
    const { user } = useAuth.getState();
    if (!user) return;
    
    try {
      // Prepare data for Supabase (convert field names to snake_case)
      const supabaseData = {
        title: data.title,
        content: data.content,
        category: data.category,
        color: data.color,
        updated_at: new Date(),
      };
      
      // Update in Supabase
      const { error } = await supabase
        .from('notes')
        .update(supabaseData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating note:', error);
        throw error;
      }
      
      // Update in local state
      set(state => ({
        notes: state.notes.map(note => 
          note.id === id 
            ? { ...note, ...data, updatedAt: new Date() } 
            : note
        )
      }));
    } catch (error) {
      console.error('Error in updateNote:', error);
    }
  },
  
  deleteNote: async (id) => {
    const { user } = useAuth.getState();
    if (!user) return;
    
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting note:', error);
        throw error;
      }
      
      // Update local state
      set(state => ({
        notes: state.notes.filter(note => note.id !== id),
        activeNoteId: state.activeNoteId === id ? null : state.activeNoteId
      }));
    } catch (error) {
      console.error('Error in deleteNote:', error);
    }
  },
  
  setActiveNote: (id) => {
    set({ activeNoteId: id });
  },
  
  addDrawingToNote: async (noteId, paths) => {
    const { user } = useAuth.getState();
    if (!user) return;
    
    try {
      const drawingId = uuidv4();
      const now = new Date();
      
      // Insert drawing into Supabase
      const { error: drawingError } = await supabase
        .from('drawings')
        .insert({
          id: drawingId,
          note_id: noteId,
          paths,
          created_at: now
        });
      
      if (drawingError) {
        console.error('Error adding drawing:', drawingError);
        throw drawingError;
      }
      
      // Update note to indicate it has drawings
      const { error: noteError } = await supabase
        .from('notes')
        .update({ has_drawings: true, updated_at: now })
        .eq('id', noteId);
      
      if (noteError) {
        console.error('Error updating note with drawing info:', noteError);
        throw noteError;
      }
      
      // Update local state
      set(state => {
        const noteIndex = state.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return state;
        
        const updatedNote = { ...state.notes[noteIndex] } as any;
        const newDrawing = {
          id: drawingId,
          paths,
          createdAt: now
        } as any;
        
        updatedNote.drawings = updatedNote.drawings ? [...updatedNote.drawings, newDrawing] : [newDrawing];
        updatedNote.hasDrawings = true;
        updatedNote.updatedAt = now;
        
        const updatedNotes = [...state.notes];
        updatedNotes[noteIndex] = updatedNote;
        
        return { notes: updatedNotes };
      });
    } catch (error) {
      console.error('Error in addDrawingToNote:', error);
    }
  },
  
  addAttachmentToNote: async (noteId, attachment: Omit<Attachment, "id" | "createdAt">) => {
    const { user } = useAuth.getState();
    if (!user) return;
    
    try {
      set({ isLoading: true });
      
      // Ensure attachment has a size property even if it's undefined
      const attachmentWithSize = {
        ...attachment,
        size: attachment.size ?? 0, // Fixed: Use nullish coalescing to provide a default value
      };
      
      const attachmentId = uuidv4();
      const now = new Date();
      
      // Insert attachment into Supabase
      const { error: attachmentError } = await supabase
        .from('attachments')
        .insert({
          id: attachmentId,
          note_id: noteId,
          name: attachmentWithSize.name,
          url: attachmentWithSize.url,
          type: attachmentWithSize.type,
          size: attachmentWithSize.size ?? 0,
          created_at: now
        });
      
      if (attachmentError) {
        console.error('Error adding attachment:', attachmentError);
        throw attachmentError;
      }
      
      // Update note to indicate it has attachments
      const { error: noteError } = await supabase
        .from('notes')
        .update({ has_attachments: true, updated_at: now })
        .eq('id', noteId);
      
      if (noteError) {
        console.error('Error updating note with attachment info:', noteError);
        throw noteError;
      }
      
      // Update local state
      set(state => {
        const noteIndex = state.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return state;
        
        const updatedNote = { ...state.notes[noteIndex] } as any;
        const newAttachment: Attachment = {
          id: attachmentId,
          ...attachmentWithSize,
          createdAt: now
        } as any;
        
        updatedNote.attachments = updatedNote.attachments 
          ? [...updatedNote.attachments, newAttachment] 
          : [newAttachment];
        updatedNote.hasAttachments = true;
        updatedNote.updatedAt = now;
        
        const updatedNotes = [...state.notes];
        updatedNotes[noteIndex] = updatedNote;
        
        return { notes: updatedNotes };
      });
    } catch (error) {
      console.error("Error adding attachment to note:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  
  removeAttachmentFromNote: async (noteId, attachmentId) => {
    const { user } = useAuth.getState();
    if (!user) return;
    
    try {
      // Delete attachment from Supabase
      const { error: attachmentError } = await supabase
        .from('attachments')
        .delete()
        .eq('id', attachmentId);
      
      if (attachmentError) {
        console.error('Error removing attachment:', attachmentError);
        throw attachmentError;
      }
      
      // Update local state
      set(state => {
        const noteIndex = state.notes.findIndex(note => note.id === noteId);
        if (noteIndex === -1) return state;
        
        const updatedNote = { ...state.notes[noteIndex] } as any;
        if (!updatedNote.attachments) return state;
        
        updatedNote.attachments = updatedNote.attachments.filter(
          (attachment: any) => attachment.id !== attachmentId
        );
        
        // Check if there are any attachments left
        const hasAttachments = updatedNote.attachments.length > 0;
        
        // Update the has_attachments flag in Supabase if needed
        if (!hasAttachments) {
          supabase
            .from('notes')
            .update({ has_attachments: false, updated_at: new Date() })
            .eq('id', noteId)
            .then(({ error }) => {
              if (error) console.error('Error updating note attachment flag:', error);
            });
        }
        
        updatedNote.hasAttachments = hasAttachments;
        updatedNote.updatedAt = new Date();
        
        const updatedNotes = [...state.notes];
        updatedNotes[noteIndex] = updatedNote;
        
        return { notes: updatedNotes };
      });
    } catch (error) {
      console.error('Error in removeAttachmentFromNote:', error);
    }
  }
}));

// Create an auth-aware hook to initialize notes
export const useInitializeNotes = () => {
  const fetchNotes = useNoteStore(state => state.fetchNotes);
  const { user } = useAuth();
  
  React.useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user, fetchNotes]);
};
