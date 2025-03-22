import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message, Keyframe } from "@/types";
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
  const [currentRunId, setCurrentRunId] = useState<string | null>(null);
  const [keyframes, setKeyframes] = useState<Record<string, Keyframe[]>>({});

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      loadKeyframes();
    } else {
      setMessages([]);
      setScreenRecordings({});
      setKeyframes({});
    }
  }, [conversationId]);

  useEffect(() => {
    // Listen for workflow run created events
    const handleWorkflowRunCreated = (event: MessageEvent) => {
      if (event.data && event.data.type === "WORKFLOW_RUN_CREATED" && event.data.chatId === conversationId) {
        console.log("Setting current run ID to:", event.data.runId);
        setCurrentRunId(event.data.runId);
      }
    };

    window.addEventListener("message", handleWorkflowRunCreated);
    return () => window.removeEventListener("message", handleWorkflowRunCreated);
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
            id: keyframe.id,
            message_id: keyframe.message_id,
            screenshot_url: keyframe.screenshot_url,
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
        const messagesData = data.map(msg => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          username: msg.username,
          function_name: msg.function_name,
          workflow_step_id: msg.workflow_step_id,
          run_id: msg.run_id,
          screenrecording_url: msg.screenrecording_url,
          chat_id: msg.chat_id,
          code_run: msg.code_run,
          code_output: msg.code_output,
          code_output_error: msg.code_output_error,
          code_run_success: msg.code_run_success,
          code_output_tables: msg.code_output_tables
        }));
        setMessages(messagesData);
        createVirtualScreenRecordings(messagesData);
      } else {
        setMessages([]);
        setScreenRecordings({});
      }
    } catch (error) {
      console.error('Error in loadMessages:', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Create virtual screen recordings based on message content
  // This simulates screen recordings without needing a new database table
  const createVirtualScreenRecordings = useCallback((messages: Message[]) => {
    const recordings: Record<string, ScreenRecording> = {};
    
    for (let i = 0; i < messages.length - 1; i++) {
      const current = messages[i];
      const next = messages[i + 1];
      
      if (current.role === "assistant" && 
          (current.content.includes("show me") || 
          current.content.includes("Can you show me") ||
          current.content.includes("please show"))) {
        
        // If the assistant asks to see something and the next message is also from the assistant,
        // assume a screen recording happened
        if (next.role === "assistant" && next.content.includes("[table]")) {
          recordings[current.id] = {
            id: `recording-${i}`,
            duration: `${Math.floor(30 + Math.random() * 60)}s`, // Random duration between 30-90s
            timestamp: new Date().toISOString()
          };
        }
      }
    }
    
    setScreenRecordings(recordings);
    
    if (Object.keys(recordings).length > 0) {
      console.log(`Created ${Object.keys(recordings).length} virtual screen recordings`);
    }
  }, []);

  return {
    messages,
    screenRecordings,
    isLoading,
    setIsLoading,
    chatId,
    hasScreenRecording: (message: Message) => message.id in screenRecordings,
    setMessages,
    currentRunId,
    setCurrentRunId,
    keyframes
  };
};
