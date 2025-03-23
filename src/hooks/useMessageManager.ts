
import { useState, useCallback } from "react";
import { Message } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export const useMessageManager = (
  conversationId: string,
  setIsLoading: (isLoading: boolean) => void,
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void,
  currentRunId: string | null,
  setCurrentRunId: (runId: string | null) => void,
  onSendMessage: (message: string) => void
) => {
  const [localMessageIds, setLocalMessageIds] = useState<Set<string>>(new Set());
  const [pendingMessageIds, setPendingMessageIds] = useState<Set<string>>(new Set());
  const [streamingMessages, setStreamingMessages] = useState<Set<string>>(new Set());

  const updateMessageContent = useCallback((messageId: string, updatedMessage: any, isStreaming: boolean = false) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              ...updatedMessage
            } 
          : msg
      )
    );
    
    if (isStreaming) {
      setStreamingMessages(prev => new Set(prev).add(messageId));
    } else {
      setStreamingMessages(prev => {
        const updated = new Set(prev);
        updated.delete(messageId);
        return updated;
      });
    }
  }, [setMessages]);

  const handleSubmit = async (inputValue: string) => {
    if (!inputValue.trim() || !conversationId) return;
    
    setIsLoading(true);
    
    try {
      const messageId = uuidv4();
      
      setLocalMessageIds(prev => new Set(prev).add(messageId));
      
      setPendingMessageIds(prev => new Set(prev).add(messageId));
      
      const optimisticMessage: Message = {
        id: messageId,
        role: 'user',
        content: inputValue,
        username: 'current_user'
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      const messageData: any = {
        id: messageId,
        chat_id: conversationId,
        role: 'user',
        content: inputValue,
        username: 'current_user',
        is_currently_streaming: false
      };
      
      // Add run_id if available
      if (currentRunId) {
        messageData.run_id = currentRunId;
      }
      
      await supabase
        .from('messages')
        .insert(messageData);
      
      // Invoke the function with conversation ID
      const functionParams: any = { 
        conversationId,
        username: 'current_user'
      };
      
      if (currentRunId) {
        functionParams.runId = currentRunId;
      }
      
      await supabase.functions.invoke('respond-to-message', {
        body: functionParams
      });
      
      onSendMessage(inputValue);
      
      // Reset the current run ID after sending
      setCurrentRunId(null);
    } catch (err) {
      console.error('Exception when processing message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    localMessageIds,
    pendingMessageIds,
    streamingMessages,
    updateMessageContent,
    handleSubmit,
    setPendingMessageIds
  };
};
