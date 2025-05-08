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
  difficulty?: string;
  questionsCount?: number;
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

// In-memory cache for quiz results (in production, consider using a more robust caching solution)
const quizCache = new Map<string, {data: QuizResponse, timestamp: number}>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache duration

// In-memory locks to prevent concurrent generation for the same explanation
const generationLocks = new Map<string, number>();
const LOCK_EXPIRY = 1000 * 60; // 1 minute lock expiry

// Function to create a short hash of the explanation content
function createExplanationHash(explanation: string): string {
  // Simple hashing - in production, consider a more robust hashing function
  let hash = 0;
  for (let i = 0; i < explanation.length; i++) {
    const char = explanation.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
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
    const requestData = await req.json() as QuizRequest;
    
    if (!requestData || !requestData.topic || !requestData.explanation) {
      return new Response(JSON.stringify({ error: 'Invalid request data' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    // Determine how many questions to generate
    const questionsCount = requestData.questionsCount || 2; // Default to 2 questions for speed
    
    // Create an explanation hash to identify this specific explanation
    const explanationHash = createExplanationHash(requestData.explanation);
    
    // Create a lock ID for this specific quiz generation request
    const lockId = `${requestData.noteId}:${requestData.topic}:${explanationHash}`;
    
    // Check if a generation is already in progress for this explanation
    const existingLock = generationLocks.get(lockId);
    if (existingLock && (Date.now() - existingLock < LOCK_EXPIRY)) {
      return new Response(JSON.stringify({ 
        error: 'A quiz is already being generated for this explanation',
        status: 'in_progress' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429, // Too many requests
      });
    }
    
    // First, try to get the quiz from the database
    // Only search for existing quizzes if we're not asking for a specific difficulty
    if (!requestData.difficulty) {
      const { data: existingQuiz, error } = await supabaseClient
        .from('quizzes')
        .select('*')
        .eq('note_id', requestData.noteId)
        .eq('topic', requestData.topic)
        .eq('explanation_hash', explanationHash)
        .single();
      
      if (existingQuiz && !error) {
        console.log('Found existing quiz in database for specific explanation');
        const formattedQuiz = {
          questions: existingQuiz.questions,
          topic: existingQuiz.topic,
          introduction: existingQuiz.introduction
        };
        
        return new Response(JSON.stringify(formattedQuiz), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }
    }
    
    // Try the cache next
    const cacheKey = `${requestData.noteId}:${requestData.topic}:${explanationHash}:${requestData.difficulty || 'default'}`;
    const cachedQuiz = quizCache.get(cacheKey);
    
    // Return cached result if available and not expired
    if (cachedQuiz && (Date.now() - cachedQuiz.timestamp < CACHE_TTL)) {
      console.log(`Returning cached quiz for ${requestData.topic} with specific explanation`);
      return new Response(JSON.stringify(cachedQuiz.data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    // No existing quiz found in DB or cache, acquire a lock for generation
    generationLocks.set(lockId, Date.now());
    
    try {
      console.log(`Generating quiz for topic: ${requestData.topic}, questions: ${questionsCount}`);
      
      // Generate a simplified prompt based on the difficulty
      let difficultyPrompt = '';
      if (requestData.difficulty && requestData.difficulty !== 'mixed') {
        difficultyPrompt = `All questions should be ${requestData.difficulty} difficulty.`;
      }
      
      // Call OpenRouter API with a simpler, more focused prompt
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': Deno.env.get('APP_URL') || 'https://localhost:3000',
          'X-Title': 'ScribbleSnap Quiz Generation'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-instant-1.2', // Revert to a more widely available model
          messages: [
            {
              role: 'system', 
              content: `Create ${questionsCount} quiz questions on the given topic. ${difficultyPrompt}
              
              Be concise and direct. Return only a JSON object in this exact format:
              {
                "topic": "Topic name",
                "introduction": "Brief 1-sentence intro",
                "questions": [
                  {
                    "id": "unique-id-1",
                    "question": "Question text?",
                    "difficulty": "easy", 
                    "hint": "Short hint",
                    "explanation": "Brief explanation"
                  }
                ]
              }`
            },
            {
              role: 'user',
              content: `Create ${questionsCount} quiz questions on: ${requestData.topic}.
              
              Context: ${requestData.explanation.substring(0, 500)}...` // Further limit context length
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.5, // Lower temperature for faster, more deterministic results
          max_tokens: 500  // Reduced response size limit
          // Removed timeout to prevent early termination
        }),
      });
      
      console.log('API response status:', response.status);
      
      const result = await response.json();
      if (result.error) {
        console.error('OpenRouter API error details:', JSON.stringify(result));
        return new Response(JSON.stringify({ 
          error: 'Error generating quiz', 
          details: result.error 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      
      // Debug response
      console.log('API response structure:', Object.keys(result));
      
      // Check if we have the expected structure
      if (!result.choices || !result.choices[0] || !result.choices[0].message || !result.choices[0].message.content) {
        console.error('Unexpected API response structure:', JSON.stringify(result));
        return new Response(JSON.stringify({ 
          error: 'Unexpected API response format', 
          details: result 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }
      
      // Parse the LLM response
      const content = result.choices[0].message.content;
      let quiz: QuizResponse;
      
      try {
        quiz = JSON.parse(content);
        
        // Add to cache
        quizCache.set(cacheKey, {
          data: quiz,
          timestamp: Date.now()
        });
        
        // Only store in Supabase if it's a standard quiz (not a specific difficulty request)
        if (!requestData.difficulty) {
          // Store the quiz in Supabase
          const { data, error } = await supabaseClient
            .from('quizzes')
            .upsert({
              note_id: requestData.noteId,
              topic: requestData.topic,
              questions: quiz.questions,
              introduction: quiz.introduction,
              explanation_hash: explanationHash,
              created_at: new Date().toISOString()
            })
            .select();
          
          if (error) {
            console.error('Error storing quiz:', error);
          }
        }
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
    } finally {
      // Release the lock when done (whether successful or not)
      generationLocks.delete(lockId);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
