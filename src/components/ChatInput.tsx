
import { useState, useRef, useEffect } from "react";
import { CornerDownLeft, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/components/ui/use-toast";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading, disabled = false }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Focus the textarea when component mounts
  useEffect(() => {
    if (textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  // This effect will run after state updates and maintain focus
  useEffect(() => {
    if (!isLoading && textareaRef.current && !disabled) {
      textareaRef.current.focus();
    }
  }, [isLoading, disabled]);

  // Listen for messages from the extension
  useEffect(() => {
    const handleRecordingStatus = (event: MessageEvent) => {
      if (event.data && event.data.type === 'RECORDING_STATUS') {
        if (event.data.status === 'started') {
          setIsRecording(true);
          toast({
            title: "Recording started",
            description: "Your screen recording has started. Click the recording button again to stop."
          });
        } else if (event.data.status === 'stopped') {
          setIsRecording(false);
          toast({
            title: "Recording completed",
            description: "Your screen recording has been added to the conversation."
          });
          
          // Send a message to indicate the recording was completed
          if (event.data.recordingId) {
            onSendMessage(`I've shared a screen recording (ID: ${event.data.recordingId})`);
          }
        }
      }
    };

    window.addEventListener('message', handleRecordingStatus);
    return () => window.removeEventListener('message', handleRecordingStatus);
  }, [onSendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || disabled) return;
    
    // Store current input value and clear input before sending
    const messageToSend = inputValue;
    setInputValue("");
    
    // Send message after state update
    onSendMessage(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    autoResizeTextarea();
  };

  const handleScreenRecording = () => {
    if (isRecording) {
      // Stop the current recording
      window.postMessage({
        type: 'STOP_RECORDING',
      }, '*');
    } else {
      // Generate a unique ID for this recording session
      const recordingId = uuidv4();
      
      // Send message to extension to start recording in the current window
      window.postMessage({
        type: 'START_RECORDING',
        payload: {
          recordingId,
          inCurrentWindow: true,
        }
      }, '*');
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <form ref={formRef} onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2 items-end">
          <Button
            type="button"
            size="icon"
            variant={isRecording ? "destructive" : "outline"}
            className="flex-shrink-0"
            onClick={handleScreenRecording}
            disabled={disabled}
            title={isRecording ? "Stop recording" : "Start screen recording"}
          >
            <Video className="h-4 w-4" />
          </Button>
          
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? "Select or create a chat to start messaging..." : "Type your message..."}
              rows={1}
              className="w-full py-3 px-4 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
              disabled={isLoading || disabled}
              autoFocus={!disabled}
            />
            <button
              type="submit"
              className="absolute right-3 bottom-3 p-1.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              disabled={!inputValue.trim() || isLoading || disabled}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CornerDownLeft className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </form>
      <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
        {disabled ? 
          "Select a chat from the sidebar or create a new one" : 
          "Press Enter to send, Shift+Enter for a new line"}
      </div>
    </div>
  );
};

export default ChatInput;
