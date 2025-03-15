
import { useRef, useEffect } from "react";
import { Film } from "lucide-react";
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
          
          {/* Screen Recording Button */}
          {message.role === "assistant" && shouldShowRecordingButton(message.content) && (
            <div className="flex justify-center mt-4">
              <Button 
                onClick={handleStartScreenRecording}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
              >
                <Film className="w-5 h-5" />
                Start Screen Recording
              </Button>
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
