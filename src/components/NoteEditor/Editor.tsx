import { Textarea } from "@/components/ui/textarea";
import { DrawPath } from "@/types";
import { useEffect, useRef, useState } from "react";
import { DrawingCanvas } from "./DrawingCanvas";
import { FontFormatBar } from "./FontFormatBar";
import { useNoteEditor } from "@/hooks/useNoteEditor";
import { NoteActions } from "./NoteActions";
import { TabsContainer } from "./TabsContainer";
import { AttachmentGallery } from "./AttachmentGallery";
import { FloatingExplainButton } from "./FloatingExplainButton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [iconPos, setIconPos] = useState<{ x: number; y: number } | null>(null);
  const [openSummary, setOpenSummary] = useState(false);

  const generateSummary = (text: string) => {
    // Very naive placeholder summary logic
    if (text.length <= 100) return text;
    return text.substring(0, 100) + "...";
  };

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
  
  // Handle text selection inside textarea
  const handleMouseUp = (e: React.MouseEvent<HTMLTextAreaElement, MouseEvent>) => {
    const target = e.target as HTMLTextAreaElement;
    const { selectionStart, selectionEnd, value } = target;
    if (selectionStart !== selectionEnd) {
      const text = value.substring(selectionStart, selectionEnd).trim();
      if (text.length > 0) {
        setSelectedText(text);
        setIconPos({ x: e.clientX, y: e.clientY });
        return;
      }
    }
    // if no selection
    setSelectedText("");
    setIconPos(null);
  };

  // Clear icon when clicking elsewhere
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
        setSelectedText("");
        setIconPos(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Text content tab
  const textContent = (
    <>
      <FontFormatBar onFormatChange={handleFormatChange} />
      <div className="flex-1 flex flex-col overflow-auto relative">
        <Textarea 
          ref={textareaRef}
          value={content} 
          onChange={e => setContent(e.target.value)} 
          onMouseUp={handleMouseUp}
          className="flex-1 min-h-0 resize-none border-none focus-visible:ring-0 p-0" 
          placeholder="Start writing your note..." 
          style={textFormatting} 
        />

        {selectedText && iconPos && (
          <Button
            size="icon"
            variant="secondary"
            className="absolute z-20"
            style={{ top: iconPos.y - 40, left: iconPos.x + 10 }}
            onClick={() => setOpenSummary(true)}
          >
            <Lightbulb className="h-4 w-4" />
          </Button>
        )}

        <Dialog open={openSummary} onOpenChange={setOpenSummary}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Explanation</DialogTitle>
            </DialogHeader>
            <p className="whitespace-pre-wrap text-sm">
              {generateSummary(selectedText)}
            </p>
          </DialogContent>
        </Dialog>
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

  // We're no longer showing the floating explain button since we have a permanent one in the header
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
    </div>
  );
}
