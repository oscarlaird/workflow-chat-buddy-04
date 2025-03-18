
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatInterface from "../components/ChatInterface";
import ChatHistory from "../components/ChatHistory";
import WorkflowPanel from "../components/WorkflowPanel";
import { Chat } from "@/types";

interface IndexProps {
  selectedConversationId: string;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  chats: Chat[];
  exampleChats: Chat[];
  systemExampleChats: Chat[];
  isLoading: boolean;
  onCreateChat: (title: string) => Promise<void>;
  onDeleteChat: (chatId: string) => Promise<void>;
  onDuplicateChat: (chatId: string) => Promise<void>;
  onRenameChat?: (chatId: string, newTitle: string) => Promise<boolean>;
}

export const Index: React.FC<IndexProps> = ({
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  chats,
  exampleChats,
  systemExampleChats,
  isLoading,
  onCreateChat,
  onDeleteChat,
  onDuplicateChat,
  onRenameChat
}) => {
  const navigate = useNavigate();

  const handleSendMessage = (message: string) => {
    console.log("Message sent from Index view:", message);
  };

  const handleRunWorkflow = () => {
    console.log("Running workflow for conversation:", selectedConversationId);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="w-1/4 min-w-[300px] max-w-md border-r border-gray-200 dark:border-gray-800">
        <ChatHistory
          selectedConversationId={selectedConversationId}
          onSelectConversation={onSelectConversation}
          onNewConversation={onNewConversation}
          chats={chats}
          exampleChats={exampleChats}
          systemExampleChats={systemExampleChats}
          isLoading={isLoading}
          onCreateChat={onCreateChat}
          onDeleteChat={onDeleteChat}
          onDuplicateChat={onDuplicateChat}
          onRenameChat={onRenameChat}
        />
      </div>
      
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-hidden">
          {selectedConversationId ? (
            <ChatInterface 
              conversationId={selectedConversationId} 
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="max-w-md text-center p-8">
                <h1 className="text-2xl font-bold mb-4">Welcome to Workflow Chat</h1>
                <p className="text-muted-foreground mb-6">
                  Create a new chat or select an existing one to start a conversation.
                </p>
                <button
                  onClick={() => onCreateChat("New Workflow")}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Create New Chat
                </button>
              </div>
            </div>
          )}
        </div>
        
        {selectedConversationId && (
          <div className="w-1/3 min-w-[300px] max-w-md border-l border-gray-200 dark:border-gray-800">
            <WorkflowPanel 
              onRunWorkflow={handleRunWorkflow} 
              chatId={selectedConversationId}
            />
          </div>
        )}
      </div>
    </div>
  );
};
