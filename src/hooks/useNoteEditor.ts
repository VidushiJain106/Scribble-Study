
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

  // Get note state from custom hook
  const {
    note,
    title,
    setTitle,
    content,
    setContent,
    textFormatting,
    handleFormatChange
  } = useNoteState(noteId);

  // Get analysis functionality from custom hook
  const {
    isAnalyzing,
    forceAnalysis
  } = useNoteAnalysis(note, content);

  // Get save functionality from custom hook
  const {
    isSaving,
    handleSave,
    deleteNote
  } = useNoteSave(noteId);

  // Get attachment functionality from custom hook
  const {
    handleDrawingComplete,
    handleFileUpload,
    handleDeleteAttachment
  } = useNoteAttachments(noteId);

  const handleExplainClick = () => {
    navigate(`/note/${noteId}/explanation`);
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
    handleSave: () => handleSave(title, content),
    handleDrawingComplete,
    handleFileUpload,
    handleDeleteAttachment,
    handleFormatChange,
    handleExplainClick,
    forceAnalysis,
    deleteNote
  };
}
