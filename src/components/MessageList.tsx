
import { useRef, useEffect } from "react";
import { Film, Download } from "lucide-react";
import { Message } from "@/types";
import { ScreenRecording } from "@/hooks/useConversations";
import { Button } from "@/components/ui/button";

interface MessageListProps {
  messages: Message[];
  hasScreenRecording: (message: Message) => boolean;
  screenRecordings: Record<string, ScreenRecording>;
}

export const MessageList = ({ 
  messages, 
  hasScreenRecording, 
  screenRecordings 
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStartScreenRecording = () => {
    window.postMessage({ type: "START_SCREEN_RECORDING" }, "*");
  };

  const isExtensionInstalled = () => {
    return typeof window !== 'undefined' && 
           window.hasOwnProperty('macroAgentsExtensionInstalled') &&
           (window as any).macroAgentsExtensionInstalled === true;
  };

  const shouldShowRecordingButton = (content: string) => {
    return content.toLowerCase().includes("ready");
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
              {message.content}
            </div>
          </div>
          
          {/* Screen Recording Button or Extension Download Prompt */}
          {message.role === "assistant" && shouldShowRecordingButton(message.content) && (
            <div className="flex justify-center mt-4">
              {isExtensionInstalled() ? (
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
