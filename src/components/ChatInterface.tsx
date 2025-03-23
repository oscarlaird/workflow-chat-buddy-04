import { useConversations } from "@/hooks/useConversations";
import { forwardRef, useImperativeHandle, useEffect } from "react";
import { useCodeRunEvents } from "@/hooks/useCodeRunEvents";
import { useRunMessages } from "@/hooks/useRunMessages";
import { useMessageManager } from "@/hooks/useMessageManager";
import useMessageListener from "@/hooks/useMessageListener";
import useExtensionStatus from "@/hooks/useExtensionStatus";
import useRunEvents from "@/hooks/useRunEvents";
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
    hasScreenRecording,
    setMessages,
    currentRunId,
    setCurrentRunId
  } = useConversations({ conversationId });
  
  // Initialize code run events hook
  const codeRunEventsData = useCodeRunEvents(conversationId);
  
  // Initialize run messages hook
  const { 
    runMessages, 
    processSpawnWindowMessage, 
    handleStopRun 
  } = useRunMessages(conversationId);
  
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
    currentRunId,
    setCurrentRunId,
    onSendMessage
  );
  
  // Initialize extension status hook
  const { isExtensionInstalled } = useExtensionStatus(forceExtensionInstalled);
  
  // Setup workflow run events listener
  useRunEvents(conversationId, setCurrentRunId);

  // Setup message listener
  useMessageListener(
    conversationId,
    setMessages,
    localMessageIds,
    setPendingMessageIds,
    updateMessageContent,
    setStreamingMessages
  );

  // Process spawn window messages when they arrive
  useEffect(() => {
    // Check for any spawn_window messages that need processing
    runMessages.forEach(message => {
      if (message.type === 'spawn_window') {
        processSpawnWindowMessage(message, isExtensionInstalled);
      }
    });
  }, [runMessages, isExtensionInstalled, processSpawnWindowMessage]);

  // Expose the handleSubmit method to the parent component
  useImperativeHandle(ref, () => ({
    handleSubmit: (inputValue: string) => handleSubmit(inputValue)
  }));

  return (
    <div className="flex flex-col h-full chat-interface">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <MessageDisplay
          messages={messages}
          hasScreenRecording={hasScreenRecording}
          screenRecordings={screenRecordings}
          isExtensionInstalled={isExtensionInstalled}
          pendingMessageIds={pendingMessageIds}
          streamingMessages={streamingMessages}
          runMessages={runMessages}
          onStopRun={handleStopRun}
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
