
import { useRef, useEffect } from "react";
import { Film, Download, Loader2, PenLine, Trash2, Plus } from "lucide-react";
import { Message } from "@/types";
import { ScreenRecording } from "@/hooks/useConversations";
import { Button } from "@/components/ui/button";
import CodeBlock from "./CodeBlock";
import RunMessage from "./RunMessage";

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

  const formatFunctionName = (name: string): string => {
    if (!name) return "";
    
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatMessageContent = (content: string, isStreaming: boolean) => {
    if (!content) return null;
    
    const lines = content.split('\n');
    return (
      <>
        {lines.map((line, index) => {
          const isLastLine = index === lines.length - 1;
          
          return (
            <p key={index} className={index > 0 ? "mt-1" : ""}>
              {line || " "}
              {isStreaming && isLastLine && (
                <span className="inline-block w-1.5 h-3 bg-black dark:bg-white opacity-70 ml-0.5 rounded-sm animate-pulse"></span>
              )}
            </p>
          );
        })}
      </>
    );
  };

  const getFunctionIcon = (functionName: string) => {
    if (!functionName) return <PenLine className="h-4 w-4" />;
    
    const normalizedName = functionName.toLowerCase();
    
    if (normalizedName.includes('insert_workflow_step') || normalizedName.includes('add_workflow_step')) {
      return <Plus className="h-4 w-4" />;
    }
    
    if (normalizedName.includes('remove_workflow_step') || normalizedName.includes('delete_workflow_step')) {
      return <Trash2 className="h-4 w-4" />;
    }
    
    return <PenLine className="h-4 w-4" />;
  };

  const renderFunctionMessage = (message: Message) => {
    const isStreaming = streamingMessageIds.has(message.id);
    const formattedName = formatFunctionName(message.function_name || "");
    const functionIcon = getFunctionIcon(message.function_name || "");
    
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-800 dark:text-blue-300">
        {functionIcon}
        <div className="flex items-center gap-1.5">
          <span className="font-medium">{formattedName}</span>
          {isStreaming && (
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-[pulse_1s_ease-in-out_infinite]"></span>
          )}
        </div>
        {message.content && (
          <div className="ml-2 text-sm opacity-80">
            {message.content}
          </div>
        )}
      </div>
    );
  };

  const renderWorkflowStepMessage = (message: Message) => {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-800 dark:text-purple-300">
        <div className="flex flex-col">
          <span className="font-medium">Workflow Step</span>
          {message.content && (
            <div className="text-sm opacity-80 mt-1">
              {message.content}
            </div>
          )}
        </div>
      </div>
    );
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
          {/* Special Run Message */}
          {message.run_id ? (
            <RunMessage runId={message.run_id} />
          ) : (
            <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.function_name ? (
                <div className="max-w-[80%]">
                  {renderFunctionMessage(message)}
                </div>
              ) : message.workflow_step_id ? (
                <div className="max-w-[80%]">
                  {renderWorkflowStepMessage(message)}
                </div>
              ) : (
                <div 
                  className={`relative max-w-[80%] px-4 py-3 rounded-lg ${
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  }`}
                >
                  {message.content ? (
                    formatMessageContent(
                      message.content, 
                      message.role === "assistant" && streamingMessageIds.has(message.id)
                    )
                  ) : (
                    <p> </p>
                  )}
                  
                  {pendingMessageIds.has(message.id) && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs opacity-70">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Sending...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
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
