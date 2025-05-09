import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNoteStore } from "@/lib/store";
import { useCategoryStore } from "@/lib/categoryStore";
import { useFolderStore, Folder } from "@/lib/folderStore";
import { Note } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { FileImage, Pen, Plus, FolderIcon, Check, MoreVertical, Grip } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

interface NoteListProps {
  category?: string;
  folderId?: string;
  showFiled?: boolean;
}

export function NoteList({ category, folderId, showFiled = true }: NoteListProps) {
  const notes = useNoteStore(state => state.notes);
  const createNote = useNoteStore(state => state.createNote);
  const assignNoteToFolder = useNoteStore(state => state.assignNoteToFolder);
  const categoryItems = useCategoryStore(state => state.categoryItems);
  const folders = useFolderStore(state => state.folders);
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for multi-select functionality
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  
  // Dragging state - use ref to avoid re-renders during drag
  const draggedNoteId = useRef<string | null>(null);
  
  // Create a memoized function for getting subcategories to avoid recalculation on every render
  const getAllSubcategories = useCallback((categoryName: string): string[] => {
    const categoryItem = categoryItems.find(item => item.name === categoryName);
    if (!categoryItem || !categoryItem.subCategories) return [];
    
    const subCategories: string[] = [...categoryItem.subCategories];
    
    // Add nested subcategories recursively
    categoryItem.subCategories.forEach(subCat => {
      const nestedSubs = getAllSubcategories(subCat);
      subCategories.push(...nestedSubs);
    });
    
    return subCategories;
  }, [categoryItems]);
  
  // Memoize the filtered notes to avoid recalculation on every render
  const filteredNotes = useMemo(() => {
    let result = notes;
    
    // Filter by category if specified
    if (category) {
      const categories = [category, ...getAllSubcategories(category)];
      result = result.filter(note => categories.includes(note.category));
    }
    
    // Filter by folder if specified
    if (folderId) {
      result = result.filter(note => note.folderId === folderId);
    } else if (!showFiled && !category) {
      // When on the main screen (no category or folder) and not showing filed notes,
      // filter out notes that have a folderId (in a folder)
      result = result.filter(note => !note.folderId);
    }
    
    return result;
  }, [notes, category, folderId, getAllSubcategories, showFiled]);
  
  const handleCreateNote = useCallback(async () => {
    if (!user) return;
    try {
      const newNoteId = await createNote(category as any);
      
      // If created in a folder, assign it to that folder
      if (folderId) {
        assignNoteToFolder(newNoteId, folderId);
      }
      
      navigate(`/note/${newNoteId}`);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  }, [user, createNote, category, folderId, assignNoteToFolder, navigate]);
  
  const handleNoteClick = useCallback((noteId: string) => {
    if (isSelectionMode) {
      setSelectedNotes(prev => 
        prev.includes(noteId) 
          ? prev.filter(id => id !== noteId) 
          : [...prev, noteId]
      );
    } else {
      navigate(`/note/${noteId}`);
    }
  }, [isSelectionMode, navigate]);

  const toggleNoteSelection = useCallback((noteId: string) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId) 
        : [...prev, noteId]
    );
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => !prev);
    setSelectedNotes([]);
  }, []);

  const selectAllNotes = useCallback(() => {
    if (selectedNotes.length === filteredNotes.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(filteredNotes.map(note => note.id));
    }
  }, [selectedNotes.length, filteredNotes]);

  const moveSelectedNotesToFolder = useCallback((targetFolderId: string) => {
    selectedNotes.forEach(noteId => {
      assignNoteToFolder(noteId, targetFolderId);
    });
    setSelectedNotes([]);
    setIsSelectionMode(false);
    setFolderDialogOpen(false);
  }, [selectedNotes, assignNoteToFolder]);

  // Use useCallback to prevent recreation of the function on every render
  const handleDragStart = useCallback((e: React.DragEvent, noteId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData("noteId", noteId);
    e.dataTransfer.setData("text/plain", noteId); // Fallback for browsers that only allow text/plain
    draggedNoteId.current = noteId;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Reset selection mode when navigating away
  useEffect(() => {
    return () => {
      setIsSelectionMode(false);
      setSelectedNotes([]);
    };
  }, [category, folderId]);

  return (
    <>
      {isSelectionMode && selectedNotes.length > 0 && (
        <div className="sticky top-0 z-10 bg-background p-2 mb-4 flex items-center justify-between border rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">{selectedNotes.length} selected</span>
            <Button variant="outline" size="sm" onClick={selectAllNotes}>
              {selectedNotes.length === filteredNotes.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => setFolderDialogOpen(true)}
            >
              Move to Folder
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleSelectionMode}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSelectionMode}
          className="text-sm"
        >
          {isSelectionMode ? "Cancel Selection" : "Select Notes"}
        </Button>
      </div>

      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in"
        onDragOver={handleDragOver}
      >
        {/* Create New Note Card */}
        <Card 
          className="note-card border-dashed cursor-pointer hover:bg-accent/50 flex flex-col items-center justify-center h-64"
          onClick={handleCreateNote}
        >
          <CardContent className="flex flex-col items-center justify-center p-6 h-full">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-lg font-medium text-center mb-2">Create New Note</CardTitle>
            <CardDescription className="text-center">
              {folderId ? "Add a new note to this folder" : "Add a new note to your collection"}
            </CardDescription>
          </CardContent>
        </Card>
        
        {/* Note Cards */}
        {filteredNotes.map((note) => (
          <div 
            key={note.id}
            className="note-wrapper"
            draggable
            onDragStart={(e) => handleDragStart(e, note.id)}
          >
            <NoteCard 
              note={note} 
              onClick={() => handleNoteClick(note.id)} 
              isSelected={selectedNotes.includes(note.id)}
              isSelectionMode={isSelectionMode}
              onSelect={() => toggleNoteSelection(note.id)}
            />
          </div>
        ))}

        {filteredNotes.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
            <p className="text-muted-foreground">No notes found{category ? ` in this category` : folderId ? ` in this folder` : ''}.</p>
          </div>
        )}
      </div>

      {/* Folder Selection Dialog */}
      <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to Folder</DialogTitle>
            <DialogDescription>
              Select a folder to move {selectedNotes.length} note{selectedNotes.length > 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 my-4 max-h-60 overflow-y-auto">
            {folders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No folders available</p>
            ) : (
              folders.filter(folder => folder.id !== folderId).map(folder => (
                <div 
                  key={folder.id}
                  className="flex items-center justify-between p-2 hover:bg-accent rounded-md cursor-pointer"
                  onClick={() => moveSelectedNotesToFolder(folder.id)}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: folder.color || '#4f46e5' }}
                    />
                    <span>{folder.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setFolderDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function NoteCard({ 
  note, 
  onClick, 
  isSelected = false,
  isSelectionMode = false,
  onSelect
}: { 
  note: Note; 
  onClick: () => void;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  onSelect?: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const folders = useFolderStore(state => state.folders);
  
  // Get folder info if note is in a folder
  const folder = note.folderId ? folders.find(f => f.id === note.folderId) : undefined;
  
  return (
    <Card 
      className={`note-card cursor-pointer h-64 bg-note-${note.color}-light hover:shadow-md transition-all duration-200 relative 
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''} 
        ${note.folderId ? 'border-l-4' : ''}
      `}
      style={note.folderId && folder ? { borderLeftColor: folder.color || '#4f46e5' } : {}}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <div className="absolute top-2 right-2 text-muted-foreground opacity-30 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
          <Grip className="h-4 w-4" />
        </div>
      )}
      
      {isSelectionMode && (
        <div 
          className="absolute top-2 left-2 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
        >
          <Checkbox checked={isSelected} />
        </div>
      )}
      
      {folder && (
        <div className="absolute top-2 left-2 text-xs text-muted-foreground flex items-center gap-1 max-w-[50%] overflow-hidden">
          {!isSelectionMode && (
            <>
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0" 
                style={{ backgroundColor: folder.color || '#4f46e5' }}
              />
              <span className="truncate">{folder.name}</span>
            </>
          )}
        </div>
      )}
      
      <CardHeader className={`pb-2 ${folder && !isSelectionMode ? 'pt-8' : ''}`}>
        <CardTitle className="line-clamp-2">{note.title}</CardTitle>
        <CardDescription>
          {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="line-clamp-5 text-sm mb-4">
          {note.content}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          {note.hasAttachments && <FileImage className="h-4 w-4" />}
          {note.hasDrawings && <Pen className="h-4 w-4" />}
          <span className="capitalize">{note.category}</span>
          <div className={`color-dot ml-auto bg-note-${note.color}`}></div>
        </div>
      </CardContent>
    </Card>
  );
}
