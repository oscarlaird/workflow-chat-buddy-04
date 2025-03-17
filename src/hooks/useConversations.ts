
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types";
import { mockConversations } from "@/data/mockData";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';

// Interface to represent a screen recording
export interface ScreenRecording {
  id: string;
  duration: string;
  timestamp: string;
}

interface UseConversationsProps {
  conversationId: string;
}

export const useConversations = ({ conversationId }: UseConversationsProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [screenRecordings, setScreenRecordings] = useState<Record<string, ScreenRecording>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [chatId] = useState(() => conversationId || uuidv4());

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      if (conversationId) {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', conversationId)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Error loading messages from Supabase:', error);
          loadMockData();
        } else if (data && data.length > 0) {
          const messagesData = data.map(msg => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content,
            username: msg.username
          }));
          setMessages(messagesData);
          createMockScreenRecordings(messagesData);
        } else {
          setMessages([]);
          setScreenRecordings({});
        }
      } else {
        setMessages([]);
        setScreenRecordings({});
      }
    } catch (error) {
      console.error('Error in loadMessages:', error);
      loadMockData();
    }
  };

  const loadMockData = () => {
    const conversation = mockConversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setMessages(conversation.messages);
      createMockScreenRecordings(conversation.messages);
    } else {
      setMessages([]);
      setScreenRecordings({});
    }
  };

  const createMockScreenRecordings = (messages: Message[]) => {
    const recordings: Record<string, ScreenRecording> = {};
    
    for (let i = 0; i < messages.length - 1; i++) {
      const current = messages[i];
      const next = messages[i + 1];
      
      if (current.role === "assistant" && 
          (current.content.includes("show me") || 
          current.content.includes("Can you show me") ||
          current.content.includes("please show"))) {
        
        if (current.id === "msg-9" && next.id === "msg-10") {
          recordings[current.id] = {
            id: `recording-${i}`,
            duration: "54s",
            timestamp: new Date().toISOString()
          };
        }
        else if (current.id === "msg-14" && next.id === "msg-15") {
          recordings[current.id] = {
            id: `recording-${i}`,
            duration: "76s",
            timestamp: new Date().toISOString()
          };
        }
      }
    }
    
    setScreenRecordings(recordings);
    
    if (Object.keys(recordings).length > 0) {
      toast({
        title: "Screen recordings loaded",
        description: `Loaded ${Object.keys(recordings).length} screen recordings in this conversation.`
      });
    }
  };

  return {
    messages,
    screenRecordings,
    isLoading,
    setIsLoading,
    chatId,
    hasScreenRecording: (message: Message) => message.id in screenRecordings,
    setMessages
  };
};
