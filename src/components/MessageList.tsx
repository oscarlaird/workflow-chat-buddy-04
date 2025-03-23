
import { useRef, useEffect } from "react";
import { Message } from "@/types";
import { ScreenRecording } from "@/hooks/useConversations";
import UserMessage from "./UserMessage";
import FunctionMessage from "./FunctionMessage";
import WorkflowStepMessage from "./WorkflowStepMessage";
import ScreenRecordingMessage from "./ScreenRecordingMessage";
import ScreenRecordingDisplay from "./ScreenRecordingDisplay";
import ExtensionAlert from "./ExtensionAlert";
import EmptyMessageList from "./EmptyMessageList";
import RecordingButton from "./RecordingButton";
import CodeRunMessage from "./CodeRunMessage";
import { useCodeRunEvents } from "@/hooks/useCodeRunEvents";

interface MessageListProps {
  messages: Message[];
  hasScreenRecording: (message: Message) => boolean;
  screenRecordings: Record<string, ScreenRecording>;
  isExtensionInstalled: boolean;
  pendingMessageIds?: Set<string>;
  streamingMessageIds?: Set<string>;
  forceExtensionInstalled?: boolean;
  codeRunEventsData?: ReturnType<typeof useCodeRunEvents>;
}

export const MessageList = ({ 
  messages, 
  hasScreenRecording, 
  screenRecordings,
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

  return (
    <div className="space-y-6">
      {messages.map((message) => {
        // Special handling for recording_requested and recording_progress functions
        if (message.function_name === "recording_requested" || message.function_name === "recording_progress") {
          return (
            <div key={message.id} className="flex justify-center">
              <RecordingButton 
                message={message} 
                isInProgress={message.function_name === "recording_progress"} 
              />
            </div>
          );
        }
        
        // Check if this message is a code run message
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
        
        // Special handling for screen_recording type
        if (message.type === "screen_recording" || (message.function_name === "screen_recording")) {
          return (
            <div key={message.id} className="flex justify-center">
              <ScreenRecordingDisplay 
                message={message} 
                duration={hasScreenRecording(message) ? screenRecordings[message.id]?.duration : undefined}
              />
            </div>
          );
        }
        
        // Regular message rendering
        return (
          <div key={message.id} className="space-y-4">
            <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.function_name ? (
                <div className="max-w-[80%]">
                  <FunctionMessage 
                    message={message} 
                    isStreaming={streamingMessageIds.has(message.id)} 
                  />
                </div>
              ) : message.workflow_step_id ? (
                <div className="max-w-[80%]">
                  <WorkflowStepMessage message={message} />
                </div>
              ) : (
                <UserMessage 
                  message={message} 
                  isStreaming={message.role === "assistant" && streamingMessageIds.has(message.id)}
                  isPending={pendingMessageIds.has(message.id)}
                />
              )}
            </div>
            
            {/* Screen Recording indicator for other message types */}
            {hasScreenRecording(message) && (message.type !== "screen_recording") && (
              <ScreenRecordingMessage 
                messageId={message.id} 
                screenRecordings={screenRecordings} 
              />
            )}
          </div>
        );
      })}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
