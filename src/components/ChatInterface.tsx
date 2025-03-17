import { useConversations } from "@/hooks/useConversations";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import SeedDataButton from "@/components/SeedDataButton";
import { useState, useEffect, useCallback, useRef } from "react";
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
  
  const [localMessageIds, setLocalMessageIds] = useState<Set<string>>(new Set());
  const [pendingMessageIds, setPendingMessageIds] = useState<Set<string>>(new Set());
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  
  const prevConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "EXTENSION_INSTALLED") {
        setIsExtensionInstalled(true);
      }
    };

    window.addEventListener("message", handleExtensionMessage);
    return () => window.removeEventListener("message", handleExtensionMessage);
  }, []);

  useEffect(() => {
    if (conversationId && prevConversationIdRef.current !== conversationId) {
      prevConversationIdRef.current = conversationId;
      
      setTimeout(() => {
        const textareaElement = document.querySelector('.chat-interface textarea') as HTMLTextAreaElement;
        if (textareaElement) {
          textareaElement.focus();
        }
      }, 200);
    }
  }, [conversationId]);

  const updateMessageContent = useCallback((messageId: string, newContent: string) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId 
          ? { ...msg, content: newContent } 
          : msg
      )
    );
  }, [setMessages]);

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
        
        if (localMessageIds.has(newMessage.id)) {
          console.log('Skipping already displayed local message:', newMessage.id);
          
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
      
      await supabase
        .from('messages')
        .insert({
          id: messageId,
          chat_id: conversationId,
          role: 'user',
          content: inputValue,
          username: 'current_user'
        });
      
      await supabase.functions.invoke('respond-to-message', {
        body: { 
          conversationId,
          username: 'current_user'
        }
      });
      
      onSendMessage(inputValue);
    } catch (err) {
      console.error('Exception when processing message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full chat-interface">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="space-y-4 max-w-md">
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">
                Start a new conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Type a message below to begin, or seed this chat with an example workflow conversation.
              </p>
              <div className="py-4">
                <SeedDataButton />
              </div>
            </div>
          </div>
        ) : (
          <MessageList 
            messages={messages} 
            hasScreenRecording={hasScreenRecording} 
            screenRecordings={screenRecordings}
            isExtensionInstalled={isExtensionInstalled}
            pendingMessageIds={pendingMessageIds}
          />
        )}
      </div>

      <ChatInput 
        onSendMessage={handleSubmit} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default ChatInterface;
