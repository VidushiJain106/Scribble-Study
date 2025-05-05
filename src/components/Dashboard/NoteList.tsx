
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNoteStore } from "@/lib/store";
import { Note } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { FileImage, Pen, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function NoteList({ category }: { category?: string }) {
  const notes = useNoteStore(state => state.notes);
  const createNote = useNoteStore(state => state.createNote);
  const navigate = useNavigate();
  
  // Filter notes by category if provided
  const filteredNotes = category 
    ? notes.filter(note => note.category === category) 
    : notes;
  
  const handleCreateNote = () => {
    const newNoteId = createNote(category as any);
    navigate(`/note/${newNoteId}`);
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
