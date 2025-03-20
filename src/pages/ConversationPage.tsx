
import { useParams, useLocation } from "react-router-dom";
import ChatInterface from "@/components/ChatInterface";
import { useToast } from "@/components/ui/use-toast";

const ConversationPage = () => {
  const { id: urlParamId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const chatIdFromQuery = queryParams.get('chat_id');
  
  // Use URL parameter first, then fall back to query parameter
  const conversationId = urlParamId || chatIdFromQuery || "";
  
  const { toast } = useToast();

  const handleSendMessage = (message: string) => {
    // In a real app, would send message to API
    console.log("Message sent in standalone view:", message);
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
      <div className="h-full p-4">
        <div className="h-full glass-panel">
          <ChatInterface
            conversationId={conversationId}
            onSendMessage={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
