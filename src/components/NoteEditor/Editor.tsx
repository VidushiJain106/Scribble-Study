
import { useEffect } from "react";
import { DrawingCanvas } from "./DrawingCanvas";
import { FontFormatBar } from "./FontFormatBar";
import { useNoteEditor } from "@/hooks/useNoteEditor";
import { NoteActions } from "./NoteActions";
import { TabsContainer } from "./TabsContainer";
import { TextEditor } from "./TextEditor";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface EditorProps {
  noteId: string;
}

export function Editor({ noteId }: EditorProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Always call hooks unconditionally at the top level
  const {
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
    deleteNote
  } = useNoteEditor(noteId);
  
  // Redirect to login if not authenticated - after all hooks are called
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  
  // Render not found message if note doesn't exist and we're not loading
  if (!note && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Note not found</p>
      </div>
    );
  }
  
  // Text content tab
  const textContent = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="sticky top-0 z-10 bg-background pb-2">
        <FontFormatBar onFormatChange={handleFormatChange} />
      </div>
      <div className="flex-1 flex flex-col overflow-auto relative">
        <TextEditor
          content={content}
          setContent={setContent}
          textFormatting={textFormatting}
          attachments={note?.attachments || []}
          onDeleteAttachment={handleDeleteAttachment}
        />
      </div>
    </div>
  );

  // Drawing content tab
  const drawContent = (
    <DrawingCanvas onComplete={handleDrawingComplete} />
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="sticky top-0 z-20 bg-background">
        <NoteActions 
          noteId={noteId}
          title={title}
          setTitle={setTitle}
          note={note}
          content={content} // Pass content to NoteActions
          isAnalyzing={isAnalyzing}
          isSaving={isSaving}
          handleSave={handleSave}
          deleteNote={deleteNote}
          handleFileUpload={handleFileUpload}
          handleExplainClick={handleExplainClick}
          forceAnalysis={forceAnalysis}
        />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <TabsContainer 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          textContent={textContent}
          drawContent={drawContent}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
