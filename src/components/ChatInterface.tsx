
import { useConversations } from "@/hooks/useConversations";
import { forwardRef, useImperativeHandle } from "react";
import { useCodeRunEvents } from "@/hooks/useCodeRunEvents";
import { useMessageManager } from "@/hooks/useMessageManager";
import useMessageListener from "@/hooks/useMessageListener";
import useExtensionStatus from "@/hooks/useExtensionStatus";
import MessageDisplay from "@/components/MessageDisplay";
import MessageInputSection from "@/components/MessageInputSection";

interface ChatInterfaceProps {
  conversationId: string;
  onSendMessage: (message: string) => void;
  forceExtensionInstalled?: boolean;
}

export const ChatInterface = forwardRef(({
  conversationId,
  onSendMessage,
  forceExtensionInstalled = false
}: ChatInterfaceProps, ref) => {
  const { 
    messages,
    screenRecordings,
    isLoading, 
    setIsLoading,
    setMessages
  } = useConversations({ conversationId });
  
  // Initialize code run events hook for the entire chat
  const codeRunEventsData = useCodeRunEvents(conversationId);
  
  // Initialize message manager hook
  const {
    localMessageIds,
    pendingMessageIds,
    streamingMessages,
    setStreamingMessages,
    updateMessageContent,
    handleSubmit,
    setPendingMessageIds
  } = useMessageManager(
    conversationId,
    setIsLoading,
    setMessages,
    onSendMessage
  );
  
  // Initialize extension status hook
  const { isExtensionInstalled } = useExtensionStatus(forceExtensionInstalled);
  
  // Setup message listener
  useMessageListener(
    conversationId,
    setMessages,
    localMessageIds,
    setPendingMessageIds,
    updateMessageContent,
    setStreamingMessages
  );

  // Expose the handleSubmit method to the parent component
  useImperativeHandle(ref, () => ({
    handleSubmit: (inputValue: string) => handleSubmit(inputValue)
  }));

  return (
    <div className="flex flex-col h-full chat-interface">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <MessageDisplay
          messages={messages}
          screenRecordings={screenRecordings}
          isExtensionInstalled={isExtensionInstalled}
          pendingMessageIds={pendingMessageIds}
          streamingMessages={streamingMessages}
          forceExtensionInstalled={forceExtensionInstalled}
          codeRunEventsData={codeRunEventsData}
        />
      </div>

      <MessageInputSection
        conversationId={conversationId}
        isLoading={isLoading}
        onSendMessage={handleSubmit}
      />
    </div>
  );
});

export default ChatInterface;
