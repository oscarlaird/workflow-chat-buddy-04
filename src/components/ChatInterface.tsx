
import { useRef, useEffect, useState } from "react";
import { CornerDownLeft, Loader2, Video } from "lucide-react";
import { mockConversations } from "@/data/mockData";
import { Message } from "@/types";
import { toast } from "@/components/ui/use-toast";

interface ChatInterfaceProps {
  conversationId: string;
  onSendMessage: (message: string) => void;
}

// Interface to represent a demonstration record
interface DemonstrationRecord {
  id: string;
  duration: string; // e.g., "54 seconds"
  timestamp: string;
}

export const ChatInterface = ({
  conversationId,
  onSendMessage
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [demoRecords, setDemoRecords] = useState<Record<string, DemonstrationRecord>>({});
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const conversation = mockConversations.find(conv => conv.id === conversationId);
    if (conversation) {
      setMessages(conversation.messages);
      
      // Instead of hard-coding message IDs, we'll identify demonstration points
      // by checking the message content and patterns
      const records: Record<string, DemonstrationRecord> = {};
      
      // Go through messages and check for potential demo opportunities
      for (let i = 0; i < conversation.messages.length - 1; i++) {
        const current = conversation.messages[i];
        const next = conversation.messages[i + 1];
        
        // Check for the specific pattern from the screenshot:
        // "Okay, one minute..." followed by a response containing a table
        if (
          current.content.includes("Okay, one minute") && 
          next.content.includes("[table]")
        ) {
          records[`${current.id}-${next.id}`] = {
            id: `demo-${i}`,
            duration: "54 seconds",
            timestamp: new Date().toISOString()
          };
          console.log(`Added demo record between: "${current.content}" and "${next.content}"`);
        }
        
        // Check for other assistant questions followed by user responses with data
        // This pattern often indicates a demonstration happened
        if (
          current.role === "assistant" &&
          next.role === "user" &&
          (current.content.toLowerCase().includes("show me") || 
           current.content.toLowerCase().includes("can you please show") ||
           current.content.toLowerCase().includes("please show")) && 
          (next.content.includes("[table]") || 
           next.content.includes("Here is") ||
           next.content.includes("I found"))
        ) {
          records[`${current.id}-${next.id}`] = {
            id: `demo-${i}`,
            duration: "54 seconds",
            timestamp: new Date().toISOString()
          };
          console.log(`Added demo record between: "${current.content}" and "${next.content}"`);
        }
      }
      
      console.log("Demo records created:", records);
      setDemoRecords(records);
      
      // Show toast notification about demo records
      if (Object.keys(records).length > 0) {
        toast({
          title: "Demonstration records loaded",
          description: `Loaded ${Object.keys(records).length} demonstration records in this conversation.`
        });
      }
    } else {
      setMessages([]);
      setDemoRecords({});
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setIsLoading(true);
    
    // Add user message immediately
    const newMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: inputValue
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    
    // Simulate sending message to API
    setTimeout(() => {
      onSendMessage(inputValue);
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

  // Function to check if there's a demonstration record between messages
  const hasDemoRecord = (currentMsg: Message, nextMsg: Message) => {
    const key = `${currentMsg.id}-${nextMsg.id}`;
    return key in demoRecords;
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
                
                {/* Demonstration record indicator */}
                {index < messages.length - 1 && hasDemoRecord(message, messages[index + 1]) && (
                  <div className="flex justify-center my-6">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-md text-sm font-medium">
                      <Video className="w-4 h-4" />
                      <span>Demonstration record, {demoRecords[`${message.id}-${messages[index + 1].id}`]?.duration}</span>
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
