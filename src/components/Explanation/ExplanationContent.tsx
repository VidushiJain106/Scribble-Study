
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Explanation, ExplanationSection } from "@/types";
import { HelpCircle, Lightbulb } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ExplanationContentProps {
  explanation: Explanation;
  onTakeQuiz: () => void;
}

export function ExplanationContent({ explanation, onTakeQuiz }: ExplanationContentProps) {
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{explanation.content.title}</h1>
          <p className="text-muted-foreground">Created from your notes on {explanation.topic}</p>
        </div>
        <Button
          onClick={onTakeQuiz}
          className="fixed right-6 bottom-6 shadow-lg flex items-center gap-2 z-10 animate-pulse"
        >
          <HelpCircle className="h-5 w-5" />
          Test Your Knowledge!
        </Button>
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
                {explanation.content.sections[activeSection].content.split('\n').map((paragraph, idx) => (
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
                      {explanation.content.sections[0].content.split('\n').slice(0, 2).map((paragraph, idx) => (
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
                      {section.content.split('\n')[0]}
                    </p>
                  </Card>
                ))}
              </div>
              
              <Card className="p-6 mt-6">
                <h2 className="text-xl font-medium mb-4">Summary</h2>
                <div className="prose max-w-none">
                  {explanation.content.summary.split('\n').map((paragraph, idx) => (
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
