
import { useEffect } from "react";
import { DrawingCanvas } from "./DrawingCanvas";
import { useNoteEditor } from "@/hooks/useNoteEditor";
import { NoteActions } from "./NoteActions";
import { TabsContainer } from "./TabsContainer";
import { RichTextEditor } from "./RichTextEditor";
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
  
  // Rich text editor tab
  const textContent = (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-auto relative">
        <RichTextEditor
          content={content}
          setContent={setContent}
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
