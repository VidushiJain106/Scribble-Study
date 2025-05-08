
import { NoteList } from "@/components/Dashboard/NoteList";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useNoteStore, useInitializeNotes } from "@/lib/store";
import { useCategoryStore } from "@/lib/categoryStore";
import { NoteCategory } from "@/types";
import { FileText, Menu, PenLine, Plus, Loader2 } from "lucide-react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
  const navigate = useNavigate();
  
  const { category } = useParams<{ category?: string }>();
  const { user, loading: authLoading } = useAuth();
  
  // Initialize notes when authenticated
  useInitializeNotes();
  
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
            <Button 
              onClick={handleCreateNote} 
              className="flex items-center gap-2 bg-violet-500 hover:bg-violet-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>New Note</span>
            </Button>
          </div>
          
          {!category && (
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
