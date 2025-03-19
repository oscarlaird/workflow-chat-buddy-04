
import { useEffect, useState } from "react";
import { Run, RunMessage as RunMessageType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface RunMessageProps {
  runId: string;
}

export const RunMessage = ({ runId }: RunMessageProps) => {
  const [run, setRun] = useState<Run | null>(null);
  const [runMessages, setRunMessages] = useState<RunMessageType[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch run and run messages data
  useEffect(() => {
    const fetchRunData = async () => {
      try {
        // Fetch run data
        const { data: runData, error: runError } = await supabase
          .from('runs')
          .select('*')
          .eq('id', runId)
          .single();
          
        if (runError) {
          console.error('Error fetching run:', runError);
          return;
        }
        
        if (runData) {
          setRun({
            id: runData.id,
            dashboard_id: runData.dashboard_id,
            chat_id: runData.chat_id,
            status: runData.status,
            in_progress: runData.in_progress,
            created_at: runData.created_at,
            updated_at: runData.updated_at,
            username: runData.username
          });
        }
        
        // Fetch run messages
        const { data: messageData, error: messageError } = await supabase
          .from('run_messages')
          .select('*')
          .eq('run_id', runId)
          .order('created_at', { ascending: true });
          
        if (messageError) {
          console.error('Error fetching run messages:', messageError);
          return;
        }
        
        if (messageData) {
          setRunMessages(messageData as RunMessageType[]);
        }
      } catch (err) {
        console.error('Exception when fetching run data:', err);
      }
    };
    
    fetchRunData();
  }, [runId]);

  // Set up real-time listeners for run and run_messages
  useEffect(() => {
    // Subscribe to changes in the run
    const runChannel = supabase
      .channel(`run:${runId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'runs',
        filter: `id=eq.${runId}`
      }, (payload) => {
        console.log('Run update received:', payload);
        if (payload.new) {
          const runData = payload.new as any;
          setRun({
            id: runData.id,
            dashboard_id: runData.dashboard_id,
            chat_id: runData.chat_id,
            status: runData.status,
            in_progress: runData.in_progress,
            created_at: runData.created_at,
            updated_at: runData.updated_at,
            username: runData.username
          });
        }
      })
      .subscribe();
      
    // Subscribe to changes in run_messages
    const runMessagesChannel = supabase
      .channel(`run_messages:${runId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'run_messages',
        filter: `run_id=eq.${runId}`
      }, (payload) => {
        console.log('Run message received:', payload);
        if (payload.new) {
          const newMessage = payload.new as RunMessageType;
          setRunMessages(prev => [...prev, newMessage]);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(runChannel);
      supabase.removeChannel(runMessagesChannel);
    };
  }, [runId]);

  const handleDeleteRun = async () => {
    if (!runId || isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('runs')
        .delete()
        .eq('id', runId);
        
      if (error) {
        console.error('Error deleting run:', error);
        toast({
          title: "Error",
          description: "Failed to delete run: " + error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Run deleted successfully"
        });
      }
    } catch (err) {
      console.error('Exception when deleting run:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the run",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatMessageContent = (message: RunMessageType) => {
    if (!message.payload) return null;
    
    switch (message.type) {
      case 'inputs':
        return (
          <div className="text-sm">
            <p className="font-medium mb-1">Input Values:</p>
            <div className="bg-muted/50 p-2 rounded-md">
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(message.payload, null, 2)}
              </pre>
            </div>
          </div>
        );
      case 'spawn_window':
        return <p className="text-sm">Opening agent window...</p>;
      case 'download_extension':
        return <p className="text-sm">Extension download requested</p>;
      default:
        return <p className="text-sm">{message.type}: {JSON.stringify(message.payload)}</p>;
    }
  };

  if (!run) {
    return (
      <div className="flex justify-center my-4">
        <Card className="w-[80%] max-w-lg border border-blue-200 dark:border-blue-800">
          <CardContent className="py-4 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Loading run information...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center my-4">
      <Card className="w-[80%] max-w-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center">
            <div 
              className={`h-2.5 w-2.5 rounded-full mr-2 ${
                run.in_progress 
                  ? "bg-amber-500 animate-pulse" 
                  : "bg-green-500"
              }`} 
            />
            <span className="font-medium text-sm">
              {run.in_progress ? "Running" : "Completed"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Run #{run.id.slice(0, 8)}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={handleDeleteRun}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="py-3">
          <div className="space-y-2">
            <p className="text-sm font-medium">Status: {run.status}</p>
            
            {runMessages.length > 0 && (
              <div className="space-y-2 mt-2">
                <p className="text-xs font-medium text-muted-foreground">Messages:</p>
                <div className="space-y-2">
                  {runMessages.map((message) => (
                    <div 
                      key={message.id} 
                      className="bg-background text-card-foreground p-2 rounded-md border text-sm"
                    >
                      {formatMessageContent(message)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RunMessage;
