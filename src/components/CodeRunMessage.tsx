
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Message } from "@/types";
import { Skeleton } from "./ui/skeleton";
import { useCodeRunEvents } from "@/hooks/useCodeRunEvents";
import CodeRunStatus from "./CodeRunStatus";
import CodeRunOutput from "./CodeRunOutput";
import CodeRunError from "./CodeRunError";
import CodeRunTables from "./CodeRunTables";
import CodeRunEventsList from "./CodeRunEventsList";

interface CodeRunMessageProps {
  message: Message;
  isStreaming: boolean;
}

const CodeRunMessage = ({ message, isStreaming }: CodeRunMessageProps) => {
  const [expanded, setExpanded] = useState(true);
  const [tablesExpanded, setTablesExpanded] = useState(true);
  const [outputExpanded, setOutputExpanded] = useState(false);
  const [errorExpanded, setErrorExpanded] = useState(false);
  
  // Track which type of events are expanded
  const [functionCallsExpanded, setFunctionCallsExpanded] = useState(true);
  const [progressBarsExpanded, setProgressBarsExpanded] = useState(true);
  
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
      <CodeRunStatus 
        status={status} 
        expanded={expanded} 
        setExpanded={setExpanded}
        hasProgressBars={hasProgressBars}
        isStreaming={isStreaming}
      />
      
      {/* Content area with output and errors */}
      {expanded && (
        <div className={`px-4 py-3 rounded-b-lg bg-muted/50 ${
          status === 'error' ? 'border-l-2 border-red-500' : 
          status === 'success' ? 'border-l-2 border-green-500' : ''
        }`}>
          <div className="mb-2 text-sm">
            <strong>Command:</strong> {message.content || "Executing workflow..."}
          </div>
          
          {/* Events Section */}
          <CodeRunEventsList 
            events={events}
            hasFunctionCalls={hasFunctionCalls}
            hasProgressBars={hasProgressBars}
            functionCallEvents={functionCallEvents}
            progressBarEvents={progressBarEvents}
            functionCallsExpanded={functionCallsExpanded}
            progressBarsExpanded={progressBarsExpanded}
            setFunctionCallsExpanded={setFunctionCallsExpanded}
            setProgressBarsExpanded={setProgressBarsExpanded}
          />
          
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
          
          {/* Code Output Section */}
          <CodeRunOutput 
            hasOutput={hasOutput}
            output={message.code_output || ""}
            outputExpanded={outputExpanded}
            setOutputExpanded={setOutputExpanded}
          />
          
          {/* Error Output Section */}
          <CodeRunError 
            hasError={hasError}
            error={message.code_output_error || ""}
            errorExpanded={errorExpanded}
            setErrorExpanded={setErrorExpanded}
          />
          
          {/* Tables output section */}
          <CodeRunTables 
            hasTableData={hasTableData}
            tables={tables || {}}
            tablesExpanded={tablesExpanded}
            setTablesExpanded={setTablesExpanded}
          />
          
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
