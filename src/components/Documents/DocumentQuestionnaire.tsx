import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentType, NoteCategory } from "@/types";
import { useCategoryStore } from "@/lib/categoryStore";

interface DocumentQuestionnaireProps {
  documentId: string;
  onComplete: (id: string, type?: DocumentType, category?: NoteCategory) => void;
  completed: boolean;
}

export function DocumentQuestionnaire({ documentId, onComplete, completed }: DocumentQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [documentType, setDocumentType] = useState<DocumentType | undefined>(undefined);
  const [category, setCategory] = useState<NoteCategory | undefined>(undefined);
  
  const categories = useCategoryStore(state => state.categories);
  const categoryItems = useCategoryStore(state => state.categoryItems);

  if (completed) {
    return (
      <div className="flex gap-2 flex-wrap">
        {documentType && (
          <Badge variant="secondary">{documentType}</Badge>
        )}
        {category && (
          <Badge>{category}</Badge>
        )}
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep < 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(documentId, documentType, category);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">What type of document is this?</h3>
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant={documentType === "handwritten" ? "default" : "outline"}
                className="justify-start"
                onClick={() => setDocumentType("handwritten")}
              >
                Hand written notes
              </Button>
              <Button
                variant={documentType === "coursework" ? "default" : "outline"}
                className="justify-start"
                onClick={() => setDocumentType("coursework")}
              >
                Coursework
              </Button>
              <Button
                variant={documentType === "textbook" ? "default" : "outline"}
                className="justify-start"
                onClick={() => setDocumentType("textbook")}
              >
                Textbook / Reading
              </Button>
            </div>
            <Button 
              className="w-full" 
              disabled={!documentType} 
              onClick={handleNext}
            >
              Next
            </Button>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Select the course it's for</h3>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categoryItems.map((item) => (
                  <SelectItem key={item.name} value={item.name}>
                    {item.name}
                  </SelectItem>
                ))}
                {categoryItems.filter(item => item.subCategories).map(item => 
                  item.subCategories?.map(subCat => (
                    <SelectItem key={`${item.name}-${subCat}`} value={subCat}>
                      {item.name} / {subCat}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button 
              className="w-full" 
              disabled={!category} 
              onClick={handleNext}
            >
              Complete
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4">
        {renderStep()}
      </CardContent>
    </Card>
  );
}
