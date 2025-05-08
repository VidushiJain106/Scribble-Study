import { Sidebar } from "@/components/Dashboard/Sidebar";
import { SavedResources } from "@/components/NoteEditor/SavedResources";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useNoteStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Menu, X, Lightbulb, HelpCircle, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ExplanationContent } from "@/components/Explanation/ExplanationContent";
import { QuizContent } from "@/components/Quiz/QuizContent";
import { Explanation, Quiz } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExplanationData } from "@/hooks/useExplanationData";
import { useToast } from "@/hooks/use-toast";

// Create a component for the floating trigger that will be conditionally rendered
const FloatingSidebarTrigger = () => {
  const { open } = useSidebar();
  
  // Don't render the trigger if the sidebar is open
  if (open) return null;
  
  return (
    <div className="absolute top-4 left-4 z-10">
      <SidebarTrigger className="bg-background/80 backdrop-blur-sm hover:bg-background/90 shadow-sm">
        <Menu className="h-5 w-5" />
      </SidebarTrigger>
    </div>
  );
};

const ResourcesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { notes, saveQuizToNote } = useNoteStore();
  const note = id ? notes.find(n => n.id === id) : null;
  const [selectedResource, setSelectedResource] = useState<{
    type: 'explanation' | 'quiz', 
    data: Explanation | Quiz
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'explanation' | 'quiz'>('explanation');
  const [relatedQuiz, setRelatedQuiz] = useState<Quiz | null>(null);
  const [relatedExplanation, setRelatedExplanation] = useState<Explanation | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const { toast } = useToast();
  
  // Set up explanation data hook for generating quizzes
  const { 
    generateQuiz, 
    quiz: newlyGeneratedQuiz,
    loading: loadingQuiz
  } = useExplanationData(id, note);
  
  // Redirect to notes list if note not found
  useEffect(() => {
    if (!note) {
      navigate('/app');
    }
  }, [note, navigate]);

  // Find related resources when a resource is selected
  useEffect(() => {
    if (!note || !selectedResource) return;

    // If explanation is selected, find related quiz by topic
    if (selectedResource.type === 'explanation') {
      const explanation = selectedResource.data as Explanation;
      setActiveTab('explanation');
      
      // Find quiz with matching topic
      const matchingQuiz = note.savedQuizzes?.find(quiz => 
        quiz.topic.toLowerCase() === explanation.topic.toLowerCase()
      ) || null;
      
      setRelatedQuiz(matchingQuiz);
      setRelatedExplanation(null);
    } 
    // If quiz is selected, find related explanation by topic
    else if (selectedResource.type === 'quiz') {
      const quiz = selectedResource.data as Quiz;
      setActiveTab('quiz');
      
      // Find explanation with matching topic
      const matchingExplanation = note.savedExplanations?.find(explanation => 
        explanation.topic.toLowerCase() === quiz.topic.toLowerCase()
      ) || null;
      
      setRelatedExplanation(matchingExplanation);
      setRelatedQuiz(null);
    }
  }, [selectedResource, note]);

  // Auto-select the most recently added resource
  useEffect(() => {
    if (!note || selectedResource) return;

    // If coming from the save action, select the most recently saved resource
    if (note.savedExplanations && note.savedExplanations.length > 0) {
      // Sort by creation date, newest first
      const sortedExplanations = [...note.savedExplanations].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setSelectedResource({
        type: 'explanation',
        data: sortedExplanations[0]
      });
    } else if (note.savedQuizzes && note.savedQuizzes.length > 0) {
      // Sort by creation date, newest first
      const sortedQuizzes = [...note.savedQuizzes].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setSelectedResource({
        type: 'quiz',
        data: sortedQuizzes[0]
      });
    }
  }, [note, selectedResource]);

  // Process newly generated quiz
  useEffect(() => {
    if (newlyGeneratedQuiz && generatingQuiz) {
      const explanation = selectedResource?.type === 'explanation' 
        ? selectedResource.data as Explanation 
        : relatedExplanation;
      
      if (explanation && id) {
        try {
          // Save the quiz to the note
          saveQuizToNote(id, newlyGeneratedQuiz);
          
          // Update related quiz
          setRelatedQuiz(newlyGeneratedQuiz);
          
          toast({
            title: "Success",
            description: "Quiz generated and saved",
          });
        } catch (error) {
          console.error("Error saving quiz:", error);
          toast({
            title: "Error",
            description: "Failed to save quiz",
            variant: "destructive",
          });
        } finally {
          setGeneratingQuiz(false);
        }
      }
    }
  }, [newlyGeneratedQuiz, generatingQuiz, id, selectedResource, relatedExplanation, saveQuizToNote, toast]);
  
  if (!id || !note) {
    return <div>Note not found</div>;
  }

  const handleSelectExplanation = (explanation: Explanation) => {
    setSelectedResource({
      type: 'explanation',
      data: explanation
    });
  };

  const handleSelectQuiz = (quiz: Quiz) => {
    setSelectedResource({
      type: 'quiz',
      data: quiz
    });
  };

  const handleCloseResource = () => {
    setSelectedResource(null);
  };

  // Mock function to satisfy props - no actual saving needed as already saved
  const handleSaveExplanation = () => {}; 

  // Mock function for quiz completion
  const handleCompleteQuiz = () => {
    // Don't close, just switch back to explanation tab if available
    if (relatedExplanation) {
      setActiveTab('explanation');
    } else {
      setSelectedResource(null);
    }
  };

  // Handle generating a new quiz from current explanation
  const handleGenerateQuiz = async () => {
    const currentExplanation = selectedResource?.type === 'explanation' 
      ? selectedResource.data as Explanation 
      : relatedExplanation;
      
    if (!currentExplanation) return;
    
    setGeneratingQuiz(true);
    await generateQuiz();
  };

  // Get current resource data based on active tab
  const getCurrentResource = () => {
    if (!selectedResource) return null;
    
    if (activeTab === 'explanation') {
      if (selectedResource.type === 'explanation') {
        return selectedResource.data as Explanation;
      } else if (relatedExplanation) {
        return relatedExplanation;
      }
    } else if (activeTab === 'quiz') {
      if (selectedResource.type === 'quiz') {
        return selectedResource.data as Quiz;
      } else if (relatedQuiz) {
        return relatedQuiz;
      }
    }
    
    return null;
  };

  // Determine if we can show the explanation tab
  const canShowExplanation = selectedResource?.type === 'explanation' || relatedExplanation !== null;
  
  // Determine if we have an explanation to generate a quiz from
  const hasExplanationForQuiz = selectedResource?.type === 'explanation' || relatedExplanation !== null;

  return (
    <SidebarProvider>
      <div className="h-screen flex w-full">
        <Sidebar />
        <main className="flex-1 overflow-hidden relative">
          <FloatingSidebarTrigger />
          
          <div className="flex flex-col h-full overflow-auto">
            <div className="sticky top-0 z-20 bg-background border-b">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    onClick={() => navigate(`/note/${id}`)}
                    aria-label="Back to note"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  
                  <h1 className="text-xl font-medium flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Saved Resources</span>
                  </h1>
                </div>
                
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate(`/note/${id}/explanation`)}
                  className="flex items-center gap-2"
                >
                  Create New
                </Button>
              </div>
            </div>
            
            {selectedResource ? (
              <div className="flex h-[calc(100vh-73px)]">
                {/* Left sidebar with close button for mobile */}
                <div className="hidden md:block w-72 flex-shrink-0 border-r p-4 overflow-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">Resources</h2>
                  </div>
                  <SavedResources 
                    note={note} 
                    onSelectExplanation={handleSelectExplanation}
                    onSelectQuiz={handleSelectQuiz}
                    compact
                    selectedResourceId={
                      (selectedResource?.type === 'explanation') 
                        ? (selectedResource.data as Explanation).id 
                        : (activeTab === 'explanation' && relatedExplanation) 
                          ? relatedExplanation.id 
                          : (selectedResource?.type === 'quiz') 
                            ? (selectedResource.data as Quiz).id 
                            : (activeTab === 'quiz' && relatedQuiz) 
                              ? relatedQuiz.id 
                              : undefined
                    }
                  />
                </div>
                
                {/* Main content */}
                <div className="flex-1 overflow-auto relative">
                  <div className="md:hidden sticky top-0 z-10 bg-background p-2 border-b flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCloseResource}
                      className="flex items-center gap-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to resources
                    </Button>
                  </div>
                  
                  {/* Add tabs for switching between explanation and quiz */}
                  <div className="sticky top-0 z-10 bg-background border-b p-2">
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'explanation' | 'quiz')}>
                      <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger 
                          value="explanation" 
                          disabled={!canShowExplanation}
                          className="flex items-center gap-2"
                        >
                          <Lightbulb className="h-4 w-4" />
                          Explanation
                        </TabsTrigger>
                        <TabsTrigger 
                          value="quiz" 
                          className="flex items-center gap-2"
                        >
                          <HelpCircle className="h-4 w-4" />
                          Quiz
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  
                  {/* Render content based on active tab */}
                  {activeTab === 'explanation' && canShowExplanation && (
                    <ExplanationContent 
                      explanation={getCurrentResource() as Explanation}
                      onTakeQuiz={() => setActiveTab('quiz')}  
                      onSaveExplanation={handleSaveExplanation}
                      hideButtons={true}
                    />
                  )}
                  
                  {activeTab === 'quiz' && (selectedResource?.type === 'quiz' || relatedQuiz) && (
                    <QuizContent 
                      quiz={getCurrentResource() as Quiz}
                      onComplete={handleCompleteQuiz}
                      onBackToExplanation={() => setActiveTab('explanation')}
                    />
                  )}
                  
                  {activeTab === 'quiz' && !relatedQuiz && selectedResource?.type !== 'quiz' && hasExplanationForQuiz && (
                    <div className="flex flex-col items-center justify-center p-8 mt-12">
                      <div className="max-w-md text-center">
                        <HelpCircle className="h-12 w-12 text-primary/80 mx-auto mb-4" />
                        <h3 className="text-xl font-medium mb-3">Create Quiz</h3>
                        <p className="text-muted-foreground mb-6">
                          Generate a quiz based on this explanation to test your knowledge.
                        </p>
                        <Button
                          onClick={handleGenerateQuiz}
                          size="lg"
                          disabled={generatingQuiz || loadingQuiz}
                          className="flex items-center gap-2 mx-auto"
                        >
                          {generatingQuiz || loadingQuiz ? (
                            <>Generating Quiz...</>
                          ) : (
                            <>
                              <PlusCircle className="h-5 w-5" />
                              Generate Quiz Questions
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6">
                <SavedResources 
                  note={note} 
                  onSelectExplanation={handleSelectExplanation}
                  onSelectQuiz={handleSelectQuiz}
                  selectedResourceId={undefined}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ResourcesPage; 