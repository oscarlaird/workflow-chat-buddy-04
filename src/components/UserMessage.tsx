
import { Loader2 } from "lucide-react";
import { Message } from "@/types";

interface UserMessageProps {
  message: Message;
  isStreaming: boolean;
  isPending: boolean;
}

export const UserMessage = ({ message, isStreaming, isPending }: UserMessageProps) => {
  const formatMessageContent = (content: string, isStreaming: boolean) => {
    if (!content) return null;
    
    const lines = content.split('\n');
    return (
      <>
        {lines.map((line, index) => {
          const isLastLine = index === lines.length - 1;
          
          return (
            <p key={index} className={index > 0 ? "mt-1" : ""}>
              {line || " "}
              {isStreaming && isLastLine && (
                <span className="inline-block w-1.5 h-3 bg-black dark:bg-white opacity-70 ml-0.5 rounded-sm animate-pulse"></span>
              )}
            </p>
          );
        })}
      </>
    );
  };

  return (
    <div 
      className={`relative max-w-[80%] px-4 py-3 rounded-lg ${
        message.role === "user" 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted"
      }`}
    >
      {message.content ? (
        formatMessageContent(
          message.content, 
          message.role === "assistant" && isStreaming
        )
      ) : (
        <p> </p>
      )}
      
      {isPending && (
        <div className="mt-2 flex items-center gap-1.5 text-xs opacity-70">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Sending...</span>
        </div>
      )}
    </div>
  );
};

export default UserMessage;
