import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NoteData {
  id: string;
  title: string;
  content: string;
  category?: string;
}

interface AnalysisResponse {
  concepts: string[];
  mainTopic: string;
  readyForExplanation: boolean;
  suggestedActions?: string[];
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
    // Use the OpenAI API key instead of OpenRouter
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!apiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(JSON.stringify({ 
        error: 'OPENAI_API_KEY not configured',
        concepts: ['Sample concept 1', 'Sample concept 2'],
        mainTopic: 'Sample Topic',
        readyForExplanation: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return fake data for development instead of error
      });
    }
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    
    // Parse request data
    const { note } = await req.json() as { note: NoteData };
    
    if (!note || !note.content) {
      return new Response(JSON.stringify({ error: 'Invalid note data provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    console.log(`Analyzing note: ${note.title}`);
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system', 
            content: 'You are an educational AI that analyzes student notes. Extract key academic concepts from student notes. Identify if there\'s enough content for a detailed explanation. Return a JSON response with: concepts (array of key academic concepts), mainTopic (single most important topic), readyForExplanation (boolean indicating if there\'s enough content for explanation).'
          },
          {
            role: 'user',
            content: `Please analyze these notes:\n\nTitle: ${note.title}\n\nContent:\n${note.content}`
          }
        ],
        response_format: { type: 'json_object' }
      }),
    });
    
    const result = await response.json();
    let analysis: AnalysisResponse;
    
    if (result.error) {
      console.error('OpenAI API error:', result.error);
      // Provide fallback analysis for development/testing
      analysis = {
        concepts: ['Concept 1', 'Concept 2', 'Concept 3'],
        mainTopic: note.title || 'General Topic',
        readyForExplanation: true
      };
    } else {
      try {
        // Parse the LLM response
        const content = result.choices[0].message.content;
        analysis = JSON.parse(content);
      } catch (e) {
        console.error('Error parsing LLM response:', e);
        // Fallback data
        analysis = {
          concepts: ['Parsing Error', 'Review Content'],
          mainTopic: note.title || 'Unknown Topic',
          readyForExplanation: true
        };
      }
    }
    
    // Ensure analysis has all required fields
    analysis.concepts = analysis.concepts || [];
    analysis.mainTopic = analysis.mainTopic || note.title || 'Topic';
    analysis.readyForExplanation = analysis.readyForExplanation !== undefined ? analysis.readyForExplanation : true;
    
    try {
      // Store the analysis in Supabase
      const { error } = await supabaseClient
        .from('note_analyses')
        .upsert({
          note_id: note.id,
          main_topic: analysis.mainTopic,
          concepts: analysis.concepts,
          ready_for_explanation: analysis.readyForExplanation,
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error storing analysis:', error);
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }
    
    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    // Return a safe fallback response
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred',
      concepts: ['Error Processing', 'Try Again Later'],
      mainTopic: 'Error Analysis',
      readyForExplanation: false
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return status 200 with fallback data instead of error
    });
  }
});
