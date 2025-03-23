
import { useState, useCallback, useRef } from "react";
import { Message } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export const useMessageManager = (conversationId: string) => {
  const [messageValue, setMessageValue] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [localMessageIds, setLocalMessageIds] = useState<Set<string>>(new Set());
  const [pendingMessageIds, setPendingMessageIds] = useState<Set<string>>(new Set());
  const [streamingMessages, setStreamingMessages] = useState<Set<string>>(new Set());

  const updateMessageContent = useCallback((messageId: string, updatedMessage: any, isStreaming: boolean = false) => {
    // This function will be passed to the message listener hook
    if (isStreaming) {
      setStreamingMessages(prev => new Set(prev).add(messageId));
    } else {
      setStreamingMessages(prev => {
        const updated = new Set(prev);
        updated.delete(messageId);
        return updated;
      });
    }
  }, []);

  const sendMessage = async (inputValue: string) => {
    if (!inputValue.trim() || !conversationId) return;
    
    try {
      const messageId = uuidv4();
      
      setLocalMessageIds(prev => new Set(prev).add(messageId));
      setPendingMessageIds(prev => new Set(prev).add(messageId));
      
      const messageData: any = {
        id: messageId,
        chat_id: conversationId,
        role: 'user',
        content: inputValue,
        username: 'current_user',
        is_currently_streaming: false
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
      
      // Clear the message input and images after sending
      setMessageValue("");
      setUploadedImages([]);
      
      return messageId;
    } catch (err) {
      console.error('Exception when processing message:', err);
      return null;
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `lovable-uploads/${fileName}`;
      
      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        return null;
      }
      
      // Get the public URL for the uploaded file
      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
        
      if (data?.publicUrl) {
        return data.publicUrl;
      }
      
      return null;
    } catch (error) {
      console.error('Error in file upload:', error);
      return null;
    }
  };

  return {
    messageValue,
    setMessageValue,
    localMessageIds,
    pendingMessageIds,
    streamingMessages,
    setStreamingMessages,
    updateMessageContent,
    sendMessage,
    setPendingMessageIds,
    uploadFile,
    uploadedImages,
    setUploadedImages
  };
};
