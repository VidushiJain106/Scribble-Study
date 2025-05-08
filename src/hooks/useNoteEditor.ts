import { useNoteStore } from "@/lib/store";
import { useChatStore } from "@/lib/chatStore";
import { DrawPath, Note, Attachment } from "@/types";
import { useEffect, useState, CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function useNoteEditor(noteId: string) {
  const notes = useNoteStore(state => state.notes);
  const updateNote = useNoteStore(state => state.updateNote);
  const deleteNote = useNoteStore(state => state.deleteNote);
  const addDrawingToNote = useNoteStore(state => state.addDrawingToNote);
  const addAttachmentToNote = useNoteStore(state => state.addAttachmentToNote);
  const removeAttachmentFromNote = useNoteStore(state => state.removeAttachmentFromNote);
  const analyzeNote = useChatStore(state => state.analyzeNote);
  const isLoading = useNoteStore(state => state.isLoading);
  const { user } = useAuth();
  
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState("text");
  const [textFormatting, setTextFormatting] = useState<CSSProperties>({});
  const [analysisTimer, setAnalysisTimer] = useState<NodeJS.Timeout | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load note data
  useEffect(() => {
    const foundNote = notes.find(n => n.id === noteId);
    if (foundNote) {
      setNote(foundNote);
      setTitle(foundNote.title);
      setContent(foundNote.content || "");
    }
  }, [noteId, notes]);

  // Auto-analyze note content when it changes
  useEffect(() => {
    if (!note) return;

    // Clear previous timer
    if (analysisTimer) {
      clearTimeout(analysisTimer);
    }

    // Only analyze if there's significant content
    if (content.length > 50) {
      setAnalysisTimer(setTimeout(() => {
        setIsAnalyzing(true);
        const updatedNote = {
          ...note,
          content
        };
        analyzeNote(updatedNote);
        setIsAnalyzing(false);
      }, 5000)); // Wait 5 seconds after typing stops
    }

    return () => {
      if (analysisTimer) {
        clearTimeout(analysisTimer);
      }
    };
  }, [content, note, analyzeNote]);

  // Save note changes
  const handleSave = async () => {
    if (!note || !user) return;
    
    setIsSaving(true);
    try {
      await updateNote(noteId, {
        title,
        content
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

  // Handle drawing completion
  const handleDrawingComplete = async (paths: DrawPath[]) => {
    if (!note || !user) return;
    
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
    if (!note || !user) return;
    
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
    if (!note || !user) return;
    
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

  // Handle text formatting
  const handleFormatChange = (formatType: string, value: any) => {
    setTextFormatting(prev => ({
      ...prev,
      [formatType]: value
    }));
  };

  const handleExplainClick = () => {
    navigate(`/note/${noteId}/explanation`);
  };

  const forceAnalysis = () => {
    if (!note) return;
    setIsAnalyzing(true);
    const updatedNote = {
      ...note,
      content
    };
    
    analyzeNote(updatedNote)
      .catch(error => {
        console.error("Error during analysis:", error);
        toast({
          title: "Analysis failed",
          description: "There was a problem analyzing your note",
          variant: "destructive"
        });
      })
      .finally(() => {
        setIsAnalyzing(false);
      });
    
    toast({
      title: "Analysis requested",
      description: "Your note is being analyzed..."
    });
  };

  const handleDelete = async () => {
    if (!note || !user) return;
    
    try {
      await deleteNote(noteId);
      navigate("/app");
      toast({
        title: "Note deleted",
        description: "Your note has been permanently deleted"
      });
    } catch (error) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error deleting note",
        description: "There was a problem deleting your note",
        variant: "destructive"
      });
    }
  };

  return {
    note,
    title,
    setTitle,
    content,
    setContent,
    activeTab,
    setActiveTab,
    textFormatting,
    isAnalyzing,
    isLoading,
    isSaving,
    handleSave,
    handleDrawingComplete,
    handleFileUpload,
    handleDeleteAttachment,
    handleFormatChange,
    handleExplainClick,
    forceAnalysis,
    deleteNote: handleDelete
  };
}
