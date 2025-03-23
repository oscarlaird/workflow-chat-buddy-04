
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrowserEvent, RunMessageType, RunMessageSenderType } from "@/types";

export const useRunMessages = (conversationId: string) => {
  const [runMessages, setRunMessages] = useState<BrowserEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch browser events for this conversation
  const fetchRunMessages = useCallback(async () => {
    if (!conversationId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('browser_events')
        .select('*')
        .eq('chat_id', conversationId);
        
      if (error) {
        console.error('Error fetching browser events:', error);
        return;
      }
      
      if (data) {
        setRunMessages(data as BrowserEvent[]);
      }
    } catch (err) {
      console.error('Exception when fetching browser events:', err);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  // Process spawn_window messages when extension is installed
  const processSpawnWindowMessage = useCallback((
    runMessage: BrowserEvent, 
    isExtensionInstalled: boolean
  ) => {
    if (runMessage.type === RunMessageType.SPAWN_WINDOW && isExtensionInstalled) {
      try {
        // First, create and send a launch_extension run_message
        const launchMessage = {
          coderun_event_id: runMessage.coderun_event_id,
          type: RunMessageType.LAUNCH_EXTENSION,
          payload: {},
          chat_id: conversationId,
          username: 'current_user',
          sender_type: RunMessageSenderType.DASHBOARD,
          display_text: 'Launching extension...'
        };
        
        // Insert the launch_extension message to the database
        supabase.from('browser_events').insert(launchMessage);
          
        // Send message to extension to create window with chat_id and coderun_event_id inside the payload
        window.postMessage({
          type: 'CREATE_AGENT_RUN_WINDOW',
          payload: {
            coderunEventId: runMessage.coderun_event_id,
            chatId: conversationId,
          }
        }, '*');
      } catch (err) {
        console.error('Error processing spawn_window message:', err);
      }
    }
  }, [conversationId]);

  // Handle stopping a coderun_event
  const handleStopRun = useCallback(async (coderunEventId: string) => {
    if (!coderunEventId) return;
    
    try {
      // Create an abort browser event
      const abortMessage = {
        coderun_event_id: coderunEventId,
        type: RunMessageType.ABORT,
        payload: { reason: 'Manual stop requested' },
        chat_id: conversationId,
        username: 'current_user',
        sender_type: RunMessageSenderType.DASHBOARD,
        display_text: 'Stopping run...'
      };
      
      const { error } = await supabase
        .from('browser_events')
        .insert(abortMessage);
        
      if (error) {
        console.error('Error creating abort event:', error);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Exception when stopping run:', err);
      return false;
    }
  }, [conversationId]);

  // Set up real-time listener for browser events
  useEffect(() => {
    if (!conversationId) return;
    
    // Initial fetch
    fetchRunMessages();
    
    const channel = supabase
      .channel(`browser_events:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'browser_events',
        filter: `chat_id=eq.${conversationId}`
      }, (payload) => {
        // Check if the message has all required properties of BrowserEvent
        if (payload.new && 
            typeof payload.new === 'object' && 
            'id' in payload.new && 
            'coderun_event_id' in payload.new && 
            'type' in payload.new && 
            'payload' in payload.new && 
            'created_at' in payload.new) {
          
          // Valid BrowserEvent - type-safe way to add to state
          const newMessage = payload.new as BrowserEvent;
          
          // Check if this message ID already exists to prevent duplicates
          setRunMessages(prev => {
            // If message with this ID already exists, don't add it again
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        } else {
          console.error('Received incomplete browser event:', payload.new);
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
