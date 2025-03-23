
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RunMessage, RunMessageType, RunMessageSenderType } from "@/types";

interface UseRunMessagesResult {
  runMessages: RunMessage[];
  isLoading: boolean;
  error: string | null;
}

// Mock data since the database tables don't exist yet
// This will be replaced with real database calls when tables are created
export const useRunMessages = (chatId: string): UseRunMessagesResult => {
  const [runMessages, setRunMessages] = useState<RunMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For now, use mock data instead of trying to fetch from non-existent tables
    // This code will be updated when the proper tables are created in Supabase
    const mockRunMessages: RunMessage[] = [
      {
        id: "1",
        run_id: "run1",
        content: "Starting task...",
        role: "system",
        created_at: new Date().toISOString(),
        type: RunMessageType.STATUS,
        sender_type: RunMessageSenderType.SERVER
      },
      {
        id: "2",
        run_id: "run1",
        content: "Task completed",
        role: "system",
        created_at: new Date().toISOString(),
        type: RunMessageType.COMPLETE,
        sender_type: RunMessageSenderType.SERVER
      }
    ];

    // Simulate async loading
    setIsLoading(true);
    setTimeout(() => {
      setRunMessages(mockRunMessages);
      setIsLoading(false);
    }, 500);

    // This function will be implemented properly when we have the actual tables
    // const fetchRunMessages = async () => {
    //   try {
    //     setIsLoading(true);
    //     setError(null);
    //
    //     // This is placeholder code - we'll replace it when the tables exist
    //     // const { data, error } = await supabase
    //     //   .from('run_messages')
    //     //   .select('*')
    //     //   .eq('chat_id', chatId)
    //     //   .order('created_at', { ascending: true });
    //
    //     if (error) {
    //       console.error('Error fetching run messages:', error);
    //       setError(error.message);
    //       return;
    //     }
    //
    //     if (data) {
    //       setRunMessages(data as RunMessage[]);
    //     } else {
    //       setRunMessages([]);
    //     }
    //   } catch (err) {
    //     console.error('Error in fetchRunMessages:', err);
    //     setError('An unexpected error occurred while loading run messages');
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    //
    // fetchRunMessages();
  }, [chatId]);

  return { runMessages, isLoading, error };
};
