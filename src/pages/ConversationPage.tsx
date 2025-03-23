
import { useParams, useLocation, useEffect } from "react-router-dom";
import ChatInterface from "@/components/ChatInterface";
import { useToast } from "@/components/ui/use-toast";
import ExtensionStatusIndicator from "@/components/ExtensionStatusIndicator";
import { Message } from "@/types";

const ConversationPage = () => {
  const { id: urlParamId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const chatIdFromQuery = queryParams.get('chat_id');
  
  // Use URL parameter first, then fall back to query parameter
  const conversationId = urlParamId || chatIdFromQuery || "";
  
  // Determine if the page is being accessed through the extension (via query param)
  const isAccessedThroughExtension = Boolean(chatIdFromQuery);
  
  const { toast } = useToast();

  const handleSendMessage = (message: string) => {
    // In a real app, would send message to API
    console.log("Message sent in standalone view:", message);
  };

  const handleMessagesUpdated = (messages: Message[]) => {
    // Find the latest user message
    const userMessages = messages.filter(msg => msg.role === 'user');
    if (userMessages.length > 0) {
      const latestUserMessage = userMessages[userMessages.length - 1];
      console.log("CONVERSATION PAGE - Latest user message:", latestUserMessage);
      console.log("requires_text_reply:", latestUserMessage.requires_text_reply);
      console.log("script:", latestUserMessage.script);
    }
  };

  if (!conversationId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h2 className="text-xl font-medium">No conversation ID provided</h2>
          <p className="mt-2 text-muted-foreground">Please specify a conversation ID.</p>
          <a href="/" className="mt-4 inline-block text-blue-500 hover:underline">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950">
      {!isAccessedThroughExtension && (
        <div className="absolute top-4 right-4 z-10">
          <ExtensionStatusIndicator />
        </div>
      )}
      <div className="h-full p-4">
        <div className="h-full glass-panel">
          <ChatInterface
            conversationId={conversationId}
            onSendMessage={handleSendMessage}
            forceExtensionInstalled={isAccessedThroughExtension}
            onMessagesUpdated={handleMessagesUpdated}
          />
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
