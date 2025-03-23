
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Message } from "@/types";
import ScrollToBottom from "./ScrollToBottom";
import { useMessageManager } from "@/hooks/useMessageManager";
import { useConversations } from "@/hooks/useConversations";
import { useExtensionStatus } from "@/hooks/useExtensionStatus";
import { useMessageListener } from "@/hooks/useMessageListener";
import { useRunEvents } from "@/hooks/useRunEvents";
import { useRunMessages } from "@/hooks/useRunMessages";
import { Loader2 } from "lucide-react";
import MessageInputSection from "./MessageInputSection";
import MessageDisplay from "./MessageDisplay";
import { useCodeRunEvents } from "@/hooks/useCodeRunEvents";

interface ChatInterfaceProps {
  conversationId: string;
  onSendMessage?: (message: string) => void;
  forceExtensionInstalled?: boolean;
}

export interface ChatInterfaceHandle {
  scrollToBottom: () => void;
  handleFileUpload: (file: File) => void;
  onFileInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadFile: (file: File) => Promise<string | null>;
  addUploadedImage: (url: string) => void;
  handleRunWorkflow: () => void;
  getMessages: () => Message[];
}

const ChatInterface = forwardRef<ChatInterfaceHandle, ChatInterfaceProps>(
  ({ conversationId, onSendMessage, forceExtensionInstalled = false }, ref) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentRunId, setCurrentRunId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const localMessageIds = useRef<Set<string>>(new Set()); // Track local message IDs
    
    const { 
      messageValue, 
      setMessageValue,
      pendingMessageIds,
      setPendingMessageIds,
      sendMessage,
      updateMessageContent,
      streamingMessages,
      setStreamingMessages,
      uploadFile,
      uploadedImages,
      setUploadedImages
    } = useMessageManager(conversationId);
    
    const { loadConversation, hasScreenRecording, screenRecordings } = useConversations();
    const { isExtensionInstalled, setIsExtensionInstalled } = useExtensionStatus();
    const { runMessages, handleStopRun } = useRunMessages(conversationId);
    
    // Initialize the useCodeRunEvents hook for this conversation
    const codeRunEventsData = useCodeRunEvents(conversationId);
    
    // Setup run events listener
    useRunEvents(conversationId, setCurrentRunId);
    
    // Setup message listener
    useMessageListener(
      conversationId, 
      setMessages, 
      localMessageIds.current, 
      setPendingMessageIds, 
      updateMessageContent, 
      setStreamingMessages
    );
    
    // Load conversation on initial render
    useEffect(() => {
      const loadData = async () => {
        setIsLoading(true);
        try {
          const conversationData = await loadConversation(conversationId);
          if (conversationData) {
            setMessages(conversationData.messages || []);
          }
        } catch (error) {
          console.error('Error loading conversation:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      // Reset state when conversation ID changes
      setMessages([]);
      setMessageValue('');
      setCurrentRunId(null);
      
      if (conversationId) {
        loadData();
      }
    }, [conversationId, loadConversation, setMessageValue]);
    
    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      scrollToBottom: () => {
        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      },
      handleFileUpload: () => {
        if (fileInputRef.current) {
          fileInputRef.current.click();
        }
      },
      onFileInputChange: async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
          const file = files[0];
          const imageUrl = await uploadFile(file);
          if (imageUrl) {
            setUploadedImages([...uploadedImages, imageUrl]);
          }
        }
        // Clear the input so the same file can be uploaded again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      uploadFile,
      addUploadedImage: (url: string) => {
        setUploadedImages([...uploadedImages, url]);
      },
      handleRunWorkflow: () => {
        console.log("Running workflow from ChatInterface");
        // Implementation placeholder
      },
      getMessages: () => messages
    }));
    
    const handleStopRunWrapper = (runId: string) => {
      handleStopRun(runId);
    };
    
    if (isLoading && messages.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      );
    }
    
    // Combine the prop with the hook value
    const effectiveIsExtensionInstalled = isExtensionInstalled || forceExtensionInstalled;
    
    return (
      <div className="flex flex-col h-full relative">
        <div
          id="messages-container"
          className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
        >
          <MessageDisplay 
            messages={messages}
            hasScreenRecording={hasScreenRecording}
            screenRecordings={screenRecordings}
            isExtensionInstalled={effectiveIsExtensionInstalled}
            pendingMessageIds={pendingMessageIds}
            streamingMessages={streamingMessages}
            runMessages={runMessages}
            onStopRun={handleStopRunWrapper}
            forceExtensionInstalled={forceExtensionInstalled}
            codeRunEventsData={codeRunEventsData}
          />
        </div>
        
        <ScrollToBottom />
        
        <MessageInputSection 
          messageValue={messageValue}
          setMessageValue={setMessageValue}
          sendMessage={sendMessage}
          uploadedImages={uploadedImages}
          setUploadedImages={setUploadedImages}
          fileInputRef={fileInputRef}
          isExtensionInstalled={isExtensionInstalled}
          setIsExtensionInstalled={setIsExtensionInstalled}
        />
      </div>
    );
  }
);

ChatInterface.displayName = "ChatInterface";

export default ChatInterface;
