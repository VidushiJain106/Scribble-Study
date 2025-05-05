
import { cn } from "@/lib/utils";
import { Message } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const timestamp = formatDistanceToNow(new Date(message.timestamp), { addSuffix: true });
  
  return (
    <div className={cn(
      "flex",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "rounded-lg px-4 py-2 max-w-[85%]",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted",
        message.isError && "bg-destructive/10 text-destructive border border-destructive/20"
      )}>
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div className={cn(
          "text-xs mt-1 text-right",
          isUser ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {timestamp}
        </div>
      </div>
    </div>
  );
}
