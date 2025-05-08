
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QuizRequest {
  noteId: string;
  topic: string;
  explanation: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  hint?: string;
  explanation?: string;
}

interface QuizResponse {
  questions: QuizQuestion[];
  topic: string;
  introduction: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const apiKey = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    // Parse request data
    const requestData = await req.json() as QuizRequest;
    
    if (!requestData || !requestData.topic || !requestData.explanation) {
      return new Response(JSON.stringify({ error: 'Invalid request data' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    console.log(`Generating quiz for topic: ${requestData.topic}`);
    
    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('APP_URL') || 'https://localhost:3000',
        'X-Title': 'ScribbleSnap Quiz Generation'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system', 
            content: `You are an educational assessment expert creating quiz questions on academic topics. Create three questions of increasing difficulty to test understanding.
            
            Return your response as a JSON object with:
            - "topic": The main topic being tested
            - "introduction": A brief introduction to the quiz
            - "questions": An array of 3 questions with fields:
              - "id": A unique identifier (string)
              - "question": The question text (should be open-ended, not multiple choice)
              - "difficulty": One of: "easy", "moderate", "hard" (one of each)
              - "hint": A helpful hint if the student gets stuck (optional)
              - "explanation": A brief explanation of what a good answer would include`
          },
          {
            role: 'user',
            content: `Create quiz questions for the topic: ${requestData.topic}
            
            This explanation has been provided to students:
            "${requestData.explanation}"`
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });
    
    const result = await response.json();
    let quiz: QuizResponse;
    
    if (result.error) {
      console.error('OpenRouter API error:', result.error);
      return new Response(JSON.stringify({ error: 'Error generating quiz' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    try {
      // Parse the LLM response
      const content = result.choices[0].message.content;
      quiz = JSON.parse(content);
      
      // Skip storing the quiz in Supabase - we bypass database storage
      console.log('Bypassing database storage for quiz');
    } catch (e) {
      console.error('Error parsing LLM response:', e);
      return new Response(JSON.stringify({ error: 'Error processing quiz response' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    return new Response(JSON.stringify(quiz), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
