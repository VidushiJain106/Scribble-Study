
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExplanationRequest {
  noteId: string;
  topic: string;
  concepts: string[];
  noteContent: string;
}

interface ExplanationResponse {
  explanation: string;
  title: string;
  sections: {
    title: string;
    content: string;
  }[];
  summary: string;
  furtherResources?: string[];
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
    const requestData = await req.json() as ExplanationRequest;
    
    if (!requestData || !requestData.topic || !requestData.noteContent) {
      return new Response(JSON.stringify({ error: 'Invalid request data' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    console.log(`Generating explanation for topic: ${requestData.topic}`);
    
    // Call OpenRouter API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': Deno.env.get('APP_URL') || 'https://localhost:3000',
        'X-Title': 'ScribbleSnap Explanation Generation'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system', 
            content: `You are a college professor creating a lesson on a topic. Create a well-structured educational explanation that a college professor would write.
            
            Follow this structure:
            1. Begin with a clear, concise overview of the topic
            2. Break down the topic into 3-5 logical sections
            3. For each section, provide detailed explanations with examples
            4. Where relevant, suggest how concepts might be visualized (with descriptions of diagrams)
            5. End with a brief summary and key takeaways
            
            Format your response as a JSON object with these fields:
            - title: A clear title for the lesson
            - sections: An array of objects, each with fields "title" and "content"
            - summary: A concise summary of key points
            - furtherResources: (optional) Suggested resources for further study`
          },
          {
            role: 'user',
            content: `Create an educational explanation for the topic: ${requestData.topic}
            
            The key concepts involved are: ${requestData.concepts.join(', ')}
            
            These notes were used as reference:
            "${requestData.noteContent}"`
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });
    
    const result = await response.json();
    let explanation: ExplanationResponse;
    
    if (result.error) {
      console.error('OpenRouter API error:', result.error);
      return new Response(JSON.stringify({ error: 'Error generating explanation' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    try {
      // Parse the LLM response
      const content = result.choices[0].message.content;
      explanation = JSON.parse(content);
      
      // Store the explanation in Supabase
      const { data, error } = await supabaseClient
        .from('explanations')
        .upsert({
          note_id: requestData.noteId,
          topic: requestData.topic,
          title: explanation.title,
          content: explanation,
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error('Error storing explanation:', error);
      }
    } catch (e) {
      console.error('Error parsing LLM response:', e);
      return new Response(JSON.stringify({ error: 'Error processing explanation response' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    
    return new Response(JSON.stringify(explanation), {
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
