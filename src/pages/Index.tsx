
import { useState, useEffect } from "react";
import { Moon, Sun, Menu } from "lucide-react";
import ChatHistory from "@/components/ChatHistory";
import ChatInterface from "@/components/ChatInterface";
import WorkflowPanel from "@/components/WorkflowPanel";
import ExtensionStatusIndicator from "@/components/ExtensionStatusIndicator";
import { mockConversations } from "@/data/mockData";
import { useToast } from "@/components/ui/use-toast";
import { 
  ResizablePanelGroup, 
  ResizablePanel, 
  ResizableHandle 
} from "@/components/ui/resizable";

const Index = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(mockConversations[0]?.id || "");
  const { toast } = useToast();

  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
    
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleNewConversation = () => {
    // In a real app, would create a new conversation
    toast({
      title: "New Conversation",
      description: "A new conversation would be created here",
    });
    
    setIsMobileSidebarOpen(false);
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setIsMobileSidebarOpen(false);
  };

  const handleSendMessage = (message: string) => {
    // In a real app, would send message to API
    toast({
      title: "Message Sent",
      description: "Your message was sent successfully",
    });
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
            <h1 className="text-xl font-medium">WorkflowChat</h1>
            
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
                  <ChatInterface
                    conversationId={selectedConversationId}
                    onSendMessage={handleSendMessage}
                  />
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
                  <WorkflowPanel onRunWorkflow={handleRunWorkflow} />
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
