
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message, Keyframe } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';

interface UseConversationsProps {
  conversationId: string;
}

export const useConversations = ({ conversationId }: UseConversationsProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId] = useState(() => conversationId || uuidv4());
  const [keyframes, setKeyframes] = useState<Record<string, Keyframe[]>>({});

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      loadKeyframes();
    } else {
      setMessages([]);
      setKeyframes({});
    }
  }, [conversationId]);

  // Load keyframes from Supabase
  const loadKeyframes = async () => {
    try {
      if (!conversationId) return;
      
      const { data, error } = await supabase
        .from('keyframes')
        .select('*')
        .eq('chat_id', conversationId);
      
      if (error) {
        console.error('Error loading keyframes from Supabase:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const keyframesMap: Record<string, Keyframe[]> = {};
        
        // Group keyframes by message_id
        data.forEach(keyframe => {
          const messageId = keyframe.message_id;
          
          if (!keyframesMap[messageId]) {
            keyframesMap[messageId] = [];
          }
          
          keyframesMap[messageId].push({
            id: keyframe.id.toString(), // Convert ID to string
            message_id: keyframe.message_id,
            screenshot_url: keyframe.screenshot_url || '',
            url: keyframe.url || '',
            tab_title: keyframe.tab_title || '',
            timestamp: keyframe.timestamp || new Date().toISOString()
          });
        });
        
        setKeyframes(keyframesMap);
      }
    } catch (error) {
      console.error('Error in loadKeyframes:', error);
    }
  };

  // Load messages from Supabase
  const loadMessages = async () => {
    try {
      if (!conversationId) return;
      
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error loading messages from Supabase:', error);
        toast({
          title: "Error loading messages",
          description: error.message,
          variant: "destructive"
        });
        setMessages([]);
      } else if (data && data.length > 0) {
        const messagesData = data.map(msg => {
          const message: Message = {
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content,
            username: msg.username,
            chat_id: msg.chat_id,
            type: (msg.type as "text_message" | "screen_recording" | "code_run" | "function_message") || "text_message", // Ensure every message has a type
            code_output: msg.code_output,
            code_output_error: msg.code_output_error,
            code_run_success: msg.code_run_success,
            code_output_tables: msg.code_output_tables,
          };
          
          // Only add these properties if they exist
          if (msg.screenrecording_url) {
            message.screenrecording_url = msg.screenrecording_url;
          }
          
          // Handle optional duration property
          const duration = parseInt(msg.duration as any);
          if (!isNaN(duration)) {
            message.duration = duration;
          }
          
          return message;
        });
        
        setMessages(messagesData);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error in loadMessages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    setIsLoading,
    chatId,
    setMessages,
    keyframes
  };
};
