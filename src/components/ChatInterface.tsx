
import { useRef, useEffect, useState } from "react";
import { CornerDownLeft, Loader2, Film } from "lucide-react";
import { mockConversations } from "@/data/mockData";
import { Message } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  conversationId: string;
  onSendMessage: (message: string) => void;
}

// Interface to represent a screen recording
interface ScreenRecording {
  id: string;
  duration: string; // e.g., "54s"
  timestamp: string;
}

export const ChatInterface = ({
  conversationId,
  onSendMessage
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [screenRecordings, setScreenRecordings] = useState<Record<string, ScreenRecording>>({});
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [chatId] = useState(() => conversationId || uuidv4());

  useEffect(() => {
    // Load existing messages for this conversation from Supabase
    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('chat_id', conversationId)
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Error loading messages:', error);
          return;
        }
        
        if (data && data.length > 0) {
          // Convert Supabase data to Message format
          const loadedMessages = data.map(msg => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content
          }));
          setMessages(loadedMessages);
        } else {
          // If no messages in database, use mock data
          const conversation = mockConversations.find(conv => conv.id === conversationId);
          if (conversation) {
            setMessages(conversation.messages);
            
            // Create screen recordings for specific messages where the agent asks to be shown something
            const recordings: Record<string, ScreenRecording> = {};
            
            // Go through messages and add recordings after specific agent questions
            for (let i = 0; i < conversation.messages.length - 1; i++) {
              const current = conversation.messages[i];
              const next = conversation.messages[i + 1];
              
              // Specifically look for messages where the agent asks to be shown something
              if (current.role === "assistant" && 
                  (current.content.includes("show me") || 
                  current.content.includes("Can you show me") ||
                  current.content.includes("please show"))) {
                
                // For the first instance, set 54s duration
                if (current.id === "msg-9" && next.id === "msg-10") {
                  recordings[current.id] = {
                    id: `recording-${i}`,
                    duration: "54s",
                    timestamp: new Date().toISOString()
                  };
                }
                // For the second instance, set 76s duration
                else if (current.id === "msg-14" && next.id === "msg-15") {
                  recordings[current.id] = {
                    id: `recording-${i}`,
                    duration: "76s",
                    timestamp: new Date().toISOString()
                  };
                }
              }
            }
            
            console.log("Screen recordings created:", recordings);
            setScreenRecordings(recordings);
            
            // Show toast notification about screen recordings
            if (Object.keys(recordings).length > 0) {
              toast({
                title: "Screen recordings loaded",
                description: `Loaded ${Object.keys(recordings).length} screen recordings in this conversation.`
              });
            }
          } else {
            setMessages([]);
            setScreenRecordings({});
          }
        }
      } catch (error) {
        console.error('Error in loadMessages:', error);
      }
    };

    loadMessages();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to save message to Supabase
  const saveMessageToSupabase = async (message: Message, messageRole: "user" | "assistant") => {
    try {
      const { error } = await supabase
        .from('conversations')
        .insert({
          chat_id: chatId,
          role: messageRole,
          content: message.content
        });
      
      if (error) {
        console.error('Error saving message to Supabase:', error);
        toast({
          title: "Error saving message",
          description: "There was a problem saving your message.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Exception saving message:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    
    // Add user message immediately
    const newUserMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: inputValue
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    
    // Save user message to Supabase
    saveMessageToSupabase(newUserMessage, "user");
    
    setInputValue("");
    
    // Simulate sending message to API
    setTimeout(() => {
      onSendMessage(inputValue);
      
      // Add the automated "Okay" response from the assistant
      const botResponse: Message = {
        id: `resp-${Date.now()}`,
        role: "assistant",
        content: "Okay"
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Save assistant response to Supabase
      saveMessageToSupabase(botResponse, "assistant");
      
      setIsLoading(false);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    autoResizeTextarea();
  };

  // Function to check if there's a screen recording for a message
  const hasScreenRecording = (message: Message) => {
    return message.id in screenRecordings;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">Start a new conversation</p>
              <p className="text-sm">Describe what you'd like to build a workflow for.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div key={message.id} className="space-y-4">
                <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-lg ${
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  }`}>
                    {message.content}
                  </div>
                </div>
                
                {/* Screen recording indicator - show after messages where asked to be shown something */}
                {hasScreenRecording(message) && (
                  <div className="flex justify-center my-4">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-md text-sm font-medium">
                      <Film className="w-4 h-4" />
                      <span>Screen recording, {screenRecordings[message.id]?.duration}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="w-full py-3 px-4 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="absolute right-3 bottom-3 p-1.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <CornerDownLeft className="w-5 h-5" />
            )}
          </button>
        </form>
        <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
          Press Enter to send, Shift+Enter for a new line
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
