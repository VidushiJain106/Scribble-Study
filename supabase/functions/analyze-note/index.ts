
// Import the required modules - using stable versions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0";

// Use the OpenAI fetch API directly instead of the SDK to avoid compatibility issues
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
    // Initialize Supabase client with a stable version
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request body
    const requestData = await req.json();
    const { note } = requestData;

    if (!note || !note.id || !note.content) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: note data is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check content length - don't analyze if too short
    if (note.content.length < 30) {
      return new Response(
        JSON.stringify({ 
          mainTopic: "Not enough content",
          concepts: [],
          readyForExplanation: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze the note with AI using direct OpenAI API call
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Call OpenAI API directly using fetch (more stable than the SDK in Deno)
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system", 
            content: `You are an educational assistant that analyzes student notes.
            Extract the main topic and key concepts from the provided notes.
            Format your response as valid JSON with the fields:
            - mainTopic: The primary subject of the notes (1-3 words)
            - concepts: An array of key concepts mentioned (3-5 items)`
          },
          { 
            role: "user", 
            content: `Analyze these notes and extract the main topic and key concepts:\n\n${note.content}` 
          }
        ],
        temperature: 0.7,
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    // Parse the AI response
    const responseData = await openaiResponse.json();
    const analysisText = responseData.choices[0].message?.content || '{}';
    
    console.log("Raw analysis text:", analysisText);
    
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, "Response was:", analysisText);
      throw new Error("Failed to parse AI response");
    }

    // Store analysis in database
    const { data: analysisData, error: analysisError } = await supabaseClient
      .from('note_analyses')
      .upsert({
        note_id: note.id,
        main_topic: analysis.mainTopic || "Unknown Topic",
        concepts: analysis.concepts || [],
        ready_for_explanation: note.content.length > 100
      })
      .select()
      .single();

    if (analysisError) {
      console.error("Error storing analysis:", analysisError);
    }

    // Return analysis with additional ready_for_explanation flag
    return new Response(
      JSON.stringify({
        mainTopic: analysis.mainTopic,
        concepts: analysis.concepts,
        readyForExplanation: note.content.length > 100
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in analyze-note function:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
