
import { useConversations } from "@/hooks/useConversations";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";

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

  const handleSubmit = async (inputValue: string) => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    
    // Add user message immediately
    await addMessage(inputValue, "user");
    
    // Determine the assistant's response based on content
    const containsReady = inputValue.toLowerCase().includes("ready");
    
    // Simulate sending message to API
    setTimeout(async () => {
      onSendMessage(inputValue);
      
      // Add the appropriate assistant response
      if (containsReady) {
        await addMessage("I'm ready when you are. Click the button below to start screen recording.", "assistant");
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
