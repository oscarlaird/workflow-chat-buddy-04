
import { useRef, useEffect } from "react";
import { Message } from "@/types";
import UserMessage from "./UserMessage";
import ScreenRecordingMessage from "./ScreenRecordingMessage";
import ScreenRecordingDisplay from "./ScreenRecordingDisplay";
import ExtensionAlert from "./ExtensionAlert";
import EmptyMessageList from "./EmptyMessageList";
import RecordingButton from "./RecordingButton";
import CodeRunMessage from "./CodeRunMessage";
import { useCodeRunEvents } from "@/hooks/useCodeRunEvents";

interface MessageListProps {
  messages: Message[];
  isExtensionInstalled: boolean;
  pendingMessageIds?: Set<string>;
  streamingMessageIds?: Set<string>;
  forceExtensionInstalled?: boolean;
  codeRunEventsData?: ReturnType<typeof useCodeRunEvents>;
}

export const MessageList = ({ 
  messages, 
  isExtensionInstalled,
  pendingMessageIds = new Set(),
  streamingMessageIds = new Set(),
  forceExtensionInstalled = false,
  codeRunEventsData
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If forceExtensionInstalled is true, we'll consider the extension as installed
  const effectiveIsExtensionInstalled = isExtensionInstalled || forceExtensionInstalled;

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (messages.length === 0) {
    return <EmptyMessageList />;
  }

  // Helper to determine if a message is a recording message
  const isRecordingMessage = (message: Message) => {
    return message.content && (
      message.content.includes("recording_requested") || 
      message.content.includes("recording_progress")
    );
  };

  return (
    <div className="space-y-6">
      {messages.map((message) => {
        // Special handling for recording messages based on content
        if (isRecordingMessage(message)) {
          return (
            <div key={message.id} className="flex justify-center">
              <RecordingButton 
                message={message} 
                isInProgress={message.content?.includes("recording_progress") || false} 
              />
            </div>
          );
        }
        
        // Handle screen recording messages
        if (message.type === "screen_recording") {
          return (
            <div key={message.id} className="flex justify-center">
              <ScreenRecordingDisplay message={message} />
            </div>
          );
        }
        
        // Handle code run messages
        if (message.type === "code_run") {
          return (
            <div key={message.id} className="flex justify-start">
              <CodeRunMessage 
                message={message} 
                isStreaming={streamingMessageIds.has(message.id)}
                codeRunEventsData={codeRunEventsData}
              />
            </div>
          );
        }
        
        // Default to text message handling
        return (
          <div key={message.id} className="space-y-4">
            <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <UserMessage 
                message={message} 
                isStreaming={message.role === "assistant" && streamingMessageIds.has(message.id)}
                isPending={pendingMessageIds.has(message.id)}
              />
            </div>
          </div>
        );
      })}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
