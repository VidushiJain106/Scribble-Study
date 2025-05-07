
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { DrawPath, PenSize, Tool, Shape, Drawing } from '@/types';

interface DrawingState {
  activeTool: Tool;
  penColor: string;
  penSize: PenSize;
  penOpacity: number;
  isDrawing: boolean;
  currentPaths: DrawPath[];
  activeShape: Shape;
  
  // Actions
  setActiveTool: (tool: Tool) => void;
  setPenColor: (color: string) => void;
  setPenSize: (size: PenSize) => void;
  setPenOpacity: (opacity: number) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setActiveShape: (shape: Shape) => void;
  undoDrawing: () => void;
  redoDrawing: () => void;
}

export const useDrawingStore = create<DrawingState>((set) => ({
  activeTool: 'pen',
  penColor: '#9b87f5',
  penSize: 'medium',
  penOpacity: 1,
  isDrawing: false,
  currentPaths: [],
  activeShape: 'rectangle',
  
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
}));
