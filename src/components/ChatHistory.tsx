import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Plus, Trash2, MessageSquare, Clock, Search, Loader2, Sparkles, Hash, Copy, Pen, Check, X } from "lucide-react";
import { Chat } from "@/types";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import NewChatDialog from "./NewChatDialog";

interface ChatHistoryProps {
  chats: Chat[];
  selectedChatId: string | null;
  onCreateChat: (title: string) => Promise<void>;
  onDeleteChat: (chatId: string) => Promise<void>;
  onDuplicateChat?: (chatId: string) => Promise<void>;
  onRenameChat?: (chatId: string, newTitle: string) => Promise<boolean>;
  exampleChats?: Chat[];
  systemExampleChats?: Chat[];
  selectedConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onNewConversation?: () => void;
  isLoading?: boolean;
}

const ChatHistory = ({
  chats,
  selectedChatId,
  onCreateChat,
  onDeleteChat,
  onDuplicateChat,
  onRenameChat,
  exampleChats = [],
  systemExampleChats = []
}: ChatHistoryProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [duplicatingChatId, setDuplicatingChatId] = useState<string | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingChatTitle, setEditingChatTitle] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const editInputRef = useRef<HTMLInputElement>(null);

  const allChats = [...chats, ...(exampleChats || [])];
  const filteredChats = allChats.filter(
    chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const groupChatsByDate = (chats: Chat[]) => {
    const groups: { [key: string]: Chat[] } = {};
    
    chats.forEach(chat => {
      const date = new Date(chat.created_at);
      const dateKey = format(date, 'MMMM d, yyyy');
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(chat);
    });
    
    return groups;
  };

  const groupedChats = groupChatsByDate(filteredChats);

  const handleCreateChat = async (title: string) => {
    setIsCreatingChat(true);
    try {
      await onCreateChat(title);
      setIsNewChatDialogOpen(false);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this chat?")) {
      await onDeleteChat(chatId);
    }
  };

  const handleDuplicateChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicateChat) {
      setDuplicatingChatId(chatId);
      try {
        await onDuplicateChat(chatId);
      } finally {
        setDuplicatingChatId(null);
      }
    }
  };

  const handleEditChat = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditingChatTitle(chat.title);
    setTimeout(() => {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }, 10);
  };

  const handleSaveEdit = async (e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!editingChatId || !onRenameChat || editingChatTitle.trim() === '') return;
    
    setIsRenaming(true);
    try {
      const success = await onRenameChat(editingChatId, editingChatTitle.trim());
      if (success) {
        setEditingChatId(null);
      }
    } finally {
      setIsRenaming(false);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
  };

  const handleEditInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditingChatId(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-sidebar rounded-l-lg">
      <div className="flex flex-col p-4 space-y-4">
        <button
          onClick={() => setIsNewChatDialogOpen(true)}
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
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : allChats.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <MessageSquare className="mx-auto h-12 w-12 mb-3 opacity-20" />
            <h3 className="font-medium text-lg mb-1">No chats yet</h3>
            <p className="text-sm mb-4">Create a new chat to get started</p>
          </div>
        ) : (
          Object.entries(groupedChats).map(([date, dateChats]) => (
            <div key={date} className="mb-4">
              <div className="px-4 py-2 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{date}</span>
              </div>
              
              <div className="space-y-1">
                {dateChats.map(chat => (
                  <div
                    key={chat.id}
                    className={cn(
                      "group flex items-start gap-3 w-full p-3 text-left hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer",
                      selectedChatId === chat.id && "bg-white dark:bg-gray-800"
                    )}
                    onClick={() => {
                      if (editingChatId !== chat.id) {
                        onSelectConversation(chat.id);
                      }
                    }}
                  >
                    {chat.is_example ? (
                      <Sparkles className="w-5 h-5 mt-0.5 text-yellow-500 flex-shrink-0" />
                    ) : (
                      <MessageSquare className="w-5 h-5 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      {editingChatId === chat.id ? (
                        <form onSubmit={handleSaveEdit} className="flex items-center gap-1">
                          <Input
                            ref={editInputRef}
                            value={editingChatTitle}
                            onChange={(e) => setEditingChatTitle(e.target.value)}
                            onKeyDown={handleEditInputKeyDown}
                            className="h-8 py-1"
                            disabled={isRenaming}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex gap-1">
                            <button
                              type="submit"
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                              disabled={isRenaming}
                              aria-label="Save"
                            >
                              {isRenaming ? (
                                <Loader2 className="w-4 h-4 text-gray-500 dark:text-gray-400 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 text-green-500" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                              disabled={isRenaming}
                              aria-label="Cancel"
                            >
                              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="font-medium truncate">{chat.title}</div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <Hash className="w-3 h-3 mr-1" />
                            <span className="truncate">{chat.id}</span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {format(new Date(chat.created_at), 'h:mm a')}
                          </div>
                        </>
                      )}
                    </div>
                    {editingChatId !== chat.id && (
                      <div className="flex gap-1">
                        {onRenameChat && !chat.is_example && (
                          <button
                            onClick={(e) => handleEditChat(chat, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"
                            aria-label="Rename chat"
                          >
                            <Pen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </button>
                        )}
                        {onDuplicateChat && (
                          <button
                            onClick={(e) => handleDuplicateChat(chat.id, e)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"
                            aria-label="Duplicate chat"
                            disabled={duplicatingChatId === chat.id}
                          >
                            {duplicatingChatId === chat.id ? (
                              <Loader2 className="w-4 h-4 text-gray-500 dark:text-gray-400 animate-spin" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-opacity"
                          aria-label="Delete chat"
                        >
                          <Trash2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <NewChatDialog
        open={isNewChatDialogOpen}
        onOpenChange={setIsNewChatDialogOpen}
        onCreateChat={handleCreateChat}
        isLoading={isCreatingChat}
        exampleChats={exampleChats}
        systemExampleChats={systemExampleChats}
        onSelectExampleChat={() => {}}
      />
    </div>
  );
};

export default ChatHistory;
