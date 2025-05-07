import { Textarea } from "@/components/ui/textarea";
import { DrawPath } from "@/types";
import { useEffect } from "react";
import { DrawingCanvas } from "./DrawingCanvas";
import { FontFormatBar } from "./FontFormatBar";
import { useNoteEditor } from "@/hooks/useNoteEditor";
import { NoteActions } from "./NoteActions";
import { TabsContainer } from "./TabsContainer";
import { AttachmentGallery } from "./AttachmentGallery";
import { FloatingExplainButton } from "./FloatingExplainButton";

interface EditorProps {
  noteId: string;
}

export function Editor({ noteId }: EditorProps) {
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
    handleSave,
    handleDrawingComplete,
    handleFileUpload,
    handleDeleteAttachment,
    handleFormatChange,
    handleExplainClick,
    forceAnalysis,
    deleteNote
  } = useNoteEditor(noteId);

  // Setup effect to automatically trigger analysis when content changes
  // This is a placeholder - the actual logic is in the useNoteEditor hook
  useEffect(() => {
    // Left intentionally empty as the logic is now in the hook
  }, []);
  
  if (!note) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Note not found</p>
      </div>
    );
  }
  
  // Check if the note has analysis data and is ready for explanation
  const showExplainButton = note.analysis && note.analysis.readyForExplanation;

  // Text content tab
  const textContent = (
    <>
      <FontFormatBar onFormatChange={handleFormatChange} />
      <div className="flex-1 flex flex-col overflow-auto">
        <Textarea 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          className="flex-1 min-h-0 resize-none border-none focus-visible:ring-0 p-0" 
          placeholder="Start writing your note..." 
          style={textFormatting} 
        />
      </div>
      
      <AttachmentGallery 
        attachments={note.attachments || []} 
        onDelete={handleDeleteAttachment} 
      />
    </>
  );

  // Drawing content tab
  const drawContent = (
    <DrawingCanvas onComplete={handleDrawingComplete} />
  );

  return (
    <div className="flex flex-col h-full">
      <NoteActions 
        noteId={noteId}
        title={title}
        setTitle={setTitle}
        note={note}
        isAnalyzing={isAnalyzing}
        handleSave={handleSave}
        deleteNote={deleteNote}
        handleFileUpload={handleFileUpload}
        handleExplainClick={handleExplainClick}
        forceAnalysis={forceAnalysis}
      />
      
      <TabsContainer 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        textContent={textContent}
        drawContent={drawContent}
      />
      
      <FloatingExplainButton 
        onClick={handleExplainClick} 
        show={showExplainButton}
      />
    </div>
  );
}
