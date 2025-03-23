
import { PenLine } from "lucide-react";
import { Message } from "@/types";

interface FunctionMessageProps {
  message: Message;
  isStreaming: boolean;
}

export const FunctionMessage = ({ message, isStreaming }: FunctionMessageProps) => {
  // We'll use message.content to determine what to display
  const getDisplayText = () => {
    if (!message.content) return "Function";
    
    // Return the first sentence or the whole content if it's short
    const firstSentence = message.content.split('.')[0];
    return firstSentence.length < 30 ? firstSentence : firstSentence.substring(0, 30) + '...';
  };

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-800 dark:text-blue-300">
      <PenLine className="h-4 w-4" />
      <div className="flex items-center gap-1.5">
        <span className="font-medium">{getDisplayText()}</span>
        {isStreaming && (
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-[pulse_1s_ease-in-out_infinite]"></span>
        )}
      </div>
      {message.content && message.content.length > 30 && (
        <div className="ml-2 text-sm opacity-80">
          {message.content.substring(30)}
        </div>
      )}
    </div>
  );
};

export default FunctionMessage;
