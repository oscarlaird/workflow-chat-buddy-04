
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import { supabase } from "@/integrations/supabase/client";
import ChatInterface from "@/components/ChatInterface";
import { useChats } from "@/hooks/useChats";
import NewChatDialog from "@/components/NewChatDialog";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { MessageSquarePlusIcon, Loader2 } from "lucide-react";
import ChatHistory from "@/components/ChatHistory";
import { useSelectedChatSettings } from "@/hooks/useSelectedChatSettings";

const Index = () => {
  const navigate = useNavigate();
  const [chatId, setChatId] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [createChatSuccess, setCreateChatSuccess] = useState(false);
  const [createChatError, setCreateChatError] = useState<string | null>(null);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const chatInterfaceRef = useRef(null);
  const selectedChatSettings = useSelectedChatSettings();
  const { chats, isLoading: chatsLoading, createChat, renameChat, deleteChat, duplicateChat, exampleChats, systemExampleChats } = useChats();

  // Create a new chat with the given title
  const createNewChat = async (title: string, isExample: boolean = false) => {
    setIsCreatingChat(true);
    setCreateChatError(null);
    
    try {
      const newId = await createChat(title);
      if (newId) {
        setCreateChatSuccess(true);
        setChatId(newId);
        return newId;
      } else {
        setCreateChatError('Failed to create chat');
        return null;
      }
    } catch (err) {
      console.error('Exception in createChat:', err);
      setCreateChatError('An unexpected error occurred');
      return null;
    } finally {
      setIsCreatingChat(false);
    }
  };

  // Handle new chat creation from the dialog
  const handleCreateNewChat = async (title: string) => {
    const newChatId = await createNewChat(title);
    if (newChatId) {
      setChatId(newChatId);
      navigate(`/conversation/${newChatId}`);
    }
  };

  const handleSelectExampleChat = (id: string) => {
    navigate(`/conversation/${id}`);
  };

  // Handle chat selection
  const handleSelectChat = (id: string) => {
    navigate(`/conversation/${id}`);
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
                onDeleteChat={deleteChat}
                onDuplicateChat={duplicateChat}
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

export default Index; // Default export instead of named export
