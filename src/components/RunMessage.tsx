
import { useEffect, useState } from "react";
import { Run, RunMessage as RunMessageType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import RunBubble from "./RunBubble";
import RunMessageItem from "./RunMessageItem";

interface RunMessageProps {
  runId: string;
}

export const RunMessage = ({ runId }: RunMessageProps) => {
  const [run, setRun] = useState<Run | null>(null);
  const [runMessages, setRunMessages] = useState<RunMessageType[]>([]);

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
      <div className="w-[80%] max-w-lg">
        <RunBubble run={run} />
        
        {runMessages.length > 0 && (
          <div className="mt-4 space-y-2 bg-background p-4 rounded-lg border">
            <p className="text-xs font-medium text-muted-foreground mb-3">Messages:</p>
            <div className="space-y-2">
              {runMessages.map((message) => (
                <RunMessageItem key={message.id} message={message} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RunMessage;
