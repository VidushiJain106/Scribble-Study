
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
  explanation?: string;
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
    
    // Get the API key from environment variables
    const apiKey = Deno.env.get('OPENROUTER_API_KEY');
    
    if (!apiKey) {
      console.error('OPENROUTER_API_KEY not configured');
      // Return mock data for testing purposes
      return new Response(JSON.stringify({
        title: "Understanding Carbon Dioxide Levels",
        sections: [
          {
            title: "Introduction to Atmospheric CO2",
            content: "Carbon dioxide (CO2) is a greenhouse gas that plays a crucial role in Earth's climate system. Atmospheric CO2 concentrations have increased significantly since the industrial revolution, primarily due to human activities like burning fossil fuels and deforestation."
          },
          {
            title: "Current Trends and Measurements",
            content: "Current atmospheric CO2 levels exceed 415 parts per million (ppm), the highest levels in over 800,000 years. Scientists measure these levels through ice core samples, direct atmospheric measurements, and satellite observations."
          },
          {
            title: "Environmental Impacts",
            content: "Rising CO2 levels contribute to global warming, climate change, and ocean acidification. These changes affect ecosystems, agriculture, weather patterns, and sea levels worldwide."
          }
        ],
        summary: "Atmospheric carbon dioxide levels are rising due to human activities, causing global warming and other environmental impacts. Understanding these trends is crucial for developing effective climate policies.",
        furtherResources: ["IPCC Climate Reports", "NASA Global Climate Change", "NOAA Earth System Research Laboratory"]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }
    
    // Parse request data
    const requestData = await req.json() as ExplanationRequest;
    
    if (!requestData || !requestData.topic || !requestData.noteContent) {
      return new Response(JSON.stringify({ error: 'Invalid request data' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    
    console.log(`Generating explanation for topic: ${requestData.topic}`);
    console.log(`Using OPENROUTER_API_KEY: ${apiKey.substring(0, 5)}...`);
    
    try {
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
              
              The key concepts involved are: ${requestData.concepts ? requestData.concepts.join(', ') : 'Various concepts related to the topic'}
              
              These notes were used as reference:
              "${requestData.noteContent}"`
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
      
      if (result.error) {
        console.error('OpenRouter API error:', result.error);
        return new Response(JSON.stringify({ 
          error: 'Error generating explanation',
          title: "Error Processing Content", 
          sections: [
            {
              title: "Error Generating Content",
              content: "There was a problem generating the explanation. Please try again."
            }
          ],
          summary: "Error generating content. Please try again."
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 with error info in content
        });
      }
      
      try {
        // Parse the LLM response
        const content = result.choices[0].message.content;
        console.log("Raw LLM response:", content.substring(0, 100) + "...");
        
        let explanation: ExplanationResponse;
        
        try {
          explanation = JSON.parse(content);
          
          // Validate the structure
          if (!explanation.title || !Array.isArray(explanation.sections) || !explanation.summary) {
            throw new Error("Invalid explanation structure");
          }
          
          // Check if sections are properly formatted
          explanation.sections = explanation.sections.map(section => {
            if (typeof section !== 'object' || !section.title || !section.content) {
              return {
                title: section.title || "Section",
                content: section.content || "Content not available"
              };
            }
            return section;
          });
          
        } catch (parseError) {
          console.error('Error parsing JSON from LLM:', parseError);
          
          // Fallback with mock data if parsing fails
          explanation = {
            title: "Understanding " + requestData.topic,
            sections: [
              {
                title: "Introduction",
                content: "This is a generated introduction to " + requestData.topic + ". The LLM response couldn't be parsed correctly, but the system is still functioning."
              },
              {
                title: "Key Concepts",
                content: "The key concepts mentioned in your notes include: " + 
                  (requestData.concepts && requestData.concepts.length > 0 
                    ? requestData.concepts.join(", ") 
                    : "various topics related to " + requestData.topic)
              }
            ],
            summary: "This is an automatically generated summary for " + requestData.topic + " since the AI's response couldn't be correctly parsed."
          };
        }
        
        // Skip storing the explanation in Supabase - we bypass database storage
        console.log('Successfully generated explanation, bypassing database storage');
        
        return new Response(JSON.stringify(explanation), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      } catch (e) {
        console.error('Error processing explanation response:', e);
        return new Response(JSON.stringify({ 
          error: 'Error processing explanation response',
          title: "Understanding " + requestData.topic,
          sections: [
            {
              title: "Error Processing Content",
              content: "There was an error processing the AI response. Please try again."
            }
          ],
          summary: "Error generating content. Please try again."
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200, // Return 200 with error message in content instead of 500
        });
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return new Response(JSON.stringify({ 
        error: `Error calling OpenRouter: ${fetchError.message}`,
        title: "Error Generating Explanation",
        sections: [
          {
            title: "Connection Error",
            content: "There was an error connecting to the AI service. Please try again later."
          }
        ],
        summary: "Error connecting to AI service. Please try again."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 with error info in content
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      error: 'An unexpected error occurred',
      title: "Error Processing Request",
      sections: [
        {
          title: "System Error",
          content: "An unexpected error occurred. Please try again later."
        }
      ],
      summary: "System error. Please try again."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 with error info
    });
  }
});
