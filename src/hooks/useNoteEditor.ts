
import { useNoteStore } from "@/lib/store";
import { useChatStore } from "@/lib/chatStore";
import { DrawPath, Note, Attachment } from "@/types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function useNoteEditor(noteId: string) {
  const notes = useNoteStore(state => state.notes);
  const updateNote = useNoteStore(state => state.updateNote);
  const deleteNote = useNoteStore(state => state.deleteNote);
  const addDrawingToNote = useNoteStore(state => state.addDrawingToNote);
  const addAttachmentToNote = useNoteStore(state => state.addAttachmentToNote);
  const removeAttachmentFromNote = useNoteStore(state => state.removeAttachmentFromNote);
  const analyzeNote = useChatStore(state => state.analyzeNote);
  
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState("text");
  const [textFormatting, setTextFormatting] = useState<CSSProperties>({});
  const [analysisTimer, setAnalysisTimer] = useState<NodeJS.Timeout | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load note data
  useEffect(() => {
    const foundNote = notes.find(n => n.id === noteId);
    if (foundNote) {
      setNote(foundNote);
      setTitle(foundNote.title);
      setContent(foundNote.content);
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
  const handleSave = () => {
    if (!note) return;
    updateNote(noteId, {
      title,
      content
    });
    toast({
      title: "Note saved",
      description: "Your changes have been saved"
    });
  };

  // Handle drawing completion
  const handleDrawingComplete = (paths: DrawPath[]) => {
    if (!note) return;
    addDrawingToNote(noteId, paths);
    toast({
      title: "Drawing saved",
      description: "Your drawing has been added to the note"
    });
  };

  // Handle file upload
  const handleFileUpload = (attachment: Omit<Attachment, "id" | "createdAt">) => {
    if (!note) return;
    addAttachmentToNote(noteId, attachment);
  };

  // Handle delete attachment
  const handleDeleteAttachment = (attachmentId: string) => {
    if (!note) return;
    removeAttachmentFromNote(noteId, attachmentId);
    toast({
      title: "Attachment removed",
      description: "The attachment has been removed from the note"
    });
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
    analyzeNote(updatedNote);
    setIsAnalyzing(false);
    
    toast({
      title: "Analysis requested",
      description: "Your note is being analyzed..."
    });
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
    handleSave,
    handleDrawingComplete,
    handleFileUpload,
    handleDeleteAttachment,
    handleFormatChange,
    handleExplainClick,
    forceAnalysis,
    deleteNote
  };
}
