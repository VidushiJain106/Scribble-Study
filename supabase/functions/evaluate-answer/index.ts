
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EvaluateAnswerRequest {
  question: {
    id: string;
    question: string;
    difficulty: 'easy' | 'moderate' | 'hard';
    explanation?: string;
  };
  answer: string;
  topic: string;
}

interface EvaluateAnswerResponse {
  isCorrect: boolean;
  feedback: string;
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
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    
    // Parse request data
    const requestData = await req.json() as EvaluateAnswerRequest;
    
    if (!requestData || !requestData.question || !requestData.answer) {
      return new Response(JSON.stringify({ error: 'Invalid request data' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    console.log(`Evaluating answer for question: ${requestData.question.question.substring(0, 50)}...`);
    
    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('APP_URL') || 'https://localhost:3000',
        'X-Title': 'ScribbleSnap Answer Evaluation'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system', 
            content: `You are an educational assessment expert evaluating student answers to academic questions. 
            Evaluate the student's answer and determine if it demonstrates understanding of the concept.
            
            You should be supportive and encouraging.
            
            For easier questions, be more lenient.
            For moderate questions, expect a good level of understanding.
            For hard questions, expect a comprehensive answer.
            
            Return a JSON object with:
            - "isCorrect": boolean (true if the answer demonstrates understanding)
            - "feedback": string (constructive feedback explaining why the answer was correct or not)
            
            If the answer is incorrect, explain the concept clearly in the feedback.`
          },
          {
            role: 'user',
            content: `Evaluate this student's answer on the topic "${requestData.topic}":
            
            Question (${requestData.question.difficulty} difficulty): ${requestData.question.question}
            
            Student's answer: "${requestData.answer}"
            
            ${requestData.question.explanation ? `Expected points to cover: ${requestData.question.explanation}` : ''}`
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });
    
    const result = await response.json();
    let evaluation: EvaluateAnswerResponse;
    
    if (result.error) {
      console.error('OpenRouter API error:', result.error);
      return new Response(JSON.stringify({ error: 'Error evaluating answer' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    try {
      // Parse the LLM response
      const content = result.choices[0].message.content;
      evaluation = JSON.parse(content);
      
      // Store the answer evaluation in Supabase
      const { data, error } = await supabaseClient
        .from('quiz_answers')
        .insert({
          question_id: requestData.question.id,
          answer_text: requestData.answer,
          is_correct: evaluation.isCorrect,
          feedback: evaluation.feedback,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error storing answer evaluation:', error);
      }
    } catch (e) {
      console.error('Error parsing LLM response:', e);
      return new Response(JSON.stringify({ error: 'Error processing evaluation response' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    return new Response(JSON.stringify(evaluation), {
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
