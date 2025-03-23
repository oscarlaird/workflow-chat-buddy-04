
import { useState } from "react";
import ChatInput from "./ChatInput";

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
  const [showAI, setShowAI] = useState(false);
  const [codeInput, setCodeInput] = useState("");

  const handleCodeSubmit = () => {
    if (onCodeRun && codeInput.trim()) {
      onCodeRun(codeInput);
      setCodeInput("");
    }
  };
  
  return (
    <div className="flex flex-col">
      {showAI && (
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
                onClick={() => setShowAI(false)}
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
          onClick={() => setShowAI(!showAI)}
        >
          {showAI ? "Hide Code Runner" : "Run Code"}
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
