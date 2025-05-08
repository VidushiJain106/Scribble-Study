import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromPdf } from "@/lib/pdfUtils";
import { Attachment } from "@/types";
import { FileUp, Image, FileText } from "lucide-react";
import { useRef, useState } from "react";

interface FileUploaderProps {
  onFileUpload: (file: Omit<Attachment, 'id' | 'createdAt'>) => void;
  onPdfTextExtracted?: (text: string) => void;
}

export function FileUploader({ onFileUpload, onPdfTextExtracted }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [extractText, setExtractText] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const isPdfFile = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    
    if (!isPdfFile && !isImage) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or image file",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }
    
    setUploadedFile(file);
    setIsPdf(isPdfFile);
    
    // Create preview URL for images
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setExtractText(false);
    } else {
      setPreviewUrl(null);
      
      // Default to text extraction if PDF is uploaded and handler exists
      if (onPdfTextExtracted) {
        setExtractText(true);
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    
    try {
      // Create a data URL for the file
      const reader = new FileReader();
      
      reader.onload = async () => {
        const url = reader.result as string;
        
        // First, upload the file as an attachment
        onFileUpload({
          name: uploadedFile.name,
          type: isPdf ? "pdf" : "image",
          url,
          thumbnailUrl: previewUrl || undefined
        });
        
        // If it's a PDF and text extraction is enabled, extract the text
        if (isPdf && extractText && onPdfTextExtracted) {
          try {
            const text = await extractTextFromPdf(url);
            onPdfTextExtracted(text);
            
            toast({
              title: "Text extracted",
              description: "PDF text has been added to your note"
            });
          } catch (error) {
            console.error("Failed to extract text:", error);
            toast({
              title: "Text extraction failed",
              description: "Failed to extract text from the PDF",
              variant: "destructive"
            });
          }
        }
        
        // Reset state
        setUploadedFile(null);
        setPreviewUrl(null);
        setIsDialogOpen(false);
        setIsProcessing(false);
        
        toast({
          title: "File uploaded",
          description: `${uploadedFile.name} has been added to your note`
        });
      };
      
      reader.readAsDataURL(uploadedFile);
    } catch (error) {
      console.error("Upload error:", error);
      setIsProcessing(false);
      
      toast({
        title: "Upload failed",
        description: "Failed to upload the file",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="rounded-full"
          aria-label="Upload file"
        >
          <FileUp className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload file</DialogTitle>
          <DialogDescription>
            Upload a PDF or image to include in your note
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
            {!uploadedFile ? (
              <div
                className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF or image (max 10MB)
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <Label>{uploadedFile.name}</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setUploadedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    Change
                  </Button>
                </div>
                
                {previewUrl && (
                  <div className="rounded-md overflow-hidden border mb-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-48 w-full object-contain"
                    />
                  </div>
                )}
                
                {isPdf && onPdfTextExtracted && (
                  <div className="flex items-center justify-between py-3 px-1 mb-3 border-t border-b">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor="extract-text" className="text-sm">
                        Extract and add text to note
                      </Label>
                    </div>
                    <Switch
                      id="extract-text"
                      checked={extractText}
                      onCheckedChange={setExtractText}
                    />
                  </div>
                )}
                
                <Button 
                  onClick={handleUpload} 
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Upload"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
