
import { Loader2, AlertCircle, CheckCircle, Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CodeRunStatusProps {
  status: 'running' | 'error' | 'success' | 'pending';
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  hasProgressBars: boolean;
  isStreaming: boolean;
}

const CodeRunStatus = ({ 
  status, 
  expanded, 
  setExpanded, 
  hasProgressBars,
  isStreaming 
}: CodeRunStatusProps) => {
  return (
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
      
      {status === 'running' && !hasProgressBars && (
        <div className="ml-auto flex-1 max-w-32">
          <Progress value={isStreaming ? 70 : 100} className="h-2" />
        </div>
      )}
    </div>
  );
};

export default CodeRunStatus;
