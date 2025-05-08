import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Explanation } from "@/types";
import { useChatStore } from "@/lib/chatStore";
import { 
  HelpCircle, 
  Lightbulb, 
  ArrowLeft, 
  BookOpen, 
  ListTodo,
  FileText,
  CheckSquare,
  List,
  AlignJustify,
  Sparkles,
  Save,
  ExternalLink
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExplanationContentProps {
  explanation: Explanation;
  onTakeQuiz: () => void;
  onSaveExplanation?: () => void;
  hideButtons?: boolean;
}

export function ExplanationContent({ explanation, onTakeQuiz, onSaveExplanation, hideButtons = false }: ExplanationContentProps) {
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const navigate = useNavigate();
  
  // State for different types of explanations
  const [activeExplanationTab, setActiveExplanationTab] = useState<string>("standard");
  const [simplifiedContent, setSimplifiedContent] = useState<string | null>(null);
  const [summarizedContent, setSummarizedContent] = useState<string | null>(null);
  const [examplesContent, setExamplesContent] = useState<string | null>(null);
  const [kidFriendlyContent, setKidFriendlyContent] = useState<string | null>(null);
  
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
  
  // Handlers for different explanation types
  const handleSimplifyContent = () => {
    if (!simplifiedContent && activeSection !== null) {
      const simplifySnippet = useChatStore.getState().simplifySnippet;
      setSimplifiedContent('Simplifying content...');
      const sectionContent = explanation.content.sections[activeSection].content;
      const contentString = typeof sectionContent === 'string' 
        ? sectionContent 
        : JSON.stringify(sectionContent);
      
      simplifySnippet(contentString).then(simplified => {
        setSimplifiedContent(simplified);
      });
    }
  };
  
  const handleSummarizeContent = () => {
    if (!summarizedContent && activeSection !== null) {
      const summarizeSnippet = useChatStore.getState().summarizeSnippet;
      setSummarizedContent('Generating summary...');
      const sectionContent = explanation.content.sections[activeSection].content;
      const contentString = typeof sectionContent === 'string' 
        ? sectionContent 
        : JSON.stringify(sectionContent);
      
      summarizeSnippet(contentString).then(summary => {
        setSummarizedContent(summary);
      });
    }
  };
  
  const handleGenerateExamples = () => {
    if (!examplesContent && activeSection !== null) {
      const generateExamples = useChatStore.getState().generateExamples;
      setExamplesContent('Generating examples...');
      const sectionContent = explanation.content.sections[activeSection].content;
      const contentString = typeof sectionContent === 'string' 
        ? sectionContent 
        : JSON.stringify(sectionContent);
      
      generateExamples(contentString).then(examples => {
        setExamplesContent(examples);
      });
    }
  };
  
  const handleKidFriendlyExplain = () => {
    if (!kidFriendlyContent && activeSection !== null) {
      const explainForMiddleSchooler = useChatStore.getState().explainForMiddleSchooler;
      setKidFriendlyContent('Creating kid-friendly explanation...');
      const sectionContent = explanation.content.sections[activeSection].content;
      const contentString = typeof sectionContent === 'string' 
        ? sectionContent 
        : JSON.stringify(sectionContent);
      
      explainForMiddleSchooler(contentString).then(kidFriendly => {
        setKidFriendlyContent(kidFriendly);
      });
    }
  };
  
  // Reset alternative content when changing sections
  const handleSectionChange = (idx: number) => {
    if (activeSection !== idx) {
      setActiveSection(idx);
      setSimplifiedContent(null);
      setSummarizedContent(null);
      setExamplesContent(null);
      setKidFriendlyContent(null);
      setActiveExplanationTab("standard");
    } else {
      setActiveSection(null);
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">{explanation.content.title}</h1>
        <p className="text-muted-foreground">Created from your notes on {explanation.topic}</p>
      </div>
      
      {!hideButtons && (
        <div className="flex items-center gap-3 mb-8">
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
          {onSaveExplanation && (
            <Button
              variant="secondary"
              onClick={onSaveExplanation}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Explanation
            </Button>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="sticky top-6">
            <Card className="overflow-hidden">
              <div className="border-b px-4 py-3 bg-muted/50">
                <h3 className="text-sm font-medium">Table of Contents</h3>
              </div>
              <div className="divide-y">
                {explanation.content.sections.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => handleSectionChange(index)}
                    className={`px-4 py-3 text-left w-full hover:bg-accent transition-colors ${
                      activeSection === index ? 'bg-accent' : ''
                    }`}
                  >
                    <span className="text-sm">{section.title}</span>
                  </button>
                ))}
              </div>
            </Card>
            
            {explanation.content.furtherResources && explanation.content.furtherResources.length > 0 && (
              <Card className="mt-4 overflow-hidden">
                <div className="border-b px-4 py-3 bg-muted/50">
                  <h3 className="text-sm font-medium">Further Reading</h3>
                </div>
                <div className="p-4 space-y-2">
                  {explanation.content.furtherResources.map((resource, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex items-start gap-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span>{resource}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
        
        <div className="md:col-span-3">
          {activeSection !== null ? (
            <Card className="p-6">
              <h2 className="text-2xl font-medium mb-4">
                {explanation.content.sections[activeSection].title}
              </h2>
              
              <Tabs 
                defaultValue="standard" 
                value={activeExplanationTab} 
                onValueChange={setActiveExplanationTab}
                className="w-full mb-4"
              >
                <TabsList className="grid grid-cols-5 mb-4">
                  <TabsTrigger value="standard" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Standard</span>
                  </TabsTrigger>
                  <TabsTrigger value="summarize" onClick={handleSummarizeContent} className="flex items-center gap-1">
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">Summarize</span>
                  </TabsTrigger>
                  <TabsTrigger value="simplify" onClick={handleSimplifyContent} className="flex items-center gap-1">
                    <AlignJustify className="h-4 w-4" />
                    <span className="hidden sm:inline">Simplify</span>
                  </TabsTrigger>
                  <TabsTrigger value="examples" onClick={handleGenerateExamples} className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">Examples</span>
                  </TabsTrigger>
                  <TabsTrigger value="kid-friendly" onClick={handleKidFriendlyExplain} className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Kid-friendly</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="standard">
                  <div className="prose max-w-none">
                    {formatContent(explanation.content.sections[activeSection].content).map((paragraph, idx) => (
                      <p key={idx} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="summarize">
                  <div className="prose max-w-none">
                    {summarizedContent ? (
                      <p className="mb-4">{summarizedContent}</p>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">Generating summary...</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="simplify">
                  <div className="prose max-w-none">
                    {simplifiedContent ? (
                      <p className="mb-4">{simplifiedContent}</p>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">Simplifying content...</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="examples">
                  <div className="prose max-w-none">
                    {examplesContent ? (
                      <p className="mb-4">{examplesContent}</p>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">Generating examples...</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="kid-friendly">
                  <div className="prose max-w-none">
                    {kidFriendlyContent ? (
                      <p className="mb-4">{kidFriendlyContent}</p>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">Creating kid-friendly explanation...</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
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
                      onClick={() => handleSectionChange(0)}
                      className="mt-2"
                    >
                      Read more
                    </Button>
                  </div>
                </div>
              </Card>
              
              <h2 className="text-xl font-medium mb-4">Key Sections</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {explanation.content.sections.slice(1).map((section, index) => (
                  <Card 
                    key={index + 1}
                    className="p-5 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleSectionChange(index + 1)}
                  >
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
