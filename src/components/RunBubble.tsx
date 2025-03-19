
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Run, RunMessage as RunMessageType } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RunMessageItem from "./RunMessageItem";

interface RunBubbleProps {
  run: Run;
  messages: RunMessageType[];
  isLatestRun?: boolean;
}

export const RunBubble = ({ run, messages, isLatestRun = false }: RunBubbleProps) => {
  const [isExpanded, setIsExpanded] = useState(isLatestRun);
  const location = useLocation();

  useEffect(() => {
    // When the isLatestRun prop changes, update the expanded state
    setIsExpanded(isLatestRun);
  }, [isLatestRun]);

  const handleJumpToAgentWindow = () => {
    window.postMessage({
      type: 'JUMP_TO_AGENT_WINDOW',
      payload: {
        runId: run.id,
        chatId: run.chat_id
      }
    }, '*');
  };

  // Check if we're on the workflow route
  const isWorkflowRoute = location.pathname.startsWith('/workflow');

  return (
    <Card className="w-full max-w-lg border-blue-200 dark:border-blue-800 bg-gradient-to-b from-blue-50/80 to-blue-50/30 dark:from-blue-950/30 dark:to-blue-950/10 backdrop-blur-sm">
      <CardHeader className="py-3 space-y-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className={`h-3 w-3 rounded-full ${
                run.in_progress 
                  ? "bg-amber-500 animate-pulse" 
                  : "bg-green-500"
              }`} 
            />
            <Badge variant={run.in_progress ? "secondary" : "outline"} className="font-medium">
              {run.in_progress ? "Running" : "Completed"}
            </Badge>
            <span className="text-xs text-muted-foreground ml-1">
              #{run.id.slice(0, 8)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {run.in_progress && !isWorkflowRoute && (
              <Button 
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-blue-500 hover:text-blue-600 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={handleJumpToAgentWindow}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Jump to agent</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-medium">Status: {run.status}</p>
          <span className="text-xs text-muted-foreground">
            {new Date(run.created_at).toLocaleString()}
          </span>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0 pb-3">
          {messages.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">Messages</p>
                <span className="text-xs text-muted-foreground">{messages.length}</span>
              </div>
              <div className="max-h-[300px] overflow-y-auto pr-1">
                {messages.map((message, index) => (
                  <RunMessageItem 
                    key={message.id} 
                    message={message} 
                    isLast={index === messages.length - 1} 
                  />
                ))}
              </div>
            </div>
          )}
          
          {messages.length === 0 && (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
              No messages available
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default RunBubble;
