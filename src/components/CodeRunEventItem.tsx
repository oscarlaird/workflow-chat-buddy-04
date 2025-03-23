
import { useState } from "react";
import { CodeRunEvent } from "@/hooks/useCodeRunEvents";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Code, ChevronDown, ChevronRight, BarChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";
import DataTable from "@/components/DataTable";
import { Progress } from "@/components/ui/progress";

interface CodeRunEventItemProps {
  event: CodeRunEvent;
}

const CodeRunEventItem = ({ event }: CodeRunEventItemProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [isOutputExpanded, setIsOutputExpanded] = useState(false);
  
  const hasInput = event.example_input && Object.keys(event.example_input).length > 0;
  const hasOutput = event.example_output !== null;
  const isProgressBar = event.n_total !== null && event.n_progress !== null;
  const isFunctionCall = event.function_name !== null;
  
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString();
  };
  
  const calculateProgressPercentage = () => {
    if (!isProgressBar) return 0;
    return Math.min(100, Math.round((event.n_progress! / event.n_total!) * 100));
  };
  
  const renderOutput = (output: any) => {
    if (output === null) return <div className="text-gray-500">No output available</div>;
    
    if (Array.isArray(output)) {
      return <DataTable data={output} />;
    }
    
    if (typeof output === 'object') {
      // Special case for _ret field which is typically a table
      if (output._ret && Array.isArray(output._ret)) {
        return <DataTable data={output._ret} />;
      }
      
      // For other objects, render as JSON
      return (
        <CodeBlock 
          code={JSON.stringify(output, null, 2)} 
          language="json" 
        />
      );
    }
    
    // For primitive values
    return <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">{String(output)}</div>;
  };
  
  // Different display for progress bars vs function calls
  if (isProgressBar) {
    return (
      <Card className="mb-2 overflow-hidden border-dashed">
        <CardHeader className="p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart className="h-4 w-4 text-blue-500" />
              <div className="font-medium text-sm">
                {event.progress_title || "Progress"}
              </div>
              <Badge variant="outline" className="text-xs py-0 h-5">
                {formatTime(event.created_at)}
              </Badge>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>{event.progress_title || "Progress"}</span>
              <span>{calculateProgressPercentage()}%</span>
            </div>
            <Progress value={calculateProgressPercentage()} className="h-1.5" />
          </div>
        </CardHeader>
      </Card>
    );
  }
  
  // Function call display (same as before with minor adjustments)
  return (
    <Card className="mb-2 overflow-hidden border-dashed">
      <CardHeader className="p-2 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-blue-500" />
            <div className="font-medium text-sm">
              {event.function_name || "Function call"}
            </div>
            <Badge variant="outline" className="text-xs py-0 h-5">
              {formatTime(event.created_at)}
            </Badge>
          </div>
          <div>
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent className="p-2 pt-0">
          {hasInput && (
            <div className="mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInputExpanded(!isInputExpanded);
                }}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors"
              >
                {isInputExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span>Inputs</span>
              </button>
              
              {isInputExpanded && (
                <div className="mt-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-900 animate-slide-in-bottom">
                  <CodeBlock 
                    code={JSON.stringify(event.example_input, null, 2)} 
                    language="json" 
                  />
                </div>
              )}
            </div>
          )}
          
          {hasOutput && (
            <div className="mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOutputExpanded(!isOutputExpanded);
                }}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors"
              >
                {isOutputExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <span>Output</span>
              </button>
              
              {isOutputExpanded && (
                <div className="mt-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-900 animate-slide-in-bottom">
                  {renderOutput(event.example_output)}
                </div>
              )}
            </div>
          )}
          
          {!hasInput && !hasOutput && (
            <div className="text-xs text-muted-foreground italic">
              No input or output data available
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default CodeRunEventItem;
