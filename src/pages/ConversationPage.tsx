
import { useParams } from "react-router-dom";
import ChatInterface from "@/components/ChatInterface";
import { useToast } from "@/components/ui/use-toast";

const ConversationPage = () => {
  const { conversationId = "" } = useParams();
  const { toast } = useToast();

  const handleSendMessage = (message: string) => {
    // In a real app, would send message to API
    console.log("Message sent in standalone view:", message);
  };

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
