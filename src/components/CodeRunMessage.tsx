
import { useState } from "react";
import { Loader2, Play, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Table, Code, Terminal, BarChart } from "lucide-react";
import { Message } from "@/types";
import { Progress } from "@/components/ui/progress";
import CodeBlock from "@/components/CodeBlock";
import DataTable from "@/components/DataTable";
import CodeRunEventItem from "./CodeRunEventItem";
import { useCodeRunEvents } from "@/hooks/useCodeRunEvents";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

interface CodeRunMessageProps {
  message: Message;
  isStreaming: boolean;
}

const CodeRunMessage = ({ message, isStreaming }: CodeRunMessageProps) => {
  const [expanded, setExpanded] = useState(true);
  const [tablesExpanded, setTablesExpanded] = useState(true);
  const [eventsExpanded, setEventsExpanded] = useState(true);
  const [outputExpanded, setOutputExpanded] = useState(false);
  const [errorExpanded, setErrorExpanded] = useState(false);
  
  const { getEventsForMessage, isLoading } = useCodeRunEvents(message.chat_id || "");
  const events = getEventsForMessage(message.id);
  
  // Separate events into function calls and progress updates
  const functionCallEvents = events.filter(event => event.function_name !== null);
  const progressBarEvents = events.filter(event => event.n_progress !== null && event.n_total !== null);
  
  const hasEvents = events.length > 0;
  const hasFunctionCalls = functionCallEvents.length > 0;
  const hasProgressBars = progressBarEvents.length > 0;
  
  // Determine the code execution status
  const getExecutionStatus = () => {
    if (isStreaming) return "running";
    if (message.code_run_success === false) return "error";
    if (message.code_run_success === true) return "success";
    if (message.code_output_error) return "error";
    if (message.code_output) return "success";
    return "pending";
  };

  const status = getExecutionStatus();
  
  // Parse tables from message.code_output_tables if it exists
  const getTables = () => {
    if (!message.code_output_tables) return null;
    
    try {
      // If it's a string, parse it, otherwise use it directly
      const tables = typeof message.code_output_tables === 'string' 
        ? JSON.parse(message.code_output_tables) 
        : message.code_output_tables;
      
      return tables;
    } catch (error) {
      console.error("Error parsing code_output_tables:", error);
      return null;
    }
  };

  const tables = getTables();
  const hasTableData = tables && Object.keys(tables).length > 0;
  const hasOutput = !!message.code_output;
  const hasError = !!message.code_output_error;
  
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
        
        {status === 'running' && !hasProgressBars && (
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
          <div className="mb-2 text-sm">
            <strong>Command:</strong> {message.content || "Executing workflow..."}
          </div>
          
          {/* Progress Bars section - Only show if there are progress events */}
          {hasProgressBars && (
            <div className="mt-3 border-t pt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEventsExpanded(!eventsExpanded);
                }}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors mb-2"
              >
                {eventsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <BarChart className="w-4 h-4" />
                <span>Progress Updates</span>
                <span className="text-xs text-muted-foreground">({progressBarEvents.length})</span>
              </button>
              
              {eventsExpanded && (
                <div className="space-y-1 mt-2">
                  {progressBarEvents.map((event) => (
                    <CodeRunEventItem key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Function Calls section */}
          {hasFunctionCalls && (
            <div className="mt-3 border-t pt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEventsExpanded(!eventsExpanded);
                }}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors mb-2"
              >
                {eventsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <Code className="w-4 h-4" />
                <span>Function Calls</span>
                <span className="text-xs text-muted-foreground">({functionCallEvents.length})</span>
              </button>
              
              {eventsExpanded && (
                <div className="space-y-1 mt-2">
                  {functionCallEvents.map((event) => (
                    <CodeRunEventItem key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Show loading state when fetching events */}
          {isLoading && (
            <div className="mt-3 border-t pt-3">
              <div className="flex items-center gap-2 mb-3">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Loading events...</span>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          )}
          
          {/* Show a message if no events and not loading */}
          {!hasFunctionCalls && !hasProgressBars && !isLoading && (
            <div className="mt-3 border-t pt-3">
              <div className="text-sm text-muted-foreground italic px-2">
                No function calls or progress updates recorded yet
              </div>
            </div>
          )}
          
          {/* Code Output Section - Collapsible */}
          {hasOutput && (
            <div className="mt-3 border-t pt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOutputExpanded(!outputExpanded);
                }}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors mb-2"
              >
                {outputExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <Terminal className="w-4 h-4" />
                <span>Output</span>
              </button>
              
              {outputExpanded && (
                <div className="mt-2">
                  <CodeBlock code={message.code_output} language="plaintext" />
                </div>
              )}
            </div>
          )}
          
          {/* Error Output Section - Collapsible */}
          {hasError && (
            <div className="mt-3 border-t pt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setErrorExpanded(!errorExpanded);
                }}
                className="flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors mb-2"
              >
                {errorExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <AlertCircle className="w-4 h-4" />
                <span>Error</span>
              </button>
              
              {errorExpanded && (
                <div className="mt-2">
                  <CodeBlock code={message.code_output_error} language="plaintext" />
                </div>
              )}
            </div>
          )}
          
          {/* Tables output section */}
          {hasTableData && (
            <div className="mt-3 border-t pt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTablesExpanded(!tablesExpanded);
                }}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-foreground transition-colors mb-2"
              >
                {tablesExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <Table className="w-4 h-4" />
                <span>Result Tables</span>
              </button>
              
              {tablesExpanded && (
                <div className="space-y-4 mt-2">
                  {Object.entries(tables).map(([tableName, tableData], index) => (
                    <div key={`table-${index}`} className="border rounded-md overflow-hidden">
                      <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 font-medium text-sm border-b">
                        {tableName}
                      </div>
                      <div className="p-1">
                        <DataTable data={tableData as any[]} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {!message.code_output && !message.code_output_error && !hasTableData && events.length === 0 && status === 'running' && !isLoading && (
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
