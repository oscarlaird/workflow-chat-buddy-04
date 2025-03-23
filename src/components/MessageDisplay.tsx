
import React from "react";
import { Message } from "@/types";
import { ScreenRecording } from "@/hooks/useConversations";
import MessageList from "./MessageList";
import { useCodeRunEvents } from "@/hooks/useCodeRunEvents";

interface MessageDisplayProps {
  messages: Message[];
  hasScreenRecording: (message: Message) => boolean;
  screenRecordings: Record<string, ScreenRecording>;
  isExtensionInstalled: boolean;
  pendingMessageIds: Set<string>;
  streamingMessages: Set<string>;
  runMessages: any[];
  onStopRun: (runId: string) => void;
  forceExtensionInstalled?: boolean;
  codeRunEventsData?: ReturnType<typeof useCodeRunEvents>;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({
  messages,
  hasScreenRecording,
  screenRecordings,
  isExtensionInstalled,
  pendingMessageIds,
  streamingMessages,
  runMessages,
  onStopRun,
  forceExtensionInstalled = false,
  codeRunEventsData
}) => {
  return (
    <MessageList
      messages={messages}
      hasScreenRecording={hasScreenRecording}
      screenRecordings={screenRecordings}
      isExtensionInstalled={isExtensionInstalled}
      pendingMessageIds={pendingMessageIds}
      streamingMessageIds={streamingMessages}
      runMessages={runMessages}
      onStopRun={onStopRun}
      forceExtensionInstalled={forceExtensionInstalled}
      codeRunEventsData={codeRunEventsData}
    />
  );
};

export default MessageDisplay;
