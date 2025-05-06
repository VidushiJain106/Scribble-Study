import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNoteStore } from "@/lib/store";
import { Attachment, DrawPath, Note } from "@/types";
import { File, FileText, Image, Pen, Save, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { DrawingCanvas } from "./DrawingCanvas";
import { FileUploader } from "./FileUploader";
import { ToolBar } from "./ToolBar";
import { FontFormatBar } from "./FontFormatBar";
import { CSSProperties } from "react";
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
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState("text");
  const [textFormatting, setTextFormatting] = useState<CSSProperties>({});
  const {
    toast
  } = useToast();

  // Load note data
  useEffect(() => {
    const foundNote = notes.find(n => n.id === noteId);
    if (foundNote) {
      setNote(foundNote);
      setTitle(foundNote.title);
      setContent(foundNote.content);
    }
  }, [noteId, notes]);

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
  if (!note) {
    return <div className="flex items-center justify-center h-full">
        <p>Note not found</p>
      </div>;
  }
  return <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex-1">
          <Input value={title} onChange={e => setTitle(e.target.value)} className="border-none text-lg font-medium focus-visible:ring-0 p-0 h-auto" placeholder="Untitled Note" />
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
        
        <TabsContent value="text" className="flex-1 p-4 overflow-auto py-0">
          <FontFormatBar onFormatChange={handleFormatChange} />
          <Textarea value={content} onChange={e => setContent(e.target.value)} className="min-h-[200px] resize-none border-none focus-visible:ring-0 p-0" placeholder="Start writing your note..." style={textFormatting} />
          
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
        
        <TabsContent value="draw" className="flex-1 flex flex-col">
          <div className="p-2 sticky top-0 z-10 bg-background">
            <ToolBar />
          </div>
          <Separator />
          <div className="flex-1 relative bg-card">
            <DrawingCanvas onDrawingComplete={handleDrawingComplete} />
          </div>
          
          {note.drawings && note.drawings.length > 0 && <div className="p-4 border-t">
              <h3 className="text-sm font-medium mb-2">Saved Drawings</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {note.drawings.map((drawing, index) => <Card key={drawing.id} className="flex-shrink-0 w-24 h-24 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Drawing {index + 1}</span>
                  </Card>)}
              </div>
            </div>}
        </TabsContent>
      </Tabs>
    </div>;
}