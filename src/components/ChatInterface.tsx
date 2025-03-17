
import { useConversations } from "@/hooks/useConversations";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

  // Set up real-time subscription to messages
  useEffect(() => {
    if (!conversationId) return;
    
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${conversationId}`
      }, (payload) => {
        const newMessage = payload.new;
        setMessages(prev => [
          ...prev, 
          {
            id: newMessage.id,
            role: newMessage.role,
            content: newMessage.content,
            username: newMessage.username
          }
        ]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, setMessages]);

  const handleSubmit = async (inputValue: string) => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Save user message to database
      await supabase
        .from('messages')
        .insert({
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
