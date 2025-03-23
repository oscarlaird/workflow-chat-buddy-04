
import { useState, useEffect } from "react";
import { Loader2, ChevronDown, ChevronRight, AlertCircle, CheckCircle, Play } from "lucide-react";
import { Message } from "@/types";
import { Skeleton } from "./ui/skeleton";
import { useCodeRunEvents } from "@/hooks/useCodeRunEvents";
import CodeRunOutput from "./CodeRunOutput";
import CodeRunError from "./CodeRunError";
import CodeRunTables from "./CodeRunTables";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import CodeRunEventItem from "./CodeRunEventItem";
import { ScrollArea } from "./ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

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
  const [eventsExpanded, setEventsExpanded] = useState(true);
  const [localEvents, setLocalEvents] = useState<any[]>([]);
  
  // Use the parent's code run events data if provided, otherwise create our own
  const localCodeRunEvents = useCodeRunEvents(message.chat_id || "");
  const { codeRunEvents, browserEvents, isLoading, getEventsForMessage, refreshCodeRunEvents } = codeRunEventsData || localCodeRunEvents;
  
  // Filter events for this message
  const messageEvents = codeRunEvents.filter(event => 
    event.message_id === message.id
  );

  // Set up a real-time subscription for this specific message
  useEffect(() => {
    if (!message.id || !message.chat_id) return;
    
    // Initial events fetch
    refreshCodeRunEvents();
    
    // Subscribe to new coderun_events for this specific message
    const channel = supabase
      .channel(`coderun_message:${message.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'coderun_events',
        filter: `message_id=eq.${message.id}`
      }, (payload) => {
        console.log('New coderun event for message:', payload);
        refreshCodeRunEvents();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [message.id, message.chat_id, refreshCodeRunEvents]);
  
  const hasEvents = messageEvents.length > 0;
  
  // Filter and sort events by type (progress bars first, then function calls)
  const progressEvents = messageEvents.filter(event => event.n_total !== null && event.n_progress !== null);
  const functionEvents = messageEvents.filter(event => !(event.n_total !== null && event.n_progress !== null));
  const sortedMessageEvents = [...progressEvents, ...functionEvents];
  
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
  
  // Create a new status header that replaces the CodeRunStatus component
  const renderStatusHeader = () => {
    const statusClasses = 
      status === 'error' 
        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
        : status === 'success'
          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';

    return (
      <div 
        className={`flex items-center gap-2 px-4 py-3 rounded-t-lg cursor-pointer ${
          expanded ? 'border-b border-border' : 'rounded-b-lg'
        } ${statusClasses}`}
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
        
        {status === 'running' && messageEvents.length === 0 && (
          <div className="ml-auto flex-1 max-w-32">
            <Progress value={isStreaming ? 70 : 100} className="h-2" />
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="max-w-[80%] w-full space-y-2">
      {/* Status header */}
      {renderStatusHeader()}
      
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
                <button
                  onClick={() => setEventsExpanded(!eventsExpanded)}
                  className="text-sm font-medium flex items-center gap-1.5"
                >
                  {eventsExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  <span>Code Run Events</span>
                  {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                </button>
                <Badge variant="outline">{messageEvents.length}</Badge>
              </div>
              
              {eventsExpanded && (
                <ScrollArea className="h-[calc(100vh*0.4)] rounded-md border" type="auto">
                  <div className="space-y-2 p-2">
                    {sortedMessageEvents.map((event) => (
                      <CodeRunEventItem
                        key={event.id}
                        event={event}
                        browserEvents={browserEvents[event.id] || []}
                      />
                    ))}
                  </div>
                </ScrollArea>
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
