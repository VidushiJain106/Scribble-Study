
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Explanation } from "@/types";
import { HelpCircle, Lightbulb, ArrowLeft, BookOpen } from "lucide-react";
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{explanation.content.title}</h1>
          <p className="text-muted-foreground">Created from your notes on {explanation.topic}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={handleBackToNote}
            className="flex items-center gap-1"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Note
          </Button>
          <Button
            onClick={onTakeQuiz}
            className="flex items-center gap-2"
            size="sm"
          >
            <HelpCircle className="h-4 w-4" />
            Test Knowledge
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-3">
          <div className="sticky top-6">
            <h2 className="font-medium text-lg mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Sections
            </h2>
            <div className="space-y-2 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2">
              {explanation.content.sections.map((section, idx) => (
                <Button
                  key={idx}
                  variant={activeSection === idx ? "default" : "outline"}
                  className={`w-full justify-start text-left h-auto py-3 px-4 font-normal ${
                    activeSection === idx ? "border-l-4 border-primary" : ""
                  }`}
                  onClick={() => setActiveSection(idx)}
                >
                  <span className="line-clamp-2">{section.title}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          {activeSection !== null ? (
            <Card className="p-6 shadow-md">
              <h2 className="text-2xl font-medium mb-4 text-primary">
                {explanation.content.sections[activeSection].title}
              </h2>
              <div className="prose max-w-none dark:prose-invert">
                {formatContent(explanation.content.sections[activeSection].content).map((paragraph, idx) => (
                  <p key={idx} className="mb-4 leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </Card>
          ) : (
            <>
              <Card className="p-6 mb-6 shadow-md bg-gradient-to-br from-white to-accent/30 dark:from-card dark:to-accent/10">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/15 p-3 rounded-full flex-shrink-0">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium mb-3">Overview</h2>
                    <div className="prose max-w-none dark:prose-invert">
                      {explanation.content.sections[0] && formatContent(explanation.content.sections[0].content)
                        .slice(0, 2)
                        .map((paragraph, idx) => (
                          <p key={idx} className="mb-4 leading-relaxed">{paragraph}</p>
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
              
              <h2 className="text-xl font-medium mb-4 flex items-center gap-2 px-1">
                <BookOpen className="h-5 w-5 text-primary" />
                Key Sections
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {explanation.content.sections.slice(1).map((section, idx) => (
                  <Card 
                    key={idx} 
                    className="p-5 hover:shadow-lg transition-all duration-300 cursor-pointer border-l-4 border-transparent hover:border-primary" 
                    onClick={() => setActiveSection(idx + 1)}
                  >
                    <h3 className="font-medium text-lg mb-2">{section.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {formatContent(section.content)[0]}
                    </p>
                  </Card>
                ))}
              </div>
              
              <Card className="p-6 shadow-md border-t-4 border-primary">
                <h2 className="text-xl font-medium mb-4">Summary</h2>
                <div className="prose max-w-none dark:prose-invert">
                  {formatContent(explanation.content.summary).map((paragraph, idx) => (
                    <p key={idx} className="mb-4 leading-relaxed">{paragraph}</p>
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
