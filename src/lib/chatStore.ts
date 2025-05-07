
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatMessageRole, ChatState, Note } from '@/types';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client ONLY if environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a dummy client or real client based on whether we have credentials
let supabase: ReturnType<typeof createClient> | null = null;

// Only create the client if we have the required credentials
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase client initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    supabase = null;
  }
} else {
  console.warn("Supabase environment variables are missing. Supabase functionality will be limited.");
}

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
        addMessage("I'm not connected to the backend yet. You'll need to connect to Supabase for full functionality. For now, I'll provide a simulated response.", "assistant");
        
        // Simulate analysis response after a short delay
        setTimeout(() => {
          if (note.content.length > 50) {
            addMessage(
              `I've analyzed your note (simulation). It looks like you're writing about an interesting topic. You've written enough that I would normally provide a detailed explanation. In a real setup with Supabase, you'd see an "Explain!" button appear.`,
              "assistant"
            );
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
      
      const { data, error } = await supabase.functions.invoke('analyze-note', {
        body: { note },
      });

      if (error) {
        console.error("Error analyzing note:", error);
        addMessage("I encountered an error analyzing your note. Please try again later.", "assistant");
        setLoading(false);
        return;
      }

      // Process the analysis response
      if (data && data.readyForExplanation) {
        const mainTopic = data.mainTopic || "your topic";
        const concepts = (data.concepts || []).slice(0, 3).join(", ") || "various concepts";
        
        addMessage(
          `I analyzed your note on "${mainTopic}". I found interesting concepts like ${concepts}. You've written enough that I can provide a detailed explanation. Click on the "Explain!" button when it appears to learn more.`,
          "assistant"
        );
        
        // Store analysis with the note
        note.analysis = {
          noteId: note.id,
          mainTopic: data.mainTopic,
          concepts: data.concepts,
          readyForExplanation: true,
          createdAt: new Date()
        };
      } else {
        // Not enough content for a full explanation
        addMessage(
          "Your note is still developing. Try adding more details or examples to get better insights.",
          "assistant"
        );
      }
    } catch (error) {
      console.error("Error in analyze note:", error);
      addMessage("I encountered an error analyzing your note. Please try again later.", "assistant");
    } finally {
      setLoading(false);
    }
  }
}));
