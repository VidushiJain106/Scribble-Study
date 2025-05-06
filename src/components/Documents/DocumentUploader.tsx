
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { Document, DocumentType, NoteCategory } from "@/types";
import { DocumentQuestionnaire } from "./DocumentQuestionnaire";

export function DocumentUploader() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const files = Array.from(e.target.files);
    
    const newDocuments = files.map(file => ({
      id: uuidv4(),
      name: file.name,
      file,
      url: URL.createObjectURL(file),
      uploadDate: new Date(),
      questionnaireDone: false
    }));
    
    setDocuments(prev => [...prev, ...newDocuments]);
    setIsUploading(false);
    
    // Reset input value to allow uploading the same file again
    if (inputRef.current) inputRef.current.value = "";
    
    toast({
      title: files.length > 1 ? "Files uploaded" : "File uploaded",
      description: files.length > 1 
        ? `${files.length} files have been uploaded successfully.` 
        : `${files[0].name} has been uploaded successfully.`
    });
  };

  const handleUploadButtonClick = () => {
    inputRef.current?.click();
  };

  const handleQuestionnaireComplete = (id: string, type?: DocumentType, category?: NoteCategory) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id 
          ? { ...doc, type, category, questionnaireDone: true } 
          : doc
      )
    );
    
    toast({
      title: "Document tagged",
      description: "Document has been successfully categorized."
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
        <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full">
            <Upload className="h-10 w-10 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-medium text-lg">Upload Documents</h3>
            <p className="text-sm text-muted-foreground">
              Drag & drop files or click the button below to upload
            </p>
          </div>
          <Input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            multiple
          />
          <Button onClick={handleUploadButtonClick} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Select Files"}
          </Button>
        </CardContent>
      </Card>

      {documents.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-medium">Uploaded Documents</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {documents.map((document) => (
              <div key={document.id} className="space-y-4">
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{document.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded {document.uploadDate.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <DocumentQuestionnaire
                  documentId={document.id}
                  onComplete={handleQuestionnaireComplete}
                  completed={document.questionnaireDone}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
