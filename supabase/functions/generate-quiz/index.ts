
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.3";
import { OpenAI } from "https://esm.sh/openai@4.36.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Set up OpenAI client
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    // Get request body
    const requestData = await req.json();
    const { noteId, topic, explanation } = requestData;

    if (!noteId || !topic || !explanation) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: noteId, topic and explanation are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if we already have a quiz for this note
    const { data: existingQuiz } = await supabaseClient
      .from('quizzes')
      .select('*')
      .eq('note_id', noteId)
      .single();

    if (existingQuiz) {
      return new Response(
        JSON.stringify({
          introduction: existingQuiz.introduction,
          questions: existingQuiz.questions
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate quiz with AI
    const systemPrompt = `
      You are an educational quiz creator that creates assessment questions based on learning materials.
      Create a quiz with multiple choice and open-ended questions based on the explanation provided.
      Format your response as valid JSON with the fields:
      - introduction: A brief introduction to the quiz
      - questions: An array of question objects with the following fields:
        - id: A unique identifier string for the question
        - question: The question text
        - type: Either "multiple_choice" or "open_ended"
        - options: An array of possible answers (for multiple_choice questions)
        - correctAnswer: The correct answer (for multiple_choice) or a model answer (for open_ended)
        - explanation: An explanation of why the answer is correct
        - difficulty: "easy", "medium", or "hard"
    `;

    const userPrompt = `
      Create a quiz to test understanding of the topic: ${topic}.
      
      Based on this explanation:
      ${explanation}
      
      Create 5 questions: 3 multiple choice and 2 open-ended.
      Make sure questions cover different aspects of the topic and vary in difficulty.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000
    });

    // Parse the AI response
    const quizText = completion.choices[0].message.content || '{}';
    const quiz = JSON.parse(quizText);

    // Store quiz in database
    const { data: quizData, error: quizError } = await supabaseClient
      .from('quizzes')
      .insert({
        note_id: noteId,
        topic: topic,
        introduction: quiz.introduction || `Quiz on ${topic}`,
        questions: quiz.questions || []
      })
      .select()
      .single();

    if (quizError) {
      console.error("Error storing quiz:", quizError);
      return new Response(
        JSON.stringify({ error: 'Failed to store quiz' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Return the quiz
    return new Response(
      JSON.stringify({
        introduction: quiz.introduction,
        questions: quiz.questions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in generate-quiz function:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
