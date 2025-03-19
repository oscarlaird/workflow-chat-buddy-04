
import { useState, useRef, useEffect } from "react";
import { CornerDownLeft, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from 'uuid';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading, disabled = false }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
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

  const handleStartScreenRecording = () => {
    // Generate a unique ID for this recording session
    const recordingId = uuidv4();
    
    // Send message to extension to create a recording window
    window.postMessage({
      type: 'CREATE_RECORDING_WINDOW',
      payload: {
        recordingId,
      }
    }, '*');
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <form ref={formRef} onSubmit={handleSubmit} className="relative">
        <div className="flex gap-2 items-end">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="flex-shrink-0"
            onClick={handleStartScreenRecording}
            disabled={disabled}
            title="Start screen recording"
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
