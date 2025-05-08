
import { useNoteStore } from "@/lib/store";
import { DrawPath, Attachment } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function useNoteAttachments(noteId: string) {
  const addDrawingToNote = useNoteStore(state => state.addDrawingToNote);
  const addAttachmentToNote = useNoteStore(state => state.addAttachmentToNote);
  const removeAttachmentFromNote = useNoteStore(state => state.removeAttachmentFromNote);
  const { user } = useAuth();
  const { toast } = useToast();

  // Handle drawing completion
  const handleDrawingComplete = async (paths: DrawPath[]) => {
    if (!user) return;
    
    try {
      await addDrawingToNote(noteId, paths);
      toast({
        title: "Drawing saved",
        description: "Your drawing has been added to the note"
      });
    } catch (error) {
      console.error("Error saving drawing:", error);
      toast({
        title: "Error saving drawing",
        description: "There was a problem saving your drawing",
        variant: "destructive"
      });
    }
  };

  // Handle file upload
  const handleFileUpload = async (attachment: Omit<Attachment, "id" | "createdAt">) => {
    if (!user) return;
    
    try {
      await addAttachmentToNote(noteId, attachment);
      toast({
        title: "Attachment added",
        description: "Your file has been attached to the note"
      });
    } catch (error) {
      console.error("Error adding attachment:", error);
      toast({
        title: "Error adding attachment",
        description: "There was a problem adding your attachment",
        variant: "destructive"
      });
    }
  };

  // Handle delete attachment
  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!user) return;
    
    try {
      await removeAttachmentFromNote(noteId, attachmentId);
      toast({
        title: "Attachment removed",
        description: "The attachment has been removed from the note"
      });
    } catch (error) {
      console.error("Error removing attachment:", error);
      toast({
        title: "Error removing attachment",
        description: "There was a problem removing the attachment",
        variant: "destructive"
      });
    }
  };

  return {
    handleDrawingComplete,
    handleFileUpload,
    handleDeleteAttachment
  };
}
