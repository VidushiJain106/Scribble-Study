
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Attachment } from "@/types";
import { FileUp, Image } from "lucide-react";
import { useRef, useState } from "react";

interface FileUploaderProps {
  onFileUpload: (file: Omit<Attachment, 'id' | 'createdAt'>) => void;
}

export function FileUploader({ onFileUpload }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    const isPdf = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");
    
    if (!isPdf && !isImage) {
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
    
    // Create preview URL for images
    if (isImage) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = () => {
    if (!uploadedFile) return;
    
    // In a real app, we would upload the file to a server
    // Here we'll simulate it by creating a data URL
    
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      
      onFileUpload({
        name: uploadedFile.name,
        type: uploadedFile.type.startsWith("image/") ? "image" : "pdf",
        url,
        size: uploadedFile.size, // Add the file size property
        thumbnailUrl: previewUrl || undefined
      });
      
      // Reset state
      setUploadedFile(null);
      setPreviewUrl(null);
      setIsDialogOpen(false);
      
      toast({
        title: "File uploaded",
        description: `${uploadedFile.name} has been added to your note`
      });
    };
    
    reader.readAsDataURL(uploadedFile);
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
                
                <Button 
                  onClick={handleUpload} 
                  className="w-full"
                >
                  Upload
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
