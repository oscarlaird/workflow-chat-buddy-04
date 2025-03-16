
import { useConversations } from "@/hooks/useConversations";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import { useState, useEffect } from "react";

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
    
    // Add user message immediately
    await addMessage(inputValue, "user");
    
    // Simulate sending message to API
    setTimeout(async () => {
      onSendMessage(inputValue);
      
      // Determine the assistant's response based on content
      const containsReady = inputValue.toLowerCase().includes("ready");
      
      // Add the appropriate assistant response
      if (containsReady) {
        const responseMessage = isExtensionInstalled
          ? "I'm ready when you are. Click the button below to start screen recording."
          : "I'm ready when you are. You'll need to install the Macro Agents extension to record your screen.";
          
        await addMessage(responseMessage, "assistant");
      } else {
        await addMessage("Okay", "assistant");
      }
      
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <MessageList 
          messages={messages} 
          hasScreenRecording={hasScreenRecording} 
          screenRecordings={screenRecordings} 
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
