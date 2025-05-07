
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Attachment } from "@/types";
import { File, Trash } from "lucide-react";
import { FC } from "react";

interface AttachmentGalleryProps {
  attachments: Attachment[];
  onDelete: (id: string) => void;
}

export const AttachmentGallery: FC<AttachmentGalleryProps> = ({ attachments, onDelete }) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Attachments</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {attachments.map(attachment => (
          <Card key={attachment.id} className="overflow-hidden">
            <div className="relative group">
              {attachment.type === "image" ? (
                <img 
                  src={attachment.url} 
                  alt={attachment.name} 
                  className="w-full h-32 object-cover" 
                />
              ) : (
                <div className="w-full h-32 bg-muted flex items-center justify-center">
                  <File className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" 
                onClick={() => onDelete(attachment.id)} 
                aria-label="Delete attachment"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-2">
              <p className="text-xs truncate">{attachment.name}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
