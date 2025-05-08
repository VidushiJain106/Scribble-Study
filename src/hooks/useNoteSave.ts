
import { useState } from "react";
import { useNoteStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function useNoteSave(noteId: string) {
  const updateNote = useNoteStore(state => state.updateNote);
  const deleteNote = useNoteStore(state => state.deleteNote);
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  // Save note changes
  const handleSave = async (title: string, content: string) => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateNote(noteId, {
        title,
        content,
        updated_at: new Date()
      });
      
      toast({
        title: "Note saved",
        description: "Your changes have been saved"
      });
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error saving note",
        description: "There was a problem saving your note",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle note deletion
  const handleDelete = async () => {
    if (!user) return;
    
    try {
      await deleteNote(noteId);
      toast({
        title: "Note deleted",
        description: "Your note has been permanently deleted"
      });
      return true; // Return true to indicate successful deletion
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error deleting note",
        description: "There was a problem deleting your note",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    isSaving,
    handleSave,
    deleteNote: handleDelete
  };
}
