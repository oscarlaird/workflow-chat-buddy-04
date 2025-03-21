
import { useRef, useEffect } from "react";
import { Message } from "@/types";
import { ScreenRecording } from "@/hooks/useConversations";
import RunMessage from "./RunMessage";
import UserMessage from "./UserMessage";
import FunctionMessage from "./FunctionMessage";
import WorkflowStepMessage from "./WorkflowStepMessage";
import ScreenRecordingMessage from "./ScreenRecordingMessage";
import ScreenRecordingDisplay from "./ScreenRecordingDisplay";
import ExtensionAlert from "./ExtensionAlert";
import EmptyMessageList from "./EmptyMessageList";
import RecordingButton from "./RecordingButton";

interface MessageListProps {
  messages: Message[];
  hasScreenRecording: (message: Message) => boolean;
  screenRecordings: Record<string, ScreenRecording>;
  isExtensionInstalled: boolean;
  pendingMessageIds?: Set<string>;
  streamingMessageIds?: Set<string>;
  runMessages?: any[];
  onStopRun?: (runId: string) => void;
  forceExtensionInstalled?: boolean;
}

export const MessageList = ({ 
  messages, 
  hasScreenRecording, 
  screenRecordings,
  isExtensionInstalled,
  pendingMessageIds = new Set(),
  streamingMessageIds = new Set(),
  runMessages = [],
  forceExtensionInstalled = false,
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

  // Find the latest run ID among all messages
  const getLatestRunId = () => {
    const runMessages = messages.filter(msg => msg.run_id);
    if (runMessages.length === 0) return null;
    
    // Sort by message index in the array (most recent will be last)
    return runMessages[runMessages.length - 1].run_id;
  };

  const latestRunId = getLatestRunId();

  // Check if any run message is of type spawn_window for this run
  const shouldShowExtensionAlert = (runId: string) => {
    if (effectiveIsExtensionInstalled) return false;
    
    const hasSpawnWindowMessage = runMessages.some(msg => 
      msg.run_id === runId && 
      msg.type === 'spawn_window'
    );
    
    return hasSpawnWindowMessage;
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
        
        // Check if this message is a run message first
        if (message.run_id) {
          return (
            <div key={message.id} className="space-y-4">
              <RunMessage 
                runId={message.run_id} 
                isLatestRun={message.run_id === latestRunId} 
              />
              
              {/* Extension Alert for Runs */}
              {shouldShowExtensionAlert(message.run_id) && (
                <ExtensionAlert runId={message.run_id} />
              )}
            </div>
          );
        }
        
        // Special handling for screen_recording function
        if (message.function_name === "screen_recording") {
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
            {hasScreenRecording(message) && message.function_name !== "screen_recording" && (
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
