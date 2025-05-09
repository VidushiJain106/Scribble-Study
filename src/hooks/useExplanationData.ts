import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { withSupabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Explanation, Quiz } from "@/types";
import OpenAI from 'openai';

/**
 * Hook for managing explanation and quiz data
 */
export function useExplanationData(noteId: string | undefined, note: any) {
  const [explanation, setExplanation] = useState<Explanation | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Fetch explanation data from Supabase or generate new one
   */
  const fetchExplanation = async () => {
    if (!noteId || !note || !note.analysis || !note.analysis.readyForExplanation) {
      return null;
    }

    setLoading(true);
    
    try {
      if (!isSupabaseConfigured()) {
        toast({
          title: "Connection Error",
          description: "Cannot connect to Supabase. Please try again later.",
          variant: "destructive",
        });
        setLoading(false);
        return null;
      }
      
      // Use withSupabase helper to safely fetch or generate explanation
      const explanation = await withSupabase(
        async (supabase) => {
          // First check if we have a stored explanation
          const { data: existingExplanation } = await supabase
            .from('explanations')
            .select('*')
            .eq('note_id', noteId)
            .single();
          
          if (existingExplanation) {
            // Ensure we properly type the response from Supabase
            return {
              id: existingExplanation.id as string,
              noteId: existingExplanation.note_id as string,
              topic: existingExplanation.topic as string,
              title: existingExplanation.title as string,
              content: existingExplanation.content as Explanation['content'],
              createdAt: new Date(existingExplanation.created_at as string)
            };
          } else {
            // Generate a new explanation
            const { data, error } = await supabase.functions.invoke('generate-explanation', {
              body: {
                noteId,
                topic: note.analysis.mainTopic,
                concepts: note.analysis.concepts,
                noteContent: note.content,
                apiKey: import.meta.env.VITE_OPENAI_API_KEY
              },
            });
            
            if (error) {
              throw new Error(error.message);
            }
            
            return {
              noteId,
              topic: note.analysis.mainTopic,
              title: data.title,
              content: {
                title: data.title,
                sections: data.sections,
                summary: data.summary,
                furtherResources: data.furtherResources
              },
              createdAt: new Date()
            };
          }
        },
        null
      );
      
      if (explanation) {
        // Explicitly cast to Explanation type to ensure type safety
        setExplanation(explanation as Explanation);
        return explanation as Explanation;
      } else {
        // If Supabase call failed, fallback to client-side OpenAI generation
        try {
          const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
          if (!apiKey) throw new Error('Missing OpenAI API key');

          const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

          const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: 'You are a helpful assistant that writes educational explanations in JSON.' },
              {
                role: 'user',
                content: `Write an explanation (JSON with fields: title, sections[{title,content}], summary) about ${note?.analysis?.mainTopic || 'this topic'}. Base it on these concepts: ${note?.analysis?.concepts?.join(', ') || ''}. Notes: ${note?.content?.slice(0,500)}`
              }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 800
          });

          const jsonContent = completion.choices?.[0]?.message?.content?.trim();
          if (jsonContent) {
            const dataParsed = JSON.parse(jsonContent);
            const fallbackExplanation: Explanation = {
              noteId: noteId || '',
              topic: note?.analysis?.mainTopic || 'Topic',
              title: dataParsed.title || 'Generated Explanation',
              content: {
                title: dataParsed.title || '',
                sections: dataParsed.sections || [],
                summary: dataParsed.summary || '' ,
                furtherResources: dataParsed.furtherResources || []
              },
              createdAt: new Date()
            };
            setExplanation(fallbackExplanation);
            return fallbackExplanation;
          }
        } catch (fallbackErr) {
          console.error('Fallback OpenAI generation failed', fallbackErr);
        }
      }

      // fallback may not produce explanation; notify user
      toast({
        title: "Error",
        description: "Failed to get explanation. Please try again later.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error fetching explanation:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching the explanation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
    
    return null;
  };

  /**
   * Generate or fetch quiz based on explanation
   * @param forceGenerate If true, generate new questions even if a quiz exists
   * @param difficulty Optional difficulty level for generated questions (easy, moderate, hard, mixed)
   */
  const generateQuiz = async (forceGenerate: boolean = false, difficulty?: string) => {
    if (!noteId) return;

    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        toast({ title: 'Error', description: 'Missing OpenAI API key', variant: 'destructive' });
        setLoading(false);
        return;
      }

      const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

      // Build context: use structured explanation if available, otherwise raw note content
      const contextText = explanation
        ? `Structured JSON explanation: ${JSON.stringify(explanation.content).slice(0, 800)}...`
        : `Raw note content: ${note?.content?.slice(0, 800)}...`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an assistant that creates study quizzes as JSON.' },
          {
            role: 'user',
            content: `Create 5 multiple-choice quiz questions (${difficulty || 'mixed'} difficulty) for the topic "${note?.title || explanation?.topic || 'General'}".

${contextText}

Return ONLY a JSON object with fields: topic, introduction (one sentence), questions[{id,question,difficulty,hint,explanation}]`
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 900
      });

      const content = completion.choices?.[0]?.message?.content?.trim();
      if (content) {
        const parsed = JSON.parse(content);
        const newQuiz: Quiz = {
          noteId,
          topic: parsed.topic || (explanation?.topic ?? 'Topic'),
          introduction: parsed.introduction || '',
          questions: parsed.questions || [],
          createdAt: new Date()
        };
        setQuiz(newQuiz);
        return newQuiz;
      }

      toast({ title: 'Error', description: 'Could not generate quiz', variant: 'destructive' });
    } catch (err) {
      console.error('Error generating quiz with OpenAI', err);
      toast({ title: 'Error', description: 'Could not generate quiz', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return {
    explanation,
    quiz,
    loading,
    fetchExplanation,
    generateQuiz,
  };
}
