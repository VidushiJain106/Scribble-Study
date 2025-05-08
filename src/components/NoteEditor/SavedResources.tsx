import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  ArrowRight, 
  Lightbulb, 
  HelpCircle, 
  Trash2, 
  ExternalLink 
} from "lucide-react";
import { Note, Explanation, Quiz } from "@/types";
import { useNavigate } from "react-router-dom";
import { useNoteStore } from "@/lib/store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface SavedResourcesProps {
  note: Note;
  onSelectExplanation?: (explanation: Explanation) => void;
  onSelectQuiz?: (quiz: Quiz) => void;
  compact?: boolean;
  selectedResourceId?: string;
}

export const SavedResources = ({ 
  note, 
  onSelectExplanation, 
  onSelectQuiz, 
  compact = false,
  selectedResourceId
}: SavedResourcesProps) => {
  const navigate = useNavigate();
  const { removeSavedExplanation, removeSavedQuiz } = useNoteStore();
  const [resourceToDelete, setResourceToDelete] = useState<{id: string, type: 'explanation' | 'quiz'} | null>(null);

  const hasExplanations = note.savedExplanations && note.savedExplanations.length > 0;
  const hasQuizzes = note.savedQuizzes && note.savedQuizzes.length > 0;
  const hasResources = hasExplanations || hasQuizzes;

  const handleDeleteResource = () => {
    if (!resourceToDelete) return;
    
    if (resourceToDelete.type === 'explanation') {
      removeSavedExplanation(note.id, resourceToDelete.id);
    } else {
      removeSavedQuiz(note.id, resourceToDelete.id);
    }
    
    setResourceToDelete(null);
  };

  const viewExplanation = (explanation: Explanation) => {
    if (onSelectExplanation) {
      onSelectExplanation(explanation);
    } else {
      // Navigate to resources page with this explanation
      navigate(`/note/${note.id}/resources`);
    }
  };

  const viewQuiz = (quiz: Quiz) => {
    if (onSelectQuiz) {
      onSelectQuiz(quiz);
    } else {
      // Navigate to resources page with this quiz
      navigate(`/note/${note.id}/resources`);
    }
  };

  // Get the main topic of explanations if available
  const getTopicFromExplanations = () => {
    if (hasExplanations && note.savedExplanations && note.savedExplanations.length > 0) {
      return note.savedExplanations[0].topic;
    }
    return "this note";
  };

  // Check if a resource is selected
  const isResourceSelected = (resourceId: string) => {
    return selectedResourceId === resourceId;
  };

  return (
    <div className={`h-full ${compact ? 'space-y-3' : ''}`}>
      {!hasResources ? (
        <Card className="p-6 flex flex-col items-center justify-center text-center h-[200px]">
          <BookOpen className="h-10 w-10 mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No saved resources yet</h3>
          <p className="text-muted-foreground mb-4">
            Generate explanations and quizzes for your note content
          </p>
          <Button 
            onClick={() => navigate(`/note/${note.id}/explanation`)}
            className="flex items-center gap-2"
          >
            <Lightbulb className="h-4 w-4" />
            Generate Resources
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Section heading for explanations if they exist */}
          {hasExplanations && (
            <div className="flex items-center gap-2 px-1 pb-1 pt-2 border-b">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Explanations</h3>
            </div>
          )}
          
          {/* Explanations list */}
          {hasExplanations && note.savedExplanations?.map((explanation) => {
            const isActive = isResourceSelected(explanation.id || '');
            return (
              <Card 
                key={explanation.id} 
                className={`p-4 ${compact ? 'p-3' : ''} hover:bg-accent cursor-pointer transition-colors
                  ${isActive ? 'border-primary bg-primary/5 shadow-sm' : ''}`}
                onClick={() => viewExplanation(explanation)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                    {explanation.content.title}
                    {isActive && (
                      <span className="inline-block ml-2 text-xs text-primary">• Active</span>
                    )}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setResourceToDelete({id: explanation.id || '', type: 'explanation'});
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-0 line-clamp-2">
                  {explanation.content.summary}
                </p>
              </Card>
            );
          })}
          
          {/* Section heading for quizzes if they exist */}
          {hasQuizzes && (
            <div className="flex items-center gap-2 px-1 pb-1 pt-2 border-b">
              <HelpCircle className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Quizzes</h3>
            </div>
          )}
          
          {/* Quizzes list */}
          {hasQuizzes && note.savedQuizzes?.map((quiz) => {
            const isActive = isResourceSelected(quiz.id || '');
            return (
              <Card 
                key={quiz.id} 
                className={`p-4 ${compact ? 'p-3' : ''} hover:bg-accent cursor-pointer transition-colors
                  ${isActive ? 'border-primary bg-primary/5 shadow-sm' : ''}`}
                onClick={() => viewQuiz(quiz)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-medium ${isActive ? 'text-primary' : ''}`}>
                    Quiz on {quiz.topic}
                    {isActive && (
                      <span className="inline-block ml-2 text-xs text-primary">• Active</span>
                    )}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setResourceToDelete({id: quiz.id || '', type: 'quiz'});
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-0">
                  {quiz.questions.length} questions
                </p>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={!!resourceToDelete} onOpenChange={(open) => !open && setResourceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {resourceToDelete?.type}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteResource} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 