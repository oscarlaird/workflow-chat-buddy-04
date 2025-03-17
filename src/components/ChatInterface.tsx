
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
    hasScreenRecording 
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

  const handleSubmit = async (inputValue: string) => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    
    // Add user message immediately with username
    await addMessage(inputValue, "user");
    
    try {
      // Call the Supabase edge function
      const { data, error } = await supabase.functions.invoke('respond-to-message', {
        body: { 
          message: inputValue,
          conversationId
        }
      });
      
      if (error) {
        console.error('Error calling edge function:', error);
        // Fallback to default response if edge function fails
        await addMessage("Sorry, there was an error processing your message.", "assistant");
      } else {
        // Use the response from the edge function
        await addMessage(data.message, "assistant");
      }
    } catch (err) {
      console.error('Exception when calling edge function:', err);
      // Fallback if exception occurs
      await addMessage("An unexpected error occurred.", "assistant");
    } finally {
      setIsLoading(false);
      onSendMessage(inputValue);
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
