
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CodeRunEvent, BrowserEvent } from "@/types";

export const useCodeRunEvents = (chatId: string) => {
  const [codeRunEvents, setCodeRunEvents] = useState<CodeRunEvent[]>([]);
  const [browserEvents, setBrowserEvents] = useState<Record<string, BrowserEvent[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch code run events for this chat
  const fetchCodeRunEvents = useCallback(async () => {
    if (!chatId) return;
    
    try {
      setIsLoading(true);
      
      // Fetch coderun_events
      const { data: eventsData, error: eventsError } = await supabase
        .from('coderun_events')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: false });
        
      if (eventsError) {
        console.error('Error fetching coderun_events:', eventsError);
        return;
      }
      
      if (eventsData) {
        setCodeRunEvents(eventsData as CodeRunEvent[]);
        
        // For each coderun_event, fetch associated browser_events
        if (eventsData.length > 0) {
          const eventIds = eventsData.map(event => event.id);
          
          const { data: browserEventsData, error: browserEventsError } = await supabase
            .from('browser_events')
            .select('*')
            .in('coderun_event_id', eventIds)
            .order('created_at', { ascending: true });
            
          if (browserEventsError) {
            console.error('Error fetching browser_events:', browserEventsError);
          } else if (browserEventsData) {
            // Group browser events by coderun_event_id
            const browserEventsMap: Record<string, BrowserEvent[]> = {};
            
            browserEventsData.forEach(event => {
              if (!browserEventsMap[event.coderun_event_id]) {
                browserEventsMap[event.coderun_event_id] = [];
              }
              browserEventsMap[event.coderun_event_id].push(event as BrowserEvent);
            });
            
            setBrowserEvents(browserEventsMap);
          }
        }
      }
    } catch (err) {
      console.error('Exception when fetching code run events:', err);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  // Set up real-time listeners for coderun_events and browser_events
  useEffect(() => {
    if (!chatId) return;
    
    // Initial fetch
    fetchCodeRunEvents();
    
    // Subscribe to changes in coderun_events
    const codeRunEventsChannel = supabase
      .channel(`coderun_events:${chatId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'coderun_events',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setCodeRunEvents(prev => [payload.new as CodeRunEvent, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setCodeRunEvents(prev => 
            prev.map(event => 
              event.id === payload.new.id ? payload.new as CodeRunEvent : event
            )
          );
        } else if (payload.eventType === 'DELETE') {
          setCodeRunEvents(prev => 
            prev.filter(event => event.id !== payload.old.id)
          );
        }
      })
      .subscribe();
      
    // Subscribe to changes in browser_events
    const browserEventsChannel = supabase
      .channel(`browser_events:coderun:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'browser_events',
        filter: `chat_id=eq.${chatId}`
      }, (payload) => {
        const newEvent = payload.new as BrowserEvent;
        
        // Only handle if coderun_event_id is present
        if (newEvent.coderun_event_id) {
          setBrowserEvents(prev => {
            const updatedEvents = { ...prev };
            
            if (!updatedEvents[newEvent.coderun_event_id]) {
              updatedEvents[newEvent.coderun_event_id] = [];
            }
            
            // Check if this event ID already exists to prevent duplicates
            if (!updatedEvents[newEvent.coderun_event_id].some(e => e.id === newEvent.id)) {
              updatedEvents[newEvent.coderun_event_id] = [
                ...updatedEvents[newEvent.coderun_event_id],
                newEvent
              ];
            }
            
            return updatedEvents;
          });
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(codeRunEventsChannel);
      supabase.removeChannel(browserEventsChannel);
    };
  }, [chatId, fetchCodeRunEvents]);

  // Find a specific code run event by ID
  const getCodeRunEvent = useCallback((codeRunEventId: string) => {
    return codeRunEvents.find(event => event.id === codeRunEventId) || null;
  }, [codeRunEvents]);

  // Get browser events for a specific code run event
  const getBrowserEvents = useCallback((codeRunEventId: string) => {
    return browserEvents[codeRunEventId] || [];
  }, [browserEvents]);

  // Get events for a specific message ID
  const getEventsForMessage = useCallback((messageId: string) => {
    return codeRunEvents.filter(event => event.message_id === messageId);
  }, [codeRunEvents]);

  return {
    codeRunEvents,
    browserEvents,
    isLoading,
    getCodeRunEvent,
    getBrowserEvents,
    getEventsForMessage,
    refreshCodeRunEvents: fetchCodeRunEvents
  };
};
