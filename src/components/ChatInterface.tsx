
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
    addMessage, 
    hasScreenRecording,
    setMessages 
  } = useConversations({ conversationId });
  
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);

  useEffect(() => {
    // Function to handle messages from the extension
    const handleExtensionMessage = (event: MessageEvent) => {
      // Check if the message is from our extension
      if (event.data && event.data.type === "EXTENSION_INSTALLED") {
        console.log("Extension installation detected in ChatInterface:", event.data);
        setIsExtensionInstalled(true);
      }
    };

    // Add the event listener
    window.addEventListener("message", handleExtensionMessage);
    
    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("message", handleExtensionMessage);
    };
  }, []);

  // Set up real-time subscription to messages
  useEffect(() => {
    if (!conversationId) return;

    console.log("Setting up real-time subscription for chat:", conversationId);
    
    // Subscribe to messages for this conversation
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${conversationId}`
      }, (payload) => {
        console.log("Real-time message received:", payload);
        const newMessage = payload.new;
        
        // Add the message to the UI
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

    // Clean up subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, setMessages]);

  const handleSubmit = async (inputValue: string) => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Save user message to database
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: conversationId,
          role: 'user',
          content: inputValue,
          username: 'current_user' // Default username for new messages
        });
      
      if (error) {
        console.error('Error saving message:', error);
        return;
      }
      
      // Trigger the edge function to respond
      await supabase.functions.invoke('respond-to-message', {
        body: { 
          message: inputValue,
          conversationId,
          username: 'current_user' // Pass the same username
        }
      });
      
      // Notification that message was sent
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
