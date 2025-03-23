
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Message } from "@/types";
import { Skeleton } from "./ui/skeleton";
import { useCodeRunEvents } from "@/hooks/useCodeRunEvents";
import CodeRunStatus from "./CodeRunStatus";
import CodeRunOutput from "./CodeRunOutput";
import CodeRunError from "./CodeRunError";
import CodeRunTables from "./CodeRunTables";

interface CodeRunMessageProps {
  message: Message;
  isStreaming: boolean;
  codeRunEventsData?: ReturnType<typeof useCodeRunEvents>;
}

const CodeRunMessage = ({ message, isStreaming, codeRunEventsData }: CodeRunMessageProps) => {
  const [expanded, setExpanded] = useState(true);
  const [tablesExpanded, setTablesExpanded] = useState(true);
  const [outputExpanded, setOutputExpanded] = useState(false);
  const [errorExpanded, setErrorExpanded] = useState(false);
  
  // Track which type of events are expanded
  const [functionCallsExpanded, setFunctionCallsExpanded] = useState(true);
  const [progressBarsExpanded, setProgressBarsExpanded] = useState(true);
  
  // Use the parent's code run events data if provided, otherwise create our own
  const localCodeRunEvents = useCodeRunEvents(message.chat_id || "");
  const { codeRunEvents, browserEvents, isLoading } = codeRunEventsData || localCodeRunEvents;
  
  // Filter events for this message
  const messageEvents = codeRunEvents.filter(event => event.message_id === message.id);
  
  // Separate events into function calls and progress updates
  const functionCallEvents = messageEvents.filter(event => event.function_name !== null);
  const progressBarEvents = messageEvents.filter(event => event.n_progress !== null && event.n_total !== null);
  
  const hasEvents = messageEvents.length > 0;
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
            <strong>Command:</strong> {message.content || "Executing code..."}
          </div>
          
          {/* Events Display */}
          {hasEvents && (
            <div className="mt-3 border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium flex items-center gap-1.5">
                  <span>Code Run Events</span>
                  {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                </div>
                <Badge variant="outline">{messageEvents.length}</Badge>
              </div>
              
              <div className="space-y-2">
                {functionCallEvents.length > 0 && (
                  <div className="space-y-1">
                    <button 
                      className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setFunctionCallsExpanded(!functionCallsExpanded)}
                    >
                      {functionCallsExpanded ? 
                        <ChevronDown className="h-3.5 w-3.5" /> : 
                        <ChevronRight className="h-3.5 w-3.5" />}
                      Function Calls ({functionCallEvents.length})
                    </button>
                    
                    {functionCallsExpanded && (
                      <div className="pl-4 space-y-2">
                        {functionCallEvents.map(event => (
                          <div key={event.id} className="text-xs p-2 border rounded">
                            <div className="font-medium">{event.function_name}</div>
                            {event.description && (
                              <div className="text-muted-foreground mt-1">{event.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {progressBarEvents.length > 0 && (
                  <div className="space-y-1">
                    <button 
                      className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setProgressBarsExpanded(!progressBarsExpanded)}
                    >
                      {progressBarsExpanded ? 
                        <ChevronDown className="h-3.5 w-3.5" /> : 
                        <ChevronRight className="h-3.5 w-3.5" />}
                      Progress Updates ({progressBarEvents.length})
                    </button>
                    
                    {progressBarsExpanded && (
                      <div className="pl-4 space-y-2">
                        {progressBarEvents.map(event => (
                          <div key={event.id} className="text-xs p-2 border rounded">
                            <div className="font-medium">{event.progress_title || "Progress"}</div>
                            <div className="flex justify-between mt-1">
                              <span>{event.n_progress} / {event.n_total}</span>
                              <span>{Math.round((event.n_progress / event.n_total) * 100)}%</span>
                            </div>
                            <Progress 
                              value={(event.n_progress / event.n_total) * 100} 
                              className="h-1 mt-1" 
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
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
          {!hasEvents && !isLoading && (
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
          
          {!message.code_output && !message.code_output_error && !hasTableData && !hasEvents && status === 'running' && !isLoading && (
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
