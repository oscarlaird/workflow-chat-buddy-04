
import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import WorkflowPanel from "@/components/WorkflowPanel";
import { useToast } from "@/components/ui/use-toast";
import { Info, AlertCircle } from "lucide-react";

const WorkflowPage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const params = useParams();
  const [chatId, setChatId] = useState("");

  useEffect(() => {
    // First check if ID is in URL params (from route pattern /workflow/:id)
    const idFromParams = params.id;
    
    // If not found in params, check query string (from route pattern /workflow?id=xxx or /workflow?chat_id=xxx)
    const searchParams = new URLSearchParams(location.search);
    const idFromQuery = searchParams.get('id') || searchParams.get('chat_id');
    
    const finalId = idFromParams || idFromQuery;

    if (finalId) {
      console.log("Setting chat ID:", finalId);
      setChatId(finalId);
      
      toast({
        title: "Loading Workflow",
        description: `Attempting to load workflow for chat ID: ${finalId}`,
        variant: "default",
      });
    } else {
      console.log("No chat ID found, setting to empty string");
      setChatId("");
      
      toast({
        title: "No Workflow ID",
        description: "No workflow ID was provided in the URL",
        variant: "destructive",
        action: (
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>Add ?id=your_chat_id or ?chat_id=your_chat_id to the URL or use /workflow/your_chat_id</span>
          </div>
        ),
      });
    }
  }, [location.search, params, toast]);

  const handleRunWorkflow = () => {
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
              chatId={chatId}
              onRunWorkflow={handleRunWorkflow} 
              showRunButton={false} 
            />
          ) : (
            <div className="flex flex-col h-full items-center justify-center p-6 text-center">
              <Info className="w-12 h-12 text-gray-400 mb-4" />
              <h2 className="text-xl font-medium mb-2">No Workflow ID Provided</h2>
              <p className="text-gray-500 max-w-md">
                Please specify a workflow ID by adding ?id=your_chat_id or ?chat_id=your_chat_id to the URL or using /workflow/your_chat_id to view workflow details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;
