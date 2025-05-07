
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNoteStore } from "@/lib/store";
import { useChatStore } from "@/lib/chatStore";
import { Attachment, DrawPath, Note } from "@/types";
import { File, FileText, GraduationCap, Image, Lightbulb, Pen, Save, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { DrawingCanvas } from "./DrawingCanvas";
import { FileUploader } from "./FileUploader";
import { ToolBar } from "./ToolBar";
import { FontFormatBar } from "./FontFormatBar";
import { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface EditorProps {
  noteId: string;
}

export function Editor({
  noteId
}: EditorProps) {
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
  const {
    toast
  } = useToast();
  const navigate = useNavigate();

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
      }, 5000) // Wait 5 seconds after typing stops
      );
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
  
  if (!note) {
    return <div className="flex items-center justify-center h-full">
        <p>Note not found</p>
      </div>;
  }
  
  // Check if the note has analysis data and is ready for explanation
  const showExplainButton = note.analysis && note.analysis.readyForExplanation;
  
  // Also check if we have enough content but no analysis yet
  const showAnalyzeButton = content.length > 50 && (!note.analysis || !note.analysis.readyForExplanation);
  
  return <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex-1 flex items-center gap-3">
          <Input value={title} onChange={e => setTitle(e.target.value)} className="border-none text-lg font-medium focus-visible:ring-0 p-0 h-auto" placeholder="Untitled Note" />
          
          {showExplainButton && <Badge variant="outline" className="flex items-center gap-1 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors animate-pulse" onClick={handleExplainClick}>
              <Lightbulb className="h-3 w-3" />
              <span>Explain!</span>
            </Badge>}
          
          {showAnalyzeButton && <Badge variant="outline" className="flex items-center gap-1 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors" onClick={forceAnalysis}>
              <GraduationCap className="h-3 w-3" />
              <span>Analyze Note</span>
            </Badge>}
          
          {isAnalyzing && <Badge variant="outline" className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Analyzing...</span>
            </Badge>}
        </div>
        
        <div className="flex items-center gap-2">
          <FileUploader onFileUpload={handleFileUpload} />
          
          <Button variant="outline" size="icon" className="rounded-full" onClick={handleSave} aria-label="Save note">
            <Save className="h-4 w-4" />
          </Button>
          
          <Button variant="outline" size="icon" className="rounded-full text-destructive hover:text-destructive" onClick={() => deleteNote(noteId)} aria-label="Delete note">
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Add a prominent explain button at the top of the note content if available */}
      {showExplainButton && (
        <div className="px-4 py-3 bg-muted/50 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span>This note has been analyzed and is ready for explanation!</span>
          </div>
          <Button onClick={handleExplainClick} variant="default" size="sm" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            <span>Explain This Topic</span>
          </Button>
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Text</span>
            </TabsTrigger>
            <TabsTrigger value="draw" className="flex items-center gap-2">
              <Pen className="h-4 w-4" />
              <span>Draw</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="text" className="flex-1 flex flex-col p-4 pt-0 overflow-hidden">
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
          
          {note.attachments && note.attachments.length > 0 && <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Attachments</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {note.attachments.map(attachment => <Card key={attachment.id} className="overflow-hidden">
                    <div className="relative group">
                      {attachment.type === "image" ? <img src={attachment.url} alt={attachment.name} className="w-full h-32 object-cover" /> : <div className="w-full h-32 bg-muted flex items-center justify-center">
                          <File className="h-12 w-12 text-muted-foreground" />
                        </div>}
                      
                      <Button variant="destructive" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteAttachment(attachment.id)} aria-label="Delete attachment">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-2">
                      <p className="text-xs truncate">{attachment.name}</p>
                    </div>
                  </Card>)}
              </div>
            </div>}
        </TabsContent>
        
        <TabsContent value="draw" className="flex-1 p-0 overflow-hidden">
          <DrawingCanvas onComplete={handleDrawingComplete} />
        </TabsContent>
      </Tabs>
      
      {showExplainButton && <div className="fixed bottom-20 right-6 z-40">
          <Button onClick={handleExplainClick} className="flex items-center gap-2 shadow-lg animate-bounce" size="lg">
            <GraduationCap className="h-5 w-5" />
            <span>Explain This Topic!</span>
          </Button>
        </div>}
    </div>;
}
