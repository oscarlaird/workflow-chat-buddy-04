
import { useState } from "react";
import ChatInput from "./ChatInput";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MessageInputSectionProps {
  conversationId: string;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onCodeRun?: (codeContent: string) => void;
}

export const MessageInputSection = ({ 
  conversationId, 
  isLoading, 
  onSendMessage,
  onCodeRun
}: MessageInputSectionProps) => {
  const [showCodeRunner, setShowCodeRunner] = useState(false);
  const [codeInput, setCodeInput] = useState("");

  const handleCodeSubmit = async () => {
    if (codeInput.trim()) {
      try {
        // Create a message with code_run type
        const messageId = uuidv4();
        
        const { error } = await supabase
          .from('messages')
          .insert({
            id: messageId,
            chat_id: conversationId,
            role: 'assistant',
            content: codeInput,
            username: 'current_user',
            type: 'code_run'
          });
  
        if (error) {
          console.error('Error creating code run message:', error);
          toast.error('Failed to submit code for execution');
          return;
        }
        
        // Clear the code input and hide the code runner
        setCodeInput("");
        setShowCodeRunner(false);
        
        toast.success("Code submitted for execution");
        
        // Call the onCodeRun callback if provided
        if (onCodeRun) {
          onCodeRun(codeInput);
        }
      } catch (err) {
        console.error('Error submitting code:', err);
        toast.error('An unexpected error occurred');
      }
    }
  };
  
  return (
    <div className="flex flex-col">
      {showCodeRunner && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex flex-col space-y-2">
            <label htmlFor="code-input" className="text-sm font-medium">
              Code to run:
            </label>
            <textarea
              id="code-input"
              className="min-h-24 p-2 border border-gray-300 dark:border-gray-600 rounded-md"
              placeholder="Enter code to run..."
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md text-sm"
                onClick={() => setShowCodeRunner(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm disabled:opacity-50"
                onClick={handleCodeSubmit}
                disabled={!codeInput.trim() || isLoading}
              >
                Run Code
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex items-center border-t border-gray-200 dark:border-gray-700 p-2">
        <button
          className="text-xs px-2 py-1 mr-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
          onClick={() => setShowCodeRunner(!showCodeRunner)}
        >
          {showCodeRunner ? "Hide Code Runner" : "Run Code"}
        </button>
        <div className="flex-1">
          <ChatInput
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            disabled={!conversationId}
            chatId={conversationId}
          />
        </div>
      </div>
    </div>
  );
};

export default MessageInputSection;
