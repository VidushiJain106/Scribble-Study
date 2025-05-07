
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
    const { noteId, topic, concepts, noteContent } = requestData;

    if (!noteId || !topic || !noteContent) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: noteId, topic and noteContent are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if we already have an explanation for this note
    const { data: existingExplanation } = await supabaseClient
      .from('explanations')
      .select('*')
      .eq('note_id', noteId)
      .single();

    if (existingExplanation) {
      return new Response(
        JSON.stringify(existingExplanation.content),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate explanation with AI
    const systemPrompt = `
      You are an educational assistant that creates detailed explanations from student notes.
      Create a comprehensive explanation based on the topic and content provided.
      Format your response as valid JSON with the fields:
      - title: A descriptive title for the explanation
      - sections: An array of sections, each with a 'title' and 'content' field
      - summary: A concise summary of the main points
      - furtherResources: (optional) An array of suggested resources for further reading
    `;

    const userPrompt = `
      Create an educational explanation on the topic: ${topic}.
      
      Key concepts include: ${concepts ? concepts.join(", ") : "various concepts"}.
      
      Based on these notes:
      ${noteContent}
      
      Create at least 3-5 sections with detailed content for each section.
      The explanation should be educational and go beyond what's in the notes to provide a comprehensive understanding.
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
    const explanationText = completion.choices[0].message.content || '{}';
    const explanation = JSON.parse(explanationText);

    // Store explanation in database
    const { data: explanationData, error: explanationError } = await supabaseClient
      .from('explanations')
      .insert({
        note_id: noteId,
        topic: topic,
        title: explanation.title || topic,
        content: explanation
      })
      .select()
      .single();

    if (explanationError) {
      console.error("Error storing explanation:", explanationError);
      return new Response(
        JSON.stringify({ error: 'Failed to store explanation' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Return the explanation content
    return new Response(
      JSON.stringify(explanation),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in generate-explanation function:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
