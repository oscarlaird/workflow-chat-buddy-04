
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types";
import { mockConversations } from "@/data/mockData";
import { toast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';

// Interface to represent a screen recording
export interface ScreenRecording {
  id: string;
  duration: string; // e.g., "54s"
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
        // First try to load from Supabase
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', conversationId)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Error loading messages from Supabase:', error);
          // Fall back to mock data
          loadMockData();
        } else if (data && data.length > 0) {
          // Map Supabase data to Message type
          const messagesData = data.map(msg => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content,
            username: msg.username
          }));
          setMessages(messagesData);
          createMockScreenRecordings(messagesData);
        } else {
          // No data found in Supabase, use mock data
          loadMockData();
        }
      } else {
        // No conversation ID, start with empty state
        setMessages([]);
        setScreenRecordings({});
      }
    } catch (error) {
      console.error('Error in loadMessages:', error);
      loadMockData();
    }
  };

  const loadMockData = () => {
    // Load from mock data as fallback
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
    
    // Go through messages and add recordings after specific agent questions
    for (let i = 0; i < messages.length - 1; i++) {
      const current = messages[i];
      const next = messages[i + 1];
      
      // Specifically look for messages where the agent asks to be shown something
      if (current.role === "assistant" && 
          (current.content.includes("show me") || 
          current.content.includes("Can you show me") ||
          current.content.includes("please show"))) {
        
        // For the first instance, set 54s duration
        if (current.id === "msg-9" && next.id === "msg-10") {
          recordings[current.id] = {
            id: `recording-${i}`,
            duration: "54s",
            timestamp: new Date().toISOString()
          };
        }
        // For the second instance, set 76s duration
        else if (current.id === "msg-14" && next.id === "msg-15") {
          recordings[current.id] = {
            id: `recording-${i}`,
            duration: "76s",
            timestamp: new Date().toISOString()
          };
        }
      }
    }
    
    console.log("Screen recordings created:", recordings);
    setScreenRecordings(recordings);
    
    // Show toast notification about screen recordings
    if (Object.keys(recordings).length > 0) {
      toast({
        title: "Screen recordings loaded",
        description: `Loaded ${Object.keys(recordings).length} screen recordings in this conversation.`
      });
    }
  };

  const saveMessageToSupabase = async (message: Message, messageRole: "user" | "assistant") => {
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          id: message.id,
          chat_id: conversationId,
          role: messageRole,
          content: message.content,
          username: message.username || 'current_user'
        });
      
      if (error) {
        console.error('Error saving message to Supabase:', error);
      }
    } catch (err) {
      console.error('Exception saving message to Supabase:', err);
    }
  };

  const addMessage = async (content: string, role: "user" | "assistant") => {
    const newMessage: Message = {
      id: `${role}-${Date.now()}`,
      role,
      content,
      username: "current_user" // Default username for new messages
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Save to Supabase
    await saveMessageToSupabase(newMessage, role);
    
    return newMessage;
  };

  return {
    messages,
    screenRecordings,
    isLoading,
    setIsLoading,
    chatId,
    addMessage,
    hasScreenRecording: (message: Message) => message.id in screenRecordings,
    setMessages // Expose setMessages for real-time updates
  };
};
