
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrowserEvent } from "@/types";

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
  browser_events?: BrowserEvent[];
}

export const useCodeRunEvents = (chatId: string) => {
  const [codeRunEvents, setCodeRunEvents] = useState<Record<string, CodeRunEvent[]>>({});
  const [browserEvents, setBrowserEvents] = useState<Record<string, BrowserEvent[]>>({});
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
        
        // After loading code run events, fetch browser events for each code run event
        const codeRunEventIds = data.map(event => event.id);
        if (codeRunEventIds.length > 0) {
          fetchBrowserEvents(codeRunEventIds);
        }
      }
    } catch (error) {
      console.error('Error in fetchCodeRunEvents:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch browser events for a list of code run event IDs
  const fetchBrowserEvents = async (codeRunEventIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('browser_events')
        .select('*')
        .in('coderun_event_id', codeRunEventIds);
        
      if (error) {
        console.error('Error loading browser events:', error);
        return;
      }
      
      if (data && data.length > 0) {
        // Group events by coderun_event_id
        const eventsByCodeRunEvent: Record<string, BrowserEvent[]> = {};
        
        data.forEach((event) => {
          if (event.coderun_event_id) {
            if (!eventsByCodeRunEvent[event.coderun_event_id]) {
              eventsByCodeRunEvent[event.coderun_event_id] = [];
            }
            
            eventsByCodeRunEvent[event.coderun_event_id].push(event as BrowserEvent);
          }
        });
        
        setBrowserEvents(eventsByCodeRunEvent);
      }
    } catch (error) {
      console.error('Error in fetchBrowserEvents:', error);
    }
  };

  // Set up real-time listener for new code run events
  useEffect(() => {
    if (!chatId) return;
    
    fetchCodeRunEvents();
    
    // Channel for coderun_events
    const coderunChannel = supabase
      .channel(`coderun_events_${chatId}`)
      .on('postgres_changes', {
        event: '*', 
        schema: 'public',
        table: 'coderun_events',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        console.log('Coderun event received:', payload);
        
        if (payload.eventType === 'INSERT') {
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
        } else if (payload.eventType === 'UPDATE') {
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
        }
      })
      .subscribe((status) => {
        console.log(`CodeRunEvents subscription status: ${status}`);
      });
      
    // Channel for browser_events
    const browserChannel = supabase
      .channel('browser_events')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'browser_events',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        console.log('Browser event received:', payload);
        
        if (payload.eventType === 'INSERT') {
          // Handle new browser event
          const newEvent = payload.new as BrowserEvent;
          
          if (newEvent.coderun_event_id) {
            setBrowserEvents(prev => {
              const updated = { ...prev };
              
              if (!updated[newEvent.coderun_event_id]) {
                updated[newEvent.coderun_event_id] = [];
              }
              
              // Add the new event if it doesn't exist
              if (!updated[newEvent.coderun_event_id].some(event => event.id === newEvent.id)) {
                updated[newEvent.coderun_event_id] = [...updated[newEvent.coderun_event_id], newEvent];
              }
              
              return updated;
            });
          }
        } else if (payload.eventType === 'UPDATE') {
          // Handle updated browser event
          const updatedEvent = payload.new as BrowserEvent;
          
          if (updatedEvent.coderun_event_id) {
            setBrowserEvents(prev => {
              const updated = { ...prev };
              
              if (!updated[updatedEvent.coderun_event_id]) {
                return prev; // Code run event ID doesn't exist in our state
              }
              
              // Update the existing event
              updated[updatedEvent.coderun_event_id] = updated[updatedEvent.coderun_event_id].map(event => 
                event.id === updatedEvent.id ? updatedEvent : event
              );
              
              return updated;
            });
          }
        }
      })
      .subscribe((status) => {
        console.log(`BrowserEvents subscription status: ${status}`);
      });
      
    return () => {
      console.log('Removing channels for code run and browser events');
      supabase.removeChannel(coderunChannel);
      supabase.removeChannel(browserChannel);
    };
  }, [chatId]);

  // Helper function to get browser events for a specific code run event
  const getBrowserEvents = (codeRunEventId: string) => {
    return browserEvents[codeRunEventId] || [];
  };
  
  // Add browser events to code run events when getting them
  const getEventsForMessage = (messageId: string) => {
    const events = codeRunEvents[messageId] || [];
    
    // Add browser events to each code run event
    return events.map(event => ({
      ...event,
      browser_events: getBrowserEvents(event.id)
    }));
  };

  return {
    codeRunEvents,
    browserEvents,
    isLoading,
    getEventsForMessage,
    getBrowserEvents
  };
};
