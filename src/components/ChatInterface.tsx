import { useConversations } from "@/hooks/useConversations";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import RunStatusBubble from "@/components/RunStatusBubble";
import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message, Run, RunMessage } from "@/types";
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  conversationId: string;
  onSendMessage: (message: string) => void;
}

export const ChatInterface = forwardRef(({
  conversationId,
  onSendMessage
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
  
  const [localMessageIds, setLocalMessageIds] = useState<Set<string>>(new Set());
  const [pendingMessageIds, setPendingMessageIds] = useState<Set<string>>(new Set());
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [streamingMessages, setStreamingMessages] = useState<Set<string>>(new Set());
  const [activeRun, setActiveRun] = useState<Run | null>(null);
  const [runMessages, setRunMessages] = useState<RunMessage[]>([]);
  
  const prevConversationIdRef = useRef<string | null>(null);

  // Expose the handleSubmit method to the parent component
  useImperativeHandle(ref, () => ({
    handleSubmit: (inputValue: string) => handleSubmit(inputValue)
  }));

  // Reset activeRun when conversation changes
  useEffect(() => {
    // Reset the activeRun state whenever conversationId changes
    if (prevConversationIdRef.current !== conversationId) {
      setActiveRun(null);
      setRunMessages([]);
    }
    
    if (!conversationId) return;
    
    // Initial fetch of any active run
    const fetchActiveRun = async () => {
      const { data, error } = await supabase
        .from('runs')
        .select('*')
        .eq('chat_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (!error && data && data.length > 0) {
        // Validate status is one of the expected values in Run type
        const validStatuses: Array<Run['status']> = ['pending', 'running', 'completed', 'failed'];
        const runData = data[0];
        const status = validStatuses.includes(runData.status as Run['status']) 
          ? runData.status as Run['status'] 
          : 'pending';
          
        setActiveRun({
          id: runData.id,
          dashboard_id: runData.dashboard_id,
          chat_id: runData.chat_id,
          status: status,
          created_at: runData.created_at,
          updated_at: runData.updated_at
        });
        
        // Fetch run messages for this run
        fetchRunMessages(runData.id);
      }
    };
    
    fetchActiveRun();
    
    // Update the previous conversation ID ref
    prevConversationIdRef.current = conversationId;
    
    // Subscribe to changes in the runs table for this chat
    const runsChannel = supabase
      .channel(`runs:${conversationId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'runs',
        filter: `chat_id=eq.${conversationId}`
      }, (payload) => {
        console.log('Run update received:', payload);
        if (payload.new) {
          const runData = payload.new as any;
          // Validate status is one of the expected values in Run type
          const validStatuses: Array<Run['status']> = ['pending', 'running', 'completed', 'failed'];
          const status = validStatuses.includes(runData.status as Run['status']) 
            ? runData.status as Run['status'] 
            : 'pending';
            
          setActiveRun({
            id: runData.id,
            dashboard_id: runData.dashboard_id,
            chat_id: runData.chat_id,
            status: status,
            created_at: runData.created_at,
            updated_at: runData.updated_at
          });
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(runsChannel);
    };
  }, [conversationId]);
  
  // Fetch run messages for a specific run
  const fetchRunMessages = async (runId: string) => {
    const { data, error } = await supabase
      .from('run_messages')
      .select('*')
      .eq('run_id', runId)
      .order('created_at', { ascending: true });
      
    if (!error && data) {
      setRunMessages(data as RunMessage[]);
      
      // Process any existing run messages
      data.forEach(message => {
        handleRunMessage(message);
      });
    }
  };
  
  // Subscribe to run_messages for the active run
  useEffect(() => {
    if (!activeRun?.id) return;
    
    console.log(`Setting up subscription for run_messages:${activeRun.id}`);
    
    const runMessagesChannel = supabase
      .channel(`run_messages:${activeRun.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'run_messages',
        filter: `run_id=eq.${activeRun.id}`
      }, (payload) => {
        console.log('Run message received:', payload);
        if (payload.new) {
          const newMessage = payload.new as RunMessage;
          setRunMessages(prev => [...prev, newMessage]);
          
          // Handle the run message
          handleRunMessage(newMessage);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(runMessagesChannel);
    };
  }, [activeRun?.id]);
  
  // Handle different types of run messages
  const handleRunMessage = (message: RunMessage) => {
    if (!message || !message.type) return;
    
    switch (message.type) {
      case 'spawn_window':
        console.log('Received spawn_window message:', message);
        window.postMessage({ type: "CREATE_AGENT_RUN_WINDOW" }, "*");
        break;
        
      case 'download_extension':
        console.log('Received download_extension message:', message);
        // Add a virtual assistant message suggesting to download the extension
        const extensionMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: "To continue, you'll need to install the Macro Agents browser extension. This allows the agent to help you in other tabs.",
          username: 'system'
        };
        
        setMessages(prev => [...prev, extensionMessage]);
        break;
        
      default:
        console.log('Unhandled run message type:', message.type);
    }
  };

  useEffect(() => {
    const handleExtensionMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "EXTENSION_INSTALLED") {
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

  const updateMessageContent = useCallback((messageId: string, newContent: string, functionName: string | null = null, isStreaming: boolean = false) => {
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.id === messageId 
          ? { 
              ...msg, 
              content: newContent,
              ...(functionName !== undefined ? { function_name: functionName } : {})
            } 
          : msg
      )
    );
    
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

  useEffect(() => {
    if (!conversationId) return;
    
    console.log(`Setting up realtime subscription for chat ${conversationId}`);
    
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${conversationId}`
      }, (payload) => {
        console.log('Received real-time INSERT message:', payload);
        const newMessage = payload.new;
        
        if (localMessageIds.has(newMessage.id)) {
          console.log('Skipping already displayed local message:', newMessage.id);
          
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
              run_id: newMessage.run_id
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
        console.log('Received real-time UPDATE message:', payload);
        const updatedMessage = payload.new;
        
        updateMessageContent(
          updatedMessage.id, 
          updatedMessage.content, 
          updatedMessage.function_name, 
          updatedMessage.is_currently_streaming
        );
      })
      .subscribe();

    return () => {
      console.log('Removing channel subscription');
      supabase.removeChannel(channel);
    };
  }, [conversationId, setMessages, localMessageIds, updateMessageContent]);

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
      
      setMessages(prev => [...prev, optimisticMessage]);
      
      const messageData: any = {
        id: messageId,
        chat_id: conversationId,
        role: 'user',
        content: inputValue,
        username: 'current_user',
        is_currently_streaming: false
      };
      
      // Add run_id if available
      if (currentRunId && inputValue === "run") {
        console.log("Adding run_id to message:", currentRunId);
        messageData.run_id = currentRunId;
      }
      
      await supabase
        .from('messages')
        .insert(messageData);
      
      // If message is "run", include run_id in the function invocation
      const functionParams: any = { 
        conversationId,
        username: 'current_user'
      };
      
      if (currentRunId && inputValue === "run") {
        functionParams.runId = currentRunId;
      }
      
      await supabase.functions.invoke('respond-to-message', {
        body: functionParams
      });
      
      onSendMessage(inputValue);
      
      // If this was a "run" message, reset the current run ID after sending
      if (inputValue === "run") {
        setCurrentRunId(null);
      }
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
            activeRun={activeRun}
          />
        )}
      </div>

      <ChatInput 
        onSendMessage={handleSubmit} 
        isLoading={isLoading} 
        disabled={!conversationId}
      />
    </div>
  );
});

export default ChatInterface;
