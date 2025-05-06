
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/lib/chatStore";
import { useNoteStore } from "@/lib/store";
import { MessageSquare, X, SendHorizontal, Move } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent } from "../ui/sheet";

type PositionType = "bottom-right" | "bottom-left" | "top-right" | "top-left";

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
  const draggableRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Position state
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<PositionType>("bottom-right");
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
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

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!draggableRef.current) return;
    
    setIsDragging(true);
    const rect = draggableRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Calculate position based on window quadrants
  const determinePosition = (x: number, y: number): PositionType => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const isTop = y < windowHeight / 2;
    const isLeft = x < windowWidth / 2;
    
    if (isTop && isLeft) return "top-left";
    if (isTop && !isLeft) return "top-right";
    if (!isTop && isLeft) return "bottom-left";
    return "bottom-right";
  };
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const x = e.clientX - dragOffset.x;
      const y = e.clientY - dragOffset.y;
      
      setCoordinates({ x, y });
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return;
      
      setIsDragging(false);
      
      // Determine which corner to snap to
      const newPosition = determinePosition(e.clientX, e.clientY);
      setPosition(newPosition);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);
  
  // Generate position styles
  const getPositionStyles = () => {
    if (isDragging) {
      return {
        position: 'fixed',
        top: `${coordinates.y}px`,
        left: `${coordinates.x}px`,
        bottom: 'auto',
        right: 'auto',
        transform: 'none'
      } as React.CSSProperties;
    }
    
    // Default positions for each corner
    switch (position) {
      case "top-left":
        return { top: '1rem', left: '1rem', bottom: 'auto', right: 'auto' };
      case "top-right":
        return { top: '1rem', right: '1rem', bottom: 'auto', left: 'auto' };
      case "bottom-left":
        return { bottom: '1rem', left: '1rem', top: 'auto', right: 'auto' };
      case "bottom-right":
      default:
        return { bottom: '1rem', right: '1rem', top: 'auto', left: 'auto' };
    }
  };

  // Mobile view using Sheet component
  if (isMobile && isOpen) {
    return (
      <>
        <Sheet open={true} onOpenChange={toggleChat}>
          <SheetContent side="bottom" className="h-[80vh] p-0">
            <div className="flex flex-col h-full">
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
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="fixed bottom-4 right-4 z-50">
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
        </div>
      </>
    );
  }
  
  return (
    <div 
      className="fixed z-50" 
      style={getPositionStyles()} 
      ref={draggableRef}
    >
      {isOpen ? (
        <Card className={cn(
          "w-80 sm:w-96 shadow-lg flex flex-col h-[450px] animate-in fade-in-0 duration-200",
          isDragging ? "cursor-grabbing opacity-90" : "opacity-100"
        )}>
          <div className="flex items-center justify-between border-b p-3 relative">
            <div 
              className="flex items-center gap-2 cursor-grab flex-1"
              onMouseDown={handleMouseDown}
            >
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Note Assistant</h3>
              <Move className="h-4 w-4 text-muted-foreground ml-2" />
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleChat} 
              className="h-8 w-8 relative z-10"
            >
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
