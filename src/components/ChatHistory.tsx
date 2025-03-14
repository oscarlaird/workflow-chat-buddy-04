
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Trash2, MessageSquare, Clock, Search } from "lucide-react";
import { mockConversations } from "@/data/mockData";
import { Conversation } from "@/types";

interface ChatHistoryProps {
  selectedConversationId: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
}

export const ChatHistory = ({
  selectedConversationId,
  onSelectConversation,
  onNewConversation
}: ChatHistoryProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = mockConversations.filter(
    conversation => conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group conversations by date
  const groupedConversations: { [key: string]: Conversation[] } = {};
  
  filteredConversations.forEach(conversation => {
    if (!groupedConversations[conversation.date]) {
      groupedConversations[conversation.date] = [];
    }
    groupedConversations[conversation.date].push(conversation);
  });

  return (
    <div className="w-full h-full flex flex-col bg-sidebar rounded-l-lg">
      <div className="flex flex-col p-4 space-y-4">
        <button
          onClick={onNewConversation}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">New Chat</span>
        </button>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-10 py-2 px-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedConversations).map(([date, conversations]) => (
          <div key={date} className="mb-4">
            <div className="px-4 py-2 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{date}</span>
            </div>
            
            <div className="space-y-1">
              {conversations.map(conversation => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={cn(
                    "flex items-start gap-3 w-full p-3 text-left hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors",
                    selectedConversationId === conversation.id && "bg-white dark:bg-gray-800"
                  )}
                >
                  <MessageSquare className="w-5 h-5 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{conversation.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {conversation.messages[conversation.messages.length - 1]?.content.slice(0, 25) || "No messages yet"}
                      {conversation.messages[conversation.messages.length - 1]?.content.length > 25 ? "..." : ""}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="flex items-center justify-center gap-2 w-full py-2 rounded-md hover:bg-white/50 dark:hover:bg-gray-800/50 text-red-500 transition-colors">
          <Trash2 className="w-4 h-4" />
          <span>Clear conversations</span>
        </button>
      </div>
    </div>
  );
};

export default ChatHistory;
