import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Quiz, QuizAnswer, QuizQuestion } from "@/types";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle, ChevronDown, ChevronUp, HelpCircle, Lightbulb, Plus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { withSupabase, getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuizContentProps {
  quiz: Quiz;
  onComplete: () => void;
  onBackToExplanation: () => void;
  onGenerateMoreQuestions?: (difficulty?: string) => Promise<void>;
  onSaveQuiz?: () => void;
}

export function QuizContent({ quiz, onComplete, onBackToExplanation, onGenerateMoreQuestions, onSaveQuiz }: QuizContentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [questionCount, setQuestionCount] = useState(quiz?.questions?.length || 0);
  const { toast } = useToast();
  
  // Track when the quiz questions change
  useEffect(() => {
    if (quiz?.questions?.length !== questionCount) {
      console.log("Quiz questions changed:", {
        previous: questionCount,
        current: quiz?.questions?.length
      });
      
      setQuestionCount(quiz?.questions?.length || 0);
      
      // If new questions were added and we have more than before
      if (quiz?.questions?.length > questionCount) {
        // Optionally navigate to the first new question
        setCurrentQuestionIndex(questionCount);
        
        toast({
          title: "New questions added",
          description: `${quiz.questions.length - questionCount} new questions have been added to the quiz.`,
        });
      }
    }
  }, [quiz?.questions]);
  
  // Update currentQuestionIndex if questionId no longer exists (after quiz refresh)
  useEffect(() => {
    if (quiz && quiz.questions.length > 0) {
      // Ensure the current question index is not out of bounds
      if (currentQuestionIndex >= quiz.questions.length) {
        setCurrentQuestionIndex(quiz.questions.length - 1);
      }
    }
  }, [quiz, currentQuestionIndex]);
  
  // Handle case where the quiz might be null or have no questions
  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="container max-w-3xl mx-auto py-6 px-4">
        <Button
          variant="ghost"
          className="mb-6 flex items-center gap-1"
          onClick={onBackToExplanation}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to explanation
        </Button>
        <Card className="p-6">
          <h2 className="text-xl font-medium mb-4">No questions available</h2>
          <p className="text-muted-foreground">Please generate some quiz questions to test your knowledge.</p>
        </Card>
      </div>
    );
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  
  // Calculate if user has answered all questions correctly
  const questionsAnswered = Object.keys(answers).length;
  const correctAnswers = Object.values(answers).filter(answer => answer.isCorrect).length;
  const hasAnsweredAll = questionsAnswered === quiz.questions.length;
  const allCorrect = hasAnsweredAll && questionsAnswered === correctAnswers;
  
  const handleShowHint = () => {
    if (currentQuestion.hint) {
      toast({
        title: "Hint",
        description: currentQuestion.hint,
      });
    }
  };
  
  const handleAnswerChange = (value: string) => {
    if (!currentQuestion) return;
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        questionId: currentQuestion.id,
        answer: value,
      }
    }));
  };
  
  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;
    
    const answer = answers[currentQuestion.id];
    
    if (!answer || !answer.answer.trim()) {
      toast({
        title: "Answer required",
        description: "Please provide an answer before submitting",
        variant: "destructive",
      });
      return;
    }
    
    setIsEvaluating(true);
    
    try {
      // Check if Supabase is available
      if (!isSupabaseConfigured()) {
        toast({
          title: "Service unavailable",
          description: "Could not connect to evaluation service. Please try again later.",
          variant: "destructive",
        });
        setIsEvaluating(false);
        return;
      }
      
      // Call the evaluate answer function using the withSupabase helper
      const data = await withSupabase(
        async (supabase) => {
          const { data, error } = await supabase.functions.invoke('evaluate-answer', {
            body: {
              question: currentQuestion,
              answer: answer.answer,
              topic: quiz.topic,
            },
          });
          
          if (error) throw new Error(error.message);
          return data;
        },
        null // fallback value if Supabase operation fails
      );
      
      if (!data) {
        throw new Error("Failed to evaluate answer");
      }
      
      const updatedAnswer: QuizAnswer = {
        ...answer,
        isCorrect: data.isCorrect,
        feedback: data.feedback,
        createdAt: new Date(),
      };
      
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: updatedAnswer
      }));
      
    } catch (error) {
      console.error("Error evaluating answer:", error);
      toast({
        title: "Error",
        description: "Could not evaluate your answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  };
  
  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // If all correct, complete the quiz
      if (allCorrect) {
        onComplete();
      }
      return;
    }
    
    setCurrentQuestionIndex(prev => prev + 1);
  };
  
  const toggleExpandQuestion = (questionId: string) => {
    if (expandedQuestion === questionId) {
      setExpandedQuestion(null);
    } else {
      setExpandedQuestion(questionId);
    }
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-500";
      case "moderate": return "text-yellow-500";
      case "hard": return "text-red-500";
      default: return "text-foreground";
    }
  };

  const handleGenerateMoreQuestions = async (difficulty?: string) => {
    if (!onGenerateMoreQuestions) return;
    
    setIsGeneratingMore(true);
    try {
      console.log("Requesting more questions with difficulty:", difficulty);
      await onGenerateMoreQuestions(difficulty);
    } catch (error) {
      console.error("Error generating more questions:", error);
      toast({
        title: "Error",
        description: "Failed to generate more questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMore(false);
    }
  };
  
  // Ensure we have valid data before rendering
  if (!currentQuestion) return null;
  
  return (
    <div className="container max-w-3xl mx-auto py-6 px-4">
      <Button
        variant="ghost"
        className="mb-6 flex items-center gap-1"
        onClick={onBackToExplanation}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to explanation
      </Button>
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Test Your Knowledge</h1>
        <div className="flex gap-2">
          {onSaveQuiz && (
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={onSaveQuiz}
            >
              <Save className="h-4 w-4" />
              Save Quiz
            </Button>
          )}
          {onGenerateMoreQuestions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  disabled={isGeneratingMore}
                >
                  <Plus className="h-4 w-4" />
                  {isGeneratingMore ? "Generating..." : "More Questions"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleGenerateMoreQuestions("mixed")}>
                  <span className="font-medium">Mixed Difficulty</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGenerateMoreQuestions("easy")}>
                  <span className="text-green-500 font-medium">Easy</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGenerateMoreQuestions("moderate")}>
                  <span className="text-yellow-500 font-medium">Moderate</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleGenerateMoreQuestions("hard")}>
                  <span className="text-red-500 font-medium">Hard</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      <p className="text-muted-foreground mb-6">{quiz.introduction}</p>
      
      <div className="flex flex-wrap gap-2 mb-6">
        {quiz.questions.map((q, idx) => (
          <Button
            key={q.id}
            variant={currentQuestionIndex === idx ? "default" : "outline"}
            className={`${answers[q.id]?.isCorrect === true ? "border-green-500" : ""} ${idx >= questionCount - (quiz.questions.length - questionCount) && idx < quiz.questions.length ? "bg-opacity-80 border-blue-400" : ""}`}
            onClick={() => setCurrentQuestionIndex(idx)}
          >
            Q{idx + 1}
            {answers[q.id]?.isCorrect === true && <CheckCircle className="ml-1 h-4 w-4 text-green-500" />}
          </Button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-muted-foreground">
          {correctAnswers} of {quiz.questions.length} questions answered correctly
        </div>
        <div className="text-sm font-medium">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </div>
      </div>
      
      <Card className="p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${getDifficultyColor(currentQuestion.difficulty)}`}>
              {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
            </span>
            {currentQuestion.hint && (
              <Button variant="ghost" size="icon" onClick={handleShowHint}>
                <HelpCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <h2 className="text-xl font-medium mb-4">{currentQuestion.question}</h2>
        
        <Textarea
          className="min-h-[200px]"
          placeholder="Type your answer here..."
          value={currentAnswer?.answer || ""}
          onChange={e => handleAnswerChange(e.target.value)}
          disabled={!!currentAnswer?.isCorrect}
        />
        
        {currentAnswer?.feedback && (
          <div className={`mt-4 p-4 rounded-md ${currentAnswer.isCorrect ? "bg-green-50" : "bg-amber-50"}`}>
            <div className="flex gap-2">
              {currentAnswer.isCorrect ? (
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              )}
              <div>
                <h3 className={`font-medium ${currentAnswer.isCorrect ? "text-green-700" : "text-amber-700"}`}>
                  {currentAnswer.isCorrect ? "Correct!" : "Not quite right"}
                </h3>
                <p className="text-sm mt-2">{currentAnswer.feedback}</p>
              </div>
            </div>
          </div>
        )}
      </Card>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>
        
        {currentAnswer?.isCorrect ? (
          <Button onClick={handleNextQuestion}>
            {isLastQuestion ? "Complete Quiz" : "Next Question"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmitAnswer}
            disabled={isEvaluating || !currentAnswer?.answer}
          >
            {isEvaluating ? "Evaluating..." : "Submit Answer"}
          </Button>
        )}
      </div>
      
      {allCorrect && (
        <Card className="mt-6 p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <div className="bg-green-500 p-2 rounded-full">
              <Check className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-medium mb-1 text-green-800">Congratulations!</h2>
              <p className="text-green-700">
                You've correctly answered all {quiz.questions.length} questions. You have a solid understanding of this topic.
              </p>
              <div className="flex gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={onComplete}
                >
                  Continue Learning
                </Button>
                {onGenerateMoreQuestions && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        disabled={isGeneratingMore}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        {isGeneratingMore ? "Generating..." : "Generate More Questions"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleGenerateMoreQuestions("mixed")}>
                        <span className="font-medium">Mixed Difficulty</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleGenerateMoreQuestions("easy")}>
                        <span className="text-green-500 font-medium">Easy</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleGenerateMoreQuestions("moderate")}>
                        <span className="text-yellow-500 font-medium">Moderate</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleGenerateMoreQuestions("hard")}>
                        <span className="text-red-500 font-medium">Hard</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

