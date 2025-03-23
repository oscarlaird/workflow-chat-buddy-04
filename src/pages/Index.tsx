import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ChatInterface from "../components/ChatInterface";
import ChatHistory from "../components/ChatHistory";
import WorkflowPanel from "../components/WorkflowPanel";
import TopBar from "../components/TopBar";
import { Chat, Message } from "@/types";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { PanelLeft } from "lucide-react";
import { MotionDiv } from "@/lib/transitions";
import { supabase } from "@/integrations/supabase/client";

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
  const chatInterfaceRef = React.useRef(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [latestUserMessage, setLatestUserMessage] = useState<Message | null>(null);

  // Fetch the latest user message every second
  useEffect(() => {
    if (!selectedConversationId) return;

    const checkLatestUserMessage = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', selectedConversationId)
          .eq('role', 'user')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) {
          console.error('Error fetching latest user message:', error);
          return;
        }

        if (data && data.length > 0) {
          const message = data[0] as Message;
          console.log("MAIN PAGE - Latest user message:", message);
          console.log("requires_text_reply:", message.requires_text_reply);
          console.log("script:", message.script);
          setLatestUserMessage(message);
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
  }, [selectedConversationId]);

  const handleSendMessage = (message: string) => {
    // We can keep this minimal log as it's useful for potential debugging
    console.log("Message sent from Index view:", message);
  };

  const handleMessagesUpdated = (messages: Message[]) => {
    // This is now less important as we're polling directly
    const userMessages = messages.filter(msg => msg.role === 'user');
    if (userMessages.length > 0) {
      const latestUserMsg = userMessages[userMessages.length - 1];
      console.log("Messages updated - Latest user message id:", latestUserMsg.id);
    }
  };

  // This function is called when the run button is clicked
  const handleRunWorkflow = () => {
    // Keep minimal logging for this important function
    console.log("Running workflow for conversation:", selectedConversationId);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <TopBar username="Demo User">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="mr-2"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
      </TopBar>
      
      <div className="flex flex-1 overflow-hidden">
        <MotionDiv
          className="border-r border-gray-200 dark:border-gray-800 bg-background z-20"
          initial={{ width: "300px" }}
          animate={{ 
            width: isSidebarOpen ? "300px" : "0px",
            opacity: isSidebarOpen ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {isSidebarOpen && (
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
          )}
        </MotionDiv>
        
        {selectedConversationId ? (
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={70} minSize={30}>
              <ChatInterface 
                conversationId={selectedConversationId} 
                onSendMessage={handleSendMessage}
                ref={chatInterfaceRef}
                onMessagesUpdated={handleMessagesUpdated}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30} minSize={20}>
              <WorkflowPanel 
                chatId={selectedConversationId}
                onRunWorkflow={handleRunWorkflow}
                showRunButton={true}
                showInputs={true}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <div className="h-full flex items-center justify-center flex-1">
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
    </div>
  );
};

export default Index;
