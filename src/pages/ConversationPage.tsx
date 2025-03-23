
import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";
import { useToast } from "@/components/ui/use-toast";
import ExtensionStatusIndicator from "@/components/ExtensionStatusIndicator";
import { Message } from "@/types";
import { supabase } from "@/integrations/supabase/client";

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
  const [latestUserMessage, setLatestUserMessage] = useState<Message | null>(null);

  // Fetch the latest user message every second
  useEffect(() => {
    if (!conversationId) return;

    const checkLatestUserMessage = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', conversationId)
          .eq('role', 'user')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error('Error fetching latest user message:', error);
          return;
        }

        if (data && data.length > 0) {
          const message = data[0] as Message;
          console.log("CONVERSATION PAGE - Latest user message:", message);
          console.log("requires_text_reply:", message.requires_text_reply);
          console.log("script:", message.script);
          setLatestUserMessage(message);
        }
      } catch (err) {
        console.error('Error in checkLatestUserMessage:', err);
      }
    };

    // Initial check
    checkLatestUserMessage();

    // Set up polling
    const intervalId = setInterval(checkLatestUserMessage, 1000);

    return () => clearInterval(intervalId);
  }, [conversationId]);

  const handleSendMessage = (message: string) => {
    // In a real app, would send message to API
    console.log("Message sent in standalone view:", message);
  };

  const handleMessagesUpdated = (messages: Message[]) => {
    // Find the latest user message
    const userMessages = messages.filter(msg => msg.role === 'user');
    if (userMessages.length > 0) {
      const latestUserMsg = userMessages[userMessages.length - 1];
      console.log("Messages updated - Latest user message id:", latestUserMsg.id);
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
