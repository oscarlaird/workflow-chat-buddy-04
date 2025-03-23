
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Message } from "@/types";
import { Skeleton } from "./ui/skeleton";
import { CodeRunEvent } from "@/hooks/useCodeRunEvents";
import CodeRunStatus from "./CodeRunStatus";
import CodeRunOutput from "./CodeRunOutput";
import CodeRunError from "./CodeRunError";
import CodeRunTables from "./CodeRunTables";
import CodeRunEventsList from "./CodeRunEventsList";

interface CodeRunMessageProps {
  message: Message;
  isStreaming: boolean;
  codeRunEvents?: CodeRunEvent[];
}

const CodeRunMessage = ({ message, isStreaming, codeRunEvents = [] }: CodeRunMessageProps) => {
  const [expanded, setExpanded] = useState(true);
  const [tablesExpanded, setTablesExpanded] = useState(true);
  const [outputExpanded, setOutputExpanded] = useState(false);
  const [errorExpanded, setErrorExpanded] = useState(false);
  
  // Track which type of events are expanded
  const [functionCallsExpanded, setFunctionCallsExpanded] = useState(true);
  const [progressBarsExpanded, setProgressBarsExpanded] = useState(true);
  
  // Separate events into function calls and progress updates
  const functionCallEvents = codeRunEvents.filter(event => event.function_name !== null);
  const progressBarEvents = codeRunEvents.filter(event => event.n_progress !== null && event.n_total !== null);
  
  const hasEvents = codeRunEvents.length > 0;
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
            events={codeRunEvents}
            hasFunctionCalls={hasFunctionCalls}
            hasProgressBars={hasProgressBars}
            functionCallEvents={functionCallEvents}
            progressBarEvents={progressBarEvents}
            functionCallsExpanded={functionCallsExpanded}
            progressBarsExpanded={progressBarsExpanded}
            setFunctionCallsExpanded={setFunctionCallsExpanded}
            setProgressBarsExpanded={setProgressBarsExpanded}
          />
          
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
          
          {!message.code_output && !message.code_output_error && !hasTableData && codeRunEvents.length === 0 && status === 'running' && (
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
