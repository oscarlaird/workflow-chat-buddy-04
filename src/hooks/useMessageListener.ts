
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types";

export const useMessageListener = (
  conversationId: string,
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void,
  localMessageIds: Set<string>,
  setPendingMessageIds: (ids: Set<string> | ((prev: Set<string>) => Set<string>)) => void,
  updateMessageContent: (messageId: string, updatedMessage: any, isStreaming: boolean) => void,
  setStreamingMessages: (messages: Set<string> | ((prev: Set<string>) => Set<string>)) => void
) => {
  useEffect(() => {
    if (!conversationId) return;
    
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${conversationId}`
      }, (payload) => {
        const newMessage = payload.new;
        
        if (localMessageIds.has(newMessage.id)) {
          setPendingMessageIds(prev => {
            const updated = new Set(prev);
            updated.delete(newMessage.id);
            return updated;
          });
          
          return;
        }
        
        setMessages(prev => {
          if (prev.some(msg => msg.id === newMessage.id)) {
            return prev;
          }
          
          return [
            ...prev, 
            {
              id: newMessage.id,
              role: newMessage.role,
              content: newMessage.content,
              username: newMessage.username,
              screenrecording_url: newMessage.screenrecording_url,
              type: newMessage.type || "text_message",
              code_output: newMessage.code_output,
              code_output_error: newMessage.code_output_error,
              code_run_success: newMessage.code_run_success,
              code_output_tables: newMessage.code_output_tables
            } as Message
          ];
        });

        if (newMessage.text_is_currently_streaming) {
          setStreamingMessages(prev => new Set(prev).add(newMessage.id));
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${conversationId}`
      }, (payload) => {
        const updatedMessage = payload.new;
        
        const messageUpdate = {
          content: updatedMessage.content,
          code_output: updatedMessage.code_output,
          code_output_error: updatedMessage.code_output_error,
          code_run_success: updatedMessage.code_run_success,
          code_output_tables: updatedMessage.code_output_tables,
          type: updatedMessage.type
        };
        
        updateMessageContent(
          updatedMessage.id, 
          messageUpdate, 
          updatedMessage.text_is_currently_streaming
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, setMessages, localMessageIds, updateMessageContent, setPendingMessageIds, setStreamingMessages]);
};

export default useMessageListener;
