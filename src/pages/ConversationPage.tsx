
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { ChatInterface } from "@/components/ChatInterface";
import WorkflowPanel from "@/components/WorkflowPanel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { supabase } from "@/integrations/supabase/client";

const ConversationPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const chatInterfaceRef = useRef<any>(null);

  // Ensure we have a conversation ID
  if (!id) {
    return <div>No conversation ID provided</div>;
  }

  // Handle sending a message to the AI
  const handleSendMessage = (message: string) => {
    console.log("Sent message:", message);
    // The actual sending is handled in ChatInterface
  };

  // Function to handle workflow execution
  const handleRunWorkflow = () => {
    if (chatInterfaceRef.current) {
      chatInterfaceRef.current.handleSubmit("[RUN_WORKFLOW]");
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={50} minSize={30} className="h-full">
          <ChatInterface
            ref={chatInterfaceRef}
            conversationId={id} 
            onSendMessage={handleSendMessage}
            onMessagesUpdate={setMessages}
          />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={50} minSize={30} className="h-full overflow-hidden">
          <WorkflowPanel 
            chatId={id} 
            onRunWorkflow={handleRunWorkflow} 
            showRunButton={true}
            messages={messages}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ConversationPage;
