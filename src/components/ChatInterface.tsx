
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import MessageDisplay from "./MessageDisplay";
import MessageInputSection from "./MessageInputSection";
import { useConversations } from "@/hooks/useConversations";
import useMessageListener from "@/hooks/useMessageListener";
import { useMessageManager } from "@/hooks/useMessageManager";
import { useCodeRunEvents } from "@/hooks/useCodeRunEvents";

const ChatInterface = () => {
  const { id: conversationId } = useParams<{ id: string }>();
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [forceExtensionInstalled, setForceExtensionInstalled] = useState(false);

  const { messages, isLoading, error, setIsLoading, setMessages } = useConversations(conversationId);
  const codeRunEventsData = useCodeRunEvents(conversationId || "");

  useEffect(() => {
    // Simulate checking if the extension is installed
    // In a real application, you would use a more reliable method
    setTimeout(() => {
      setIsExtensionInstalled(true);
    }, 1000);
  }, []);

  const onSendMessage = (message: string) => {
    // Any custom logic here
    console.log("Message sent:", message);
  };

  const { 
    localMessageIds, 
    pendingMessageIds,
    streamingMessages,
    setStreamingMessages,
    updateMessageContent,
    handleSubmit,
    handleCodeRun,
    setPendingMessageIds
  } = useMessageManager(
    conversationId || "",
    setIsLoading,
    setMessages,
    onSendMessage
  );

  useMessageListener(
    conversationId || "",
    setMessages,
    localMessageIds,
    setPendingMessageIds,
    updateMessageContent,
    setStreamingMessages
  );

  const handleInputSubmit = useCallback(
    (inputValue: string) => {
      handleSubmit(inputValue);
    },
    [handleSubmit]
  );
  
  const handleRunCode = useCallback(
    (codeContent: string) => {
      handleCodeRun(codeContent);
    },
    [handleCodeRun]
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4">
        <MessageDisplay
          messages={messages}
          isExtensionInstalled={isExtensionInstalled}
          pendingMessageIds={pendingMessageIds}
          streamingMessages={streamingMessages}
          forceExtensionInstalled={forceExtensionInstalled}
          codeRunEventsData={codeRunEventsData}
        />
      </div>
      <div className="border-t p-4">
        <MessageInputSection
          conversationId={conversationId || ""}
          isLoading={isLoading}
          onSendMessage={handleInputSubmit}
          onCodeRun={handleRunCode}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
