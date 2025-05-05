
import { useState, useRef, useEffect } from "react";
import { useChatStore } from "@/lib/chatStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, X, Minimize, Send, Sparkles } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { cn } from "@/lib/utils";

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, addMessage, clearMessages } = useChatStore();
  
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    // Add user message to chat
    addMessage({
      id: Date.now().toString(),
      content: message,
      role: "user",
      timestamp: new Date()
    });
    
    setMessage("");
    setIsLoading(true);
    
    try {
      // Simulate API call (replace with actual LLM API call)
      setTimeout(() => {
        addMessage({
          id: (Date.now() + 1).toString(),
          content: "This is a simulated response from the AI. In a real implementation, this would be a response from an LLM API like OpenAI.",
          role: "assistant",
          timestamp: new Date()
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsLoading(false);
      
      // Add error message
      addMessage({
        id: (Date.now() + 1).toString(),
        content: "Sorry, I couldn't process your request. Please try again.",
        role: "assistant",
        timestamp: new Date(),
        isError: true
      });
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary text-white z-50 hover:bg-primary/90"
        aria-label="Open AI Chat"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }
  
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col w-80 sm:w-96 h-[500px] max-h-[80vh] rounded-lg shadow-xl border border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2 font-medium">
          <Sparkles className="h-4 w-4 text-primary" />
          <span>AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
            aria-label="Minimize"
          >
            <Minimize className="h-4 w-4" />
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-8 w-8"
            onClick={clearMessages}
            aria-label="Clear chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
              <Sparkles className="h-8 w-8 mb-2 text-primary/50" />
              <p>How can I help you with your notes today?</p>
              <div className="mt-2 text-sm">
                <p>Try asking questions like:</p>
                <ul className="mt-1">
                  <li className="mt-1">• Summarize my current note</li>
                  <li className="mt-1">• Generate content ideas</li>
                  <li className="mt-1">• Help me brainstorm</li>
                </ul>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))
          )}
          {isLoading && (
            <div className="flex justify-center py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0s" }}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[40px] max-h-[120px] resize-none"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!message.trim() || isLoading}
            className={cn(
              "flex-shrink-0 h-10 w-10",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
