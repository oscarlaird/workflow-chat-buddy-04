
import { useState } from "react";
import { Run, RunMessage as RunMessageType } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Square, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RunMessageItem from "./RunMessageItem";
import { Badge } from "@/components/ui/badge";

interface RunBubbleProps {
  run: Run;
  messages: RunMessageType[];
}

export const RunBubble = ({ run, messages }: RunBubbleProps) => {
  const [isStopping, setIsStopping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleStopRun = async () => {
    if (!run.id || isStopping || !run.in_progress) return;
    
    setIsStopping(true);
    
    try {
      const { error } = await supabase
        .from('runs')
        .update({ 
          in_progress: false,
          status: 'Stopped by user'
        })
        .eq('id', run.id);
        
      if (error) {
        console.error('Error stopping run:', error);
        toast({
          title: "Error",
          description: "Failed to stop run: " + error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Run stopped successfully"
        });
      }
    } catch (err) {
      console.error('Exception when stopping run:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while stopping the run",
        variant: "destructive"
      });
    } finally {
      setIsStopping(false);
    }
  };

  const handleJumpToAgentWindow = () => {
    window.postMessage({
      type: 'JUMP_TO_AGENT_WINDOW',
      payload: {
        runId: run.id,
        chatId: run.chat_id
      }
    }, '*');
  };

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
            {run.in_progress && (
              <>
                <Button 
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-blue-500 hover:text-blue-600 border-blue-200 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={handleJumpToAgentWindow}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Jump to agent</span>
                </Button>
                <Button 
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-red-500 dark:text-red-400 hover:text-red-600 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={handleStopRun}
                  disabled={isStopping}
                >
                  {isStopping ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Square className="h-3.5 w-3.5" />
                  )}
                  <span>Stop</span>
                </Button>
              </>
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
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Messages</p>
                <span className="text-xs text-muted-foreground">{messages.length}</span>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {messages.map((message) => (
                  <RunMessageItem key={message.id} message={message} />
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
