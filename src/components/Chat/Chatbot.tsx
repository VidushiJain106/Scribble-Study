
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/lib/chatStore";
import { useNoteStore } from "@/lib/store";
import { MessageSquare, X, SendHorizontal } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { cn } from "@/lib/utils";

export function Chatbot() {
  const { 
    messages, 
    isOpen, 
    hasNewMessage, 
    isLoading, 
    toggleChat, 
    addMessage, 
    markAsRead,
    analyzeNote
  } = useChatStore();
  
  const [input, setInput] = useState("");
  const activeNoteId = useNoteStore(state => state.activeNoteId);
  const notes = useNoteStore(state => state.notes);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);
  
  // Analyze note when active note changes
  useEffect(() => {
    if (!activeNoteId) return;
    
    const activeNote = notes.find(note => note.id === activeNoteId);
    if (activeNote) {
      analyzeNote(activeNote);
    }
  }, [activeNoteId, notes, analyzeNote]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    addMessage(input, "user");
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      addMessage("I'm processing your request. Let me think about that...", "assistant");
    }, 800);
  };
  
  const handleOpen = () => {
    toggleChat();
    if (!isOpen) {
      markAsRead();
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-80 sm:w-96 shadow-lg flex flex-col h-[450px] animate-in fade-in-0 slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b p-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Note Assistant</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-muted rounded-lg px-3 py-2 max-w-[80%]">
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce delay-150" />
                    <div className="h-2 w-2 rounded-full bg-foreground/40 animate-bounce delay-300" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="border-t p-3">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                <SendHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Button
          onClick={handleOpen}
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg relative"
        >
          <MessageSquare className="h-6 w-6" />
          {hasNewMessage && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive animate-pulse" />
          )}
        </Button>
      )}
    </div>
  );
}
