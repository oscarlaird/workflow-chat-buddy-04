
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
      // Load from mock data instead of database
      const conversation = mockConversations.find(conv => conv.id === conversationId);
      if (conversation) {
        setMessages(conversation.messages);
        
        // Create screen recordings for specific messages
        createMockScreenRecordings(conversation.messages);
      } else {
        setMessages([]);
        setScreenRecordings({});
      }
    } catch (error) {
      console.error('Error in loadMessages:', error);
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
    // If we were using Supabase, we'd save to the messages table with username
    // Since we're using mock data, we'll skip this
    return;
  };

  const addMessage = async (content: string, role: "user" | "assistant") => {
    const newMessage: Message = {
      id: `${role}-${Date.now()}`,
      role,
      content,
      username: "current_user" // Default username for new messages
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Skip saving to Supabase
    // await saveMessageToSupabase(newMessage, role);
    
    return newMessage;
  };

  return {
    messages,
    screenRecordings,
    isLoading,
    setIsLoading,
    chatId,
    addMessage,
    hasScreenRecording: (message: Message) => message.id in screenRecordings
  };
};
