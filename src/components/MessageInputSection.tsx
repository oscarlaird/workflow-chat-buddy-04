
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
      isLoading={isLoading}
      disabled={!conversationId}
      chatId={conversationId}
      onCodeRun={onCodeRun}
    />
  );
};

export default MessageInputSection;
