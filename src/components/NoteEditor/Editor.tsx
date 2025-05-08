
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
import { Lightbulb, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/lib/chatStore";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface EditorProps {
  noteId: string;
}

export function Editor({ noteId }: EditorProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  
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

  const editorRef = useRef<HTMLDivElement | null>(null);
  const [selectedText, setSelectedText] = useState("");
  const [iconPos, setIconPos] = useState<{ x: number; y: number } | null>(null);
  const [openSummary, setOpenSummary] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [middleSchoolExplanation, setMiddleSchoolExplanation] = useState<string | null>(null);

  const handleExplainSelected = () => {
    const explainSnippet = useChatStore.getState().explainSnippet;
    setExplanation('Generating explanation...');
    explainSnippet(selectedText).then(exp => setExplanation(exp));
  };

  const handleMiddleSchoolExplain = () => {
    const explainForMiddleSchooler = useChatStore.getState().explainForMiddleSchooler;
    setMiddleSchoolExplanation('Generating middle school explanation...');
    explainForMiddleSchooler(selectedText).then(exp => setMiddleSchoolExplanation(exp));
  };

  // Listen to selection changes to position icon next to highlight
  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setSelectedText("");
        setIconPos(null);
        setExplanation(null);
        return;
      }
      if (!editorRef.current || !editorRef.current.contains(sel.anchorNode)) {
        setSelectedText("");
        setIconPos(null);
        setExplanation(null);
        return;
      }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect) {
        const text = sel.toString().trim();
        if (text.length) {
          setSelectedText(text);
          
          // Calculate position with viewport boundary checks
          const padding = 20; // Padding from viewport edges
          const iconSize = 36; // Approximate size of the icon button
          
          // Get viewport dimensions
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          // Calculate initial position
          let x = rect.right + window.scrollX;
          let y = rect.top + window.scrollY;
          
          // Ensure icon stays within horizontal boundaries with padding
          if (x + iconSize + padding > viewportWidth) {
            x = viewportWidth - iconSize - padding;
          }
          if (x < padding) {
            x = padding;
          }
          
          // Ensure icon stays within vertical boundaries with padding
          if (y + iconSize + padding > viewportHeight) {
            y = viewportHeight - iconSize - padding;
          }
          if (y < padding) {
            y = padding;
          }
          
          setIconPos({ x, y });
          
          if (text.length > 5) {
            setExplanation('Generating explanation...');
            const explainSnippet = useChatStore.getState().explainSnippet;
            explainSnippet(text).then(exp => setExplanation(exp));
          }
        }
      }
    };
    document.addEventListener("selectionchange", handleSelection);
    return () => document.removeEventListener("selectionchange", handleSelection);
  }, []);

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
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="flex-1 min-h-0 outline-none p-2 whitespace-pre-wrap"
          style={textFormatting}
          onInput={(e) => setContent((e.target as HTMLDivElement).innerText)}
          onBlur={(e) => setContent((e.target as HTMLDivElement).innerText)}
          onFocus={() => {
            // ensure innerText sync
            if (editorRef.current && editorRef.current.innerText !== content) {
              editorRef.current.innerText = content;
            }
          }}
        >{content}</div>

        {selectedText && iconPos && (
          <Button
            size="icon"
            variant="default"
            className="fixed z-50 bg-primary text-primary-foreground hover:bg-primary/90"
            style={{ top: iconPos.y - 8, left: iconPos.x + 8 }}
            onClick={() => setOpenSummary(true)}
            aria-label="Explain selection"
          >
            <Lightbulb className="h-4 w-4" />
          </Button>
        )}

        <Dialog open={openSummary} onOpenChange={setOpenSummary}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <div className="flex items-center justify-between mb-2">
                <DialogTitle className="text-xl">Explanation</DialogTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setOpenSummary(false)}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Note
                </Button>
              </div>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap">
                {explanation || "Highlight text to generate an explanation..."}
              </div>
              
              {!middleSchoolExplanation && (
                <Button 
                  onClick={handleMiddleSchoolExplain}
                  size="sm"
                  variant="outline"
                  className="mt-2"
                >
                  Explain to a Middle Schooler
                </Button>
              )}
              
              {middleSchoolExplanation && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Middle School Explanation:</h4>
                  <div className="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap">
                    {middleSchoolExplanation}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <AttachmentGallery 
        attachments={note?.attachments || []} 
        onDelete={handleDeleteAttachment} 
      />
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
