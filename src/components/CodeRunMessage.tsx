
import { useState } from "react";
import { Loader2, Play, AlertCircle, CheckCircle } from "lucide-react";
import { Message } from "@/types";
import { Progress } from "@/components/ui/progress";
import CodeBlock from "@/components/CodeBlock";

interface CodeRunMessageProps {
  message: Message;
  isStreaming: boolean;
}

const CodeRunMessage = ({ message, isStreaming }: CodeRunMessageProps) => {
  const [expanded, setExpanded] = useState(true);
  
  // Determine the code execution status
  const getExecutionStatus = () => {
    if (isStreaming) return "running";
    if (message.code_output_error) return "error";
    if (message.code_output) return "success";
    return "pending";
  };

  const status = getExecutionStatus();
  
  return (
    <div className="max-w-[80%] w-full space-y-2">
      {/* Status header */}
      <div 
        className={`flex items-center gap-2 px-4 py-3 rounded-t-lg cursor-pointer ${
          expanded ? 'border-b border-border' : 'rounded-b-lg'
        } ${
          status === 'error' 
            ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
            : status === 'success'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        {status === 'running' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status === 'error' ? (
          <AlertCircle className="h-4 w-4" />
        ) : status === 'success' ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        
        <div className="font-medium">
          {status === 'running' ? 'Running Code...' : 
           status === 'error' ? 'Code Execution Failed' : 
           status === 'success' ? 'Code Execution Completed' : 
           'Preparing to Run Code'}
        </div>
        
        {status === 'running' && (
          <div className="ml-auto flex-1 max-w-32">
            <Progress value={isStreaming ? 70 : 100} className="h-2" />
          </div>
        )}
      </div>
      
      {/* Content area with output and errors */}
      {expanded && (
        <div className={`px-4 py-3 rounded-b-lg bg-muted/50 ${
          status === 'error' ? 'border-l-2 border-red-500' : 
          status === 'success' ? 'border-l-2 border-green-500' : ''
        }`}>
          {message.content && (
            <div className="mb-2 text-sm">
              <strong>Command:</strong> {message.content || "Executing workflow..."}
            </div>
          )}
          
          {!message.content && (
            <div className="mb-2 text-sm">
              <strong>Command:</strong> Executing workflow...
            </div>
          )}
          
          {message.code_output && (
            <div className="mt-3">
              <div className="text-xs text-muted-foreground mb-1">Output:</div>
              <CodeBlock code={message.code_output} language="plaintext" />
            </div>
          )}
          
          {message.code_output_error && (
            <div className="mt-3">
              <div className="text-xs text-red-500 mb-1">Error:</div>
              <CodeBlock code={message.code_output_error} language="plaintext" />
            </div>
          )}
          
          {!message.code_output && !message.code_output_error && status === 'running' && (
            <div className="py-2 text-sm text-muted-foreground italic">
              Executing code, please wait...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CodeRunMessage;
