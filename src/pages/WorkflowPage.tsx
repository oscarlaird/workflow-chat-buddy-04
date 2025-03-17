
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import WorkflowPanel from "@/components/WorkflowPanel";
import { useToast } from "@/components/ui/use-toast";
import { Info, AlertCircle } from "lucide-react";

const WorkflowPage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [chatId, setChatId] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      console.log("Setting chat ID from URL:", idFromUrl);
      setChatId(idFromUrl);
      
      // Notify user with the chat ID for debugging purposes
      toast({
        title: "Loading Workflow",
        description: `Attempting to load workflow for chat ID: ${idFromUrl}`,
        variant: "default",
      });
    } else {
      console.log("No chat ID found in URL, setting to empty string");
      setChatId("");
      
      toast({
        title: "No Workflow ID",
        description: "No workflow ID was provided in the URL",
        variant: "destructive",
        action: (
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>Add ?id=your_chat_id to the URL</span>
          </div>
        ),
      });
    }
  }, [location.search, toast]);

  const handleRunWorkflow = () => {
    // Note: The actual postMessage happens in the WorkflowPanel component
    toast({
      title: "Workflow Running",
      description: "The workflow is now processing your request in standalone view",
    });
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950">
      <div className="h-full p-4">
        <div className="h-full glass-panel">
          {chatId ? (
            <WorkflowPanel 
              onRunWorkflow={handleRunWorkflow} 
              showRunButton={false} 
              chatId={chatId}
            />
          ) : (
            <div className="flex flex-col h-full items-center justify-center p-6 text-center">
              <Info className="w-12 h-12 text-gray-400 mb-4" />
              <h2 className="text-xl font-medium mb-2">No Workflow ID Provided</h2>
              <p className="text-gray-500 max-w-md">
                Please specify a workflow ID by adding ?id=your_chat_id to the URL to view workflow details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;
