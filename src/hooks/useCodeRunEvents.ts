
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CodeRunEvent {
  id: string;
  created_at: string;
  function_name: string | null;
  chat_id: string | null;
  example_input: any | null;
  example_output: any | null;
  message_id: string | null;
  n_total: number | null;
  n_progress: number | null;
  progress_title: string | null;
}

export const useCodeRunEvents = (chatId: string) => {
  const [codeRunEvents, setCodeRunEvents] = useState<Record<string, CodeRunEvent[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch code run events for a specific chat
  const fetchCodeRunEvents = async () => {
    try {
      if (!chatId) return;
      
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('coderun_events')
        .select('*')
        .eq('chat_id', chatId);
        
      if (error) {
        console.error('Error loading code run events:', error);
        return;
      }
      
      if (data && data.length > 0) {
        // Group events by message_id
        const eventsByMessage: Record<string, CodeRunEvent[]> = {};
        
        data.forEach((event) => {
          if (event.message_id) {
            if (!eventsByMessage[event.message_id]) {
              eventsByMessage[event.message_id] = [];
            }
            
            eventsByMessage[event.message_id].push(event as CodeRunEvent);
          }
        });
        
        setCodeRunEvents(eventsByMessage);
      }
    } catch (error) {
      console.error('Error in fetchCodeRunEvents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time listener for new code run events
  useEffect(() => {
    if (!chatId) return;
    
    fetchCodeRunEvents();
    
    // Create a channel for INSERT events
    const insertChannel = supabase
      .channel(`coderun_events_insert_${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT', 
        schema: 'public',
        table: 'coderun_events',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        // Handle new code run event
        const newEvent = payload.new as CodeRunEvent;
        
        if (newEvent.message_id) {
          setCodeRunEvents(prev => {
            const updated = { ...prev };
            
            if (!updated[newEvent.message_id!]) {
              updated[newEvent.message_id!] = [];
            }
            
            // Add the new event if it doesn't exist
            if (!updated[newEvent.message_id!].some(event => event.id === newEvent.id)) {
              updated[newEvent.message_id!] = [...updated[newEvent.message_id!], newEvent];
            }
            
            return updated;
          });
        }
      })
      .subscribe();
      
    // Create a separate channel for UPDATE events  
    const updateChannel = supabase
      .channel(`coderun_events_update_${chatId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'coderun_events',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        // Handle updated code run event
        const updatedEvent = payload.new as CodeRunEvent;
        
        if (updatedEvent.message_id) {
          setCodeRunEvents(prev => {
            const updated = { ...prev };
            
            if (!updated[updatedEvent.message_id!]) {
              return prev; // Message ID doesn't exist in our state
            }
            
            // Update the existing event
            updated[updatedEvent.message_id!] = updated[updatedEvent.message_id!].map(event => 
              event.id === updatedEvent.id ? updatedEvent : event
            );
            
            return updated;
          });
        }
      })
      .subscribe();
      
    return () => {
      console.log('Removing channels for code run events');
      supabase.removeChannel(insertChannel);
      supabase.removeChannel(updateChannel);
    };
  }, [chatId]);

  return {
    codeRunEvents,
    isLoading,
    getEventsForMessage: (messageId: string) => codeRunEvents[messageId] || []
  };
};
