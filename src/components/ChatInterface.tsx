
import { useConversations } from "@/hooks/useConversations";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCodeRunEvents } from "@/hooks/useCodeRunEvents";
import { useRunMessages } from "@/hooks/useRunMessages";
import { useMessageManager } from "@/hooks/useMessageManager";

interface ChatInterfaceProps {
  conversationId: string;
  onSendMessage: (message: string) => void;
  forceExtensionInstalled?: boolean;
}

export const ChatInterface = forwardRef(({
  conversationId,
  onSendMessage,
  forceExtensionInstalled = false
}: ChatInterfaceProps, ref) => {
  const { 
    messages,
    screenRecordings,
    isLoading, 
    setIsLoading,
    hasScreenRecording,
    setMessages,
    currentRunId,
    setCurrentRunId
  } = useConversations({ conversationId });
  
  // Initialize code run events hook
  const codeRunEventsData = useCodeRunEvents(conversationId);
  
  // Initialize run messages hook
  const { 
    runMessages, 
    processSpawnWindowMessage, 
    handleStopRun 
  } = useRunMessages(conversationId);
  
  // Initialize message manager hook
  const {
    localMessageIds,
    pendingMessageIds,
    streamingMessages,
    setStreamingMessages, // Add this line to correctly destructure the setter
    updateMessageContent,
    handleSubmit,
    setPendingMessageIds
  } = useMessageManager(
    conversationId,
    setIsLoading,
    setMessages,
    currentRunId,
    setCurrentRunId,
    onSendMessage
  );
  
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const prevConversationIdRef = useRef<string | null>(null);

  // Expose the handleSubmit method to the parent component
  useImperativeHandle(ref, () => ({
    handleSubmit: (inputValue: string) => handleSubmit(inputValue)
  }));

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

  // Handle extension installation check
  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "EXTENSION_INSTALLED") {
        console.log("Extension installation detected in ChatInterface:", event.data);
        setIsExtensionInstalled(true);
      }
    };

    window.addEventListener("message", handleExtensionMessage);
    return () => window.removeEventListener("message", handleExtensionMessage);
  }, []);

  // Handle workflow run created events
  useEffect(() => {
    const handleWorkflowRunCreated = (event: MessageEvent) => {
      if (event.data && 
          event.data.type === "WORKFLOW_RUN_CREATED" && 
          event.data.chatId === conversationId) {
        setCurrentRunId(event.data.runId);
      }
    };

    window.addEventListener("message", handleWorkflowRunCreated);
    return () => window.removeEventListener("message", handleWorkflowRunCreated);
  }, [conversationId, setCurrentRunId]);

  // Process spawn window messages when they arrive
  useEffect(() => {
    // Check for any spawn_window messages that need processing
    runMessages.forEach(message => {
      if (message.type === 'spawn_window') {
        processSpawnWindowMessage(message, isExtensionInstalled);
      }
    });
  }, [runMessages, isExtensionInstalled, processSpawnWindowMessage]);

  // Set up message listeners
  useEffect(() => {
    if (!conversationId) return;
    
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${conversationId}`
      }, (payload) => {
        const newMessage = payload.new;
        
        if (localMessageIds.has(newMessage.id)) {
          setPendingMessageIds(prev => {
            const updated = new Set(prev);
            updated.delete(newMessage.id);
            return updated;
          });
          
          return;
        }
        
        setMessages(prev => {
          if (prev.some(msg => msg.id === newMessage.id)) {
            return prev;
          }
          
          return [
            ...prev, 
            {
              id: newMessage.id,
              role: newMessage.role,
              content: newMessage.content,
              username: newMessage.username,
              function_name: newMessage.function_name,
              workflow_step_id: newMessage.workflow_step_id,
              run_id: newMessage.run_id,
              code_run: newMessage.code_run,
              code_output: newMessage.code_output,
              code_output_error: newMessage.code_output_error,
              screenrecording_url: newMessage.screenrecording_url,
              code_output_tables: newMessage.code_output_tables
            }
          ];
        });

        if (newMessage.is_currently_streaming) {
          setStreamingMessages(prev => new Set(prev).add(newMessage.id));
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${conversationId}`
      }, (payload) => {
        const updatedMessage = payload.new;
        
        const messageUpdate = {
          content: updatedMessage.content,
          function_name: updatedMessage.function_name,
          code_output: updatedMessage.code_output,
          code_output_error: updatedMessage.code_output_error,
          code_run: updatedMessage.code_run,
          code_run_success: updatedMessage.code_run_success,
          code_output_tables: updatedMessage.code_output_tables
        };
        
        updateMessageContent(
          updatedMessage.id, 
          messageUpdate, 
          updatedMessage.is_currently_streaming
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, setMessages, localMessageIds, updateMessageContent, setPendingMessageIds, setStreamingMessages]);

  return (
    <div className="flex flex-col h-full chat-interface">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="space-y-4 max-w-md">
              <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">
                Start a new conversation
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Type a message below to begin, or select an example workflow from the "New Chat" menu.
              </p>
            </div>
          </div>
        ) : (
          <MessageList 
            messages={messages} 
            hasScreenRecording={hasScreenRecording} 
            screenRecordings={screenRecordings}
            isExtensionInstalled={isExtensionInstalled}
            pendingMessageIds={pendingMessageIds}
            streamingMessageIds={streamingMessages}
            runMessages={runMessages}
            onStopRun={handleStopRun}
            forceExtensionInstalled={forceExtensionInstalled}
            codeRunEventsData={codeRunEventsData}
          />
        )}
      </div>

      <ChatInput 
        onSendMessage={handleSubmit} 
        isLoading={isLoading} 
        disabled={!conversationId}
        chatId={conversationId}
      />
    </div>
  );
});

export default ChatInterface;
