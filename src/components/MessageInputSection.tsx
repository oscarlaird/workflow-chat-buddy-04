
import { useState } from "react";
import ChatInput from "./ChatInput";

interface MessageInputSectionProps {
  conversationId: string;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

export const MessageInputSection = ({ 
  conversationId, 
  isLoading, 
  onSendMessage
}: MessageInputSectionProps) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center border-t border-gray-200 dark:border-gray-700 p-2">
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
