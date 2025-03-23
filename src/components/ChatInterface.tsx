import { useConversations } from "@/hooks/useConversations";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message, RunMessage, RunMessageType, RunMessageSenderType } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/components/ui/use-toast";
import { useCodeRunEvents } from "@/hooks/useCodeRunEvents";

interface ChatInterfaceProps {
  conversationId: string;
  onSendMessage: (message: string) => void;
  forceExtensionInstalled?: boolean;
  onMessagesUpdated?: (messages: Message[]) => void;
}

export const ChatInterface = forwardRef(({
  conversationId,
  onSendMessage,
  forceExtensionInstalled = false,
  onMessagesUpdated
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
  
  const [localMessageIds, setLocalMessageIds] = useState<Set<string>>(new Set());
  const [pendingMessageIds, setPendingMessageIds] = useState<Set<string>>(new Set());
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [streamingMessages, setStreamingMessages] = useState<Set<string>>(new Set());
  const [runMessages, setRunMessages] = useState<RunMessage[]>([]);
  
  const prevConversationIdRef = useRef<string | null>(null);

  // Check latest user message every second
  useEffect(() => {
    if (!conversationId) return;
    
    const checkLatestUserMessage = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', conversationId)
          .eq('role', 'user')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error('Error fetching latest user message:', error);
          return;
        }

        if (data && data.length > 0) {
          const latestMessage = data[0] as Message;
          console.log("CHAT INTERFACE - Latest user message from polling:", latestMessage);
          console.log("requires_text_reply:", latestMessage.requires_text_reply);
          console.log("script:", latestMessage.script);
        }
      } catch (err) {
        console.error('Error in checkLatestUserMessage:', err);
      }
    };
    
    // Initial check
    checkLatestUserMessage();
    
    // Set up polling
    const intervalId = setInterval(checkLatestUserMessage, 1000);
    
    return () => clearInterval(intervalId);
  }, [conversationId]);

  // Expose the handleSubmit method to the parent component
  useImperativeHandle(ref, () => ({
    handleSubmit: (inputValue: string) => handleSubmit(inputValue)
  }));

  // Notify parent when messages update
  useEffect(() => {
    if (onMessagesUpdated && messages.length > 0) {
      onMessagesUpdated(messages);
    }
  }, [messages, onMessagesUpdated]);

  useEffect(() => {
    setRunMessages([]);
    
    if (!conversationId) return;
    
    console.log(`Setting up for conversation: ${conversationId}, previous was: ${prevConversationIdRef.current}`);
    
    // Update the previous conversation ID ref
    prevConversationIdRef.current = conversationId;
    
    // Fetch run messages for this conversation
    fetchRunMessages();
  }, [conversationId]);

  // Fetch run messages for this conversation
  const fetchRunMessages = async () => {
    if (!conversationId) return;
    
    try {
      const { data, error } = await supabase
        .from('run_messages')
        .select('*')
        .eq('chat_id', conversationId);
        
      if (error) {
        console.error('Error fetching run messages:', error);
        return;
      }
      
      if (data) {
        setRunMessages(data as RunMessage[]);
      }
    } catch (err) {
      console.error('Exception when fetching run messages:', err);
    }
  };

  // Handle stopping a run
  const handleStopRun = async (runId: string) => {
    if (!runId) return;
    
    try {
      // Update the run status to stopped
      const { error } = await supabase
        .from('runs')
        .update({
          status: 'Stopped - Extension not installed',
          in_progress: false
        })
        .eq('id', runId);
        
      if (error) {
        console.error('Error stopping run:', error);
        toast({
          title: "Error",
          description: "Failed to stop the run",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Run stopped",
        description: "The workflow run has been stopped"
      });
    } catch (err) {
      console.error('Exception when stopping run:', err);
    }
  };

  // Check if the extension is installed
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

  // Process spawn_window messages when extension is installed
  const processSpawnWindowMessage = useCallback(async (runMessage: RunMessage) => {
    if (runMessage.type === RunMessageType.SPAWN_WINDOW && isExtensionInstalled) {
      try {
        // First, create and send a launch_extension run_message
        const launchMessage = {
          run_id: runMessage.run_id,
          type: RunMessageType.LAUNCH_EXTENSION,
          payload: {},
          chat_id: conversationId,
          username: 'current_user',
          sender_type: RunMessageSenderType.DASHBOARD,
          display_text: 'Launching extension...'
        };
        
        // Insert the launch_extension message to the database
        await supabase
          .from('run_messages')
          .insert(launchMessage);
          
        // Send message to extension to create window with chat_id and run_id inside the payload
        window.postMessage({
          type: 'CREATE_AGENT_RUN_WINDOW',
          payload: {
            runId: runMessage.run_id,
            chatId: conversationId,
          }
        }, '*');
      } catch (err) {
        console.error('Error processing spawn_window message:', err);
      }
    }
  }, [isExtensionInstalled, conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    
    const channel = supabase
      .channel(`run_messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'run_messages',
        filter: `chat_id=eq.${conversationId}`
      }, (payload) => {
        // Check if the message has all required properties of RunMessage
        if (payload.new && 
            typeof payload.new === 'object' && 
            'id' in payload.new && 
            'run_id' in payload.new && 
            'type' in payload.new && 
            'payload' in payload.new && 
            'created_at' in payload.new) {
          
          // Valid RunMessage - type-safe way to add to state
          const newMessage = payload.new as RunMessage;
          
          // Check specifically for spawn_window messages
          if (newMessage.type === 'spawn_window') {
            processSpawnWindowMessage(newMessage);
          }
          
          // Check if this message ID already exists to prevent duplicates
          setRunMessages(prev => {
            // If message with this ID already exists, don't add it again
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        } else {
          console.error('Received incomplete run message:', payload.new);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, processSpawnWindowMessage]);

  // We'll keep this function but simplify it to just update the local message state
  const updateMessageContent = useCallback((messageId: string, updatedMessage: any, isStreaming: boolean = false) => {
    setMessages(prevMessages => {
      const updatedMessages = prevMessages.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              ...updatedMessage
            } 
          : msg
      );
      
      return updatedMessages;
    });
    
    if (isStreaming) {
      setStreamingMessages(prev => new Set(prev).add(messageId));
    } else {
      setStreamingMessages(prev => {
        const updated = new Set(prev);
        updated.delete(messageId);
        return updated;
      });
    }
  }, [setMessages]);

  // Instead of listening for changes, we'll use the useConversations hook's data
  // and let our polling function handle checking the latest message

  const handleSubmit = async (inputValue: string) => {
    if (!inputValue.trim() || !conversationId) return;
    
    setIsLoading(true);
    
    try {
      const messageId = uuidv4();
      
      setLocalMessageIds(prev => new Set(prev).add(messageId));
      
      setPendingMessageIds(prev => new Set(prev).add(messageId));
      
      const optimisticMessage: Message = {
        id: messageId,
        role: 'user',
        content: inputValue,
        username: 'current_user'
      };
      
      setMessages(prev => {
        const newMessages = [...prev, optimisticMessage];
        return newMessages;
      });
      
      const messageData: any = {
        id: messageId,
        chat_id: conversationId,
        role: 'user',
        content: inputValue,
        username: 'current_user',
        is_currently_streaming: false
      };
      
      // Add run_id if available
      if (currentRunId) {
        messageData.run_id = currentRunId;
      }
      
      await supabase
        .from('messages')
        .insert(messageData);
      
      // Invoke the function with conversation ID
      const functionParams: any = { 
        conversationId,
        username: 'current_user'
      };
      
      if (currentRunId) {
        functionParams.runId = currentRunId;
      }
      
      await supabase.functions.invoke('respond-to-message', {
        body: functionParams
      });
      
      onSendMessage(inputValue);
      
      // Reset the current run ID after sending
      setCurrentRunId(null);
    } catch (err) {
      console.error('Exception when processing message:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
