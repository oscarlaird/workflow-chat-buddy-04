
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BrowserEvent, RunMessageSenderType } from "@/types";

interface UseRunMessagesResult {
  browserEvents: BrowserEvent[];
  isLoading: boolean;
  error: string | null;
}

// Mock data since the database tables don't exist yet
// This will be replaced with real database calls when tables are created
export const useRunMessages = (chatId: string): UseRunMessagesResult => {
  const [browserEvents, setBrowserEvents] = useState<BrowserEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For now, use mock data instead of trying to fetch from non-existent tables
    const mockBrowserEvents: BrowserEvent[] = [
      {
        id: "1",
        type: "navigate",
        sender_type: RunMessageSenderType.EXTENSION,
        display_text: "Navigating to page...",
        created_at: new Date().toISOString(),
        chat_id: chatId,
        payload: { url: "https://example.com" }
      },
      {
        id: "2",
        type: "click",
        sender_type: RunMessageSenderType.EXTENSION,
        display_text: "Clicked on button",
        created_at: new Date().toISOString(),
        chat_id: chatId,
        payload: { selector: "#submit-button" }
      }
    ];

    // Simulate async loading
    setIsLoading(true);
    setTimeout(() => {
      setBrowserEvents(mockBrowserEvents);
      setIsLoading(false);
    }, 500);

    // This function will be implemented properly when we have the actual tables
    // const fetchBrowserEvents = async () => {
    //   try {
    //     setIsLoading(true);
    //     setError(null);
    //
    //     const { data, error } = await supabase
    //       .from('browser_events')
    //       .select('*')
    //       .eq('chat_id', chatId)
    //       .order('created_at', { ascending: true });
    //
    //     if (error) {
    //       console.error('Error fetching browser events:', error);
    //       setError(error.message);
    //       return;
    //     }
    //
    //     if (data) {
    //       setBrowserEvents(data as BrowserEvent[]);
    //     } else {
    //       setBrowserEvents([]);
    //     }
    //   } catch (err) {
    //     console.error('Error in fetchBrowserEvents:', err);
    //     setError('An unexpected error occurred while loading browser events');
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    //
    // fetchBrowserEvents();
  }, [chatId]);

  return { browserEvents, isLoading, error };
};
