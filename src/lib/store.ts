
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Note, NoteCategory, NoteColor, Tool, PenSize, Drawing, Attachment, DrawPath, Shape, CategoryItem } from '@/types';

interface NoteState {
  notes: Note[];
  activeNoteId: string | null;
  activeTool: Tool;
  penColor: string;
  penSize: PenSize;
  penOpacity: number;
  isDrawing: boolean;
  currentPaths: DrawPath[];
  activeShape: Shape;
  categories: string[];
  categoryItems: CategoryItem[];
  
  // Actions
  createNote: (category?: NoteCategory, color?: NoteColor) => string;
  updateNote: (id: string, data: Partial<Omit<Note, 'id'>>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  setActiveTool: (tool: Tool) => void;
  setPenColor: (color: string) => void;
  setPenSize: (size: PenSize) => void;
  setPenOpacity: (opacity: number) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setActiveShape: (shape: Shape) => void;
  addDrawingToNote: (noteId: string, paths: DrawPath[]) => void;
  addAttachmentToNote: (noteId: string, attachment: Omit<Attachment, 'id' | 'createdAt'>) => void;
  removeAttachmentFromNote: (noteId: string, attachmentId: string) => void;
  undoDrawing: () => void;
  redoDrawing: () => void;
  createCategory: (category: string, parent?: string) => void;
  deleteCategory: (category: string) => void;
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
  categories: ['Math', 'Physics', 'Chemistry', 'English'],
  categoryItems: [
    { name: 'Math', subCategories: ['Algebra', 'Geometry', 'Calculus'] },
    { name: 'Physics', subCategories: ['Mechanics', 'Electromagnetism'] },
    { name: 'Chemistry', subCategories: ['Organic', 'Inorganic'] },
    { name: 'English', subCategories: ['Literature', 'Grammar', 'Vocabulary'] },
    { name: 'Algebra', parent: 'Math' },
    { name: 'Geometry', parent: 'Math' },
    { name: 'Calculus', parent: 'Math' },
    { name: 'Mechanics', parent: 'Physics' },
    { name: 'Electromagnetism', parent: 'Physics' },
    { name: 'Organic', parent: 'Chemistry' },
    { name: 'Inorganic', parent: 'Chemistry' },
    { name: 'Literature', parent: 'English' },
    { name: 'Grammar', parent: 'English' },
    { name: 'Vocabulary', parent: 'English' }
  ],
  activeNoteId: null,
  activeTool: 'pen',
  penColor: '#9b87f5',
  penSize: 'medium',
  penOpacity: 1,
  isDrawing: false,
  currentPaths: [],
  activeShape: 'rectangle',
  
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
  
  setPenOpacity: (opacity) => {
    set({ penOpacity: opacity });
  },
  
  setIsDrawing: (isDrawing) => {
    set({ isDrawing });
  },
  
  setActiveShape: (shape) => {
    set({ activeShape: shape });
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
  },
  
  undoDrawing: () => {
    set(state => {
      if (state.currentPaths.length === 0) return state;
      
      const updatedPaths = [...state.currentPaths];
      updatedPaths.pop();
      
      return { currentPaths: updatedPaths };
    });
  },
  
  redoDrawing: () => {
    // This would need to store redoable paths, but for simplicity we're just adding a stub
    return;
  },
  
  createCategory: (category: string, parent?: string) => {
    set(state => {
      // Check if category already exists (case insensitive)
      const categoryExists = state.categories.some(
        cat => cat.toLowerCase() === category.toLowerCase()
      );
      
      if (categoryExists) return state;
      
      // Add category to the list of categories
      const newCategories = [...state.categories, category];
      
      // Create the category item
      let newCategoryItems = [...state.categoryItems];
      const newCategory: CategoryItem = { name: category };
      
      // If parent is provided, set parent and add this category as subcategory to parent
      if (parent) {
        newCategory.parent = parent;
        
        // Find parent category item and update its subCategories
        const parentIndex = newCategoryItems.findIndex(item => item.name === parent);
        if (parentIndex !== -1) {
          const parentItem = {...newCategoryItems[parentIndex]};
          parentItem.subCategories = parentItem.subCategories 
            ? [...parentItem.subCategories, category]
            : [category];
          
          newCategoryItems[parentIndex] = parentItem;
        }
      }
      
      // Add the new category item
      newCategoryItems.push(newCategory);
      
      return {
        categories: newCategories,
        categoryItems: newCategoryItems
      };
    });
  },
  
  deleteCategory: (category: string) => {
    set(state => {
      // Get the category item
      const categoryItem = state.categoryItems.find(item => item.name === category);
      if (!categoryItem) return state;
      
      let categoriesToRemove = [category];
      
      // If it has subcategories, add them to the removal list
      if (categoryItem.subCategories && categoryItem.subCategories.length > 0) {
        categoriesToRemove = [...categoriesToRemove, ...categoryItem.subCategories];
      }
      
      // Remove from categories array
      const newCategories = state.categories.filter(cat => !categoriesToRemove.includes(cat));
      
      // Remove from categoryItems array
      const newCategoryItems = state.categoryItems.filter(item => !categoriesToRemove.includes(item.name));
      
      // If it has a parent, update the parent's subCategories
      if (categoryItem.parent) {
        const parentIndex = newCategoryItems.findIndex(item => item.name === categoryItem.parent);
        if (parentIndex !== -1) {
          const parentItem = {...newCategoryItems[parentIndex]};
          parentItem.subCategories = parentItem.subCategories?.filter(sub => sub !== category);
          newCategoryItems[parentIndex] = parentItem;
        }
      }
      
      return {
        categories: newCategories,
        categoryItems: newCategoryItems
      };
    });
  }
}));
