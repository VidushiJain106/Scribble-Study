
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Quiz, QuizAnswer, QuizQuestion } from "@/types";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle, ChevronDown, ChevronUp, HelpCircle, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { withSupabase, getSupabaseClient, isSupabaseConfigured } from "@/lib/supabaseClient";

interface QuizContentProps {
  quiz: Quiz;
  onComplete: () => void;
  onBackToExplanation: () => void;
}

export function QuizContent({ quiz, onComplete, onBackToExplanation }: QuizContentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const { toast } = useToast();
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
  const hasAnsweredAll = Object.keys(answers).length === quiz.questions.length;
  const allCorrect = hasAnsweredAll && Object.values(answers).every(answer => answer.isCorrect);
  
  const handleShowHint = () => {
    if (currentQuestion.hint) {
      toast({
        title: "Hint",
        description: currentQuestion.hint,
      });
    }
  };
  
  const handleAnswerChange = (value: string) => {
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
      
      <h1 className="text-3xl font-bold mb-4">Test Your Knowledge</h1>
      <p className="text-muted-foreground mb-8">{quiz.introduction}</p>
      
      <div className="flex gap-4 mb-6">
        {quiz.questions.map((q, idx) => (
          <Button
            key={q.id}
            variant={currentQuestionIndex === idx ? "default" : "outline"}
            className={`flex-1 ${answers[q.id]?.isCorrect === true ? "border-green-500" : ""}`}
            onClick={() => setCurrentQuestionIndex(idx)}
          >
            Q{idx + 1}
            {answers[q.id]?.isCorrect === true && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
          </Button>
        ))}
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
                You've correctly answered all questions. You have a solid understanding of this topic.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={onComplete}
              >
                Continue Learning
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

