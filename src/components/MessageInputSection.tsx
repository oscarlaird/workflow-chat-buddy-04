
import { useState, useRef, useEffect } from "react";
import ChatInput from "@/components/ChatInput";

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
  const prevConversationIdRef = useRef<string | null>(null);

  // Set initial focus on load
  useEffect(() => {
    if (conversationId && prevConversationIdRef.current !== conversationId) {
      prevConversationIdRef.current = conversationId;
      
      setTimeout(() => {
        const textareaElement = document.querySelector('.chat-interface textarea') as HTMLTextAreaElement;
        if (textareaElement) {
          textareaElement.focus();
        }
      }, 200);
    }
  }, [conversationId]);

  return (
    <ChatInput 
      onSendMessage={onSendMessage}
      isLoading={isLoading}
      disabled={!conversationId}
      chatId={conversationId}
    />
  );
};

export default MessageInputSection;
