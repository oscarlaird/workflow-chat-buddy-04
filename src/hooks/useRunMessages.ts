
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrowserEvent, RunMessageSenderType } from "@/types";

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
    if (runMessage.type === "spawn_window" && isExtensionInstalled) {
      try {
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
    if (!coderunEventId) return false;
    
    try {
      // Create an abort browser event
      const abortMessage = {
        coderun_event_id: coderunEventId,
        type: "abort",
        payload: { reason: 'Manual stop requested' },
        chat_id: conversationId,
        username: 'current_user',
        sender_type: RunMessageSenderType.DASHBOARD, // Use the enum value instead of string
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
        if (payload.new) {
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
