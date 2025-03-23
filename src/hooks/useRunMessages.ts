
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RunMessage, RunMessageType, RunMessageSenderType } from "@/types";

export const useRunMessages = (conversationId: string) => {
  const [runMessages, setRunMessages] = useState<RunMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch run messages for this conversation
  const fetchRunMessages = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('run_messages')
        .select('*')
        .eq('chat_id', conversationId);
        
      if (error) {
        console.error('Error fetching run messages:', error);
        return;
      }
      
      if (data) {
        setRunMessages(data as RunMessage[]);
      }
    } catch (err) {
      console.error('Exception when fetching run messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Process spawn_window messages when extension is installed
  const processSpawnWindowMessage = useCallback((
    runMessage: RunMessage, 
    isExtensionInstalled: boolean
  ) => {
    if (runMessage.type === RunMessageType.SPAWN_WINDOW && isExtensionInstalled) {
      try {
        // First, create and send a launch_extension run_message
        const launchMessage = {
          run_id: runMessage.run_id,
          type: RunMessageType.LAUNCH_EXTENSION,
          payload: {},
          chat_id: conversationId,
          username: 'current_user',
          sender_type: RunMessageSenderType.DASHBOARD,
          display_text: 'Launching extension...'
        };
        
        // Insert the launch_extension message to the database
        supabase.from('run_messages').insert(launchMessage);
          
        // Send message to extension to create window with chat_id and run_id inside the payload
        window.postMessage({
          type: 'CREATE_AGENT_RUN_WINDOW',
          payload: {
            runId: runMessage.run_id,
            chatId: conversationId,
          }
        }, '*');
      } catch (err) {
        console.error('Error processing spawn_window message:', err);
      }
    }
  }, [conversationId]);

  // Handle stopping a run
  const handleStopRun = useCallback(async (runId: string) => {
    if (!runId) return;
    
    try {
      // Update the run status to stopped
      const { error } = await supabase
        .from('runs')
        .update({
          status: 'Stopped - Extension not installed',
          in_progress: false
        })
        .eq('id', runId);
        
      if (error) {
        console.error('Error stopping run:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Exception when stopping run:', err);
      return false;
    }
  }, []);

  // Set up real-time listener for run messages
  useEffect(() => {
    if (!conversationId) return;
    
    // Initial fetch
    fetchRunMessages();
    
    const channel = supabase
      .channel(`run_messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'run_messages',
        filter: `chat_id=eq.${conversationId}`
      }, (payload) => {
        // Check if the message has all required properties of RunMessage
        if (payload.new && 
            typeof payload.new === 'object' && 
            'id' in payload.new && 
            'run_id' in payload.new && 
            'type' in payload.new && 
            'payload' in payload.new && 
            'created_at' in payload.new) {
          
          // Valid RunMessage - type-safe way to add to state
          const newMessage = payload.new as RunMessage;
          
          // Check if this message ID already exists to prevent duplicates
          setRunMessages(prev => {
            // If message with this ID already exists, don't add it again
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        } else {
          console.error('Received incomplete run message:', payload.new);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, fetchRunMessages]);

  return {
    runMessages,
    isLoading,
    processSpawnWindowMessage,
    handleStopRun
  };
};
