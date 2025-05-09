import { useParams, useNavigate } from "react-router-dom";
import { useNoteStore } from "@/lib/store";
import { useFolderStore } from "@/lib/folderStore";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Edit, Folder, Menu, Trash, ArrowLeft, FolderOpen, PenSquare } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useState, useEffect, useCallback } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { NoteList } from "@/components/Dashboard/NoteList";

// Floating trigger component
const FloatingSidebarTrigger = () => {
  const { open } = useSidebar();
  
  if (open) return null;
  
  return (
    <SidebarTrigger className="md:hidden">
      <Menu className="h-5 w-5" />
    </SidebarTrigger>
  );
};

export default function FolderPage() {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Get folder and related data
  const folder = useFolderStore(state => 
    state.folders.find(f => f.id === folderId)
  );
  const updateFolder = useFolderStore(state => state.updateFolder);
  const deleteFolder = useFolderStore(state => state.deleteFolder);
  
  // Get notes in this folder
  const notes = useNoteStore(state => 
    state.notes.filter(note => note.folderId === folderId)
  );
  const createNote = useNoteStore(state => state.createNote);
  const assignNoteToFolder = useNoteStore(state => state.assignNoteToFolder);
  const removeNoteFromFolder = useNoteStore(state => state.removeNoteFromFolder);

  // Initialize folder name state only once when folder is loaded
  useEffect(() => {
    if (folder) {
      setNewFolderName(folder.name);
    }
  }, [folder?.id]); // Only run when folder ID changes, not on every change to folder object

  // Create a note in this folder - use useCallback to avoid recreation on each render
  const handleCreateNote = useCallback(async () => {
    if (!folderId) return;
    
    try {
      const newNoteId = await createNote();
      assignNoteToFolder(newNoteId, folderId);
      navigate(`/note/${newNoteId}`);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  }, [folderId, createNote, assignNoteToFolder, navigate]);

  if (!folder) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <ErrorBoundary>
            <Sidebar />
          </ErrorBoundary>
          <main className="flex-1 p-6">
            <div className="flex items-center gap-2 mb-6">
              <FloatingSidebarTrigger />
              <h1 className="text-2xl font-bold">Folder not found</h1>
            </div>
            <p>The folder you're looking for doesn't exist or has been deleted.</p>
            <Button 
              onClick={() => navigate("/")} 
              className="mt-4"
            >
              Go back to notes
            </Button>
          </main>
        </div>
      </SidebarProvider>
    );
  }
  
  const handleRenameFolder = () => {
    if (!folderId || !newFolderName.trim()) return;
    
    updateFolder(folderId, { name: newFolderName });
    setIsRenameDialogOpen(false);
    
    toast({
      title: "Folder renamed",
      description: `Folder has been renamed to "${newFolderName}"`,
    });
  };
  
  const handleDeleteFolder = () => {
    if (!folderId) return;
    
    // Remove folder reference from all notes in this folder
    notes.forEach(note => {
      removeNoteFromFolder(note.id);
    });
    
    // Delete the folder
    deleteFolder(folderId);
    
    toast({
      title: "Folder deleted",
      description: `"${folder.name}" folder has been deleted`,
    });
    
    // Navigate back to home
    navigate("/");
    
    setIsDeleteDialogOpen(false);
  };
  
  const handleOpenRenameDialog = () => {
    setNewFolderName(folder.name);
    setIsRenameDialogOpen(true);
  };
  
  // Create handlers outside render
  const handleNavigateBack = () => navigate("/");
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ErrorBoundary>
          <Sidebar />
        </ErrorBoundary>
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FloatingSidebarTrigger />
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleNavigateBack}
                className="text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Back</span>
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-md flex items-center justify-center"
                style={{ backgroundColor: folder.color || '#4f46e5' }}
              >
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{folder.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {notes.length} note{notes.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleCreateNote}
                className="flex items-center gap-2"
              >
                <PenSquare className="h-4 w-4" />
                <span>New Note</span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Folder className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleOpenRenameDialog}>
                    <Edit className="h-4 w-4 mr-2" />
                    Rename Folder
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete Folder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Use the NoteList component to display notes in this folder */}
          <ErrorBoundary>
            <NoteList folderId={folderId} />
          </ErrorBoundary>
          
          {/* Rename folder dialog */}
          <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename Folder</DialogTitle>
                <DialogDescription>
                  Enter a new name for this folder.
                </DialogDescription>
              </DialogHeader>
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="mt-4"
              />
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRenameFolder}>
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Delete folder dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Folder</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this folder? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDeleteFolder}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </SidebarProvider>
  );
} 