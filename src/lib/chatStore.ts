import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatMessageRole, ChatState, Note } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [
    {
      id: uuidv4(),
      content: "Hi there! I'm your notes assistant. I can analyze your notes and provide ideas. Try editing a note, and I'll help you expand on your thoughts.",
      role: "assistant",
      timestamp: new Date(),
    },
  ],
  isOpen: false,
  hasNewMessage: false,
  isLoading: false,

  addMessage: (content, role) => {
    if (!content.trim()) return;
    
    const newMessage: ChatMessage = {
      id: uuidv4(),
      content,
      role,
      timestamp: new Date(),
    };
    
    set((state) => ({
      messages: [...state.messages, newMessage],
      hasNewMessage: role === "assistant",
    }));
  },

  toggleChat: () => {
    set((state) => ({ 
      isOpen: !state.isOpen,
      hasNewMessage: state.isOpen ? state.hasNewMessage : false
    }));
  },

  markAsRead: () => {
    set({ hasNewMessage: false });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  analyzeNote: async (note: Note) => {
    const { addMessage, setLoading } = get();
    
    // Skip if no note or no content
    if (!note || !note.content.trim()) return;
    
    setLoading(true);
    addMessage("Analyzing your note...", "assistant");
    
    try {
      // Check if we have a valid Supabase client
      if (!supabase) {
        console.warn("Supabase client not available. Providing fallback message.");
        addMessage("I'm not connected to the backend yet. For now, I'll provide a simulated response.", "assistant");
        
        // Simulate analysis response after a short delay
        setTimeout(() => {
          if (note.content.length > 50) {
            addMessage(
              `I've analyzed your note (simulation). It looks like you're writing about an interesting topic. You've written enough that I would normally provide a detailed explanation. In a real setup with Supabase, you'd see an "Explain!" button appear.`,
              "assistant"
            );
            
            // Update note with simulated analysis
            note.analysis = {
              noteId: note.id,
              mainTopic: "Simulated Topic",
              concepts: ["Concept 1", "Concept 2", "Concept 3"],
              readyForExplanation: true,
              createdAt: new Date()
            };
          } else {
            addMessage(
              "Your note is still developing. Try adding more details or examples to get better insights.",
              "assistant"
            );
          }
          setLoading(false);
        }, 1500);
        
        return;
      }

      // Log for debugging
      console.log("Sending note for analysis:", note.id);
      
      try {
        const { data, error } = await supabase.functions.invoke('analyze-note', {
          body: { note },
        });

        if (error) {
          console.error("Error analyzing note:", error);
          addMessage("I encountered an error analyzing your note. Please try again later.", "assistant");
          setLoading(false);
          return;
        }

        console.log("Analysis response:", data);

        // Process the analysis response
        if (data && data.concepts && data.concepts.length > 0) {
          const mainTopic = data.mainTopic || "your topic";
          const concepts = (data.concepts || []).slice(0, 3).join(", ") || "various concepts";
          
          // Always set readyForExplanation to true if we have concepts
          const readyForExplanation = true;
          
          addMessage(
            `I analyzed your note on "${mainTopic}". I found interesting concepts like ${concepts}. You've written enough that I can provide a detailed explanation. Click on the "Explain!" button when it appears to learn more.`,
            "assistant"
          );
          
          // Store analysis with the note
          note.analysis = {
            noteId: note.id,
            mainTopic: data.mainTopic || "Topic",
            concepts: data.concepts || [],
            readyForExplanation: readyForExplanation,
            createdAt: new Date()
          };
        } else {
          // Not enough content for a full explanation
          addMessage(
            "Your note is still developing. Try adding more details or examples to get better insights.",
            "assistant"
          );
          
          // Store limited analysis
          if (data) {
            note.analysis = {
              noteId: note.id,
              mainTopic: data.mainTopic || "Topic",
              concepts: data.concepts || [],
              readyForExplanation: false,
              createdAt: new Date()
            };
          }
        }
      } catch (error) {
        console.error("Error calling Supabase function:", error);
        addMessage("I encountered an error analyzing your note. Please try again later.", "assistant");
        
        // Fallback analysis for development
        if (note.content.length > 50) {
          note.analysis = {
            noteId: note.id,
            mainTopic: "Error Analysis",
            concepts: ["Error"],
            readyForExplanation: true,
            createdAt: new Date()
          };
        }
      }
    } catch (error) {
      console.error("Error in analyze note:", error);
      addMessage("I encountered an error analyzing your note. Please try again later.", "assistant");
    } finally {
      setLoading(false);
    }
  },

  explainSnippet: async (snippet: string): Promise<string> => {
    const { addMessage, setLoading } = get();
    if (!snippet.trim()) return "";

    setLoading(true);
    addMessage(`Explaining: "${snippet.slice(0,40)}..."`, "assistant");

    try {
      const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
      let explanation = "";

      if (OPENAI_KEY) {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are an educational assistant. Respond with a concise explanation (3-4 sentences)." },
              { role: "user", content: `Explain the following snippet in easy language:\n\n${snippet}` }
            ],
            max_tokens: 150,
            temperature: 0.7
          })
        });

        const json = await res.json();
        explanation = json?.choices?.[0]?.message?.content?.trim() || "";
      }

      if (!explanation) {
        explanation = `This is a simulated explanation of the highlighted text. In production, this would be returned by your language model after analyzing the snippet: \n\n"${snippet}"`;
      }

      addMessage(explanation, "assistant");
      return explanation;
    } catch (err) {
      console.error("explainSnippet error", err);
      const fallback = `Sorry, I couldn't generate an explanation right now.`;
      addMessage(fallback, "assistant");
      return fallback;
    } finally {
      setLoading(false);
    }
  },

  explainForMiddleSchooler: async (snippet: string): Promise<string> => {
    const { addMessage, setLoading } = get();
    if (!snippet.trim()) return "";

    setLoading(true);
    addMessage(`Explaining for a middle schooler: "${snippet.slice(0,30)}..."`, "assistant");

    try {
      const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
      let explanation = "";

      if (OPENAI_KEY) {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a helpful teaching assistant for middle school students. Explain concepts in simple, engaging language a 12-year-old would understand. Use analogies and examples from everyday life. Avoid complex terminology." },
              { role: "user", content: `Explain this in a way a middle school student would understand:\n\n${snippet}` }
            ],
            max_tokens: 150,
            temperature: 0.7
          })
        });

        const json = await res.json();
        explanation = json?.choices?.[0]?.message?.content?.trim() || "";
      }

      if (!explanation) {
        explanation = `This is a simplified explanation for middle schoolers (simulated): ${snippet.slice(0, 50)}...`;
      }

      addMessage(explanation, "assistant");
      return explanation;
    } catch (err) {
      console.error("explainForMiddleSchooler error", err);
      const fallback = `Sorry, I couldn't generate a middle school explanation right now.`;
      addMessage(fallback, "assistant");
      return fallback;
    } finally {
      setLoading(false);
    }
  }
}));
