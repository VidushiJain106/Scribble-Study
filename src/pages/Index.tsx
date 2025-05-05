
import { NoteList } from "@/components/Dashboard/NoteList";
import { Sidebar } from "@/components/Dashboard/Sidebar";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useNoteStore } from "@/lib/store";
import { NoteCategory } from "@/types";
import { Menu, PenLine, Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const Index = () => {
  const createNote = useNoteStore(state => state.createNote);
  const navigate = useNavigate();
  
  const { category } = useParams<{ category?: string }>();
  
  const handleCreateNote = () => {
    const newNoteId = createNote(category as NoteCategory);
    navigate(`/note/${newNoteId}`);
  };

  let pageTitle = "All Notes";
  if (category) {
    pageTitle = `${category.charAt(0).toUpperCase() + category.slice(1)} Notes`;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <h1 className="text-2xl font-bold">{pageTitle}</h1>
            </div>
            <Button onClick={handleCreateNote} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>New Note</span>
            </Button>
          </div>
          
          {!category && (
            <div className="mb-8 p-8 bg-gradient-to-r from-note-purple to-primary rounded-lg shadow-lg text-white">
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
          
          <NoteList category={category as NoteCategory | undefined} />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
