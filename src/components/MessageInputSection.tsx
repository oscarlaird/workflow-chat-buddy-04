
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
  // Ensure we're only passing props that ChatInput accepts
  return (
    <ChatInput
      onSendMessage={onSendMessage}
      isLoading={isLoading}
      disabled={!conversationId}
      chatId={conversationId}
      // Only pass onCodeRun if it's defined
      {...(onCodeRun ? { onCodeRun } : {})}
    />
  );
};

export default MessageInputSection;
