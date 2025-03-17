
import { useConversations } from "@/hooks/useConversations";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types";
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  conversationId: string;
  onSendMessage: (message: string) => void;
}

export const ChatInterface = ({
  conversationId,
  onSendMessage
}: ChatInterfaceProps) => {
  const { 
    messages,
    screenRecordings,
    isLoading, 
    setIsLoading,
    hasScreenRecording,
    setMessages 
  } = useConversations({ conversationId });
  
  // Track locally created message IDs to avoid duplicates from realtime
  const [localMessageIds, setLocalMessageIds] = useState<Set<string>>(new Set());
  // Track pending messages waiting for Supabase confirmation
  const [pendingMessageIds, setPendingMessageIds] = useState<Set<string>>(new Set());
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);

  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "EXTENSION_INSTALLED") {
        setIsExtensionInstalled(true);
      }
    };

    window.addEventListener("message", handleExtensionMessage);
    return () => window.removeEventListener("message", handleExtensionMessage);
  }, []);

  // Memoize message update function to avoid recreating it on each render
  const updateMessageContent = useCallback((messageId: string, newContent: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent } 
          : msg
      )
    );
  }, [setMessages]);

  // Set up real-time subscription to messages
  useEffect(() => {
    if (!conversationId) return;
    
    console.log(`Setting up realtime subscription for chat ${conversationId}`);
    
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${conversationId}`
      }, (payload) => {
        console.log('Received real-time INSERT message:', payload);
        const newMessage = payload.new;
        
        // Skip messages that were created locally (optimistic updates)
        if (localMessageIds.has(newMessage.id)) {
          console.log('Skipping already displayed local message:', newMessage.id);
          
          // Remove the message from pending state since we got confirmation
          setPendingMessageIds(prev => {
            const updated = new Set(prev);
            updated.delete(newMessage.id);
            return updated;
          });
          
          return;
        }
        
        setMessages(prev => {
          // Still check if this message is already in the list as a fallback
          if (prev.some(msg => msg.id === newMessage.id)) {
            return prev;
          }
          
          return [
            ...prev, 
            {
              id: newMessage.id,
              role: newMessage.role,
              content: newMessage.content,
              username: newMessage.username
            }
          ];
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${conversationId}`
      }, (payload) => {
        console.log('Received real-time UPDATE message:', payload);
        const updatedMessage = payload.new;
        
        // Use our memoized function to update the message content
        // This should help with race conditions when updates come in rapidly
        updateMessageContent(updatedMessage.id, updatedMessage.content);
      })
      .subscribe();

    return () => {
      console.log('Removing channel subscription');
      supabase.removeChannel(channel);
    };
  }, [conversationId, setMessages, localMessageIds, updateMessageContent]);

  const handleSubmit = async (inputValue: string) => {
    if (!inputValue.trim() || !conversationId) return;
    
    setIsLoading(true);
    
    try {
      // Create a message ID - we'll use the same ID for both local state and database
      const messageId = uuidv4();
      
      // Track this ID locally to avoid duplicate display
      setLocalMessageIds(prev => new Set(prev).add(messageId));
      
      // Add to pending messages
      setPendingMessageIds(prev => new Set(prev).add(messageId));
      
      // Add message optimistically to the UI
      const optimisticMessage: Message = {
        id: messageId,
        role: 'user',
        content: inputValue,
        username: 'current_user'
      };
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      // Save user message to database with the SAME ID as the optimistic update
      await supabase
        .from('messages')
        .insert({
          id: messageId, // Use the same ID
          chat_id: conversationId,
          role: 'user',
          content: inputValue,
          username: 'current_user'
        });
      
      // Trigger the edge function to respond
      await supabase.functions.invoke('respond-to-message', {
        body: { 
          conversationId,
          username: 'current_user'
        }
      });
      
      onSendMessage(inputValue);
    } catch (err) {
      console.error('Exception when processing message:', err);
      // Consider removing the optimistic message if saving fails
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <MessageList 
          messages={messages} 
          hasScreenRecording={hasScreenRecording} 
          screenRecordings={screenRecordings}
          isExtensionInstalled={isExtensionInstalled}
          pendingMessageIds={pendingMessageIds}
        />
      </div>

      <ChatInput 
        onSendMessage={handleSubmit} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default ChatInterface;
