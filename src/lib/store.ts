
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Note, NoteCategory, NoteColor, Attachment, DrawPath } from '@/types';
import { useDrawingStore } from './drawingStore';
import { useCategoryStore } from './categoryStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  loadNotes: (userId: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>()(
  (set, get) => ({
    notes: [],
    activeNoteId: null,
    isLoading: false,
    
    loadNotes: async (userId: string) => {
      if (!userId) return;
      
      try {
        set({ isLoading: true });
        
        const { data: notes, error } = await supabase
          .from('notes')
          .select(`
            *,
            attachments(*),
            drawings(*)
          `)
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });
        
        if (error) {
          console.error('Error loading notes:', error);
          return;
        }
        
        // Transform data to match our Note type
        const transformedNotes = notes.map((note: any): Note => ({
          id: note.id,
          title: note.title,
          content: note.content || '',
          createdAt: new Date(note.created_at),
          updatedAt: new Date(note.updated_at),
          category: note.category || 'uncategorized',
          color: note.color || 'purple',
          hasAttachments: note.has_attachments,
          hasDrawings: note.has_drawings,
          attachments: note.attachments?.map((att: any) => ({
            id: att.id,
            name: att.name,
            type: att.type,
            url: att.url,
            createdAt: new Date(att.created_at),
            thumbnailUrl: att.url // For now, using same URL for thumbnail
          })) || [],
          drawings: note.drawings?.map((d: any) => ({
            id: d.id,
            paths: d.paths,
            createdAt: new Date(d.created_at)
          })) || []
        }));
        
        set({ 
          notes: transformedNotes,
          isLoading: false 
        });
      } catch (error) {
        console.error('Error loading notes:', error);
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
      
      // Save to Supabase
      const { user } = useAuth();
      if (user) {
        supabase
          .from('notes')
          .insert({
            id: newNote.id,
            user_id: user.id,
            title: newNote.title,
            content: newNote.content,
            category: newNote.category,
            color: newNote.color,
            has_attachments: newNote.hasAttachments,
            has_drawings: newNote.hasDrawings,
          })
          .then(({ error }) => {
            if (error) console.error('Error creating note in Supabase:', error);
          });
      }
      
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
      
      // Update in Supabase
      const { user } = useAuth();
      if (user) {
        // Convert data keys from camelCase to snake_case for Supabase
        const supabaseData: any = {};
        if (data.title !== undefined) supabaseData.title = data.title;
        if (data.content !== undefined) supabaseData.content = data.content;
        if (data.category !== undefined) supabaseData.category = data.category;
        if (data.color !== undefined) supabaseData.color = data.color;
        if (data.hasAttachments !== undefined) supabaseData.has_attachments = data.hasAttachments;
        if (data.hasDrawings !== undefined) supabaseData.has_drawings = data.hasDrawings;
        
        // Always update the timestamp
        supabaseData.updated_at = new Date().toISOString();
        
        supabase
          .from('notes')
          .update(supabaseData)
          .eq('id', id)
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) console.error('Error updating note in Supabase:', error);
          });
      }
    },
    
    deleteNote: (id) => {
      set(state => ({
        notes: state.notes.filter(note => note.id !== id),
        activeNoteId: state.activeNoteId === id ? null : state.activeNoteId
      }));
      
      // Delete from Supabase
      const { user } = useAuth();
      if (user) {
        supabase
          .from('notes')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)
          .then(({ error }) => {
            if (error) console.error('Error deleting note from Supabase:', error);
          });
      }
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
        
        // Save drawing to Supabase
        const { user } = useAuth();
        if (user) {
          supabase
            .from('drawings')
            .insert({
              id: newDrawing.id,
              note_id: noteId,
              paths: paths
            })
            .then(({ error }) => {
              if (error) console.error('Error saving drawing to Supabase:', error);
            });
          
          // Update note has_drawings flag
          supabase
            .from('notes')
            .update({ 
              has_drawings: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', noteId)
            .eq('user_id', user.id)
            .then(({ error }) => {
              if (error) console.error('Error updating note drawing flag in Supabase:', error);
            });
        }
        
        return { notes: updatedNotes } as any;
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
        
        // Save attachment to Supabase
        const { user } = useAuth();
        if (user) {
          supabase
            .from('attachments')
            .insert({
              id: newAttachment.id,
              note_id: noteId,
              name: attachmentData.name,
              url: attachmentData.url,
              type: attachmentData.type
            })
            .then(({ error }) => {
              if (error) console.error('Error saving attachment to Supabase:', error);
            });
          
          // Update note has_attachments flag
          supabase
            .from('notes')
            .update({ 
              has_attachments: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', noteId)
            .eq('user_id', user.id)
            .then(({ error }) => {
              if (error) console.error('Error updating note attachment flag in Supabase:', error);
            });
        }
        
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
        
        // Remove attachment from Supabase
        const { user } = useAuth();
        if (user) {
          supabase
            .from('attachments')
            .delete()
            .eq('id', attachmentId)
            .then(({ error }) => {
              if (error) console.error('Error deleting attachment from Supabase:', error);
            });
          
          // Update note has_attachments flag if needed
          if (!updatedNote.hasAttachments) {
            supabase
              .from('notes')
              .update({ 
                has_attachments: false,
                updated_at: new Date().toISOString()
              })
              .eq('id', noteId)
              .eq('user_id', user.id)
              .then(({ error }) => {
                if (error) console.error('Error updating note attachment flag in Supabase:', error);
              });
          }
        }
        
        return { notes: updatedNotes } as any;
      });
    }
  })
);

// Now create a component to load the user's notes when authenticated
export const NotesInitializer = () => {
  const { user } = useAuth();
  const loadNotes = useNoteStore(state => state.loadNotes);
  const { toast } = useToast();
  
  React.useEffect(() => {
    if (user) {
      loadNotes(user.id)
        .catch(error => {
          console.error('Error initializing notes:', error);
          toast({
            title: "Failed to load notes",
            description: "There was a problem loading your notes.",
            variant: "destructive"
          });
        });
    }
  }, [user, loadNotes, toast]);
  
  return null;
};

// Re-export stores for backward compatibility
export { useDrawingStore } from './drawingStore';
export { useCategoryStore } from './categoryStore';
