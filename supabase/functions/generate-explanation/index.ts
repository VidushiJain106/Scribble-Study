
// Import the required modules - using stable versions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.22.0";

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
    console.log("Explanation generation started");
    
    // Initialize Supabase client with a stable version
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request body
    const requestData = await req.json();
    const { noteId, topic, concepts, noteContent } = requestData;

    console.log(`Processing request for note: ${noteId}, topic: ${topic}`);
    
    if (!noteId || !topic || !noteContent) {
      console.error("Invalid request - missing required fields");
      return new Response(
        JSON.stringify({ error: 'Invalid request: noteId, topic and noteContent are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if we already have an explanation for this note
    const { data: existingExplanation, error: existingError } = await supabaseClient
      .from('explanations')
      .select('*')
      .eq('note_id', noteId)
      .maybeSingle();
      
    if (existingError) {
      console.error("Error checking existing explanation:", existingError);
    }

    if (existingExplanation) {
      console.log("Using existing explanation from database");
      return new Response(
        JSON.stringify(existingExplanation.content),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate explanation with AI using OpenRouter API
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      console.error("OpenRouter API key not found");
      throw new Error('OpenRouter API key not found');
    }

    console.log("Calling OpenRouter API to generate explanation");
    
    // Call OpenRouter API directly using fetch
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': Deno.env.get('APP_URL') || 'https://localhost:3000',
        'X-Title': 'ScribbleSnap Explanation Generation'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: "system", 
            content: `You are an educational assistant that creates detailed explanations from student notes.
            Create a comprehensive explanation based on the topic and content provided.
            Format your response as JSON with the fields:
            - title: A descriptive title for the explanation
            - sections: An array of sections, each with a 'title' and 'content' field
            - summary: A concise summary of the main points
            - furtherResources: (optional) An array of suggested resources for further reading
            
            IMPORTANT: Return ONLY the JSON object without any markdown formatting, code blocks, or backticks.`
          },
          {
            role: "user", 
            content: `Create an educational explanation on the topic: ${topic}.
            
            Key concepts include: ${concepts ? concepts.join(", ") : "various concepts"}.
            
            Based on these notes:
            ${noteContent}
            
            Create at least 3-5 sections with detailed content for each section.
            The explanation should be educational and go beyond what's in the notes to provide a comprehensive understanding.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error("OpenRouter API error:", errorText);
      throw new Error(`OpenRouter API error: ${openRouterResponse.status}`);
    }

    // Parse the AI response
    const responseData = await openRouterResponse.json();
    let analysisText = responseData.choices[0].message?.content || '{}';
    
    console.log("Raw explanation text:", analysisText);
    
    // Clean up the response text to handle possible markdown formatting
    // Remove any markdown code block indicators or backticks
    analysisText = analysisText.replace(/```json\s*/g, '').replace(/```\s*$/g, '').replace(/^```\s*/g, '').trim();
    
    let explanation;
    try {
      explanation = JSON.parse(analysisText);
      console.log("Successfully parsed explanation JSON");
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError, "Response was:", analysisText);
      
      // Try additional cleanup if first parse fails
      try {
        // Remove any remaining non-JSON characters
        const jsonStart = analysisText.indexOf('{');
        const jsonEnd = analysisText.lastIndexOf('}') + 1;
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const cleanerJson = analysisText.substring(jsonStart, jsonEnd);
          explanation = JSON.parse(cleanerJson);
          console.log("Successfully parsed explanation JSON after cleanup");
        } else {
          throw new Error("Could not locate valid JSON in response");
        }
      } catch (secondError) {
        console.error("Failed second parse attempt:", secondError);
        
        // Last resort: provide an explanation with the error to help debugging
        explanation = {
          title: "Explanation Generation Error",
          sections: [
            {
              title: "Error Information",
              content: "There was an error creating your explanation. Please try again later."
            }
          ],
          summary: "Error generating explanation: " + (parseError.message || "Unknown parsing error")
        };
        
        // Since we failed to parse but provided a fallback, we should still save something
        console.log("Using fallback explanation due to parsing errors");
      }
    }

    // Ensure explanation has all required fields even if some parsing succeeded
    if (!explanation.title) explanation.title = topic || "Explanation";
    if (!explanation.sections || !Array.isArray(explanation.sections) || explanation.sections.length === 0) {
      explanation.sections = [{
        title: "Overview", 
        content: "Content could not be properly generated. Please try again."
      }];
    }
    if (!explanation.summary) explanation.summary = "Summary could not be generated.";

    // Store explanation in database
    console.log("Storing explanation in database");
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
        JSON.stringify({ error: 'Failed to store explanation', details: explanationError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log("Explanation generation completed successfully");
    
    // Return the explanation content
    return new Response(
      JSON.stringify(explanation),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in generate-explanation function:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
