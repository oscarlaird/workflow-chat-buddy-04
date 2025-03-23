import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types";

interface UseConversationsResult {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export const useConversations = (chatId?: string): UseConversationsResult => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
          setError(error.message);
          return;
        }

        if (data) {
          // Transform the messages from the database to the Message interface
          const transformedMessages = data.map(mapDbMessageToMessage);
          setMessages(transformedMessages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error('Error in fetchMessages:', err);
        setError('An unexpected error occurred while loading messages');
        setMessages([]); // Ensure we set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription for messages for this chat
    const channel = supabase
      .channel(`chat-messages-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          console.log('Message updated:', payload);
          fetchMessages();
        }
      )
      .subscribe();

    // Clean up subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId]);

  // Handle the transformation of messages from the database to the Message interface
  const mapDbMessageToMessage = (message: any): Message => {
    // Extract code_output_tables and ensure it's an array
    let code_output_tables: any[] = [];
    
    if (message.code_output_tables) {
      // Handle case where it could be a string or already parsed JSON
      try {
        code_output_tables = typeof message.code_output_tables === 'string'
          ? JSON.parse(message.code_output_tables)
          : message.code_output_tables;
          
        // If it's not an array, wrap it in an array
        if (!Array.isArray(code_output_tables)) {
          code_output_tables = [];
        }
      } catch (e) {
        console.error('Error parsing code_output_tables:', e);
        code_output_tables = [];
      }
    }
    
    // Handle optional duration field
    const duration = message.duration !== undefined ? message.duration : undefined;
    
    return {
      id: message.id,
      chat_id: message.chat_id,
      role: message.role,
      content: message.content,
      type: message.type || 'text_message',
      username: message.username,
      screenrecording_url: message.screenrecording_url,
      code_output: message.code_output,
      code_output_error: message.code_output_error,
      code_run_success: message.code_run_success,
      code_output_tables,
      duration
    };
  };

  return { messages, isLoading, error };
};
