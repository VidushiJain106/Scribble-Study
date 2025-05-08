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
import { 
  Lightbulb, 
  ArrowLeft, 
  List, 
  Sparkles, 
  FileText,
  AlignJustify,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChatStore } from "@/lib/chatStore";

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
    handlePdfTextExtracted,
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
  const [summary, setSummary] = useState<string | null>(null);
  const [simplified, setSimplified] = useState<string | null>(null);
  const [examples, setExamples] = useState<string | null>(null);
  const [activeExplanationTab, setActiveExplanationTab] = useState<string>("explain");

  const generateSummary = (text: string) => {
    // Very naive placeholder summary logic
    if (text.length <= 100) return text;
    return text.substring(0, 100) + "...";
  };

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

  const handleSummarize = () => {
    const summarizeSnippet = useChatStore.getState().summarizeSnippet;
    setSummary('Generating summary...');
    summarizeSnippet(selectedText).then(sum => setSummary(sum));
  };

  const handleSimplify = () => {
    const simplifySnippet = useChatStore.getState().simplifySnippet;
    setSimplified('Simplifying text...');
    simplifySnippet(selectedText).then(simp => setSimplified(simp));
  };

  const handleGenerateExamples = () => {
    const generateExamples = useChatStore.getState().generateExamples;
    setExamples('Generating examples...');
    generateExamples(selectedText).then(ex => setExamples(ex));
  };

  // Setup effect to automatically trigger analysis when content changes
  // This is a placeholder - the actual logic is in the useNoteEditor hook
  useEffect(() => {
    // Left intentionally empty as the logic is now in the hook
  }, []);
  
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

  useEffect(() => {
    // When opening the explanation dialog, ensure we generate an explanation
    // if one isn't already there
    if (openSummary && !explanation && selectedText) {
      handleExplainSelected();
    }
  }, [openSummary, explanation, selectedText]);

  if (!note) {
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
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <div className="flex items-center justify-between mb-2">
                <DialogTitle className="text-xl">AI Analysis</DialogTitle>
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
            
            <Tabs 
              defaultValue="explain" 
              value={activeExplanationTab} 
              onValueChange={setActiveExplanationTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-5 mb-4">
                <TabsTrigger value="explain" onClick={handleExplainSelected} className="flex items-center gap-1">
                  <Lightbulb className="h-4 w-4" />
                  <span className="hidden sm:inline">Explain</span>
                </TabsTrigger>
                <TabsTrigger value="summarize" onClick={handleSummarize} className="flex items-center gap-1">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">Summarize</span>
                </TabsTrigger>
                <TabsTrigger value="simplify" onClick={handleSimplify} className="flex items-center gap-1">
                  <AlignJustify className="h-4 w-4" />
                  <span className="hidden sm:inline">Simplify</span>
                </TabsTrigger>
                <TabsTrigger value="examples" onClick={handleGenerateExamples} className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">Examples</span>
                </TabsTrigger>
                <TabsTrigger value="middle-school" onClick={handleMiddleSchoolExplain} className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Kid-friendly</span>
                </TabsTrigger>
              </TabsList>
              
              {selectedText ? (
                <>
                  {activeExplanationTab === "explain" && (
                    <div className="space-y-4">
                      <div className="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap min-h-[150px]">
                        {explanation || "Generating explanation..."}
                      </div>
                    </div>
                  )}
                  
                  {activeExplanationTab === "summarize" && (
                    <div className="space-y-4">
                      <div className="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap min-h-[150px]">
                        {summary || "Generating summary..."}
                      </div>
                    </div>
                  )}
                  
                  {activeExplanationTab === "simplify" && (
                    <div className="space-y-4">
                      <div className="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap min-h-[150px]">
                        {simplified || "Simplifying text..."}
                      </div>
                    </div>
                  )}
                  
                  {activeExplanationTab === "examples" && (
                    <div className="space-y-4">
                      <div className="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap min-h-[150px]">
                        {examples || "Generating examples..."}
                      </div>
                    </div>
                  )}
                  
                  {activeExplanationTab === "middle-school" && (
                    <div className="space-y-4">
                      <div className="rounded-md bg-muted p-4 text-sm whitespace-pre-wrap min-h-[150px]">
                        {middleSchoolExplanation || "Generating kid-friendly explanation..."}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-muted rounded-md p-8 text-center text-muted-foreground">
                  <Lightbulb className="h-10 w-10 mx-auto mb-4 opacity-50" />
                  <p className="text-sm mb-2">No text selected</p>
                  <p className="text-xs max-w-md mx-auto">
                    Highlight some text in your note to get AI-powered explanations, 
                    summaries, simplifications, and examples.
                  </p>
                </div>
              )}
            </Tabs>
            
            <div className="text-xs text-muted-foreground mt-2">
              Select text and choose an analysis type to get AI-powered insights.
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <AttachmentGallery 
        attachments={note.attachments || []} 
        onDelete={handleDeleteAttachment} 
      />
    </div>
  );

  // Drawing content tab
  const drawContent = (
    <DrawingCanvas onComplete={handleDrawingComplete} />
  );

  // We're no longer showing the floating explain button since we have a permanent one in the header
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="sticky top-0 z-20 bg-background">
        <NoteActions 
          noteId={noteId}
          title={title}
          setTitle={setTitle}
          note={note}
          isAnalyzing={isAnalyzing}
          handleSave={handleSave}
          deleteNote={deleteNote}
          handleFileUpload={handleFileUpload}
          handlePdfTextExtracted={handlePdfTextExtracted}
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
        />
      </div>
    </div>
  );
}
