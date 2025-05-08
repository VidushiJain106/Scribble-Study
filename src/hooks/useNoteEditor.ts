
import { useNoteStore } from "@/lib/store";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNoteState } from "./useNoteState";
import { useNoteAnalysis } from "./useNoteAnalysis";
import { useNoteSave } from "./useNoteSave";
import { useNoteAttachments } from "./useNoteAttachments";

export function useNoteEditor(noteId: string) {
  const isLoading = useNoteStore(state => state.isLoading);
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("text");
  const navigate = useNavigate();

  // Get note state from custom hook - always call hooks regardless of conditions
  const noteState = useNoteState(noteId);
  
  // Get analysis functionality from custom hook - always call regardless of conditions
  const noteAnalysis = useNoteAnalysis(noteState.note, noteState.content);

  // Get save functionality from custom hook - always call regardless of conditions
  const noteSave = useNoteSave(noteId);

  // Get attachment functionality from custom hook - always call regardless of conditions
  const noteAttachments = useNoteAttachments(noteId);

  const handleExplainClick = () => {
    navigate(`/note/${noteId}/explanation`);
  };

  // Return all properties from the hooks
  return {
    ...noteState,
    activeTab,
    setActiveTab,
    isAnalyzing: noteAnalysis.isAnalyzing,
    isLoading,
    isSaving: noteSave.isSaving,
    handleSave: (title: string, content: string) => noteSave.handleSave(title, content),
    handleDrawingComplete: noteAttachments.handleDrawingComplete,
    handleFileUpload: noteAttachments.handleFileUpload,
    handleDeleteAttachment: noteAttachments.handleDeleteAttachment,
    handleExplainClick,
    forceAnalysis: noteAnalysis.forceAnalysis,
    deleteNote: noteSave.deleteNote
  };
}
