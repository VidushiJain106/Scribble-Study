
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNoteStore } from "@/lib/store";
import { useCategoryStore } from "@/lib/categoryStore";
import { Note } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { FileImage, Pen, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function NoteList({ category }: { category?: string }) {
  const notes = useNoteStore(state => state.notes);
  const createNote = useNoteStore(state => state.createNote);
  const categoryItems = useCategoryStore(state => state.categoryItems);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Get all subcategories for a category
  const getAllSubcategories = (categoryName: string): string[] => {
    const categoryItem = categoryItems.find(item => item.name === categoryName);
    if (!categoryItem || !categoryItem.subCategories) return [];
    
    const subCategories: string[] = [...categoryItem.subCategories];
    
    // Add nested subcategories recursively
    categoryItem.subCategories.forEach(subCat => {
      const nestedSubs = getAllSubcategories(subCat);
      subCategories.push(...nestedSubs);
    });
    
    return subCategories;
  };
  
  // Filter notes by category and its subcategories if provided
  const filteredNotes = category 
    ? notes.filter(note => {
        const categories = [category, ...getAllSubcategories(category)];
        return categories.includes(note.category);
      })
    : notes;
  
  const handleCreateNote = async () => {
    if (!user) return;
    try {
      const newNoteId = await createNote(category as any);
      navigate(`/note/${newNoteId}`);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };
  
  const handleNoteClick = (noteId: string) => {
    navigate(`/note/${noteId}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
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
            Add a new note to your collection
          </CardDescription>
        </CardContent>
      </Card>
      
      {/* Note Cards */}
      {filteredNotes.map((note) => (
        <NoteCard 
          key={note.id} 
          note={note} 
          onClick={() => handleNoteClick(note.id)} 
        />
      ))}

      {filteredNotes.length === 0 && (
        <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12">
          <p className="text-muted-foreground">No notes found in this category.</p>
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, onClick }: { note: Note; onClick: () => void }) {
  return (
    <Card 
      className={`note-card cursor-pointer h-64 bg-note-${note.color}-light hover:shadow-md transition-all duration-200`}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
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
