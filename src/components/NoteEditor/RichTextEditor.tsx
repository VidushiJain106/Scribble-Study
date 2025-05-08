
import { useState, useRef, useEffect, useCallback } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { useChatStore } from "@/lib/chatStore";
import { AttachmentGallery } from "./AttachmentGallery";
import { Attachment } from "@/types";
import { EditorToolbar } from "./EditorToolbar";
import { EditorTableMenu } from "./EditorTableMenu";
import { EditorColorMenu } from "./EditorColorMenu";

interface RichTextEditorProps {
  content: string;
  setContent: (content: string) => void;
  attachments?: Attachment[];
  onDeleteAttachment: (id: string) => void;
}

export function RichTextEditor({
  content,
  setContent,
  attachments = [],
  onDeleteAttachment
}: RichTextEditorProps) {
  const [selectedText, setSelectedText] = useState("");
  const [iconPos, setIconPos] = useState<{ x: number; y: number } | null>(null);
  const [openSummary, setOpenSummary] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [middleSchoolExplanation, setMiddleSchoolExplanation] = useState<string | null>(null);
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      Highlight,
      FontFamily,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      Placeholder.configure({
        placeholder: 'Start typing your note...',
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      // When content changes in the editor, update parent
      setContent(editor.getHTML());
    },
  });

  // Update editor content when content prop changes (e.g. when loading a note)
  useEffect(() => {
    if (editor && editor.getHTML() !== content && content !== undefined) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleExplainSelected = () => {
    const explainSnippet = useChatStore.getState().explainSnippet;
    setExplanation('Generating explanation...');
    
    // Use async/await to handle the promise
    const getExplanation = async () => {
      const exp = await explainSnippet(selectedText);
      setExplanation(exp);
    };
    
    getExplanation();
  };

  const handleMiddleSchoolExplain = () => {
    const explainForMiddleSchooler = useChatStore.getState().explainForMiddleSchooler;
    setMiddleSchoolExplanation('Generating middle school explanation...');
    
    // Use async/await to handle the promise
    const getExplanation = async () => {
      const exp = await explainForMiddleSchooler(selectedText);
      setMiddleSchoolExplanation(exp);
    };
    
    getExplanation();
  };

  // Handle selection changes to position the explanation icon
  useEffect(() => {
    if (!editor) return;

    const handleSelectionUpdate = () => {
      if (!editor.isActive) return;
      
      if (editor.isActive && editor.view.state.selection.empty) {
        // No selection
        setSelectedText("");
        setIconPos(null);
        setExplanation(null);
        return;
      }
      
      try {
        const text = editor.state.doc.textBetween(
          editor.state.selection.from, 
          editor.state.selection.to,
          " "
        );
        
        if (text && text.length > 0) {
          setSelectedText(text);
          
          // Get position for the lightbulb icon
          const view = editor.view;
          const { from } = view.state.selection;
          const start = view.coordsAtPos(from);
          
          // Calculate position with viewport boundary checks
          const padding = 20; // Padding from viewport edges
          const iconSize = 36; // Approximate size of the icon button
          
          // Get viewport dimensions
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          // Calculate initial position
          let x = start.right;
          let y = start.top;
          
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
          
          // Auto-generate explanation for longer text
          if (text.length > 5) {
            setExplanation('Generating explanation...');
            const explainSnippet = useChatStore.getState().explainSnippet;
            
            // Use async/await to handle the promise
            const getExplanation = async () => {
              const exp = await explainSnippet(text);
              setExplanation(exp);
            };
            
            getExplanation();
          }
        }
      } catch (e) {
        console.error("Error handling selection:", e);
        setSelectedText("");
        setIconPos(null);
      }
    };
    
    // Setup event listeners for selection changes
    editor.on('selectionUpdate', handleSelectionUpdate);
    
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor]);

  // Helper to handle image uploads
  const addImage = useCallback((url: string, alt: string = "") => {
    if (editor) {
      editor.chain().focus().setImage({ src: url, alt }).run();
    }
  }, [editor]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      {editor && (
        <EditorToolbar 
          editor={editor} 
          setIsTableMenuOpen={setIsTableMenuOpen} 
          setIsColorMenuOpen={setIsColorMenuOpen}
        />
      )}

      {/* Editor */}
      <div className="flex-1 overflow-auto">
        <EditorContent 
          editor={editor} 
          className="prose max-w-none h-full p-4 focus:outline-none"
        />
      </div>

      {/* Floating lightbulb for explanations */}
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

      {/* Table menu */}
      {isTableMenuOpen && editor && (
        <EditorTableMenu 
          editor={editor}
          isOpen={isTableMenuOpen}
          setIsOpen={setIsTableMenuOpen}
        />
      )}

      {/* Color menu */}
      {isColorMenuOpen && editor && (
        <EditorColorMenu 
          editor={editor}
          isOpen={isColorMenuOpen}
          setIsOpen={setIsColorMenuOpen}
        />
      )}

      <ExplanationDialog 
        open={openSummary}
        onOpenChange={setOpenSummary}
        explanation={explanation}
        middleSchoolExplanation={middleSchoolExplanation}
        onRequestMiddleSchoolExplanation={handleMiddleSchoolExplain}
      />

      <AttachmentGallery 
        attachments={attachments} 
        onDelete={onDeleteAttachment} 
      />
    </div>
  );
}

interface ExplanationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  explanation: string | null;
  middleSchoolExplanation: string | null;
  onRequestMiddleSchoolExplanation: () => void;
}

function ExplanationDialog({
  open,
  onOpenChange,
  explanation,
  middleSchoolExplanation,
  onRequestMiddleSchoolExplanation
}: ExplanationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-xl">Explanation</DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
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
              onClick={onRequestMiddleSchoolExplanation}
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
  );
}
