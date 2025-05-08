
import { useEffect, useState } from "react";
import { Note } from "@/types";
import { useNoteStore } from "@/lib/store";

export function useNoteState(noteId: string) {
  const notes = useNoteStore(state => state.notes);
  
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [textFormatting, setTextFormatting] = useState<React.CSSProperties>({});

  // Load note data
  useEffect(() => {
    const foundNote = notes.find(n => n.id === noteId);
    if (foundNote) {
      setNote(foundNote);
      setTitle(foundNote.title);
      setContent(foundNote.content || "");
    }
  }, [noteId, notes]);

  // Handle text formatting
  const handleFormatChange = (formatType: string, value: any) => {
    setTextFormatting(prev => ({
      ...prev,
      [formatType]: value
    }));
  };

  return {
    note,
    setNote,
    title,
    setTitle,
    content,
    setContent,
    textFormatting,
    handleFormatChange
  };
}
