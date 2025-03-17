
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import WorkflowPanel from "@/components/WorkflowPanel";
import { useToast } from "@/components/ui/use-toast";

const WorkflowPage = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [chatId, setChatId] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setChatId(idFromUrl);
    } else {
      // Default to empty if no ID is provided
      setChatId("");
    }
  }, [location.search]);

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
          <WorkflowPanel 
            onRunWorkflow={handleRunWorkflow} 
            showRunButton={false} 
            chatId={chatId}
          />
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;
