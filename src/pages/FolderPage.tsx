import { useParams, useNavigate } from "react-router-dom";
import { useNoteStore } from "@/lib/store";
import { useFolderStore } from "@/lib/folderStore";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { Edit, Folder, Menu, Trash } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useState, useEffect } from "react";
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
  const removeNoteFromFolder = useNoteStore(state => state.removeNoteFromFolder);

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
    if (newFolderName.trim()) {
      updateFolder(folderId!, { name: newFolderName });
      setIsRenameDialogOpen(false);
      
      toast({
        title: "Folder renamed",
        description: `Folder has been renamed to "${newFolderName}"`,
      });
    }
  };
  
  const handleDeleteFolder = () => {
    // Remove folder reference from all notes in this folder
    notes.forEach(note => {
      removeNoteFromFolder(note.id);
    });
    
    // Delete the folder
    deleteFolder(folderId!);
    
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
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ErrorBoundary>
          <Sidebar />
        </ErrorBoundary>
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FloatingSidebarTrigger />
              <div 
                className="w-5 h-5 rounded-full mr-1" 
                style={{ backgroundColor: folder.color || '#4f46e5' }}
              />
              <h1 className="text-2xl font-bold">{folder.name}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
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