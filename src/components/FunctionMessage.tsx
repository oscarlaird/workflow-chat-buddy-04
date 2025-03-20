
import { PenLine, Trash2, Plus, Film } from "lucide-react";
import { Message } from "@/types";

interface FunctionMessageProps {
  message: Message;
  isStreaming: boolean;
}

export const FunctionMessage = ({ message, isStreaming }: FunctionMessageProps) => {
  const formatFunctionName = (name: string): string => {
    if (!name) return "";
    
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const getFunctionIcon = (functionName: string) => {
    if (!functionName) return <PenLine className="h-4 w-4" />;
    
    const normalizedName = functionName.toLowerCase();
    
    if (normalizedName.includes('insert_workflow_step') || normalizedName.includes('add_workflow_step')) {
      return <Plus className="h-4 w-4" />;
    }
    
    if (normalizedName.includes('remove_workflow_step') || normalizedName.includes('delete_workflow_step')) {
      return <Trash2 className="h-4 w-4" />;
    }
    
    if (normalizedName === 'screen_recording') {
      return <Film className="h-4 w-4" />;
    }
    
    return <PenLine className="h-4 w-4" />;
  };

  // If this is a screen recording message, we'll handle it in MessageList
  if (message.function_name === "screen_recording") {
    return null;
  }

  const formattedName = formatFunctionName(message.function_name || "");
  const functionIcon = getFunctionIcon(message.function_name || "");
  
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-800 dark:text-blue-300">
      {functionIcon}
      <div className="flex items-center gap-1.5">
        <span className="font-medium">{formattedName}</span>
        {isStreaming && (
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-[pulse_1s_ease-in-out_infinite]"></span>
        )}
      </div>
      {message.content && (
        <div className="ml-2 text-sm opacity-80">
          {message.content}
        </div>
      )}
    </div>
  );
};

export default FunctionMessage;
