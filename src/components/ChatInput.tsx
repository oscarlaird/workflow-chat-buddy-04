
import { useState, useRef, useEffect } from "react";
import { CornerDownLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus the textarea when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
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

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          className="w-full py-3 px-4 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
          disabled={isLoading}
          autoFocus
        />
        <button
          type="submit"
          className="absolute right-3 bottom-3 p-1.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          disabled={!inputValue.trim() || isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CornerDownLeft className="w-5 h-5" />
          )}
        </button>
      </form>
      <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
        Press Enter to send, Shift+Enter for a new line
      </div>
    </div>
  );
};

export default ChatInput;
