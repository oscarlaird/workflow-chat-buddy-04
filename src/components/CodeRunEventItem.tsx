
import { useState } from "react";
import { BrowserEvent, CodeRunEvent } from "@/types";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Code, ChevronDown, ChevronRight, BarChart, Database, ArrowDownUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";
import DataTable from "@/components/DataTable";
import { Progress } from "@/components/ui/progress";
import { cn, formatFieldName } from "@/lib/utils";
import { InputFieldIcon } from "@/components/InputField";
import { inferFieldType } from "@/hooks/useSelectedChatSettings";

interface CodeRunEventItemProps {
  event: CodeRunEvent;
  browserEvents: BrowserEvent[];
}

const CodeRunEventItem = ({ event, browserEvents }: CodeRunEventItemProps) => {
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
    if (event.n_total === 0) return 100; // Prevent division by zero
    return Math.min(100, Math.round((event.n_progress! / event.n_total!) * 100));
  };
  
  // Function to infer field types from input data
  const inferInputFields = (inputData: Record<string, any>) => {
    if (!inputData) return [];
    
    return Object.entries(inputData).map(([fieldName, value]) => ({
      field_name: fieldName,
      type: inferFieldType(fieldName, value)
    }));
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
      
      // For other objects, render as formatted items
      return (
        <div className="space-y-3">
          {Object.entries(output).map(([key, value]) => (
            <div key={key} className="border rounded-md p-3">
              <div className="font-medium text-sm mb-1">{formatFieldName(key)}</div>
              {renderOutput(value)}
            </div>
          ))}
        </div>
      );
    }
    
    // For primitive values
    return <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">{String(output)}</div>;
  };
  
  // Different display for progress bars vs function calls
  if (isProgressBar) {
    const progressPercent = calculateProgressPercentage();
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
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        </CardHeader>
      </Card>
    );
  }
  
  // Function call display - enhanced to match workflow display
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
                <Database className="w-4 h-4" />
                <span>Inputs</span>
              </button>
              
              {isInputExpanded && (
                <div className="mt-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-900 animate-slide-in-bottom">
                  {/* Enhanced input display similar to workflow */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(event.example_input || {}).map(([fieldName, value]) => {
                      const fieldType = inferFieldType(fieldName, value);
                      
                      return (
                        <div key={fieldName} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <InputFieldIcon type={fieldType} className="text-gray-500" />
                            <label className="text-sm font-medium">
                              {formatFieldName(fieldName)}
                              <span className="ml-2 text-xs text-gray-500">({fieldType})</span>
                            </label>
                          </div>
                          
                          {/* Render value based on type */}
                          {fieldType === 'table' && Array.isArray(value) ? (
                            <div className="border rounded">
                              <DataTable data={value} />
                            </div>
                          ) : typeof value === 'boolean' ? (
                            <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                              {value ? 'true' : 'false'}
                            </div>
                          ) : typeof value === 'object' && value !== null ? (
                            <CodeBlock code={JSON.stringify(value, null, 2)} language="json" />
                          ) : (
                            <div className="font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                              {String(value)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
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
                <ArrowDownUp className="w-4 h-4" />
                <span>Output</span>
              </button>
              
              {isOutputExpanded && (
                <div className="mt-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-900 animate-slide-in-bottom">
                  {renderOutput(event.example_output)}
                </div>
              )}
            </div>
          )}
          
          {browserEvents.length > 0 && (
            <div className="mt-3 border-t pt-3">
              <div className="text-sm font-medium mb-2">Browser Events</div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {browserEvents.map((browserEvent) => (
                  <div key={browserEvent.id} className="p-2 border rounded">
                    {browserEvent.display_text}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!hasInput && !hasOutput && browserEvents.length === 0 && (
            <div className="text-xs text-muted-foreground italic">
              No input, output, or browser event data available
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default CodeRunEventItem;
