
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ChatMessageRole, ChatState, Note } from '@/types';

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
  
  analyzeNote: (note: Note) => {
    const { addMessage, setLoading } = get();
    
    // Skip if no note or no content
    if (!note || !note.content.trim()) return;
    
    setLoading(true);
    
    // Simulate the LLM analyzing the note
    setTimeout(() => {
      // Generate some basic analysis based on note content
      const contentLength = note.content.length;
      let response = "";
      
      if (contentLength === 0) {
        response = "Your note is empty. Would you like some ideas to get started?";
      } else if (contentLength < 50) {
        response = "Your note is quite brief. Consider expanding on the main points with more details or examples.";
      } else {
        // Extract potential keywords from content
        const words = note.content.split(/\s+/).filter(word => word.length > 4);
        const randomWord = words[Math.floor(Math.random() * words.length)] || 'topic';
        
        const suggestions = [
          `I noticed you're writing about "${randomWord}". Have you considered exploring how this relates to other aspects of your project?`,
          `Your note has good detail. To make it even better, you could add some structure with headings or bullet points.`,
          `This looks like an interesting note! Consider adding some actionable next steps based on this information.`,
          `I see potential for expanding on the "${randomWord}" concept. Would you like me to suggest some related ideas?`
        ];
        
        response = suggestions[Math.floor(Math.random() * suggestions.length)];
      }
      
      addMessage(response, "assistant");
      setLoading(false);
    }, 1500);
  }
}));
