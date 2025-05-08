import { NoteList } from "@/components/Dashboard/NoteList";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useNoteStore } from "@/lib/store";
import { useCategoryStore } from "@/lib/categoryStore";
import { useFolderStore } from "@/lib/folderStore";
import { NoteCategory } from "@/types";
import { FileText, Menu, PenLine, Plus, Loader2, FolderDown, ChevronDown } from "lucide-react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Create a component for the floating trigger that will be conditionally rendered
const FloatingSidebarTrigger = () => {
  const { open } = useSidebar();
  
  // Don't render the trigger if the sidebar is open
  if (open) return null;
  
  return (
    <SidebarTrigger className="md:hidden">
      <Menu className="h-5 w-5" />
    </SidebarTrigger>
  );
};

const Index = () => {
  console.log("Index component rendering");
  
  const createNote = useNoteStore(state => state.createNote);
  const isLoading = useNoteStore(state => state.isLoading);
  const categoryItems = useCategoryStore(state => state.categoryItems);
  const folders = useFolderStore(state => state.folders);
  const navigate = useNavigate();
  
  const { category } = useParams<{ category?: string }>();
  const { user, loading: authLoading } = useAuth();
  
  // Add state for folder filtering
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  
  // Initialize notes when component mounts and user is authenticated
  useEffect(() => {
    if (user) {
      console.log("User authenticated, initializing notes");
      // Any initialization logic can go here
    }
  }, [user]);
  
  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Debug log
  useEffect(() => {
    console.log("Index component mounted", { category });
    
    return () => {
      console.log("Index component unmounted");
    };
  }, [category]);
  
  const handleCreateNote = async () => {
    try {
      console.log("Creating new note", { category });
      const newNoteId = await createNote(category as NoteCategory);
      console.log("Note created with ID:", newNoteId);
      navigate(`/note/${newNoteId}`);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolder(folderId);
    if (folderId) {
      navigate(`/folder/${folderId}`);
    }
  };

  let pageTitle = "All Notes";
  if (category) {
    pageTitle = `${category.charAt(0).toUpperCase() + category.slice(1)} Notes`;
    
    // Check if this is a subcategory and show the parent in the title
    const categoryItem = categoryItems?.find(item => item.name.toLowerCase() === category.toLowerCase());
    if (categoryItem?.parent) {
      pageTitle = `${categoryItem.name} Notes (${categoryItem.parent})`;
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold">{pageTitle}</h1>
            </div>
            <div className="flex items-center gap-2">
              {/* Add folder selector dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <FolderDown className="h-4 w-4" />
                    <span>{selectedFolder ? folders.find(f => f.id === selectedFolder)?.name : "All Folders"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Folder</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleFolderSelect(null)}>
                    All Folders
                  </DropdownMenuItem>
                  {folders.map(folder => (
                    <DropdownMenuItem 
                      key={folder.id} 
                      onClick={() => handleFolderSelect(folder.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: folder.color || '#4f46e5' }}
                        />
                        <span>{folder.name}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                  {folders.length === 0 && (
                    <DropdownMenuItem disabled>
                      No folders created yet
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {!category && !selectedFolder && (
            <div className="mb-8 p-8 bg-gradient-to-r from-violet-500 to-primary rounded-lg shadow-lg text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Welcome to ScribbleSnap</h2>
                  <p className="text-white/90 max-w-md">
                    Take notes, upload files, and annotate PDFs & images all in one place.
                    Get started by creating a new note or explore your existing notes below.
                  </p>
                </div>
                <div className="hidden md:block">
                  <PenLine className="h-20 w-20 text-white/20" />
                </div>
              </div>
            </div>
          )}
          
          <ErrorBoundary>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading notes...</p>
                </div>
              </div>
            ) : (
              <NoteList category={category as NoteCategory | undefined} />
            )}
          </ErrorBoundary>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
