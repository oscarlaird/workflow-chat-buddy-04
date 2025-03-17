import { useState, useEffect } from "react";
import { Moon, Sun, Menu } from "lucide-react";
import ChatHistory from "@/components/ChatHistory";
import ChatInterface from "@/components/ChatInterface";
import WorkflowPanel from "@/components/WorkflowPanel";
import ExtensionStatusIndicator from "@/components/ExtensionStatusIndicator";
import VersionDisplay from "@/components/VersionDisplay";
import SeedDataButton from "@/components/SeedDataButton";
import { useChats } from "@/hooks/useChats";
import { useToast } from "@/components/ui/use-toast";
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from "@/components/ui/resizable";

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { chats, isLoading, createChat, deleteChat } = useChats();
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
    
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    // Set initial conversation when chats are loaded
    if (!isLoading && chats.length > 0 && !selectedConversationId) {
      setSelectedConversationId(chats[0].id);
    }
  }, [chats, isLoading, selectedConversationId]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleNewConversation = async () => {
    toast({
      title: "Creating new chat",
      description: "Please provide a title for your new workflow chat",
    });
  };

  const handleCreateChat = async (title: string) => {
    try {
      const newChatId = await createChat(title);
      setSelectedConversationId(newChatId);
      setIsMobileSidebarOpen(false);
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setIsMobileSidebarOpen(false);
  };

  const handleSendMessage = (message: string) => {
    // This is handled within ChatInterface now
  };

  const handleRunWorkflow = () => {
    toast({
      title: "Workflow Running",
      description: "The workflow is now processing your request",
    });
  };

  return (
    <div className="min-h-screen dark:bg-gray-950 bg-gray-50 transition-colors duration-300 overflow-hidden">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-xl font-medium">WorkflowChat</h1>
              <VersionDisplay />
            </div>
            
            {/* Extension Status Indicator */}
            <ExtensionStatusIndicator />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
              U
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar (Chat History) */}
          <div 
            className={`
              fixed md:relative inset-0 md:inset-auto z-30 md:z-auto w-full md:w-72 lg:w-80 transition-transform duration-300 ease-in-out
              ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
          >
            <div className="h-full glass-panel-strong md:rounded-none">
              <ChatHistory
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
                chats={chats}
                isLoading={isLoading}
                onCreateChat={handleCreateChat}
                onDeleteChat={deleteChat}
              />
            </div>
            
            {/* Mobile overlay */}
            {isMobileSidebarOpen && (
              <div 
                className="md:hidden fixed inset-0 bg-black/40 z-[-1]"
                onClick={() => setIsMobileSidebarOpen(false)}
              />
            )}
          </div>
          
          {/* Chat and Workflow Area */}
          <div className="flex-1 flex items-stretch p-4 gap-4 overflow-hidden">
            <ResizablePanelGroup 
              direction="horizontal"
              className="w-full rounded-lg"
            >
              {/* Chat Interface */}
              <ResizablePanel 
                defaultSize={50} 
                minSize={30}
              >
                <div className="h-full glass-panel">
                  {selectedConversationId ? (
                    <ChatInterface
                      conversationId={selectedConversationId}
                      onSendMessage={handleSendMessage}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <p className="text-lg mb-2">Select or create a chat to get started</p>
                        <p className="text-sm">You can create a new chat from the sidebar.</p>
                      </div>
                    </div>
                  )}
                </div>
              </ResizablePanel>
              
              <ResizableHandle className="w-2 bg-transparent" withHandle />
              
              {/* Workflow Panel */}
              <ResizablePanel 
                defaultSize={50} 
                minSize={25}
                className="hidden md:block"
              >
                <div className="h-full glass-panel">
                  <WorkflowPanel onRunWorkflow={handleRunWorkflow} showRunButton={true} />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
