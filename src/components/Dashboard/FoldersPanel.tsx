import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFolderStore, Folder } from "@/lib/folderStore";
import { useNoteStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Trash, 
  Edit2, 
  Check, 
  X, 
  Folder as FolderIcon, 
  Plus, 
  MoreVertical 
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/ui/sidebar";
import { toast } from "@/components/ui/use-toast";

export function FoldersPanel() {
  const navigate = useNavigate();
  const { setOpenMobile } = useSidebar();
  const folders = useFolderStore(state => state.folders);
  const createFolder = useFolderStore(state => state.createFolder);
  const updateFolder = useFolderStore(state => state.updateFolder);
  const deleteFolder = useFolderStore(state => state.deleteFolder);
  const autoGenerateFolderName = useFolderStore(state => state.autoGenerateFolderName);
  const notes = useNoteStore(state => state.notes);
  const getNotesInFolder = useNoteStore(state => state.getNotesInFolder);
  const assignNoteToFolder = useNoteStore(state => state.assignNoteToFolder);
  
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [draggedOverFolderId, setDraggedOverFolderId] = useState<string | null>(null);
  
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName);
      setNewFolderName("");
    }
  };
  
  const handleCreateAutoFolder = () => {
    // Generate a folder name based on notes without folders
    const notesWithoutFolders = notes.filter(note => !note.folderId);
    if (notesWithoutFolders.length === 0) return;
    
    const folderName = autoGenerateFolderName(notesWithoutFolders);
    createFolder(folderName, true);
  };
  
  const handleFolderClick = (folderId: string) => {
    navigate(`/folder/${folderId}`);
    setOpenMobile(false); // Close mobile sidebar
  };
  
  const startEditing = (folder: Folder) => {
    setEditingFolder(folder.id);
    setEditValue(folder.name);
  };
  
  const cancelEditing = () => {
    setEditingFolder(null);
    setEditValue("");
  };
  
  const saveEditing = (folderId: string) => {
    if (editValue.trim()) {
      useFolderStore.getState().updateFolder(folderId, { name: editValue });
    }
    setEditingFolder(null);
  };
  
  const handleDeleteFolder = (folderId: string) => {
    // Remove folder reference from all notes in this folder
    const notesInFolder = getNotesInFolder(folderId);
    notesInFolder.forEach(note => {
      useNoteStore.getState().removeNoteFromFolder(note.id);
    });
    
    // Then delete the folder
    deleteFolder(folderId);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOverFolderId(folderId);
  };

  const handleDragLeave = () => {
    setDraggedOverFolderId(null);
  };

  const handleDrop = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get the dragged note ID
    const noteId = e.dataTransfer.getData("noteId");
    if (noteId) {
      // Move the note to this folder
      assignNoteToFolder(noteId, folderId);
      
      // Show success message
      const note = notes.find(n => n.id === noteId);
      const folder = folders.find(f => f.id === folderId);
      if (note && folder) {
        toast({
          title: "Note moved",
          description: `"${note.title}" moved to "${folder.name}" folder`,
        });
      }
    }
    
    setDraggedOverFolderId(null);
  };
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm">Folders</h4>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6" 
          onClick={handleCreateAutoFolder}
          title="Auto-generate folder from notes"
        >
          <FolderIcon className="h-4 w-4" />
        </Button>
      </div>
      
      {/* New folder input */}
      <div className="flex space-x-1">
        <Input
          className="h-8 text-sm"
          placeholder="New folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={handleCreateFolder}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Folders list */}
      <div className="space-y-1 mt-2">
        {folders.map((folder) => (
          <div 
            key={folder.id} 
            className={`flex items-center justify-between group ${draggedOverFolderId === folder.id ? 'bg-accent/80 ring-2 ring-primary rounded-md' : ''}`}
            onDragOver={(e) => handleDragOver(e, folder.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, folder.id)}
          >
            {editingFolder === folder.id ? (
              <div className="flex items-center flex-1 space-x-1">
                <Input
                  className="h-7 text-sm"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveEditing(folder.id)}
                  autoFocus
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={() => saveEditing(folder.id)}
                >
                  <Check className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7" 
                  onClick={cancelEditing}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="justify-start flex-1 px-2 py-1 h-7 text-sm"
                  onClick={() => handleFolderClick(folder.id)}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: folder.color || '#4f46e5' }}
                    />
                    <span>{folder.name}</span>
                  </div>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => startEditing(folder)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteFolder(folder.id)}>
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        ))}
        
        {folders.length === 0 && (
          <div className="text-sm text-muted-foreground py-2 px-1">
            No folders yet. Create one!
          </div>
        )}
      </div>
    </div>
  );
} 