
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import ChatHistory from "@/components/ChatHistory";
import NewChatDialog from "@/components/NewChatDialog";
import { Button } from "@/components/ui/button";
import { MessageSquarePlusIcon, Loader2 } from "lucide-react";
import { useChats } from "@/hooks/useChats";
import { Chat } from "@/types";

interface IndexProps {
  selectedConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onNewConversation?: () => void;
  chats?: Chat[];
  exampleChats?: Chat[];
  systemExampleChats?: Chat[];
  isLoading?: boolean;
  onCreateChat?: (title: string) => Promise<string>;
  onDeleteChat?: (chatId: string) => Promise<void>;
  onDuplicateChat?: (chatId: string) => Promise<string | null>;
  onRenameChat?: (chatId: string, newTitle: string) => Promise<boolean>;
}

const Index: React.FC<IndexProps> = (props) => {
  const navigate = useNavigate();
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const { chats, isLoading: chatsLoading, createChat, renameChat, deleteChat, duplicateChat, exampleChats, systemExampleChats } = useChats();

  // Create a new chat with the given title
  const createNewChat = async (title: string): Promise<void> => {
    setIsCreatingChat(true);
    try {
      const newId = await createChat(title);
      if (newId) {
        navigate(`/conversation/${newId}`);
      }
    } catch (err) {
      console.error('Exception in createChat:', err);
    } finally {
      setIsCreatingChat(false);
    }
  };

  // Handle new chat creation from the dialog
  const handleCreateNewChat = async (title: string): Promise<void> => {
    await createNewChat(title);
    setIsNewChatDialogOpen(false);
  };

  const handleSelectExampleChat = (id: string) => {
    navigate(`/conversation/${id}`);
  };

  // Handle chat selection
  const handleSelectChat = (id: string) => {
    navigate(`/conversation/${id}`);
  };

  const handleDeleteChatWrapper = async (chatId: string): Promise<void> => {
    await deleteChat(chatId);
  };

  const handleDuplicateChatWrapper = async (chatId: string): Promise<void> => {
    await duplicateChat(chatId);
  };

  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r bg-white dark:bg-gray-900 flex flex-col h-full">
          <div className="p-4 border-b">
            <Button 
              onClick={() => setIsNewChatDialogOpen(true)} 
              className="w-full"
              variant="default"
            >
              <MessageSquarePlusIcon className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {chatsLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ChatHistory 
                chats={chats}
                selectedChatId={null}
                onCreateChat={createNewChat}
                onDeleteChat={handleDeleteChatWrapper}
                onDuplicateChat={handleDuplicateChatWrapper}
                onRenameChat={renameChat}
              />
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div className="max-w-md space-y-6">
              <h1 className="text-3xl font-bold tracking-tight">Welcome to the AI Assistant</h1>
              <p className="text-muted-foreground">
                Start a new conversation by selecting "New Chat" from the sidebar, 
                or select an existing conversation to continue where you left off.
              </p>
              <Button 
                onClick={() => setIsNewChatDialogOpen(true)}
                size="lg"
                className="mt-4"
              >
                <MessageSquarePlusIcon className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <NewChatDialog 
        open={isNewChatDialogOpen} 
        onOpenChange={setIsNewChatDialogOpen} 
        onCreateChat={handleCreateNewChat}
        isLoading={isCreatingChat}
        exampleChats={exampleChats}
        systemExampleChats={systemExampleChats}
        onSelectExampleChat={handleSelectExampleChat}
      />
    </div>
  );
};

export default Index;
