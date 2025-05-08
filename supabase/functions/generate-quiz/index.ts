
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
      console.error('OPENROUTER_API_KEY not configured');
      // Return mock quiz data for testing
      return new Response(JSON.stringify({
        topic: "Carbon Dioxide and Climate Change",
        introduction: "Test your knowledge about atmospheric carbon dioxide and its environmental impacts",
        questions: [
          {
            id: "q1",
            question: "What is the current atmospheric CO2 level in parts per million (ppm) as of 2023?",
            difficulty: "easy",
            hint: "It's over 400 ppm",
            explanation: "According to recent measurements, global average atmospheric CO2 reached 419.3 ppm in 2023."
          },
          {
            id: "q2",
            question: "Explain how carbon dioxide contributes to the greenhouse effect",
            difficulty: "moderate",
            hint: "Think about how it interacts with heat radiation",
            explanation: "Carbon dioxide absorbs and re-emits infrared radiation, trapping heat in Earth's atmosphere that would otherwise escape to space."
          },
          {
            id: "q3",
            question: "Analyze the potential consequences if atmospheric CO2 reaches 800 ppm by the end of the century",
            difficulty: "hard",
            hint: "Consider historical analogs from Earth's past",
            explanation: "At 800 ppm, we would likely see temperature increases of 4-7°C, significant sea level rise, widespread ecosystem disruption, and conditions not seen on Earth for nearly 50 million years."
          }
        ]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
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
    console.log(`Using OPENROUTER_API_KEY: ${apiKey.substring(0, 5)}...`);
    
    try {
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
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error response:', response.status, errorText);
        throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
      }
      
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
        console.log("Raw quiz response:", content.substring(0, 100) + "...");
        
        try {
          quiz = JSON.parse(content);
        } catch (parseError) {
          console.error('Error parsing JSON from LLM:', parseError);
          
          // Fallback with mock data if parsing fails
          quiz = {
            topic: requestData.topic,
            introduction: "Test your knowledge on " + requestData.topic,
            questions: [
              {
                id: "q1",
                question: "What is the main topic discussed in the explanation?",
                difficulty: "easy",
                hint: "It's the central subject of the material",
                explanation: "The main topic is " + requestData.topic
              },
              {
                id: "q2",
                question: "Explain one key concept from the explanation",
                difficulty: "moderate",
                explanation: "A good answer would identify and explain any main concept from the explanation."
              },
              {
                id: "q3",
                question: "How does this topic relate to broader environmental or scientific issues?",
                difficulty: "hard",
                explanation: "This requires connecting the topic to wider scientific or environmental contexts."
              }
            ]
          };
        }
        
        console.log('Successfully generated quiz');
        
        return new Response(JSON.stringify(quiz), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      } catch (e) {
        console.error('Error processing quiz response:', e);
        return new Response(JSON.stringify({ 
          error: 'Error processing quiz response',
          topic: requestData.topic,
          introduction: "There was an error generating your quiz.",
          questions: [
            {
              id: "error1",
              question: "Error generating questions. Please try again later.",
              difficulty: "moderate"
            }
          ]
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 with error message in content
        });
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return new Response(JSON.stringify({
        error: `Error calling OpenRouter: ${fetchError.message}`,
        topic: requestData.topic,
        introduction: "Unable to generate quiz at this time.",
        questions: [
          {
            id: "error1",
            question: "Connection error. Please try again later.",
            difficulty: "moderate"
          }
        ]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 with error info
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({
      error: 'An unexpected error occurred',
      topic: "Error",
      introduction: "An error occurred while generating your quiz.",
      questions: [
        {
          id: "error1",
          question: "System error. Please try again later.",
          difficulty: "moderate"
        }
      ]
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 with error info
    });
  }
});
