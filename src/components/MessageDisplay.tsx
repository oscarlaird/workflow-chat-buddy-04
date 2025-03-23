
import { Message } from "@/types";
import { ScreenRecording } from "@/hooks/useConversations";
import MessageList from "@/components/MessageList";
import { useCodeRunEvents } from "@/hooks/useCodeRunEvents";

interface MessageDisplayProps {
  messages: Message[];
  screenRecordings: Record<string, ScreenRecording>;
  isExtensionInstalled: boolean;
  pendingMessageIds: Set<string>;
  streamingMessages: Set<string>;
  forceExtensionInstalled: boolean;
  codeRunEventsData?: ReturnType<typeof useCodeRunEvents>;
}

export const MessageDisplay = ({
  messages,
  screenRecordings,
  isExtensionInstalled,
  pendingMessageIds,
  streamingMessages,
  forceExtensionInstalled = false,
  codeRunEventsData
}: MessageDisplayProps) => {
  // Get chat ID from the first message (all messages should be from the same chat)
  const chatId = messages.length > 0 ? messages[0].chat_id : "";
  
  // If codeRunEventsData wasn't passed in, initialize it here
  const localCodeRunEventsData = !codeRunEventsData ? useCodeRunEvents(chatId || "") : null;
  
  // Use the passed data or the locally initialized data
  const effectiveCodeRunEventsData = codeRunEventsData || localCodeRunEventsData;

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
      screenRecordings={screenRecordings}
      isExtensionInstalled={isExtensionInstalled}
      pendingMessageIds={pendingMessageIds}
      streamingMessageIds={streamingMessages}
      forceExtensionInstalled={forceExtensionInstalled}
      codeRunEventsData={effectiveCodeRunEventsData}
    />
  );
};

export default MessageDisplay;
