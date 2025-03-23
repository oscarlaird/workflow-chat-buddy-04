
import { Message } from "@/types";
import { ScreenRecording } from "@/hooks/useConversations";
import MessageList from "@/components/MessageList";
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
  forceExtensionInstalled: boolean;
}

export const MessageDisplay = ({
  messages,
  hasScreenRecording,
  screenRecordings,
  isExtensionInstalled,
  pendingMessageIds,
  streamingMessages,
  runMessages,
  onStopRun,
  forceExtensionInstalled = false
}: MessageDisplayProps) => {
  // Get chat ID from the first message (all messages should be from the same chat)
  const chatId = messages.length > 0 ? messages[0].chat_id : "";
  
  // Initialize code run events for this chat
  const codeRunEventsData = useCodeRunEvents(chatId || "");

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="space-y-4 max-w-md">
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">
            Start a new conversation
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Type a message below to begin, or select an example workflow from the "New Chat" menu.
          </p>
        </div>
      </div>
    );
  }

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
