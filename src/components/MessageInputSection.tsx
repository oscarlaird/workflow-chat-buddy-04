
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
  return (
    <ChatInput
      onSendMessage={onSendMessage}
      onCodeRun={onCodeRun}
      isLoading={isLoading}
      disabled={!conversationId}
      chatId={conversationId}
    />
  );
};

export default MessageInputSection;
