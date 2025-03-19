
import { useConversations } from "@/hooks/useConversations";
import MessageList from "@/components/MessageList";
import ChatInput from "@/components/ChatInput";
import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message, RunMessage } from "@/types";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/components/ui/use-toast";

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
  const [runMessages, setRunMessages] = useState<RunMessage[]>([]);
  
  const prevConversationIdRef = useRef<string | null>(null);

  // Expose the handleSubmit method to the parent component
  useImperativeHandle(ref, () => ({
    handleSubmit: (inputValue: string) => handleSubmit(inputValue)
  }));

  // Reset state when conversation changes
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
    // Check if extension status is already stored in localStorage
    const storedStatus = localStorage.getItem('extension_installed');
    if (storedStatus === 'true') {
      setIsExtensionInstalled(true);
    }

    const handleExtensionMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "EXTENSION_INSTALLED") {
        console.log("Extension installation detected in ChatInterface:", event.data);
        setIsExtensionInstalled(true);
        localStorage.setItem('extension_installed', 'true');
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

  // Set up real-time listener for run_messages
  useEffect(() => {
    if (!conversationId) return;
    
    console.log(`Setting up realtime subscription for run_messages in chat ${conversationId}`);
    
    const channel = supabase
      .channel(`run_messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'run_messages',
        filter: `chat_id=eq.${conversationId}`
      }, (payload) => {
        console.log('Received real-time INSERT run_message:', payload);
        
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
          
          console.log(`New run message of type: ${newMessage.type}`, newMessage);
          
          // Log extension status when receiving spawn_window message
          if (newMessage.type === 'spawn_window') {
            console.log(`Received spawn_window message. Extension installed: ${isExtensionInstalled}`);
          }
          
          setRunMessages(prev => [...prev, newMessage]);
        } else {
          console.error('Received incomplete run message:', payload.new);
        }
      })
      .subscribe();
      
    return () => {
      console.log('Removing run_messages channel subscription');
      supabase.removeChannel(channel);
    };
  }, [conversationId, isExtensionInstalled]);

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
      if (currentRunId) {
        console.log("Adding run_id to message:", currentRunId);
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
