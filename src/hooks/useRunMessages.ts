import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RunMessage, RunMessageType, RunMessageSenderType } from "@/types";
import { v4 as uuidv4 } from 'uuid';

interface UseRunMessagesResult {
  runMessages: RunMessage[];
  isLoading: boolean;
  error: string | null;
  abortRun: (runId: string, reason: string) => Promise<void>;
  fetchRunMessages: () => Promise<void>;
}

export const useRunMessages = (runId?: string): UseRunMessagesResult => {
  const [runMessages, setRunMessages] = useState<RunMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRunMessages = async () => {
    if (!runId) {
      setRunMessages([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('run_messages')
        .select('*')
        .eq('run_id', runId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching run messages:', error);
        setError(error.message);
        return;
      }

      if (data) {
        setRunMessages(data as RunMessage[]);
      } else {
        setRunMessages([]);
      }
    } catch (err) {
      console.error('Error in fetchRunMessages:', err);
      setError('An unexpected error occurred while loading run messages');
      setRunMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRunMessages();

    const channel = supabase
      .channel(`run-messages-${runId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'run_messages',
          filter: `run_id=eq.${runId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
            fetchRunMessages();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [runId]);

  // Handle aborting a run 
  const abortRun = async (runId: string, reason: string) => {
    try {
      // Find the run record to get the chat_id
      const { data: runData, error: runError } = await supabase
        .from('runs')
        .select('chat_id')
        .eq('id', runId)
        .single();
        
      if (runError) {
        console.error('Error finding run:', runError);
        return;
      }
      
      // Create abort message
      const messageId = uuidv4();
      
      // Get the current user
      const currentUser = await supabase.auth.getUser();
      const username = currentUser.data.user?.email || 'anonymous';
      
      // Create a string value for sender_type instead of using the enum directly
      const senderTypeValue = 'dashboard'; // This corresponds to RunMessageSenderType.DASHBOARD
      
      // Create browser event
      const { error: eventError } = await supabase
        .from('browser_events')
        .insert({
          id: messageId,
          coderun_event_id: null,
          type: 'abort', // Use string value instead of enum
          payload: { reason },
          chat_id: runData.chat_id,
          username,
          sender_type: senderTypeValue,
          display_text: `Run aborted: ${reason}`
        });
        
      if (eventError) {
        console.error('Error creating abort event:', eventError);
        return;
      }
      
      // Update the run status
      const { error: updateError } = await supabase
        .from('runs')
        .update({ status: 'aborted', in_progress: false })
        .eq('id', runId);
        
      if (updateError) {
        console.error('Error updating run status:', updateError);
      }
      
      // Reload run messages
      fetchRunMessages();
      
    } catch (error) {
      console.error('Error in abortRun:', error);
    }
  };

  return { runMessages, isLoading, error, abortRun, fetchRunMessages };
};
