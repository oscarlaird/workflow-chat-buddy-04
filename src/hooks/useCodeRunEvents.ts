
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
    
    const channel = supabase
      .channel(`coderun_events:${chatId}`)
      .on('postgres_changes', {
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'coderun_events',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          // Handle new code run event or update
          const newEvent = payload.new as CodeRunEvent;
          
          if (newEvent.message_id) {
            setCodeRunEvents(prev => {
              const updated = { ...prev };
              
              if (!updated[newEvent.message_id!]) {
                updated[newEvent.message_id!] = [];
              }
              
              // For inserts, add the new event if it doesn't exist
              if (payload.eventType === 'INSERT' && 
                  !updated[newEvent.message_id!].some(event => event.id === newEvent.id)) {
                updated[newEvent.message_id!] = [...updated[newEvent.message_id!], newEvent];
              }
              
              // For updates, replace the existing event
              if (payload.eventType === 'UPDATE') {
                updated[newEvent.message_id!] = updated[newEvent.message_id!].map(event => 
                  event.id === newEvent.id ? newEvent : event
                );
              }
              
              return updated;
            });
          }
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  return {
    codeRunEvents,
    isLoading,
    getEventsForMessage: (messageId: string) => codeRunEvents[messageId] || []
  };
};
