import { useState, useCallback } from "react";
import { Message } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export const useMessageManager = (
  conversationId: string,
  setIsLoading: (isLoading: boolean) => void,
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void,
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
        username: 'current_user',
        type: 'text_message' // Explicitly set as text_message
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      const messageData: any = {
        id: messageId,
        chat_id: conversationId,
        role: 'user',
        content: inputValue,
        username: 'current_user',
        text_is_currently_streaming: false,
        type: 'text_message' // Explicitly set as text_message
      };
      
      await supabase
        .from('messages')
        .insert(messageData);
      
      // Invoke the function with conversation ID
      const functionParams: any = { 
        conversationId,
        username: 'current_user'
      };
      
      await supabase.functions.invoke('respond-to-message', {
        body: functionParams
      });
      
      onSendMessage(inputValue);
    } catch (err) {
      console.error('Exception when processing message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle code run creation
  const handleCodeRun = async (codeContent: string) => {
    if (!codeContent.trim() || !conversationId) return;
    
    setIsLoading(true);
    
    try {
      const messageId = uuidv4();
      
      setLocalMessageIds(prev => new Set(prev).add(messageId));
      setPendingMessageIds(prev => new Set(prev).add(messageId));
      
      const optimisticMessage: Message = {
        id: messageId,
        role: 'user',
        content: codeContent,
        username: 'current_user',
        type: 'code_run' // Explicitly set as code_run
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      const messageData: any = {
        id: messageId,
        chat_id: conversationId,
        role: 'user',
        content: codeContent,
        username: 'current_user',
        text_is_currently_streaming: false,
        type: 'code_run' // Explicitly set as code_run
      };
      
      await supabase
        .from('messages')
        .insert(messageData);
      
      // Invoke the function with conversation ID and code run specific parameters
      const functionParams: any = { 
        conversationId,
        username: 'current_user',
        messageId: messageId,
        isCodeRun: true,
        codeContent: codeContent
      };
      
      await supabase.functions.invoke('respond-to-message', {
        body: functionParams
      });
      
      onSendMessage(codeContent);
    } catch (err) {
      console.error('Exception when processing code run:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    localMessageIds,
    pendingMessageIds,
    streamingMessages,
    setStreamingMessages,
    updateMessageContent,
    handleSubmit,
    handleCodeRun,
    setPendingMessageIds
  };
};
