import { useRef, useEffect } from "react";
import { Film, Download, Loader2, Circle, CheckCircle } from "lucide-react";
import { Message } from "@/types";
import { ScreenRecording } from "@/hooks/useConversations";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageListProps {
  messages: Message[];
  hasScreenRecording: (message: Message) => boolean;
  screenRecordings: Record<string, ScreenRecording>;
  isExtensionInstalled: boolean;
  pendingMessageIds?: Set<string>;
  streamingMessageIds?: Set<string>;
}

export const MessageList = ({ 
  messages, 
  hasScreenRecording, 
  screenRecordings,
  isExtensionInstalled,
  pendingMessageIds = new Set(),
  streamingMessageIds = new Set()
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStartScreenRecording = () => {
    window.postMessage({ type: "CREATE_RECORDING_WINDOW" }, "*");
  };

  const shouldShowRecordingButton = (content: string) => {
    return content.toLowerCase().includes("ready");
  };

  // Function to preserve newlines in message content
  const formatMessageContent = (content: string) => {
    if (!content) return null;
    
    // Split by newlines and create paragraph elements
    return content.split('\n').map((line, index) => (
      <p key={index} className={index > 0 ? "mt-1" : ""}>
        {line || " "} {/* Use a space if line is empty to preserve line height */}
      </p>
    ));
  };

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">Start a new conversation</p>
          <p className="text-sm">Describe what you'd like to build a workflow for.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <div key={message.id} className="space-y-4">
          <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-lg ${
              message.role === "user" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted"
            }`}>
              <div className="flex justify-between items-start mb-1">
                {message.role === "assistant" && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                    {streamingMessageIds.has(message.id) ? (
                      <>
                        <Circle className="h-3 w-3 fill-current text-amber-500 animate-pulse" />
                        <span>Streaming</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>Completed</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {message.content ? (
                formatMessageContent(message.content)
              ) : message.role === "assistant" ? (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse delay-150" />
                  <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-pulse delay-300" />
                </div>
              ) : null}
              
              {pendingMessageIds.has(message.id) && (
                <div className="mt-2 flex items-center gap-1.5 text-xs opacity-70">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Sending...</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Screen Recording Button or Extension Download Prompt */}
          {message.role === "assistant" && shouldShowRecordingButton(message.content) && (
            <div className="flex justify-center mt-4">
              {isExtensionInstalled ? (
                <Button 
                  onClick={handleStartScreenRecording}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
                >
                  <Film className="w-5 h-5" />
                  Start Screen Recording
                </Button>
              ) : (
                <div className="flex flex-col items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-center">
                  <p className="text-amber-800 dark:text-amber-300 mb-2">
                    To use screen recording, you need to install the Macro Agents extension first.
                  </p>
                  <Button 
                    onClick={() => window.open('https://chrome.google.com/webstore/category/extensions', '_blank')}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                  >
                    <Download className="w-5 h-5" />
                    Download Extension
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* Screen recording indicator */}
          {hasScreenRecording(message) && (
            <div className="flex justify-center my-4">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-md text-sm font-medium">
                <Film className="w-4 h-4" />
                <span>Screen recording, {screenRecordings[message.id]?.duration}</span>
              </div>
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
