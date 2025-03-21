
import { useState, useRef, useEffect } from "react";
import { CornerDownLeft, Loader2, Video, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  chatId?: string;
}

export const ChatInput = ({ 
  onSendMessage, 
  isLoading, 
  disabled = false,
  chatId
}: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Determine if the page is accessed through the extension
  const isInExtension = window.location.search.includes("chat_id");

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

  useEffect(() => {
    // Listen for recording status changes
    const handleRecordingStatus = (event: MessageEvent) => {
      if (event.data && event.data.type === "RECORDING_STATUS") {
        setIsRecording(event.data.isRecording);
      }
    };

    window.addEventListener("message", handleRecordingStatus);
    return () => window.removeEventListener("message", handleRecordingStatus);
  }, []);

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

  const addRecordingRequestedMessage = async () => {
    if (!chatId) return;
    
    try {
      const messageId = uuidv4();
      
      const messageData = {
        id: messageId,
        chat_id: chatId,
        role: 'assistant',
        content: 'Click Here to Start Recording',
        function_name: 'recording_requested',
        is_currently_streaming: false,
        username: 'system' // Required username field
      };
      
      await supabase.from('messages').insert(messageData);
    } catch (error) {
      console.error('Error adding recording_requested message:', error);
    }
  };

  const handleScreenRecording = async () => {
    if (isInExtension) {
      // Toggle recording state
      const newRecordingState = !isRecording;
      setIsRecording(newRecordingState);
      
      // Message directly to background script
      if (newRecordingState) {
        // Start recording
        if (window.chrome?.runtime) {
          window.chrome.runtime.sendMessage({
            action: "startRecording",
            chatId: chatId
          });
        } else {
          // Fallback for when chrome API is not available but we're in extension
          window.parent.postMessage({
            type: 'START_RECORDING',
            payload: {
              chatId: chatId
            }
          }, '*');
        }
      } else {
        // Stop recording
        if (window.chrome?.runtime) {
          window.chrome.runtime.sendMessage({
            action: "stopRecording",
            chatId: chatId
          });
        } else {
          // Fallback for when chrome API is not available but we're in extension
          window.parent.postMessage({
            type: 'STOP_RECORDING',
            payload: {
              chatId: chatId
            }
          }, '*');
        }
      }
    } else {
      // When in dashboard, create recording window without adding a message yet
      window.postMessage({
        type: 'CREATE_RECORDING_WINDOW',
        payload: {
          chatId: chatId
        }
      }, '*');
    }
  };

  // Generate recording button classes based on state
  const getRecordingButtonClasses = () => {
    let classes = "flex items-center gap-1 absolute left-3 bottom-3 p-1.5 rounded-md transition-colors disabled:opacity-50";
    
    if (isInExtension && isRecording) {
      // Red recording button with pulsing border when recording in extension
      classes += " bg-red-100 hover:bg-red-200 text-red-600 animate-pulse";
    } else {
      // Default state
      classes += " text-gray-500 hover:text-primary";
    }
    
    return classes;
  };

  // Get the appropriate icon and aria-label for the recording button
  const getRecordingButtonProps = () => {
    if (isRecording) {
      return {
        icon: <Square className="w-5 h-5" />,
        text: "Stop recording",
        ariaLabel: "Stop screen recording",
      };
    } else {
      return {
        icon: <Video className="w-5 h-5" />,
        text: "Add screen recording",
        ariaLabel: "Open screen recording",
      };
    }
  };

  const recordingButtonProps = getRecordingButtonProps();

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <form ref={formRef} onSubmit={handleSubmit} className="relative">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Select or create a chat to start messaging..." : "Type your message..."}
          rows={1}
          className="w-full py-3 px-4 pr-12 pl-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
          disabled={isLoading || disabled}
          autoFocus={!disabled}
        />
        <button
          type="button"
          onClick={handleScreenRecording}
          className={getRecordingButtonClasses()}
          disabled={disabled}
          aria-label={recordingButtonProps.ariaLabel}
        >
          {recordingButtonProps.icon}
          <span className="text-xs font-medium">{recordingButtonProps.text}</span>
        </button>
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
      </form>
      <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
        {disabled ? 
          "Select a chat from the sidebar or create a new one" : 
          isInExtension && isRecording ?
            "Recording in progress. Click the stop button to finish recording." :
            "Press Enter to send, Shift+Enter for a new line"}
      </div>
    </div>
  );
};

export default ChatInput;
