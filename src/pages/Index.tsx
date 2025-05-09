import { NoteList } from "@/components/Dashboard/NoteList";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useNoteStore } from "@/lib/store";
import { useCategoryStore } from "@/lib/categoryStore";
import { useFolderStore } from "@/lib/folderStore";
import { NoteCategory } from "@/types";
import { FileText, Menu, PenLine, Plus, Loader2, FolderDown, ChevronDown, FolderOpen } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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

// Folder Overview component to show a preview of folders and their notes
const FolderOverview = () => {
  const navigate = useNavigate();
  const folders = useFolderStore(state => state.folders);
  const notes = useNoteStore(state => state.notes);
  
  // Get notes by folder
  const getNotesByFolder = (folderId: string) => {
    return notes.filter(note => note.folderId === folderId);
  };
  
  // Handler for folder navigation
  const handleFolderClick = (folderId: string) => {
    // Use navigate directly without setting any state
    navigate(`/folder/${folderId}`);
  };
  
  if (folders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">You haven't created any folders yet.</p>
        <Button onClick={() => navigate("/app")}>Go to Notes</Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {folders.map(folder => {
        const folderNotes = getNotesByFolder(folder.id);
        return (
          <div key={folder.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-md flex items-center justify-center" 
                  style={{ backgroundColor: folder.color || '#4f46e5' }}
                >
                  <FolderOpen className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-lg font-semibold">{folder.name}</h3>
                <span className="text-xs text-muted-foreground">
                  {folderNotes.length} note{folderNotes.length !== 1 ? 's' : ''}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleFolderClick(folder.id)}
              >
                View All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {folderNotes.slice(0, 3).map(note => (
                <Card 
                  key={note.id}
                  className={`cursor-pointer bg-note-${note.color}-light border-l-4 h-32`}
                  style={{ borderLeftColor: folder.color || '#4f46e5' }}
                  onClick={() => navigate(`/note/${note.id}`)}
                >
                  <CardHeader className="p-3 pb-1">
                    <CardTitle className="text-sm line-clamp-1">{note.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-xs line-clamp-3">{note.content}</p>
                  </CardContent>
                </Card>
              ))}
              
              {folderNotes.length === 0 && (
                <div className="col-span-3 text-center py-4 border rounded-md bg-muted/20">
                  <p className="text-sm text-muted-foreground">No notes in this folder yet.</p>
                </div>
              )}
              
              {folderNotes.length > 0 && folderNotes.length < 3 && (
                <Card 
                  className="cursor-pointer border-dashed flex items-center justify-center h-32"
                  onClick={() => handleFolderClick(folder.id)}
                >
                  <CardContent className="flex flex-col items-center justify-center p-3">
                    <Plus className="h-5 w-5 text-muted-foreground mb-1" />
                    <p className="text-xs text-muted-foreground">View More</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );
      })}
    </div>
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
  
  // Add state for folder filtering and view mode
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'notes' | 'folders'>('notes'); // Determined automatically by pathname
  const [showAllNotes, setShowAllNotes] = useState(false); 
  
  // inside Index component after state declarations
  const locationPath = window.location.pathname;
  useEffect(() => {
    if (locationPath === '/folders') {
      if (viewMode !== 'folders') {
        setViewMode('folders');
      }
    } else {
      if (viewMode !== 'notes') {
        setViewMode('notes');
      }
    }
    // We intentionally omit viewMode from dependency array to avoid loop; we rely on locationPath changes only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationPath]);
  
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

  let pageTitle = showAllNotes ? "All Notes" : "Unfiled Notes";
  if (viewMode === 'folders') {
    pageTitle = "Folders";
  } else if (category) {
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
            <div className="flex items-center gap-3">
              {/* Toggle for showing all notes vs only unfiled notes */}
              {viewMode === 'notes' && !category && (
                <div className="flex items-center gap-2 border p-1.5 px-3 rounded-md">
                  <Label htmlFor="show-all-notes" className="text-xs mr-1 flex items-center cursor-pointer">
                    {showAllNotes ? "Showing all notes" : "Showing unfiled notes"}
                  </Label>
                  <Switch
                    id="show-all-notes"
                    checked={showAllNotes}
                    onCheckedChange={setShowAllNotes}
                  />
                </div>
              )}
              
              {/* Add folder selector dropdown */}
              {viewMode === 'notes' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <FolderDown className="h-4 w-4" />
                      <span>{selectedFolder ? folders.find(f => f.id === selectedFolder)?.name : "Folders"}</span>
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
              )}
            </div>
          </div>
          
          {!category && !selectedFolder && viewMode === 'notes' && (
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
            ) : viewMode === 'folders' ? (
              <FolderOverview />
            ) : (
              <NoteList 
                category={category as NoteCategory | undefined} 
                showFiled={showAllNotes} 
              />
            )}
          </ErrorBoundary>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
