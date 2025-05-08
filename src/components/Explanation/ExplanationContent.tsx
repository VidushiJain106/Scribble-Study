import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Explanation } from "@/types";
import { HelpCircle, Lightbulb, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ExplanationContentProps {
  explanation: Explanation;
  onTakeQuiz: () => void;
}

export function ExplanationContent({ explanation, onTakeQuiz }: ExplanationContentProps) {
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const navigate = useNavigate();
  
  // Helper function to safely convert content to string and handle any format
  const formatContent = (content: any): string[] => {
    if (!content) return ["No content available"];
    
    // If content is already a string, split by newlines
    if (typeof content === 'string') {
      return content.split('\n');
    }
    
    // If content is an array, join it and then split by newlines
    if (Array.isArray(content)) {
      return content.join('\n').split('\n');
    }
    
    // If content is an object, convert to string representation
    if (typeof content === 'object') {
      try {
        return JSON.stringify(content, null, 2).split('\n');
      } catch (e) {
        return ["[Complex content structure]"];
      }
    }
    
    // Fallback for any other type
    return [String(content)];
  };
  
  // Helper to navigate back to note
  const handleBackToNote = () => {
    if (explanation && explanation.noteId) {
      navigate(`/note/${explanation.noteId}`);
    } else {
      navigate('/');
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{explanation.content.title}</h1>
          <p className="text-muted-foreground">Created from your notes on {explanation.topic}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleBackToNote}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Note
          </Button>
          <Button
            onClick={onTakeQuiz}
            className="flex items-center gap-2"
          >
            <HelpCircle className="h-5 w-5" />
            Test Knowledge
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-3">
          <h2 className="font-medium text-lg mb-3">Sections</h2>
          {explanation.content.sections.map((section, idx) => (
            <Button
              key={idx}
              variant={activeSection === idx ? "default" : "outline"}
              className="w-full justify-start text-left h-auto py-2 font-normal"
              onClick={() => setActiveSection(idx)}
            >
              {section.title}
            </Button>
          ))}
        </div>
        
        <div className="md:col-span-3">
          {activeSection !== null ? (
            <Card className="p-6">
              <h2 className="text-2xl font-medium mb-4">
                {explanation.content.sections[activeSection].title}
              </h2>
              <div className="prose max-w-none">
                {formatContent(explanation.content.sections[activeSection].content).map((paragraph, idx) => (
                  <p key={idx} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </Card>
          ) : (
            <>
              <Card className="p-6 mb-6">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Lightbulb className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium mb-2">Overview</h2>
                    <div className="prose max-w-none">
                      {explanation.content.sections[0] && formatContent(explanation.content.sections[0].content)
                        .slice(0, 2)
                        .map((paragraph, idx) => (
                          <p key={idx} className="mb-4">{paragraph}</p>
                        ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveSection(0)}
                      className="mt-2"
                    >
                      Read more
                    </Button>
                  </div>
                </div>
              </Card>
              
              <h2 className="text-xl font-medium mb-4">Key Sections</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {explanation.content.sections.slice(1).map((section, idx) => (
                  <Card key={idx} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveSection(idx + 1)}>
                    <h3 className="font-medium mb-2">{section.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {formatContent(section.content)[0]}
                    </p>
                  </Card>
                ))}
              </div>
              
              <Card className="p-6 mt-6">
                <h2 className="text-xl font-medium mb-4">Summary</h2>
                <div className="prose max-w-none">
                  {formatContent(explanation.content.summary).map((paragraph, idx) => (
                    <p key={idx} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
